import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env.js";
import { getMySqlPool } from "../config/databases.js";

/*
|--------------------------------------------------------------------------
| Validación
|--------------------------------------------------------------------------
*/

const messageSchema = z.object({
  message: z
    .string()
    .min(1, "El mensaje no puede estar vacío.")
    .max(2000, "El mensaje es demasiado largo."),

  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1),
      }),
    )
    .optional()
    .default([]),

  conversationId: z
    .string()
    .regex(/^\d+$/, "conversationId inválido.")
    .optional(),
});

const conversationIdSchema = z.object({
  conversationId: z
    .string()
    .regex(/^\d+$/, "conversationId inválido."),
});

/*
|--------------------------------------------------------------------------
| Prompt
|--------------------------------------------------------------------------
*/

const SYSTEM_PROMPT = `
Eres VitalMind AI, el asistente inteligente de salud y bienestar de la aplicación VitalMind.

Tu objetivo es ayudar al usuario a comprender mejor su bienestar, hábitos y molestias comunes mediante orientación educativa, práctica, clara, empática y responsable.

ÁREAS EN LAS QUE PUEDES AYUDAR:

- Sueño y descanso.
- Alimentación e hidratación.
- Ejercicio y actividad física.
- Estrés y bienestar emocional.
- Hábitos saludables.
- Fatiga y energía.
- Rutinas saludables.
- Dolor y molestias comunes.
- Prevención y autocuidado.
- Bienestar general.

ESTILO:

- Responde siempre en español.
- Sé natural, humano, amable y empático.
- Aprovecha el contexto de la conversación actual.
- Responde directamente a la pregunta.
- Explica brevemente por qué das una recomendación.
- Proporciona acciones prácticas.
- Para preguntas sencillas, responde brevemente.
- Para síntomas o recomendaciones, desarrolla la respuesta de forma suficiente.
- Usa párrafos cortos y listas cuando sean útiles.
- Puedes utilizar Markdown.
- Utiliza **negritas** para destacar información importante.
- Nunca cortes una respuesta a la mitad.
- No repitas innecesariamente información que ya se mencionó.
- Mantén coherencia con los mensajes anteriores.

SALUD Y SEGURIDAD:

- No realices diagnósticos médicos.
- No afirmes que una persona tiene una enfermedad.
- No inventes resultados médicos.
- No inventes antecedentes.
- No sustituyas la atención de un profesional.
- No recomiendes medicamentos ni dosis personalizadas como si fueras un médico.
- Si los síntomas requieren valoración médica, indícalo.
- Si parece una emergencia, recomienda atención de urgencia.
- Si no sabes algo, dilo honestamente.
`;

/*
|--------------------------------------------------------------------------
| Cliente Gemini
|--------------------------------------------------------------------------
*/

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

/*
|--------------------------------------------------------------------------
| Usuario autenticado
|--------------------------------------------------------------------------
*/

function getAuthenticatedUserId(req) {
  const userId = req.user?.sub ?? req.user?.id;

  if (!userId) {
    const error = new Error(
      "No se pudo identificar al usuario autenticado.",
    );

    error.status = 401;

    throw error;
  }

  return BigInt(userId);
}

/*
|--------------------------------------------------------------------------
| Obtener información de una conversación del usuario
|--------------------------------------------------------------------------
*/

async function getConversationById(
  userId,
  conversationId,
) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        id,
        user_id,
        title,
        created_at,
        updated_at
      FROM chat_conversations
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [conversationId, userId],
  );

  return rows[0] ?? null;
}

/*
|--------------------------------------------------------------------------
| Crear conversación
|--------------------------------------------------------------------------
*/

async function createConversation(
  userId,
  title = "Nueva conversación",
) {
  const pool = getMySqlPool();

  const [result] = await pool.execute(
    `
      INSERT INTO chat_conversations (
        user_id,
        title
      )
      VALUES (?, ?)
    `,
    [userId, title],
  );

  return getConversationById(
    userId,
    result.insertId,
  );
}

/*
|--------------------------------------------------------------------------
| Obtener mensajes
|--------------------------------------------------------------------------
*/

async function getConversationMessages(
  conversationId,
) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        id,
        role,
        content,
        created_at
      FROM chat_messages
      WHERE conversation_id = ?
      ORDER BY id ASC
    `,
    [conversationId],
  );

  return rows;
}

/*
|--------------------------------------------------------------------------
| Guardar mensaje
|--------------------------------------------------------------------------
*/

async function saveMessage(
  conversationId,
  role,
  content,
) {
  const pool = getMySqlPool();

  await pool.execute(
    `
      INSERT INTO chat_messages (
        conversation_id,
        role,
        content
      )
      VALUES (?, ?, ?)
    `,
    [conversationId, role, content],
  );

  await pool.execute(
    `
      UPDATE chat_conversations
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [conversationId],
  );
}

/*
|--------------------------------------------------------------------------
| Actualizar título
|--------------------------------------------------------------------------
*/

