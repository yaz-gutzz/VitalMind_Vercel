import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Brain,
  Apple,
  Dumbbell,
  Moon,
  Smile,
  AlertTriangle,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Droplets,
  Pill,
  CalendarDays,
  HeartPulse,
  Activity,
  RefreshCw,
  ClipboardList,
} from "lucide-react";

import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";

/*
|--------------------------------------------------------------------------
| Tipos
|--------------------------------------------------------------------------
*/

type RecommendationKind =
  | "tip"
  | "reminder"
  | "ai"
  | "alert";

type RecommendationPriority =
  | "high"
  | "medium"
  | "low";

type Recommendation = {
  kind: RecommendationKind;
  priority: RecommendationPriority;
  source: string;
  title: string;
  body: string;
  time: string;
};

type RecommendationData = {
  profile: {
    id: number | string;
    full_name?: string;
    email?: string;
    age?: number;
    status?: string;
    role?: string;
    blood_type?: string | null;
    phone?: string | null;
    weight_kg?: number | string | null;
    height_cm?: number | string | null;
    last_active_at?: string | null;
  } | null;

  medications: unknown[];
  appointments: unknown[];
  habits: unknown[];
  healthMetrics: unknown[];
  symptoms: unknown[];
  emotionalLogs: unknown[];
  medicalHistory: unknown[];
};

type RecommendationResponse = {
  user: {
    id: string;
    name: string;
  };

  data: RecommendationData;

  recommendations: Recommendation[];
};

/*
|--------------------------------------------------------------------------
| Metadata visual
|--------------------------------------------------------------------------
*/

type CategoryConfig = {
  key: string;
  label: string;
  color: string;
  icon: typeof Apple;
  sources: string[];
};

const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    key: "nutrition",
    label: "Alimentación",
    color: "#22C55E",
    icon: Apple,
    sources: [
      "hydration",
    ],
  },

  {
    key: "activity",
    label: "Actividad física",
    color: "#2563EB",
    icon: Dumbbell,
    sources: [
      "exercise",
    ],
  },

  {
    key: "sleep",
    label: "Descanso",
    color: "#8B5CF6",
    icon: Moon,
    sources: [
      "sleep",
      "sleep_quality",
    ],
  },

  {
    key: "emotional",
    label: "Bienestar emocional",
    color: "#F59E0B",
    icon: Smile,
    sources: [
      "emotional",
      "energy",
    ],
  },
];

/*
|--------------------------------------------------------------------------
| API
|--------------------------------------------------------------------------
*/

async function getRecommendations() {
  return apiRequest<RecommendationResponse>(
    "/recommendations",
    {
      method: "GET",
    },
  );
}

/*
|--------------------------------------------------------------------------
| Completitud de perfil
|--------------------------------------------------------------------------
|
| IMPORTANTE:
| Esto NO representa "salud al 78%".
| Representa qué tan completo está el
| conjunto de datos disponible para
| personalizar recomendaciones.
|--------------------------------------------------------------------------
*/

function calculateProfileCompleteness(
  data: RecommendationData,
) {
  const profile = data.profile;

  if (!profile) {
    return 0;
  }

  let completed = 0;
  let total = 0;

  const checkValue = (
    value: unknown,
  ) => {
    total++;

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      completed++;
    }
  };

  /*
   * Datos básicos del perfil.
   */
  checkValue(profile.full_name);
  checkValue(profile.email);
  checkValue(profile.age);
  checkValue(profile.blood_type);
  checkValue(profile.phone);
  checkValue(profile.weight_kg);
  checkValue(profile.height_cm);

  /*
   * Datos de salud disponibles.
   */
  total++;
  if (
    data.medications.length > 0
  ) {
    completed++;
  }

  total++;
  if (
    data.appointments.length > 0
  ) {
    completed++;
  }

  total++;
  if (
    data.habits.length > 0
  ) {
    completed++;
  }

  total++;
  if (
    data.healthMetrics.length > 0
  ) {
    completed++;
  }

  total++;
  if (
    data.symptoms.length > 0
  ) {
    completed++;
  }

  total++;
  if (
    data.emotionalLogs.length > 0
  ) {
    completed++;
  }

  total++;
  if (
    data.medicalHistory.length > 0
  ) {
    completed++;
  }

  if (total === 0) {
    return 0;
  }

  return Math.round(
    (completed / total) * 100,
  );
}

