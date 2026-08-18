import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronRight,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Droplets,
  Moon,
  Activity,
  Heart,
  Pill,
} from "lucide-react";
import { motion } from "motion/react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";

import type {
  HabitToday,
  MetricsSummary,
  MetricsWeekly,
  SymptomLog,
} from "../../lib/types";

/*
|--------------------------------------------------------------------------
| Hábitos
|--------------------------------------------------------------------------
*/

const habitMeta: {
  key: HabitToday["key"];
  label: string;
  color: string;
  icon: typeof Droplets;
}[] = [
  {
    key: "water",
    label: "Agua",
    color: "#2563EB",
    icon: Droplets,
  },
  {
    key: "exercise",
    label: "Ejercicio",
    color: "#22C55E",
    icon: Activity,
  },
  {
    key: "sleep",
    label: "Sueño",
    color: "#8B5CF6",
    icon: Moon,
  },
  {
    key: "meditation",
    label: "Meditación",
    color: "#F59E0B",
    icon: Heart,
  },
];

/*
|--------------------------------------------------------------------------
| Recomendaciones
|--------------------------------------------------------------------------
*/

type Recommendation = {
  kind: "tip" | "reminder" | "ai" | "alert";
  priority: "high" | "medium" | "low";
  source: string;
  title: string;
  body: string;
  time: string;
};

type RecommendationResponse = {
  user: {
    id: string;
    name: string;
  };

  recommendations: Recommendation[];
};

/*
|--------------------------------------------------------------------------
| Utilidad para porcentajes
|--------------------------------------------------------------------------
*/

function safePercentage(
  value: number | undefined | null,
) {
  if (
    value === undefined ||
    value === null ||
    !Number.isFinite(Number(value))
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Number(value)),
  );
}

/*
|--------------------------------------------------------------------------
| Pantalla
|--------------------------------------------------------------------------
*/