async function updateConversationTitle(
  conversationId,
  title,
) {
  const pool = getMySqlPool();

  await pool.execute(
    `
      UPDATE chat_conversations
      SET title = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    [title, conversationId],
  );
}

/*
|--------------------------------------------------------------------------
| Generar título sencillo a partir del primer mensaje
|--------------------------------------------------------------------------
*/

function generateConversationTitle(message) {
  const clean = message
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    return "Nueva conversación";
  }

  if (clean.length <= 55) {
    return clean;
  }

  return `${clean.slice(0, 52)}...`;
}

/*
|--------------------------------------------------------------------------
| Gemini
|--------------------------------------------------------------------------
*/

async function callGemini(message, history) {
  const contents = [
    ...history.map((item) => ({
      role:
        item.role === "assistant"
          ? "model"
          : "user",

      parts: [
        {
          text: item.content,
        },
      ],
    })),

    {
      role: "user",
      parts: [
        {
          text: message,
        },
      ],
    },
  ];

  const maxRetries = 3;

  for (
    let attempt = 0;
    attempt <= maxRetries;
    attempt++
  ) {
    try {
      const response =
        await ai.models.generateContent({
          model: "gemini-3.6-flash",

          contents,

          config: {
            systemInstruction:
              SYSTEM_PROMPT,

            thinkingConfig: {
              thinkingLevel: "low",
            },

            maxOutputTokens: 1500,
          },
        });

      const reply =
        response.text?.trim();

      if (!reply) {
        return "No pude generar una respuesta en este momento. Intenta nuevamente.";
      }

      return reply;
    } catch (error) {
      const status =
        error?.status ?? error?.code;

      const temporaryError =
        status === 503 ||
        status === "UNAVAILABLE" ||
        status === 429 ||
        status === "RESOURCE_EXHAUSTED";

      if (
        !temporaryError ||
        attempt === maxRetries
      ) {
        throw error;
      }

      const delay =
        1000 * 2 ** attempt;

      console.warn(
        `Gemini temporalmente no disponible. ` +
          `Reintento ${
            attempt + 1
          }/${maxRetries} ` +
          `en ${delay} ms.`,
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, delay),
      );
    }
  }

  throw new Error(
    "Gemini no está disponible temporalmente.",
  );
}

/*
|--------------------------------------------------------------------------
| GET /api/chat/conversations
|--------------------------------------------------------------------------
| Lista todas las conversaciones del usuario autenticado.
|--------------------------------------------------------------------------
*/

export async function getChatConversations(
  req,
  res,
  next,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const pool = getMySqlPool();

    const [rows] = await pool.query(
      `
        SELECT
          c.id,
          c.title,
          c.created_at,
          c.updated_at,

          COUNT(m.id) AS message_count

        FROM chat_conversations c

        LEFT JOIN chat_messages m
          ON m.conversation_id = c.id

        WHERE c.user_id = ?

        GROUP BY
          c.id,
          c.title,
          c.created_at,
          c.updated_at

        ORDER BY
          c.updated_at DESC,
          c.id DESC
      `,
      [userId],
    );

    return res.status(200).json({
      conversations: rows.map(
        (conversation) => ({
          id: String(conversation.id),
          title: conversation.title,
          createdAt:
            conversation.created_at,
          updatedAt:
            conversation.updated_at,
          messageCount:
            Number(
              conversation.message_count,
            ),
        }),
      ),
    });
  } catch (error) {
    console.error(
      "Get chat conversations error:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/chat/conversations
|--------------------------------------------------------------------------
| Crea una conversación vacía.
|--------------------------------------------------------------------------
*/

export async function createChatConversation(
  req,
  res,
  next,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const conversation =
      await createConversation(
        userId,
      );

    return res.status(201).json({
      conversation: {
        id: String(
          conversation.id,
        ),
        title:
          conversation.title,
        createdAt:
          conversation.created_at,
        updatedAt:
          conversation.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Create chat conversation error:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| GET /api/chat/conversations/:conversationId
|--------------------------------------------------------------------------
| Obtiene los mensajes de una conversación específica.
|--------------------------------------------------------------------------
*/

export async function getChatConversation(
  req,
  res,
  next,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      conversationId,
    } = conversationIdSchema.parse(
      req.params,
    );

    const conversation =
      await getConversationById(
        userId,
        BigInt(conversationId),
      );

    if (!conversation) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "La conversación no existe o no pertenece al usuario.",
      });
    }

    const messages =
      await getConversationMessages(
        BigInt(conversationId),
      );

    return res.status(200).json({
      conversation: {
        id: String(
          conversation.id,
        ),
        title:
          conversation.title,
        createdAt:
          conversation.created_at,
        updatedAt:
          conversation.updated_at,
      },

      messages: messages.map(
        (message) => ({
          id: String(message.id),
          role: message.role,
          content:
            message.content,
          createdAt:
            message.created_at,
        }),
      ),
    });
  } catch (error) {
    console.error(
      "Get chat conversation error:",
      error,
    );

    if (
      error?.name ===
      "ZodError"
    ) {
      return res.status(400).json({
        error:
          "Invalid conversation",
        message:
          "El identificador de la conversación no es válido.",
      });
    }

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| DELETE /api/chat/conversations/:conversationId
|--------------------------------------------------------------------------
| Elimina una conversación y todos sus mensajes.
|--------------------------------------------------------------------------
*/

export async function deleteChatConversation(
  req,
  res,
  next,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const {
      conversationId,
    } = conversationIdSchema.parse(
      req.params,
    );

    const conversation =
      await getConversationById(
        userId,
        BigInt(conversationId),
      );

    if (!conversation) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "La conversación no existe o no pertenece al usuario.",
      });
    }

    const pool = getMySqlPool();

    await pool.execute(
      `
        DELETE FROM chat_conversations
        WHERE id = ?
          AND user_id = ?
      `,
      [
        BigInt(conversationId),
        userId,
      ],
    );

    return res.status(200).json({
      message:
        "Conversación eliminada correctamente.",
      conversationId:
        conversationId,
    });
  } catch (error) {
    console.error(
      "Delete chat conversation error:",
      error,
    );

    if (
      error?.name ===
      "ZodError"
    ) {
      return res.status(400).json({
        error:
          "Invalid conversation",
        message:
          "El identificador de la conversación no es válido.",
      });
    }

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| POST /api/chat/message
|--------------------------------------------------------------------------
| Envía mensaje a una conversación específica.
|--------------------------------------------------------------------------
*/

export async function sendChatMessage(
  req,
  res,
  next,
) {
  try {
    const body =
      messageSchema.parse(
        req.body,
      );

    if (!env.GEMINI_API_KEY) {
      return res.status(503).json({
        error:
          "Service Unavailable",
        message:
          "El chatbot de IA no está configurado.",
      });
    }

    const userId =
      getAuthenticatedUserId(req);

    let conversation;

    /*
     * Si el frontend manda conversationId,
     * usamos esa conversación.
     */
    if (body.conversationId) {
      conversation =
        await getConversationById(
          userId,
          BigInt(
            body.conversationId,
          ),
        );

      if (!conversation) {
        return res.status(404).json({
          error: "Not Found",
          message:
            "La conversación no existe o no pertenece al usuario.",
        });
      }
    } else {
      /*
       * Compatibilidad con el flujo anterior:
       * si no manda conversationId,
       * creamos una nueva conversación.
       */
      conversation =
        await createConversation(
          userId,
        );
    }

    /*
     * Recuperar historial de ESTA conversación.
     */
    const storedMessages =
      await getConversationMessages(
        BigInt(
          conversation.id,
        ),
      );

    const history =
      storedMessages.map(
        (message) => ({
          role:
            message.role,
          content:
            message.content,
        }),
      );

    /*
     * Si todavía no tiene mensajes,
     * ponemos como título el primer mensaje.
     */
    if (
      storedMessages.length === 0
    ) {
      const title =
        generateConversationTitle(
          body.message,
        );

      await updateConversationTitle(
        BigInt(
          conversation.id,
        ),
        title,
      );

      conversation.title =
        title;
    }

    /*
     * Guardar mensaje del usuario.
     */
    await saveMessage(
      BigInt(
        conversation.id,
      ),
      "user",
      body.message,
    );

    /*
     * Gemini utiliza únicamente
     * el historial de ESTA conversación.
     */
    const reply =
      await callGemini(
        body.message,
        history,
      );

    /*
     * Guardar respuesta de IA.
     */
    await saveMessage(
      BigInt(
        conversation.id,
      ),
      "assistant",
      reply,
    );

    return res.status(200).json({
      reply,

      conversationId:
        String(
          conversation.id,
        ),
    });
  } catch (error) {
    console.error(
      "Gemini API error:",
      error,
    );

    const status =
      error?.status ?? error?.code;

    if (
      status === 401 ||
      status ===
        "UNAUTHENTICATED"
    ) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "La sesión del usuario no es válida.",
      });
    }

    if (
      status === 503 ||
      status === "UNAVAILABLE"
    ) {
      return res.status(503).json({
        error:
          "AI temporarily unavailable",
        message:
          "El asistente de VitalMind está temporalmente saturado. Intenta nuevamente en unos segundos.",
      });
    }

    if (
      status === 429 ||
      status ===
        "RESOURCE_EXHAUSTED"
    ) {
      return res.status(429).json({
        error: "AI rate limit",
        message:
          "El asistente de VitalMind alcanzó temporalmente el límite de solicitudes.",
      });
    }

    if (
      error?.name ===
      "ZodError"
    ) {
      return res.status(400).json({
        error:
          "Invalid request",
        message:
          "La información enviada no tiene un formato válido.",
      });
    }

    return next(error);
  }
}