/*
|--------------------------------------------------------------------------
| Texto de completitud
|--------------------------------------------------------------------------
*/

function getCompletenessText(
  percentage: number,
) {
  if (percentage >= 90) {
    return "Tu perfil contiene suficientes datos para personalizar mejor las recomendaciones.";
  }

  if (percentage >= 70) {
    return "Tu perfil está bastante completo. Puedes agregar algunos datos para mejorar la personalización.";
  }

  if (percentage >= 40) {
    return "Ya tenemos algunos datos. Completa más información para obtener recomendaciones más precisas.";
  }

  return "Completa tu información y registra tus hábitos para obtener recomendaciones más personalizadas.";
}

/*
|--------------------------------------------------------------------------
| Agrupar recomendaciones por categoría
|--------------------------------------------------------------------------
*/

function getCategoryRecommendations(
  recommendations: Recommendation[],
  category: CategoryConfig,
) {
  return recommendations.filter(
    (recommendation) =>
      category.sources.includes(
        recommendation.source,
      ),
  );
}

/*
|--------------------------------------------------------------------------
| Icono para una recomendación
|--------------------------------------------------------------------------
*/

function getRecommendationIcon(
  recommendation: Recommendation,
) {
  switch (recommendation.source) {
    case "hydration":
      return Droplets;

    case "exercise":
      return Activity;

    case "sleep":
    case "sleep_quality":
      return Moon;

    case "emotional":
    case "energy":
      return Smile;

    case "medications":
      return Pill;

    case "appointments":
      return CalendarDays;

    case "symptoms":
    case "blood_pressure":
    case "glucose":
      return HeartPulse;

    case "medical_history":
      return ClipboardList;

    default:
      return Sparkles;
  }
}

/*
|--------------------------------------------------------------------------
| Pantalla
|--------------------------------------------------------------------------
*/

