import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Bell,
  Sparkles,
  Clock,
  AlertTriangle,
  Lightbulb,
  ChevronLeft,
  Check,
  RefreshCw,
  Brain,
  Droplets,
  Moon,
  HeartPulse,
  CalendarDays,
} from "lucide-react";

import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type { NotificationItem } from "../../lib/types";
import {
  socket,
  connectSocket,
  disconnectSocket,
} from "../../lib/socket";

/*
|--------------------------------------------------------------------------
| Tipos
|--------------------------------------------------------------------------
*/

type NotifKind =
  | "tip"
  | "reminder"
  | "ai"
  | "alert";

interface Notif {
  id: string;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  source?: string;
  priority?: "high" | "medium" | "low";
}

interface RecommendationResponse {
  user: {
    id: string;
    name: string;
  };

  data: {
    profile: unknown;
    medications: unknown[];
    appointments: unknown[];
    habits: unknown[];
    healthMetrics: unknown[];
    symptoms: unknown[];
    emotionalLogs: unknown[];
    medicalHistory: unknown[];
  };

  recommendations: Array<{
    kind: NotifKind;
    priority: "high" | "medium" | "low";
    source: string;
    title: string;
    body: string;
    time: string;
  }>;
}

/*
|--------------------------------------------------------------------------
| Configuración visual
|--------------------------------------------------------------------------
*/

const kindConfig: Record<
  NotifKind,
  {
    icon: typeof Bell;
    colorLight: string;
    colorDark: string;
    bgLight: string;
    bgDark: string;
    label: string;
  }
> = {
  tip: {
    icon: Lightbulb,
    colorLight: "#D97706",
    colorDark: "#FBBF24",
    bgLight: "#FFFBEB",
    bgDark: "rgba(245, 158, 11, 0.12)",
    label: "Consejo",
  },

  reminder: {
    icon: Clock,
    colorLight: "#2563EB",
    colorDark: "#60A5FA",
    bgLight: "#EFF6FF",
    bgDark: "rgba(37, 99, 235, 0.12)",
    label: "Recordatorio",
  },

  ai: {
    icon: Sparkles,
    colorLight: "#0F766E",
    colorDark: "#2DD4BF",
    bgLight: "#F0FDFA",
    bgDark: "rgba(15, 118, 110, 0.14)",
    label: "IA",
  },

  alert: {
    icon: AlertTriangle,
    colorLight: "#DC2626",
    colorDark: "#F87171",
    bgLight: "#FEF2F2",
    bgDark: "rgba(239, 68, 68, 0.12)",
    label: "Alerta",
  },
};

/*
|--------------------------------------------------------------------------
| Iconos adicionales según fuente
|--------------------------------------------------------------------------
*/

function getSourceIcon(source?: string) {
  switch (source) {
    case "sleep":
    case "sleep_quality":
      return Moon;

    case "hydration":
      return Droplets;

    case "emotional":
    case "energy":
      return Brain;

    case "symptoms":
    case "blood_pressure":
    case "glucose":
      return HeartPulse;

    case "appointments":
      return CalendarDays;

    default:
      return null;
  }
}

/*
|--------------------------------------------------------------------------
| Conversión de notificación existente
|--------------------------------------------------------------------------
*/

function mapNotification(
  item: NotificationItem,
): Notif {
  return {
    id: String(item.id),
    kind: item.kind,
    title: item.title,
    body: item.body,
    time: item.time ?? "Ahora",
    read: Boolean(item.read),
  };
}

/*
|--------------------------------------------------------------------------
| Conversión de recomendaciones
|--------------------------------------------------------------------------
*/

function mapRecommendation(
  item: RecommendationResponse["recommendations"][number],
  index: number,
): Notif {
  return {
    id: `recommendation-${item.source}-${index}`,
    kind: item.kind,
    title: item.title,
    body: item.body,
    time: item.time,
    read: false,
    source: item.source,
    priority: item.priority,
  };
}

/*
|--------------------------------------------------------------------------
| Orden
|--------------------------------------------------------------------------
*/

function sortNotifications(
  items: Notif[],
) {
  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...items].sort(
    (a, b) => {
      const priorityA =
        priorityOrder[
          a.priority ?? "medium"
        ];

      const priorityB =
        priorityOrder[
          b.priority ?? "medium"
        ];

      return priorityA - priorityB;
    },
  );
}

/*
|--------------------------------------------------------------------------
| Pantalla
|--------------------------------------------------------------------------
*/

