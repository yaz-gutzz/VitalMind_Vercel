import { useEffect, useRef, useState } from "react";
import {
  Send,
  Mic,
  Image as ImageIcon,
  Brain,
  User,
  Sparkles,
  Menu,
  Plus,
  Trash2,
  X,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import vitalMindLogo from "../../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";

import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";

/*
|--------------------------------------------------------------------------
| Tipos
|--------------------------------------------------------------------------
*/

type Message = {
  id: number | string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;

  /*
   * Preparado para la futura función de imágenes.
   * Por ahora los mensajes normales son "text".
   */
  type?: "text" | "image";
  imageUrl?: string;
};

type ChatResponse = {
  reply: string;
  conversationId: string;
};

type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
};

type ConversationResponse = {
  conversation: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  };
  messages: ConversationMessage[];
};

type ConversationsResponse = {
  conversations: Conversation[];
};

type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

/*
|--------------------------------------------------------------------------
| Sugerencias
|--------------------------------------------------------------------------
|
| Se mantienen SIEMPRE visibles.
|--------------------------------------------------------------------------
*/

const quickSuggestions = [
  "¿Cómo mejorar mi sueño?",
  "¿Qué puedo hacer para reducir el estrés?",
  "¿Qué hábitos saludables me recomiendas?",
  "¿Cuánta agua debería tomar?",
  "¿Qué ejercicio podría hacer?",
];

const WELCOME_MESSAGE =
  "Hola, soy VitalMind AI, tu asistente inteligente de salud 🧠. Puedo orientarte sobre síntomas, hábitos saludables y bienestar. ¿En qué te puedo ayudar hoy?";

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

/**
 * Obtener todas las conversaciones del usuario.
 */
const getConversations =
  async (): Promise<ConversationsResponse> => {
    return apiRequest<ConversationsResponse>(
      "/chat/conversations",
      {
        method: "GET",
      },
    );
  };

/**
 * Crear una nueva conversación.
 */