export function RecomendacionesIAScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    user,
    setUser,
  ] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [
    data,
    setData,
  ] = useState<RecommendationData | null>(
    null,
  );

  const [
    recommendations,
    setRecommendations,
  ] = useState<Recommendation[]>(
    [],
  );

  /*
  |--------------------------------------------------------------------------
  | Tema
  |--------------------------------------------------------------------------
  */

  const pageBg = dark
    ? "#070A12"
    : "#F8FAFC";

  const surface = dark
    ? "#0D1322"
    : "#FFFFFF";

  const border = dark
    ? "rgba(148,163,184,0.14)"
    : "#E2E8F0";

  const title = dark
    ? "#F8FAFC"
    : "#0F172A";

  const body = dark
    ? "#CBD5E1"
    : "#475569";

  const muted = dark
    ? "#94A3B8"
    : "#64748B";

  /*
  |--------------------------------------------------------------------------
  | Cargar recomendaciones
  |--------------------------------------------------------------------------
  */

  const loadRecommendations =
    async (
      isRefresh = false,
    ) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const result =
          await getRecommendations();

        setUser(
          result.user ?? null,
        );

        setData(
          result.data ?? null,
        );

        setRecommendations(
          result.recommendations ??
            [],
        );
      } catch (requestError) {
        console.error(
          "Error cargando recomendaciones IA:",
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
    loadRecommendations();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Porcentaje real de completitud
  |--------------------------------------------------------------------------
  */

  const profileCompleteness =
    useMemo(() => {
      if (!data) {
        return 0;
      }

      return calculateProfileCompleteness(
        data,
      );
    }, [data]);

  /*
  |--------------------------------------------------------------------------
  | Alertas preventivas reales
  |--------------------------------------------------------------------------
  */

  const alerts =
    useMemo(
      () =>
        recommendations.filter(
          (recommendation) =>
            recommendation.kind ===
            "alert",
        ),
      [recommendations],
    );

  /*
  |--------------------------------------------------------------------------
  | Recomendaciones por categoría
  |--------------------------------------------------------------------------
  */

  const categories =
    useMemo(() => {
      return CATEGORY_CONFIG.map(
        (category) => ({
          ...category,
          recommendations:
            getCategoryRecommendations(
              recommendations,
              category,
            ),
        }),
      );
    }, [recommendations]);

  /*
  |--------------------------------------------------------------------------
  | Recomendaciones generales
  |--------------------------------------------------------------------------
  */

  const generalRecommendations =
    useMemo(
      () =>
        recommendations.filter(
          (recommendation) =>
            recommendation.kind !==
              "alert" &&
            !CATEGORY_CONFIG.some(
              (category) =>
                category.sources.includes(
                  recommendation.source,
                ),
            ),
        ),
      [recommendations],
    );

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="h-full overflow-y-auto transition-colors"
      style={{
        backgroundColor: pageBg,
      }}
    >
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}

      <div
        className="px-5 sm:px-6 pt-8 sm:pt-12 pb-8"
        style={{
          background:
            "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Brain
              className="w-7 h-7 text-white"
              strokeWidth={1.5}
            />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              Recomendaciones IA
            </h1>

            <p className="text-white/70 text-sm">
              {user
                ? `Personalizadas para ${user.name}`
                : "Personalizadas para ti"}
            </p>
          </div>

          {/* Actualizar */}
          <button
            type="button"
            onClick={() =>
              loadRecommendations(
                true,
              )
            }
            disabled={refreshing}
            className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-50"
            title="Actualizar recomendaciones"
          >
            <RefreshCw
              className={
                refreshing
                  ? "w-4 h-4 animate-spin"
                  : "w-4 h-4"
              }
            />
          </button>
        </div>

        {/* ======================================================== */}
        {/* PERFIL - YA NO ES "SALUD AL 78%"                       */}
        {/* ======================================================== */}

        <div className="mt-4 bg-white/15 backdrop-blur-md rounded-[20px] p-4 border border-white/20">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#F59E0B] flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold">
                {profileCompleteness}%
                {" "}de información
                disponible
              </p>

              <p className="text-white/70 text-xs mt-0.5">
                {getCompletenessText(
                  profileCompleteness,
                )}
              </p>
            </div>

            {profileCompleteness <
              100 && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/medical-history",
                  )
                }
                className="text-white/80 hover:text-white flex-shrink-0"
                title="Completar información"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${profileCompleteness}%`,
                }}
                transition={{
                  duration: 0.8,
                }}
                className="h-full rounded-full bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONTENIDO                                                    */}
      {/* ============================================================ */}

      <div className="px-5 mt-6 space-y-5 pb-8">
        {/* Loading */}
        {loading && (
          <>
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className={`rounded-[20px] p-5 border animate-pulse ${
                    dark
                      ? "bg-[#0D1322] border-slate-800"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${
                        dark
                          ? "bg-slate-800"
                          : "bg-slate-100"
                      }`}
                    />

                    <div className="flex-1">
                      <div
                        className={`w-1/3 h-4 rounded mb-3 ${
                          dark
                            ? "bg-slate-800"
                            : "bg-slate-100"
                        }`}
                      />

                      <div
                        className={`w-full h-3 rounded mb-2 ${
                          dark
                            ? "bg-slate-800"
                            : "bg-slate-100"
                        }`}
                      />

                      <div
                        className={`w-4/5 h-3 rounded ${
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
            className={`rounded-[20px] p-6 border text-center ${
              dark
                ? "bg-[#0D1322] border-red-500/20"
                : "bg-white border-red-100"
            }`}
          >
            <AlertTriangle className="w-9 h-9 text-red-500 mx-auto mb-3" />

            <p
              className="text-sm font-semibold"
              style={{
                color: title,
              }}
            >
              No se pudieron cargar las
              recomendaciones
            </p>

            <p
              className="text-xs mt-2"
              style={{
                color: body,
              }}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                loadRecommendations()
              }
              className="mt-4 px-4 py-2 rounded-full bg-[#0F766E] text-white text-xs font-semibold"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* ALERTAS PREVENTIVAS REALES                               */}
        {/* ======================================================== */}

        {!loading &&
          !error &&
          alerts.length > 0 && (
            <div className="space-y-3">
              <h2
                className="text-base font-bold flex items-center gap-2"
                style={{
                  color: title,
                }}
              >
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
                Alertas preventivas
              </h2>

              {alerts.map(
                (
                  alert,
                  index,
                ) => (
                  <motion.div
                    key={`${alert.source}-${index}`}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className={`rounded-[20px] p-4 border flex gap-3 ${
                      alert.priority ===
                      "high"
                        ? dark
                          ? "bg-[#1F0E12] border-[#F87171]/40"
                          : "bg-[#FEF2F2] border-[#FCA5A5]"
                        : dark
                          ? "bg-[#211B07] border-[#FBBF24]/40"
                          : "bg-[#FFFBEB] border-[#FCD34D]"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        alert.priority ===
                        "high"
                          ? "text-[#EF4444]"
                          : "text-[#F59E0B]"
                      }`}
                    />

                    <div className="flex-1">
                      <p
                        className="text-sm font-semibold mb-1"
                        style={{
                          color: title,
                        }}
                      >
                        {
                          alert.title
                        }
                      </p>

                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: body,
                        }}
                      >
                        {
                          alert.body
                        }
                      </p>

                      <p
                        className="text-[10px] mt-2"
                        style={{
                          color: muted,
                        }}
                      >
                        {alert.time}
                      </p>
                    </div>
                  </motion.div>
                ),
              )}
            </div>
          )}

        {/* ======================================================== */}
        {/* CATEGORÍAS REALES                                         */}
        {/* ======================================================== */}

        {!loading &&
          !error &&
          categories.map(
            (category) => {
              const Icon =
                category.icon;

              const hasData =
                category.recommendations
                  .length >
                0;

              return (
                <motion.div
                  key={category.key}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="rounded-[20px] border shadow-sm overflow-hidden"
                  style={{
                    backgroundColor:
                      surface,
                    borderColor:
                      border,
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor:
                          `${category.color}15`,
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{
                          color:
                            category.color,
                        }}
                      />
                    </div>

                    <h3
                      className="text-base font-bold"
                      style={{
                        color: title,
                      }}
                    >
                      {
                        category.label
                      }
                    </h3>
                  </div>

                  {/* Contenido */}
                  <div className="px-4 pb-4 space-y-3">
                    {hasData ? (
                      category.recommendations
                        .slice(0, 3)
                        .map(
                          (
                            recommendation,
                            index,
                          ) => {
                            const RecommendationIcon =
                              getRecommendationIcon(
                                recommendation,
                              );

                            return (
                              <div
                                key={`${recommendation.source}-${index}`}
                                className="flex gap-3 items-start"
                              >
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                  style={{
                                    backgroundColor:
                                      `${category.color}20`,
                                  }}
                                >
                                  <span
                                    className="text-[10px] font-bold"
                                    style={{
                                      color:
                                        category.color,
                                    }}
                                  >
                                    {index +
                                      1}
                                  </span>
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <RecommendationIcon
                                      className="w-3.5 h-3.5"
                                      style={{
                                        color:
                                          category.color,
                                      }}
                                    />

                                    <p
                                      className="text-sm font-semibold"
                                      style={{
                                        color:
                                          title,
                                      }}
                                    >
                                      {
                                        recommendation.title
                                      }
                                    </p>
                                  </div>

                                  <p
                                    className="text-sm leading-relaxed mt-1"
                                    style={{
                                      color:
                                        body,
                                    }}
                                  >
                                    {
                                      recommendation.body
                                    }
                                  </p>

                                  <p
                                    className="text-[10px] mt-1.5"
                                    style={{
                                      color:
                                        muted,
                                    }}
                                  >
                                    {
                                      recommendation.time
                                    }
                                  </p>
                                </div>
                              </div>
                            );
                          },
                        )
                    ) : (
                      <div className="py-2">
                        <p
                          className="text-sm leading-relaxed"
                          style={{
                            color:
                              body,
                          }}
                        >
                          Todavía no hay suficientes
                          registros para generar
                          recomendaciones específicas
                          en esta categoría.
                        </p>

                        <p
                          className="text-[10px] mt-2"
                          style={{
                            color:
                              muted,
                          }}
                        >
                          Registra datos relacionados
                          para que VitalMind pueda
                          personalizar esta sección.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            },
          )}

        {/* ======================================================== */}
        {/* RECOMENDACIONES GENERALES                                */}
        {/* ======================================================== */}

        {!loading &&
          !error &&
          generalRecommendations.length >
            0 && (
            <div
              className="rounded-[20px] border shadow-sm overflow-hidden"
              style={{
                backgroundColor:
                  surface,
                borderColor:
                  border,
              }}
            >
              <div className="flex items-center gap-3 p-4 pb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor:
                      "#0F766E15",
                  }}
                >
                  <Sparkles
                    className="w-5 h-5"
                    style={{
                      color:
                        "#0F766E",
                    }}
                  />
                </div>

                <h3
                  className="text-base font-bold"
                  style={{
                    color: title,
                  }}
                >
                  Seguimiento personalizado
                </h3>
              </div>

              <div className="px-4 pb-4 space-y-3">
                {generalRecommendations
                  .slice(0, 5)
                  .map(
                    (
                      recommendation,
                      index,
                    ) => (
                      <div
                        key={`${recommendation.source}-${index}`}
                        className="flex gap-3 items-start"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#0F766E15] flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-[#0F766E]">
                            {index +
                              1}
                          </span>
                        </div>

                        <div>
                          <p
                            className="text-sm font-semibold"
                            style={{
                              color:
                                title,
                            }}
                          >
                            {
                              recommendation.title
                            }
                          </p>

                          <p
                            className="text-sm leading-relaxed mt-1"
                            style={{
                              color:
                                body,
                            }}
                          >
                            {
                              recommendation.body
                            }
                          </p>
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </div>
          )}

        {/* ======================================================== */}
        {/* SIN RECOMENDACIONES                                      */}
        {/* ======================================================== */}

        {!loading &&
          !error &&
          recommendations.length ===
            0 && (
            <div
              className={`rounded-[20px] p-6 border text-center ${
                dark
                  ? "bg-[#0D1322] border-slate-800"
                  : "bg-white border-slate-200"
              }`}
            >
              <Sparkles
                className="w-9 h-9 mx-auto mb-3"
                style={{
                  color:
                    dark
                      ? "#2DD4BF"
                      : "#0F766E",
                }}
              />

              <p
                className="text-sm font-semibold"
                style={{
                  color: title,
                }}
              >
                Aún no hay recomendaciones
              </p>

              <p
                className="text-xs mt-2 leading-relaxed"
                style={{
                  color: body,
                }}
              >
                A medida que registres
                hábitos, métricas,
                síntomas, emociones,
                medicamentos y otros
                datos, VitalMind generará
                recomendaciones basadas
                en tu información.
              </p>
            </div>
          )}

        {/* ======================================================== */}
        {/* CHATBOT                                                   */}
        {/* ======================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/chatbot",
            )
          }
          className="w-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white rounded-[20px] p-5 flex items-center gap-4 active:scale-95 transition-all"
          style={{
            boxShadow:
              "0 8px 24px rgba(15,118,110,0.3)",
          }}
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>

          <div className="text-left flex-1">
            <p className="font-bold text-base">
              Chatbot inteligente
            </p>

            <p className="text-white/70 text-sm">
              Pregunta lo que quieras a tu IA
            </p>
          </div>

          <ChevronRight className="w-5 h-5 text-white/70" />
        </button>
      </div>
    </div>
  );
}