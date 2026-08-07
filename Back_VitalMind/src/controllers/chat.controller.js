import { z } from "zod";
import { env } from "../config/env.js";

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

const SYSTEM_PROMPT = `Eres VitalMind AI, el asistente de salud y bienestar dentro de la app VitalMind.
Ayudas con hábitos saludables, dudas generales de bienestar, sueño, alimentación, ejercicio y manejo del estrés.
Responde siempre en español, de forma breve, clara y empática.
Nunca inventes datos médicos ni diagnósticos. Si el usuario describe síntomas que podrían ser graves,
recomiéndale claramente consultar a un profesional de la salud o acudir a un servicio de urgencias si es necesario.
No debes inventar información falsa: si no sabes algo, dilo con honestidad.`;

// Llama a la API de Anthropic para generar una respuesta real (no respuestas
// fijas por palabra clave). Requiere la variable de entorno ANTHROPIC_API_KEY.
async function callAnthropic(message, history) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [...history, { role: "user", content: message }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const error = new Error(`Anthropic API error (${response.status}): ${detail}`);
    error.status = 502;
    throw error;
  }

  const data = await response.json();
  const text = (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return text || "No pude generar una respuesta en este momento. Intenta de nuevo.";
}

export async function sendChatMessage(req, res, next) {
  try {
    const body = messageSchema.parse(req.body);

    if (!env.ANTHROPIC_API_KEY) {
      return res.status(503).json({
        error: "Service Unavailable",
        message:
          "El chatbot de IA no está configurado todavía. Define la variable de entorno ANTHROPIC_API_KEY en el backend (.env) para activar respuestas reales.",
      });
    }

    const reply = await callAnthropic(body.message, body.history);
    return res.json({ reply });
  } catch (error) {
    return next(error);
  }
}