const createConversation =
  async (): Promise<{
    conversation: Conversation;
  }> => {
    return apiRequest(
      "/chat/conversations",
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
  };

/**
 * Obtener una conversación específica.
 */
const getConversation = async (
  conversationId: string,
): Promise<ConversationResponse> => {
  return apiRequest<ConversationResponse>(
    `/chat/conversations/${conversationId}`,
    {
      method: "GET",
    },
  );
};

/**
 * Eliminar conversación.
 */
const deleteConversation =
  async (
    conversationId: string,
  ) => {
    return apiRequest(
      `/chat/conversations/${conversationId}`,
      {
        method: "DELETE",
      },
    );
  };

/**
 * Enviar mensaje a Gemini mediante el backend.
 */
const sendToChat = async (
  message: string,
  conversationId: string,
  history: ChatHistoryItem[],
): Promise<ChatResponse> => {
  return apiRequest<ChatResponse>(
    "/chat/message",
    {
      method: "POST",
      body: JSON.stringify({
        message,
        conversationId,
        history,
      }),
    },
  );
};

/*
|--------------------------------------------------------------------------
| Utilidades
|--------------------------------------------------------------------------
*/

/**
 * Convierte una respuesta del backend
 * en mensajes visuales del frontend.
 */
function mapConversationMessages(
  messages: ConversationMessage[],
): Message[] {
  return messages.map(
    (message) => ({
      id: message.id,
      text: message.content,

      sender:
        message.role === "user"
          ? "user"
          : "bot",

      timestamp: new Date(
        message.createdAt,
      ),

      type: "text",
    }),
  );
}

/**
 * Formatea la fecha de una conversación.
 */
function formatConversationDate(
  date: string,
) {
  const conversationDate =
    new Date(date);

  const now = new Date();

  const sameDay =
    conversationDate.toDateString() ===
    now.toDateString();

  if (sameDay) {
    return conversationDate.toLocaleTimeString(
      "es-MX",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  }

  const yesterday =
    new Date(now);

  yesterday.setDate(
    now.getDate() - 1,
  );

  if (
    conversationDate.toDateString() ===
    yesterday.toDateString()
  ) {
    return "Ayer";
  }

  return conversationDate.toLocaleDateString(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
    },
  );
}

/*
|--------------------------------------------------------------------------
| Componente
|--------------------------------------------------------------------------
*/

export function ChatbotScreen() {
  const { dark } = useTheme();

  /*
  |--------------------------------------------------------------------------
  | Conversaciones
  |--------------------------------------------------------------------------
  */

  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Mensajes
  |--------------------------------------------------------------------------
  */

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: "welcome",
        text: WELCOME_MESSAGE,
        sender: "bot",
        timestamp: new Date(),
        type: "text",
      },
    ]);

  /*
  |--------------------------------------------------------------------------
  | Estados
  |--------------------------------------------------------------------------
  */

  const [
    inputText,
    setInputText,
  ] = useState("");

  const [typing, setTyping] =
    useState(false);

  const [
    loadingConversations,
    setLoadingConversations,
  ] = useState(true);

  const [
    loadingConversation,
    setLoadingConversation,
  ] = useState(false);

  const [
    creatingConversation,
    setCreatingConversation,
  ] = useState(false);

  const [
    deletingConversation,
    setDeletingConversation,
  ] = useState(false);

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const endRef =
    useRef<HTMLDivElement>(null);

  /*
  |--------------------------------------------------------------------------
  | Conversación actual
  |--------------------------------------------------------------------------
  */

  const activeConversation =
    conversations.find(
      (conversation) =>
        conversation.id ===
        activeConversationId,
    ) ?? null;

  /*
  |--------------------------------------------------------------------------
  | Cargar conversaciones
  |--------------------------------------------------------------------------
  */

  const loadConversations =
    async () => {
      try {
        setLoadingConversations(true);

        const result =
          await getConversations();

        const list =
          result.conversations ?? [];

        setConversations(list);

        /*
         * Si no existen conversaciones,
         * creamos automáticamente la primera.
         */
        if (list.length === 0) {
          const created =
            await createConversation();

          setConversations([
            created.conversation,
          ]);

          setActiveConversationId(
            created.conversation.id,
          );

          setMessages([
            {
              id: "welcome",
              text: WELCOME_MESSAGE,
              sender: "bot",
              timestamp: new Date(),
              type: "text",
            },
          ]);

          return;
        }

        /*
         * Si ya tenemos una conversación activa
         * y todavía existe, mantenemos esa.
         */
        const currentStillExists =
          activeConversationId &&
          list.some(
            (conversation) =>
              conversation.id ===
              activeConversationId,
          );

        if (
          !currentStillExists
        ) {
          /*
           * Abrimos la conversación más reciente.
           */
          setActiveConversationId(
            list[0].id,
          );
        }
      } catch (error) {
        console.error(
          "Error cargando conversaciones:",
          error,
        );
      } finally {
        setLoadingConversations(
          false,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Carga inicial
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadConversations();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Cargar conversación activa
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    let cancelled = false;

    const loadActiveConversation =
      async () => {
        try {
          setLoadingConversation(
            true,
          );

          const result =
            await getConversation(
              activeConversationId,
            );

          if (cancelled) {
            return;
          }

          const storedMessages =
            mapConversationMessages(
              result.messages,
            );

          /*
           * Si la conversación todavía
           * no tiene mensajes, mostramos
           * bienvenida.
           */
          if (
            storedMessages.length === 0
          ) {
            setMessages([
              {
                id: "welcome",
                text: WELCOME_MESSAGE,
                sender: "bot",
                timestamp:
                  new Date(),
                type: "text",
              },
            ]);
          } else {
            setMessages(
              storedMessages,
            );
          }
        } catch (error) {
          if (!cancelled) {
            console.error(
              "Error cargando conversación:",
              error,
            );

            setMessages([
              {
                id: "welcome",
                text: WELCOME_MESSAGE,
                sender: "bot",
                timestamp:
                  new Date(),
                type: "text",
              },
            ]);
          }
        } finally {
          if (!cancelled) {
            setLoadingConversation(
              false,
            );
          }
        }
      };

    loadActiveConversation();

    return () => {
      cancelled = true;
    };
  }, [activeConversationId]);

  /*
  |--------------------------------------------------------------------------
  | Scroll automático
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    messages,
    typing,
    loadingConversation,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Nueva conversación
  |--------------------------------------------------------------------------
  */

  const handleNewConversation =
    async () => {
      if (creatingConversation) {
        return;
      }

      try {
        setCreatingConversation(
          true,
        );

        const result =
          await createConversation();

        setConversations(
          (previous) => [
            result.conversation,
            ...previous,
          ],
        );

        setActiveConversationId(
          result.conversation.id,
        );

        setMessages([
          {
            id: "welcome",
            text: WELCOME_MESSAGE,
            sender: "bot",
            timestamp: new Date(),
            type: "text",
          },
        ]);

        setSidebarOpen(false);
      } catch (error) {
        console.error(
          "Error creando conversación:",
          error,
        );
      } finally {
        setCreatingConversation(
          false,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Seleccionar conversación
  |--------------------------------------------------------------------------
  */

  const handleSelectConversation =
    (
      conversationId: string,
    ) => {
      if (
        conversationId ===
        activeConversationId
      ) {
        setSidebarOpen(false);
        return;
      }

      setActiveConversationId(
        conversationId,
      );

      setSidebarOpen(false);
    };

  /*
  |--------------------------------------------------------------------------
  | Eliminar conversación
  |--------------------------------------------------------------------------
  */

  const handleDeleteConversation =
    async (
      conversationId: string,
    ) => {
      if (deletingConversation) {
        return;
      }

      const confirmed =
        window.confirm(
          "¿Quieres eliminar esta conversación? Esta acción no se puede deshacer.",
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingConversation(
          true,
        );

        await deleteConversation(
          conversationId,
        );

        const remaining =
          conversations.filter(
            (conversation) =>
              conversation.id !==
              conversationId,
          );

        /*
         * Si todavía hay conversaciones,
         * abrimos la primera.
         */
        if (remaining.length > 0) {
          setConversations(
            remaining,
          );

          if (
            activeConversationId ===
            conversationId
          ) {
            setActiveConversationId(
              remaining[0].id,
            );
          }

          return;
        }

        /*
         * Si ya no queda ninguna,
         * creamos una nueva.
         */
        const created =
          await createConversation();

        setConversations([
          created.conversation,
        ]);

        setActiveConversationId(
          created.conversation.id,
        );

        setMessages([
          {
            id: "welcome",
            text: WELCOME_MESSAGE,
            sender: "bot",
            timestamp: new Date(),
            type: "text",
          },
        ]);
      } catch (error) {
        console.error(
          "Error eliminando conversación:",
          error,
        );
      } finally {
        setDeletingConversation(
          false,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Enviar mensaje
  |--------------------------------------------------------------------------
  */

  const handleSend = (
    text?: string,
  ) => {
    const msg =
      text ?? inputText;

    if (
      !msg.trim() ||
      typing ||
      loadingConversation ||
      !activeConversationId
    ) {
      return;
    }

    const cleanMessage =
      msg.trim();

    const userMsg: Message = {
      id: Date.now(),
      text: cleanMessage,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    };

    /*
     * Historial que tenemos visible.
     *
     * El backend de todas formas obtiene
     * el historial real desde MySQL.
     */
    const history: ChatHistoryItem[] =
      messages
        .filter(
          (message) =>
            message.id !==
            "welcome",
        )
        .filter(
          (message) =>
            message.type !==
            "image",
        )
        .map(
          (message) => ({
            role:
              message.sender ===
              "user"
                ? "user"
                : "assistant",

            content:
              message.text,
          }),
        );

    setMessages(
      (previous) => [
        ...previous,
        userMsg,
      ],
    );

    setInputText("");
    setTyping(true);

    sendToChat(
      cleanMessage,
      activeConversationId,
      history,
    )
      .then((result) => {
        const botMsg: Message = {
          id: Date.now() + 1,

          text:
            result.reply ||
            "No recibí una respuesta válida del asistente.",

          sender: "bot",

          timestamp: new Date(),

          type: "text",
        };

        setMessages(
          (previous) => [
            ...previous,
            botMsg,
          ],
        );

        /*
         * Actualizamos el título visual
         * inmediatamente cuando era
         * una conversación nueva.
         */
        setConversations(
          (previous) =>
            previous.map(
              (conversation) => {
                if (
                  conversation.id !==
                  activeConversationId
                ) {
                  return conversation;
                }

                if (
                  conversation.title !==
                    "Nueva conversación" &&
                  conversation.messageCount >
                    0
                ) {
                  return {
                    ...conversation,
                    updatedAt:
                      new Date().toISOString(),
                    messageCount:
                      conversation.messageCount +
                      2,
                  };
                }

                return {
                  ...conversation,
                  title:
                    cleanMessage.length >
                    55
                      ? `${cleanMessage.slice(
                          0,
                          52,
                        )}...`
                      : cleanMessage,

                  updatedAt:
                    new Date().toISOString(),

                  messageCount:
                    conversation.messageCount +
                    2,
                };
              },
            ),
        );

        /*
         * Sincronizar títulos y fechas
         * con el backend.
         */
        loadConversations();
      })
      .catch((error) => {
        console.error(
          "Error del chatbot:",
          error,
        );

        const errMsg: Message = {
          id: Date.now() + 1,

          text:
            error instanceof Error
              ? error.message
              : "No pude conectarme con el asistente de IA. Intenta de nuevo en un momento.",

          sender: "bot",

          timestamp: new Date(),

          type: "text",
        };

        setMessages(
          (previous) => [
            ...previous,
            errMsg,
          ],
        );
      })
      .finally(() => {
        setTyping(false);
      });
  };

  /*
  |--------------------------------------------------------------------------
  | Abrir/cerrar panel
  |--------------------------------------------------------------------------
  */

  const toggleSidebar = () => {
    setSidebarOpen(
      (previous) => !previous,
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="h-full flex flex-col transition-colors relative"
      style={{
        backgroundColor: dark
          ? "#070A12"
          : "#F8FAFC",
      }}
    >
      {/* --------------------------------------------------------------- */}
      {/* PANEL DE CONVERSACIONES                                        */}
      {/* --------------------------------------------------------------- */}

      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setSidebarOpen(
                  false,
                )
              }
              className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
            />

            {/* Panel */}
            <motion.aside
              initial={{
                x: -320,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: -320,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 30,
              }}
              className={`absolute top-0 bottom-0 left-0 z-50 w-[310px] max-w-[88%] shadow-2xl ${
                dark
                  ? "bg-[#0B1120] border-r border-slate-800"
                  : "bg-white border-r border-slate-200"
              }`}
            >
              {/* Panel header */}
              <div
                className={`p-4 border-b ${
                  dark
                    ? "border-slate-800"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2
                      className={`font-bold text-base ${
                        dark
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      Conversaciones
                    </h2>

                    <p
                      className={`text-xs mt-1 ${
                        dark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Tus conversaciones
                      de VitalMind
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSidebarOpen(
                        false,
                      )
                    }
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      dark
                        ? "hover:bg-slate-800 text-slate-300"
                        : "hover:bg-slate-100 text-slate-500"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Nueva conversación */}
                <button
                  type="button"
                  onClick={
                    handleNewConversation
                  }
                  disabled={
                    creatingConversation
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-[#0F766E] text-white font-medium text-sm hover:bg-[#0D6B64] transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />

                  {creatingConversation
                    ? "Creando..."
                    : "Nueva conversación"}
                </button>
              </div>

              {/* Lista */}
              <div className="overflow-y-auto h-[calc(100%-150px)] p-3">
                {loadingConversations ? (
                  <div
                    className={`text-sm text-center py-8 ${
                      dark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    Cargando conversaciones...
                  </div>
                ) : conversations.length ===
                  0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                    <MessageSquare
                      className={`w-10 h-10 mb-3 ${
                        dark
                          ? "text-slate-600"
                          : "text-slate-300"
                      }`}
                    />

                    <p
                      className={`text-sm font-medium ${
                        dark
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      No hay conversaciones
                    </p>

                    <p
                      className={`text-xs mt-1 ${
                        dark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      Crea una para comenzar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map(
                      (conversation) => {
                        const isActive =
                          conversation.id ===
                          activeConversationId;

                        return (
                          <motion.div
                            key={
                              conversation.id
                            }
                            layout
                            className={`group rounded-xl border transition-colors ${
                              isActive
                                ? dark
                                  ? "bg-[#102827] border-[#0F766E]"
                                  : "bg-[#ECFDF5] border-[#99F6E4]"
                                : dark
                                  ? "bg-transparent border-transparent hover:bg-slate-900"
                                  : "bg-transparent border-transparent hover:bg-slate-50"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                handleSelectConversation(
                                  conversation.id,
                                )
                              }
                              className="w-full text-left p-3"
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    isActive
                                      ? "bg-[#0F766E] text-white"
                                      : dark
                                        ? "bg-slate-800 text-slate-400"
                                        : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-sm font-medium truncate ${
                                      dark
                                        ? "text-slate-200"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    {conversation.title}
                                  </p>

                                  <p
                                    className={`text-[11px] mt-1 ${
                                      dark
                                        ? "text-slate-500"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {formatConversationDate(
                                      conversation.updatedAt,
                                    )}
                                    {" • "}
                                    {
                                      conversation.messageCount
                                    }{" "}
                                    mensajes
                                  </p>
                                </div>
                              </div>
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();

                                handleDeleteConversation(
                                  conversation.id,
                                );
                              }}
                              disabled={
                                deletingConversation
                              }
                              className={`absolute ml-[-42px] mt-[14px] w-8 h-8 rounded-lg items-center justify-center hidden group-hover:flex ${
                                dark
                                  ? "text-slate-500 hover:text-red-400 hover:bg-slate-800"
                                  : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                              }`}
                              title="Eliminar conversación"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      },
                    )}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --------------------------------------------------------------- */}
      {/* HEADER                                                         */}
      {/* --------------------------------------------------------------- */}

      <div
        className="px-5 sm:px-6 pt-8 sm:pt-12 pb-5 sm:pb-6 rounded-b-[32px] flex-shrink-0"
        style={{
          background:
            "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Menu */}
            <button
              type="button"
              onClick={
                toggleSidebar
              }
              className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Abrir conversaciones"
            >
              <Menu className="w-5 h-5" />
            </button>

            <ImageWithFallback
              src={vitalMindLogo}
              alt="VitalMind AI"
              className="h-7 w-auto object-contain brightness-0 invert"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse" />

            <span className="text-white/90 text-xs font-medium">
              IA activa
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <Brain
              className="w-6 h-6 text-white"
              strokeWidth={1.5}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white">
              VitalMind Chat
            </h1>

            <p className="text-white/70 text-xs truncate">
              {activeConversation?.title ||
                "Tu asistente de salud inteligente"}
            </p>
          </div>

          <Sparkles className="w-5 h-5 text-[#F59E0B]" />
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* MESSAGES                                                        */}
      {/* --------------------------------------------------------------- */}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-5 space-y-4">
        {loadingConversation ? (
          <div className="flex items-center justify-center py-8">
            <div
              className={`text-xs ${
                dark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Cargando conversación...
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.2,
                }}
                className={`flex ${
                  msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2.5 max-w-[90%] sm:max-w-[82%] ${
                    msg.sender === "user"
                      ? "flex-row-reverse"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === "user"
                        ? "bg-[#0F766E]"
                        : "bg-[#14B8A6]"
                    }`}
                  >
                    {msg.sender ===
                    "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Brain className="w-4 h-4 text-white" />
                    )}
                  </div>

                  <div className="min-w-0">
                    {/* Bubble */}
                    <div
                      className={`rounded-[20px] px-4 py-3 ${
                        msg.sender ===
                        "user"
                          ? "bg-[#0F766E] text-white"
                          : dark
                            ? "bg-[#0D1322] border border-slate-700 text-slate-200"
                            : "bg-white border border-[#E2E8F0] text-slate-700"
                      }`}
                    >
                      {/* Future image message support */}
                      {msg.type ===
                        "image" &&
                      msg.imageUrl ? (
                        <img
                          src={
                            msg.imageUrl
                          }
                          alt="Imagen enviada"
                          className="max-w-full rounded-xl"
                        />
                      ) : msg.sender ===
                        "bot" ? (
                        <div
                          className={`text-sm leading-relaxed ${
                            dark
                              ? "text-slate-200"
                              : "text-slate-700"
                          }`}
                        >
                          <ReactMarkdown
                            components={{
                              p: ({
                                children,
                              }) => (
                                <p className="mb-3 last:mb-0 leading-6">
                                  {
                                    children
                                  }
                                </p>
                              ),

                              strong: ({
                                children,
                              }) => (
                                <strong
                                  className={
                                    dark
                                      ? "font-bold text-white"
                                      : "font-bold text-slate-900"
                                  }
                                >
                                  {
                                    children
                                  }
                                </strong>
                              ),

                              ul: ({
                                children,
                              }) => (
                                <ul className="list-disc ml-5 mb-3 space-y-1">
                                  {
                                    children
                                  }
                                </ul>
                              ),

                              ol: ({
                                children,
                              }) => (
                                <ol className="list-decimal ml-5 mb-3 space-y-1">
                                  {
                                    children
                                  }
                                </ol>
                              ),

                              li: ({
                                children,
                              }) => (
                                <li className="pl-1 leading-6">
                                  {
                                    children
                                  }
                                </li>
                              ),

                              h1: ({
                                children,
                              }) => (
                                <h1
                                  className={`text-base font-bold mb-2 ${
                                    dark
                                      ? "text-white"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {
                                    children
                                  }
                                </h1>
                              ),

                              h2: ({
                                children,
                              }) => (
                                <h2
                                  className={`text-base font-bold mb-2 ${
                                    dark
                                      ? "text-white"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {
                                    children
                                  }
                                </h2>
                              ),

                              h3: ({
                                children,
                              }) => (
                                <h3
                                  className={`text-sm font-bold mb-2 ${
                                    dark
                                      ? "text-white"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {
                                    children
                                  }
                                </h3>
                              ),

                              blockquote: ({
                                children,
                              }) => (
                                <blockquote
                                  className={`border-l-4 pl-3 my-3 italic ${
                                    dark
                                      ? "border-teal-400 text-slate-300"
                                      : "border-teal-600 text-slate-600"
                                  }`}
                                >
                                  {
                                    children
                                  }
                                </blockquote>
                              ),

                              code: ({
                                children,
                              }) => (
                                <code
                                  className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                                    dark
                                      ? "bg-slate-800 text-teal-300"
                                      : "bg-slate-100 text-teal-700"
                                  }`}
                                >
                                  {
                                    children
                                  }
                                </code>
                              ),
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p
                      className="text-[10px] mt-1 px-2"
                      style={{
                        color: dark
                          ? "#64748B"
                          : "#94A3B8",
                      }}
                    >
                      {msg.timestamp.toLocaleTimeString(
                        "es-MX",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Typing */}
            {typing && (
              <div className="flex justify-start">
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#14B8A6] flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>

                  <div
                    className={`rounded-[20px] px-5 py-3.5 flex gap-1.5 ${
                      dark
                        ? "bg-[#0D1322] border border-slate-700"
                        : "bg-white border border-[#E2E8F0]"
                    }`}
                  >
                    {[
                      0,
                      1,
                      2,
                    ].map(
                      (i) => (
                        <motion.div
                          key={i}
                          animate={{
                            y: [-2, 2, -2],
                          }}
                          transition={{
                            repeat:
                              Infinity,
                            duration: 0.6,
                            delay:
                              i * 0.15,
                          }}
                          className="w-2 h-2 bg-[#0F766E] rounded-full"
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={endRef} />
      </div>

      {/* --------------------------------------------------------------- */}
      {/* SUGERENCIAS — SIEMPRE VISIBLES                                 */}
      {/* --------------------------------------------------------------- */}

      <div className="flex-shrink-0 px-4 sm:px-5 pb-3">
        <p
          className="text-xs mb-2 font-medium"
          style={{
            color: dark
              ? "#94A3B8"
              : "#64748B",
          }}
        >
          Puedes preguntarme sobre...
        </p>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickSuggestions.map(
            (suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  handleSend(
                    suggestion,
                  )
                }
                disabled={
                  typing ||
                  loadingConversation
                }
                className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50 ${
                  dark
                    ? "bg-[#0D1322] border border-slate-700 text-slate-300 hover:border-[#0F766E] hover:bg-[#111827]"
                    : "bg-white border border-[#E2E8F0] text-slate-600 hover:border-[#0F766E] hover:bg-[#F0FDFA]"
                }`}
              >
                {suggestion}
              </button>
            ),
          )}
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* INPUT                                                           */}
      {/* --------------------------------------------------------------- */}

      <div className="flex-shrink-0 px-4 sm:px-5 pb-5 pt-2">
        <div
          className={`rounded-[24px] p-2 flex items-center gap-2 shadow-sm ${
            dark
              ? "bg-[#0D1322] border border-slate-700"
              : "bg-white border border-[#E2E8F0]"
          }`}
        >
          {/* Image button */}
          <button
            type="button"
            disabled
            title="Enviar imagen — próximamente"
            className={`w-10 h-10 rounded-full flex items-center justify-center opacity-50 cursor-not-allowed ${
              dark
                ? "bg-[#090D16] text-slate-500"
                : "bg-[#F8FAFC] text-slate-400"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Input */}
          <input
            type="text"
            value={inputText}
            onChange={(event) =>
              setInputText(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Escribe tu pregunta..."
            className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-sm"
            style={{
              color: dark
                ? "#F8FAFC"
                : "#0F172A",
            }}
            disabled={
              typing ||
              loadingConversation ||
              !activeConversationId
            }
          />

          {/* Microphone */}
          <button
            type="button"
            disabled
            title="Voz — próximamente"
            className={`w-10 h-10 rounded-full flex items-center justify-center opacity-50 cursor-not-allowed ${
              dark
                ? "bg-[#090D16] text-slate-500"
                : "bg-[#F8FAFC] text-slate-400"
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Send */}
          <button
            type="button"
            onClick={() =>
              handleSend()
            }
            disabled={
              !inputText.trim() ||
              typing ||
              loadingConversation ||
              !activeConversationId
            }
            className="w-10 h-10 bg-[#0F766E] text-white rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Mobile back affordance when sidebar isn't obvious               */}
      {/* --------------------------------------------------------------- */}

      {activeConversation &&
        sidebarOpen === false && (
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(true)
            }
            className={`sm:hidden absolute left-3 top-[74px] z-10 w-8 h-8 rounded-full flex items-center justify-center ${
              dark
                ? "bg-[#0D1322] text-slate-400 border border-slate-700"
                : "bg-white text-slate-500 border border-slate-200 shadow-sm"
            }`}
            aria-label="Ver conversaciones"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
        )}
    </div>
  );
}