export function NotificacionesScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [notifications, setNotifications] =
    useState<Notif[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    recommendationsUser,
    setRecommendationsUser,
  ] = useState<{
    id: string;
    name: string;
  } | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Cargar recomendaciones + notificaciones
  |--------------------------------------------------------------------------
  */

  const loadNotifications = async (
    showRefreshing = false,
  ) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      /*
       * Consultamos ambas fuentes.
       *
       * /notifications
       * → notificaciones persistidas
       *
       * /recommendations
       * → recomendaciones personalizadas
       */
      const [
        persistedResult,
        recommendationResult,
      ] = await Promise.all([
        apiRequest<NotificationItem[]>(
          "/notifications",
        ),

        apiRequest<RecommendationResponse>(
          "/recommendations",
        ),
      ]);

      /*
       * Notificaciones normales
       */
      const persistedNotifications =
        (persistedResult ?? []).map(
          mapNotification,
        );

      /*
       * Recomendaciones personalizadas
       */
      const personalizedNotifications =
        (
          recommendationResult?.recommendations ??
          []
        ).map(mapRecommendation);

      /*
       * Guardamos el usuario para mostrar
       * "Recomendaciones para Yazmin", etc.
       */
      if (
        recommendationResult?.user
      ) {
        setRecommendationsUser(
          recommendationResult.user,
        );
      }

      /*
       * Combinamos ambas fuentes.
       *
       * Primero recomendaciones personalizadas
       * y después notificaciones persistidas.
       */
      const combined = [
        ...personalizedNotifications,
        ...persistedNotifications,
      ];

      setNotifications(
        sortNotifications(combined),
      );
    } catch (requestError) {
      console.error(
        "Error cargando notificaciones:",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar las recomendaciones.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Primera carga
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadNotifications();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Socket.IO
  |--------------------------------------------------------------------------
  |
  | Recibe nuevas notificaciones sin recargar la pantalla.
  */

  useEffect(() => {
    connectSocket();

    const handleNewNotification = (
      incoming: NotificationItem,
    ) => {
      const newNotification =
        mapNotification(incoming);

      setNotifications((current) => {
        const alreadyExists =
          current.some(
            (item) =>
              item.id ===
              newNotification.id,
          );

        if (alreadyExists) {
          return current;
        }

        return sortNotifications([
          newNotification,
          ...current,
        ]);
      });
    };

    const handleConnect = () => {
      console.log(
        "Socket.IO conectado:",
        socket.id,
      );
    };

    const handleDisconnect = (
      reason: string,
    ) => {
      console.log(
        "Socket.IO desconectado:",
        reason,
      );
    };

    const handleConnectError = (
      error: Error,
    ) => {
      console.error(
        "Error de Socket.IO:",
        error.message,
      );
    };

    socket.on(
      "connect",
      handleConnect,
    );

    socket.on(
      "disconnect",
      handleDisconnect,
    );

    socket.on(
      "connect_error",
      handleConnectError,
    );

    socket.on(
      "notification:new",
      handleNewNotification,
    );

    return () => {
      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "disconnect",
        handleDisconnect,
      );

      socket.off(
        "connect_error",
        handleConnectError,
      );

      socket.off(
        "notification:new",
        handleNewNotification,
      );

      disconnectSocket();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | No leídas
  |--------------------------------------------------------------------------
  */

  const unread =
    notifications.filter(
      (notification) =>
        !notification.read,
    ).length;

  /*
  |--------------------------------------------------------------------------
  | Marcar notificaciones persistidas
  | como leídas
  |--------------------------------------------------------------------------
  */

  const markAllRead = () => {
    apiRequest(
      "/notifications/mark-all-read",
      {
        method: "PATCH",
      },
    )
      .then(() => {
        connectSocket();
        return loadNotifications(true);
      })
      .catch((requestError) => {
        console.error(
          "Error marcando notificaciones:",
          requestError,
        );
      });
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="h-full overflow-y-auto transition-colors"
      style={{
        backgroundColor: dark
          ? "#070A12"
          : "#F8FAFC",
      }}
    >
      {/* -------------------------------------------------------------- */}
      {/* HEADER                                                         */}
      {/* -------------------------------------------------------------- */}

      <div
        className="px-5 sm:px-6 pt-8 sm:pt-12 pb-8"
        style={{
          background:
            "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">
              Notificaciones
            </h1>

            <p className="text-white/70 text-sm">
              {recommendationsUser
                ? `Recomendaciones para ${recommendationsUser.name}`
                : `${unread} sin leer`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              connectSocket();
              loadNotifications(true);
            }}
            disabled={refreshing}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw
              className={`w-4 h-4 text-white ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
          </button>

          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="hidden sm:flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-white text-xs font-medium hover:bg-white/30 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Marcar todo leído
            </button>
          )}
        </div>

        {/* Resumen */}
        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div className="flex items-center gap-2 text-white/75 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />

              <span>
                Recomendaciones basadas en
                tus registros recientes
              </span>
            </div>
          )}
      </div>

      {/* -------------------------------------------------------------- */}
      {/* CONTENIDO                                                      */}
      {/* -------------------------------------------------------------- */}

      <div className="px-5 mt-6 space-y-3 pb-6">
        {/* Loading */}
        {loading && (
          <>
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className={`rounded-[20px] p-4 border animate-pulse ${
                    dark
                      ? "border-slate-800 bg-[#0D1322]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl ${
                        dark
                          ? "bg-slate-800"
                          : "bg-slate-100"
                      }`}
                    />

                    <div className="flex-1">
                      <div
                        className={`h-4 rounded w-1/3 mb-2 ${
                          dark
                            ? "bg-slate-800"
                            : "bg-slate-100"
                        }`}
                      />

                      <div
                        className={`h-3 rounded w-full mb-2 ${
                          dark
                            ? "bg-slate-800"
                            : "bg-slate-100"
                        }`}
                      />

                      <div
                        className={`h-3 rounded w-1/2 ${
                          dark
                            ? "bg-slate-800"
                            : "bg-slate-100"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ),
            )}
          </>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            className={`rounded-[20px] p-5 border text-center ${
              dark
                ? "bg-[#0D1322] border-red-500/20"
                : "bg-white border-red-100"
            }`}
          >
            <AlertTriangle
              className="w-8 h-8 mx-auto mb-3 text-red-500"
            />

            <p
              className={`text-sm font-semibold ${
                dark
                  ? "text-slate-100"
                  : "text-slate-800"
              }`}
            >
              No pudimos cargar tus
              recomendaciones
            </p>

            <p
              className={`text-xs mt-2 ${
                dark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadNotifications()
              }
              className="mt-4 px-4 py-2 rounded-full bg-[#0F766E] text-white text-xs font-medium hover:bg-[#0D6B64] transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          notifications.length ===
            0 && (
            <div
              className={`rounded-[20px] p-8 border text-center ${
                dark
                  ? "bg-[#0D1322] border-slate-800"
                  : "bg-white border-[#E2E8F0]"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  dark
                    ? "bg-teal-500/10"
                    : "bg-teal-50"
                }`}
              >
                <Sparkles
                  className={`w-7 h-7 ${
                    dark
                      ? "text-teal-400"
                      : "text-teal-600"
                  }`}
                />
              </div>

              <p
                className={`text-sm font-semibold ${
                  dark
                    ? "text-slate-100"
                    : "text-slate-800"
                }`}
              >
                Aún no tenemos
                recomendaciones
              </p>

              <p
                className={`text-xs mt-2 leading-relaxed ${
                  dark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                A medida que registres
                hábitos, síntomas,
                sueño, actividad y
                otros datos, VitalMind
                podrá generar
                recomendaciones más
                personalizadas.
              </p>
            </div>
          )}

        {/* Lista */}
        {!loading &&
          !error &&
          notifications.map(
            (notif, index) => {
              const cfg =
                kindConfig[
                  notif.kind
                ];

              const Icon =
                cfg.icon;

              const SourceIcon =
                getSourceIcon(
                  notif.source,
                );

              const isPersonalized =
                Boolean(
                  notif.source,
                );

              return (
                <motion.div
                  key={`${notif.id}-${index}`}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.04,
                  }}
                  className={`rounded-[20px] p-4 border shadow-sm flex gap-3 transition-all ${
                    dark
                      ? !notif.read
                        ? "border-teal-400/20 bg-[#0D1322]"
                        : "border-slate-700 bg-[#0D1322]"
                      : !notif.read
                        ? "border-[#0F766E]/20 bg-[#F0FDFA]"
                        : "border-[#E2E8F0] bg-white"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        dark
                          ? cfg.bgDark
                          : cfg.bgLight,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{
                        color: dark
                          ? cfg.colorDark
                          : cfg.colorLight,
                      }}
                    />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm font-semibold ${
                              dark
                                ? "text-slate-100"
                                : !notif.read
                                  ? "text-slate-800"
                                  : "text-slate-600"
                            }`}
                          >
                            {notif.title}
                          </p>

                          {isPersonalized && (
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
                                dark
                                  ? "bg-teal-400/10 text-teal-300"
                                  : "bg-teal-50 text-teal-700"
                              }`}
                            >
                              PERSONALIZADA
                            </span>
                          )}
                        </div>
                      </div>

                      {!notif.read &&
                        !isPersonalized && (
                          <div className="w-2 h-2 bg-[#0F766E] rounded-full flex-shrink-0 mt-1" />
                        )}
                    </div>

                    <p
                      className={`text-xs leading-relaxed mt-1 ${
                        dark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {notif.body}
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <p
                        className={`text-[10px] ${
                          dark
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        {notif.time}
                      </p>

                      {SourceIcon && (
                        <>
                          <span
                            className={
                              dark
                                ? "text-slate-700"
                                : "text-slate-300"
                            }
                          >
                            •
                          </span>

                          <SourceIcon
                            className={`w-3 h-3 ${
                              dark
                                ? "text-slate-500"
                                : "text-slate-400"
                            }`}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            },
          )}
      </div>
    </div>
  );
}