export function ResumenScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  /*
  |--------------------------------------------------------------------------
  | Datos reales del usuario
  |--------------------------------------------------------------------------
  */

  const [metrics, setMetrics] =
    useState<MetricsSummary | null>(null);

  const [weekly, setWeekly] =
    useState<MetricsWeekly | null>(null);

  const [habits, setHabits] =
    useState<HabitToday[]>([]);

  const [symptoms, setSymptoms] =
    useState<SymptomLog[]>([]);

  const [emotions, setEmotions] =
    useState<any[]>([]);

  const [
    recommendations,
    setRecommendations,
  ] = useState<Recommendation[]>([]);

  /*
  |--------------------------------------------------------------------------
  | Estado de carga
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Cargar datos
  |--------------------------------------------------------------------------
  */

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        metricsResult,
        weeklyResult,
        habitsResult,
        symptomsResult,
        emotionsResult,
        recommendationsResult,
      ] = await Promise.all([
        apiRequest<MetricsSummary>(
          "/metrics/summary",
        ),

        apiRequest<MetricsWeekly>(
          "/metrics/weekly",
        ),

        apiRequest<HabitToday[]>(
          "/habits/today",
        ),

        apiRequest<SymptomLog[]>(
          "/symptom-logs",
        ),

        apiRequest<any[]>(
          "/emotional-logs/history",
        ),

        apiRequest<RecommendationResponse>(
          "/recommendations",
        ),
      ]);

      setMetrics(metricsResult);
      setWeekly(weeklyResult);
      setHabits(habitsResult ?? []);
      setSymptoms(symptomsResult ?? []);
      setEmotions(emotionsResult ?? []);

      setRecommendations(
        recommendationsResult?.recommendations ??
          [],
      );
    } catch (requestError) {
      console.error(
        "Error cargando resumen:",
        requestError,
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo cargar el resumen.",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Primera carga
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadSummary();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Bienestar real
  |--------------------------------------------------------------------------
  */

  const wellnessScore = Math.round(
    Number(
      metrics?.wellnessScore ?? 0,
    ),
  );

  const wellnessData = [
    {
      name: "Bienestar",
      value: safePercentage(
        wellnessScore,
      ),
      color: "#0F766E",
    },
    {
      name: "Resto",
      value: Math.max(
        0,
        100 -
          safePercentage(
            wellnessScore,
          ),
      ),
      color: dark
        ? "rgba(255,255,255,0.12)"
        : "#E2E8F0",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Bienestar semanal REAL
  |--------------------------------------------------------------------------
  */

  const weeklyActivity = useMemo(
    () =>
      weekly?.Bienestar?.map(
        (row) => ({
          day: row.day,
          value: Number(
            row.value ?? 0,
          ),
        }),
      ) ?? [],
    [weekly],
  );

  /*
  |--------------------------------------------------------------------------
  | Hábitos reales
  |--------------------------------------------------------------------------
  */

  const habitPcts = useMemo(
    () =>
      habitMeta.map((habit) => {
        const row = habits.find(
          (item) =>
            item.key ===
            habit.key,
        );

        const value = Number(
          row?.value ?? 0,
        );

        const goal = Number(
          row?.goal ?? 0,
        );

        const pct =
          goal > 0
            ? Math.min(
                100,
                Math.round(
                  (value / goal) *
                    100,
                ),
              )
            : 0;

        return {
          ...habit,
          value,
          goal,
          pct,
        };
      }),
    [habits],
  );

  /*
  |--------------------------------------------------------------------------
  | Síntomas reales
  |--------------------------------------------------------------------------
  */

  const symptomChartData =
    useMemo(
      () =>
        symptoms
          .slice()
          .reverse()
          .map((symptom) => ({
            date: new Date(
              symptom.created_at,
            ).toLocaleDateString(
              "es-MX",
              {
                day: "2-digit",
                month: "short",
              },
            ),

            dolor: Number(
              symptom.pain ?? 0,
            ),

            temperatura:
              symptom.temperature !==
              null &&
              symptom.temperature !==
                undefined
                ? Number(
                    symptom.temperature,
                  )
                : null,

            glucosa:
              symptom.glucose !==
              null &&
              symptom.glucose !==
                undefined
                ? Number(
                    symptom.glucose,
                  )
                : null,

            frecuencia:
              symptom.heart_rate !==
              null &&
              symptom.heart_rate !==
                undefined
                ? Number(
                    symptom.heart_rate,
                  )
                : null,
          })),
      [symptoms],
    );

  /*
  |--------------------------------------------------------------------------
  | Evolución emocional REAL
  |--------------------------------------------------------------------------
  */

  const emotionChartData =
    useMemo(
      () =>
        emotions
          .slice()
          .sort(
            (a, b) =>
              new Date(
                a.log_date,
              ).getTime() -
              new Date(
                b.log_date,
              ).getTime(),
          )
          .map((emotion) => ({
            date: new Date(
              emotion.log_date,
            ).toLocaleDateString(
              "es-MX",
              {
                day: "2-digit",
                month: "short",
              },
            ),

            mood:
              emotion.mood ===
              "Muy bien"
                ? 5
                : emotion.mood ===
                    "Bien"
                  ? 4
                  : emotion.mood ===
                      "Regular"
                    ? 3
                    : emotion.mood ===
                        "Mal"
                      ? 2
                      : 1,

            estres: Number(
              emotion.stress_level ??
                0,
            ),

            energia: Number(
              emotion.energy_level ??
                0,
            ),

            sueno: Number(
              emotion.sleep_quality ??
                0,
            ),
          })),
      [emotions],
    );

  /*
  |--------------------------------------------------------------------------
  | Insights REALES desde backend
  |--------------------------------------------------------------------------
  |
  | Ya no generamos frases artificiales
  | directamente en este componente.
  |--------------------------------------------------------------------------
  */

  const aiInsights = recommendations
    .filter(
      (recommendation) =>
        recommendation.kind !==
        "alert",
    )
    .slice(0, 4);

  /*
  |--------------------------------------------------------------------------
  | Alertas reales
  |--------------------------------------------------------------------------
  */

  const alerts = recommendations
    .filter(
      (recommendation) =>
        recommendation.kind ===
        "alert",
    )
    .slice(0, 3);

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
        className="px-5 pt-12 pb-8"
        style={{
          background:
            "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)",
        }}
      >
        <h1 className="text-2xl font-bold text-white mb-1">
          Mi Resumen
        </h1>

        <p className="text-white/70 text-sm">
          Últimos 7 días
        </p>

        {/* ---------------------------------------------------------- */}
        {/* Wellness indicator                                        */}
        {/* ---------------------------------------------------------- */}

        <div className="mt-5 bg-white/15 backdrop-blur-md rounded-[24px] p-5 border border-white/20 flex items-center gap-4">
          {loading ? (
            <div className="w-full flex items-center gap-4">
              <div className="w-28 h-28 rounded-full bg-white/10 animate-pulse" />

              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-white/10 animate-pulse" />
                <div className="h-6 w-28 rounded bg-white/10 animate-pulse" />
                <div className="h-3 w-36 rounded bg-white/10 animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              <div className="w-28 h-28 flex-shrink-0 relative">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={wellnessData}
                      cx="50%"
                      cy="50%"
                      innerRadius={34}
                      outerRadius={48}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      isAnimationActive={false}
                    >
                      {wellnessData.map(
                        (entry) => (
                          <Cell
                            key={`w-${entry.name}`}
                            fill={
                              entry.color
                            }
                          />
                        ),
                      )}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {wellnessScore}
                  </span>

                  <span className="text-white/60 text-xs">
                    pts
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-white/70 text-xs mb-1">
                  Nivel de bienestar
                </p>

                <p className="text-xl font-bold text-white mb-1">
                  {wellnessScore >=
                  80
                    ? "Excelente"
                    : wellnessScore >=
                        60
                      ? "Bueno"
                      : wellnessScore >
                          0
                        ? "Puede mejorar"
                        : "Sin datos"}
                </p>

                <div className="flex items-center gap-1 text-[#4ADE80] text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />

                  <span>
                    {metrics
                      ? `Adherencia meds. ${metrics.medsAdherence ?? 0}%`
                      : "Sin datos de adherencia"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONTENIDO                                                    */}
      {/* ============================================================ */}

      <div className="px-5 mt-6 space-y-6 pb-6">
        {/* Error */}
        {!loading && error && (
          <div
            className="rounded-[20px] border p-4"
            style={{
              backgroundColor:
                surface,
              borderColor:
                "#FCA5A5",
            }}
          >
            <p
              className="text-sm font-semibold"
              style={{
                color:
                  "#DC2626",
              }}
            >
              No se pudo cargar todo el resumen
            </p>

            <p
              className="text-xs mt-1"
              style={{
                color: body,
              }}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadSummary
              }
              className="mt-3 px-4 py-2 rounded-full bg-[#0F766E] text-white text-xs font-semibold"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* BIENESTAR SEMANAL                                        */}
        {/* ======================================================== */}

        <div
          className="rounded-[20px] p-5 shadow-sm"
          style={{
            backgroundColor:
              surface,
            border: `1px solid ${border}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-base font-bold"
              style={{
                color: title,
              }}
            >
              Bienestar semanal
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/graficas",
                )
              }
              className="text-[#0F766E] text-xs font-medium flex items-center gap-0.5"
            >
              Ver gráficas
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <div className="h-36 rounded-xl animate-pulse bg-slate-100/50 dark:bg-slate-800/30" />
          ) : weeklyActivity.length ===
            0 ? (
            <div className="h-36 flex items-center justify-center text-sm text-center px-4">
              <div>
                <p
                  style={{
                    color:
                      muted,
                  }}
                >
                  Aún no tienes
                  suficientes datos
                  registrados para
                  mostrar tu progreso
                  semanal.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/habitos",
                    )
                  }
                  className="mt-3 text-[#0F766E] text-xs font-semibold"
                >
                  Registrar hábitos
                </button>
              </div>
            </div>
          ) : (
            <div className="h-36">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    weeklyActivity
                  }
                  barSize={20}
                >
                  <XAxis
                    dataKey="day"
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                    tick={{
                      fontSize: 12,
                      fill: "#94A3B8",
                    }}
                  />

                  <YAxis hide />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        dark
                          ? "#0D1322"
                          : "white",
                      border: `1px solid ${border}`,
                      borderRadius: 12,
                      fontSize: 12,
                      color: title,
                    }}
                    cursor={{
                      fill: dark
                        ? "rgba(255,255,255,0.04)"
                        : "#F1F5F9",
                      radius: 8,
                    }}
                  />

                  <Bar
                    dataKey="value"
                    radius={[
                      8,
                      8,
                      0,
                      0,
                    ]}
                    isAnimationActive={
                      false
                    }
                  >
                    {weeklyActivity.map(
                      (
                        entry,
                        index,
                      ) => (
                        <Cell
                          key={`bar-${entry.day}-${index}`}
                          fill="#0F766E"
                          fillOpacity={
                            index ===
                            weeklyActivity.length -
                              1
                              ? 1
                              : 0.5
                          }
                        />
                      ),
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* HÁBITOS                                                   */}
        {/* ======================================================== */}

        <div
          className="rounded-[20px] p-5 shadow-sm"
          style={{
            backgroundColor:
              surface,
            border: `1px solid ${border}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-base font-bold"
              style={{
                color: title,
              }}
            >
              Hábitos saludables de hoy
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/habitos",
                )
              }
              className="text-[#0F766E] text-xs font-medium flex items-center gap-0.5"
            >
              Ver todos
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {habitPcts.map(
            (habit) => {
              const Icon =
                habit.icon;

              return (
                <div
                  key={
                    habit.label
                  }
                  className="mb-4 last:mb-0"
                >
                  <div className="flex justify-between mb-1.5 items-center">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={15}
                        style={{
                          color:
                            habit.color,
                        }}
                      />

                      <span
                        className="text-sm font-medium"
                        style={{
                          color:
                            body,
                        }}
                      >
                        {
                          habit.label
                        }
                      </span>
                    </div>

                    <span
                      className="text-sm font-bold"
                      style={{
                        color:
                          habit.color,
                      }}
                    >
                      {habit.pct}%
                    </span>
                  </div>

                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{
                      backgroundColor:
                        dark
                          ? "rgba(255,255,255,0.06)"
                          : "#F1F5F9",
                    }}
                  >
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${habit.pct}%`,
                      }}
                      transition={{
                        duration:
                          0.8,
                      }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          habit.color,
                      }}
                    />
                  </div>
                </div>
              );
            },
          )}
        </div>

        {/* ======================================================== */}
        {/* EVOLUCIÓN EMOCIONAL                                      */}
        {/* ======================================================== */}

        <div
          className="rounded-[20px] p-5 shadow-sm"
          style={{
            backgroundColor:
              surface,
            border: `1px solid ${border}`,
          }}
        >
          <h2
            className="text-base font-bold mb-4"
            style={{
              color: title,
            }}
          >
            Evolución emocional
          </h2>

          {emotionChartData.length ===
          0 ? (
            <p
              className="text-sm text-center py-8"
              style={{
                color: muted,
              }}
            >
              Registra tu estado
              emocional para ver
              tu progreso.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    emotionChartData
                  }
                >
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: muted,
                      fontSize: 11,
                    }}
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                  />

                  <YAxis
                    domain={[
                      0,
                      10,
                    ]}
                    tick={{
                      fill: muted,
                      fontSize: 10,
                    }}
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#0F766E"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    name="Ánimo"
                  />

                  <Line
                    type="monotone"
                    dataKey="estres"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    name="Estrés"
                  />

                  <Line
                    type="monotone"
                    dataKey="energia"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    name="Energía"
                  />

                  <Line
                    type="monotone"
                    dataKey="sueno"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    name="Sueño"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SÍNTOMAS                                                  */}
        {/* ======================================================== */}

        <div
          className="rounded-[20px] p-5 border shadow-sm"
          style={{
            backgroundColor:
              surface,
            borderColor:
              border,
          }}
        >
          <h2
            className="text-base font-bold mb-4"
            style={{
              color: title,
            }}
          >
            Evolución de síntomas
          </h2>

          {symptomChartData.length ===
          0 ? (
            <p
              className="text-sm text-center py-8"
              style={{
                color: muted,
              }}
            >
              No hay datos suficientes
              para generar la gráfica.
            </p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart
                  data={
                    symptomChartData
                  }
                >
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: muted,
                      fontSize: 11,
                    }}
                    axisLine={
                      false
                    }
                    tickLine={
                      false
                    }
                  />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="dolor"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    name="Dolor"
                  />

                  <Line
                    type="monotone"
                    dataKey="temperatura"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    name="Temperatura"
                  />

                  <Line
                    type="monotone"
                    dataKey="glucosa"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    name="Glucosa"
                  />

                  <Line
                    type="monotone"
                    dataKey="frecuencia"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                    }}
                    name="Frecuencia"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* HISTORIAL DE SÍNTOMAS                                    */}
        {/* ======================================================== */}

        <div
          className="rounded-[20px] p-5 border shadow-sm"
          style={{
            backgroundColor:
              surface,
            borderColor:
              border,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-base font-bold"
              style={{
                color: title,
              }}
            >
              Historial de síntomas
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/registro",
                )
              }
              className="text-[#0F766E] text-xs font-medium"
            >
              Nuevo registro
            </button>
          </div>

          {symptoms.length ===
          0 ? (
            <p
              className="text-sm text-center py-4"
              style={{
                color: muted,
              }}
            >
              No tienes síntomas
              registrados todavía.
            </p>
          ) : (
            <div className="space-y-3">
              {symptoms
                .slice(0, 5)
                .map((symptom) => (
                  <div
                    key={
                      symptom.id
                    }
                    className={`rounded-2xl p-4 border ${
                      dark
                        ? "bg-[#111827] border-slate-800"
                        : "bg-[#F8FAFC] border-slate-100"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className="text-xs"
                        style={{
                          color: muted,
                        }}
                      >
                        {new Date(
                          symptom.created_at,
                        ).toLocaleDateString(
                          "es-MX",
                        )}
                      </span>

                      <span
                        className={`text-xs font-bold ${
                          symptom.pain >
                          7
                            ? "text-red-500"
                            : symptom.pain >
                                3
                              ? "text-orange-500"
                              : "text-green-500"
                        }`}
                      >
                        Dolor:{" "}
                        {
                          symptom.pain
                        }
                        /10
                      </span>
                    </div>

                    <div
                      className="grid grid-cols-2 gap-2 text-xs"
                      style={{
                        color:
                          body,
                      }}
                    >
                      {symptom.temperature !==
                        null &&
                        symptom.temperature !==
                          undefined && (
                          <span>
                            🌡️{" "}
                            {
                              symptom.temperature
                            }
                            °C
                          </span>
                        )}

                      {symptom.heart_rate !==
                        null &&
                        symptom.heart_rate !==
                          undefined && (
                          <span>
                            ❤️{" "}
                            {
                              symptom.heart_rate
                            }{" "}
                            bpm
                          </span>
                        )}

                      {symptom.glucose !==
                        null &&
                        symptom.glucose !==
                          undefined && (
                          <span>
                            💧{" "}
                            {
                              symptom.glucose
                            }{" "}
                            mg/dL
                          </span>
                        )}

                      {symptom.systolic !==
                        null &&
                        symptom.systolic !==
                          undefined &&
                        symptom.diastolic !==
                          null &&
                        symptom.diastolic !==
                          undefined && (
                          <span>
                            🩺{" "}
                            {
                              symptom.systolic
                            }
                            /
                            {
                              symptom.diastolic
                            }
                          </span>
                        )}
                    </div>

                    {symptom.mood && (
                      <p
                        className="mt-2 text-xs"
                        style={{
                          color:
                            muted,
                        }}
                      >
                        Estado:{" "}
                        {
                          symptom.mood
                        }
                      </p>
                    )}

                    {symptom.notes && (
                      <p
                        className="mt-2 text-xs italic"
                        style={{
                          color:
                            muted,
                        }}
                      >
                        "
                        {
                          symptom.notes
                        }
                        "
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* INSIGHTS IA REALES                                       */}
        {/* ======================================================== */}

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />

            <h2
              className="text-base font-bold"
              style={{
                color: title,
              }}
            >
              Insights personalizados
            </h2>
          </div>

          <div className="space-y-3">
            {aiInsights.length ===
            0 ? (
              <p
                className="text-sm"
                style={{
                  color: muted,
                }}
              >
                Registra hábitos,
                métricas, síntomas o
                estado emocional para
                recibir recomendaciones
                personalizadas.
              </p>
            ) : (
              aiInsights.map(
                (
                  recommendation,
                  index,
                ) => (
                  <motion.div
                    key={`${recommendation.source}-${index}`}
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
                        index * 0.1,
                    }}
                    className="border rounded-[20px] p-4 flex gap-3"
                    style={{
                      background:
                        dark
                          ? "linear-gradient(90deg, rgba(15,118,110,0.10), rgba(20,184,166,0.04))"
                          : "linear-gradient(90deg, rgba(15,118,110,0.05), rgba(20,184,166,0.02))",

                      borderColor:
                        dark
                          ? "rgba(20,184,166,0.18)"
                          : "rgba(15,118,110,0.15)",
                    }}
                  >
                    <div className="w-2 h-2 mt-1.5 bg-[#0F766E] rounded-full flex-shrink-0" />

                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: title,
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

                      <p
                        className="text-[10px] mt-2"
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
                  </motion.div>
                ),
              )
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* ALERTAS REALES                                           */}
        {/* ======================================================== */}

        {alerts.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />

              <h2
                className="text-base font-bold"
                style={{
                  color:
                    title,
                }}
              >
                Alertas recientes
              </h2>
            </div>

            <div className="space-y-3">
              {alerts.map(
                (
                  alert,
                  index,
                ) => (
                  <div
                    key={`${alert.source}-${index}`}
                    className={`rounded-[20px] p-4 border flex gap-3 ${
                      alert.priority ===
                      "high"
                        ? dark
                          ? "bg-red-950/20 border-red-500/20"
                          : "bg-red-50 border-red-200"
                        : dark
                          ? "bg-amber-950/20 border-amber-500/20"
                          : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-5 h-5 flex-shrink-0 ${
                        alert.priority ===
                        "high"
                          ? "text-red-500"
                          : "text-amber-500"
                      }`}
                    />

                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color:
                            title,
                        }}
                      >
                        {
                          alert.title
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
                          alert.body
                        }
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}