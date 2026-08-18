import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  Droplets,
  Heart,
  Moon,
  Activity,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Plus,
  Pill,
  Calendar,
  Check,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";
import { motion } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import vitalMindLogo from "../../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";
import { toast } from "sonner";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type {
  DashboardSummary,
  MetricsSummary,
  MetricsWeekly,
  HabitToday,
} from "../../lib/types";

/*
|--------------------------------------------------------------------------
| Estados emocionales
|--------------------------------------------------------------------------
*/

const moods = [
  { label: "Muy bien", emoji: "😄" },
  { label: "Bien", emoji: "🙂" },
  { label: "Regular", emoji: "😐" },
  { label: "Mal", emoji: "😔" },
  { label: "Muy mal", emoji: "😭" },
];

/*
|--------------------------------------------------------------------------
| Acciones rápidas
|--------------------------------------------------------------------------
*/

const quickActions = [
  {
    label: "Registrar síntoma",
    path: "/registro",
    emoji: "🩺",
    color: "#EF4444",
  },
  {
    label: "Medicamentos",
    path: "/medicamentos",
    emoji: "💊",
    color: "#0F766E",
  },
  {
    label: "Mis citas",
    path: "/citas",
    emoji: "📅",
    color: "#2563EB",
  },
  {
    label: "Chatbot IA",
    path: "/chatbot",
    emoji: "🤖",
    color: "#8B5CF6",
  },
  {
    label: "Mis hábitos",
    path: "/habitos",
    emoji: "💪",
    color: "#22C55E",
  },
  {
    label: "Historial médico",
    path: "/medical-history",
    emoji: "📋",
    color: "#F59E0B",
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
| Función para determinar icono, color y etiqueta
|--------------------------------------------------------------------------
*/

function getRecommendationVisual(
  recommendation: Recommendation,
) {
  switch (recommendation.source) {
    case "hydration":
      return {
        icon: Droplets,
        color: "#2563EB",
        tag: "Agua",
      };

    case "sleep":
    case "sleep_quality":
      return {
        icon: Moon,
        color: "#8B5CF6",
        tag: "Sueño",
      };

    case "emotional":
      return {
        icon: Heart,
        color: "#EC4899",
        tag: "Bienestar",
      };

    case "energy":
      return {
        icon: TrendingUp,
        color: "#F59E0B",
        tag: "Energía",
      };

    case "exercise":
      return {
        icon: Activity,
        color: "#22C55E",
        tag: "Actividad",
      };

    case "medications":
      return {
        icon: Pill,
        color: "#0F766E",
        tag: "Medicamentos",
      };

    case "appointments":
      return {
        icon: Calendar,
        color: "#2563EB",
        tag: "Citas",
      };

    case "symptoms":
    case "blood_pressure":
    case "glucose":
      return {
        icon: AlertTriangle,
        color: "#EF4444",
        tag: "Seguimiento",
      };

    case "medical_history":
      return {
        icon: Lightbulb,
        color: "#F59E0B",
        tag: "Historial",
      };

    default:
      return {
        icon: Sparkles,
        color: "#0F766E",
        tag: "IA",
      };
  }
}

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

type HabitProgressRowProps = {
  icon: typeof Droplets;
  label: string;
  value: string;
  target: string;
  percentage: number;
  color: string;
  dark: boolean;
  textMain: string;
  textMuted: string;
};

function HabitProgressRow({
  icon: Icon,
  label,
  value,
  target,
  percentage,
  color,
  dark,
  textMain,
  textMuted,
}: HabitProgressRowProps) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={17} style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium" style={{ color: textMain }}>
              {label}
            </p>
            <span className="text-xs font-bold" style={{ color }}>
              {percentage}%
            </span>
          </div>

          <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>
            {value} / {target}
          </p>
        </div>
      </div>

      <div
        className="h-2 rounded-full overflow-hidden"
        style={{
          backgroundColor: dark ? "rgba(255,255,255,0.07)" : "#F1F5F9",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.7 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  /*
  |--------------------------------------------------------------------------
  | Hora actual
  |--------------------------------------------------------------------------
  */

  const [currentTime, setCurrentTime] =
    useState<Date>(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Estado emocional
  |--------------------------------------------------------------------------
  */

  const [selectedMood, setSelectedMood] =
    useState<string | null>(null);

  const [stressLevel, setStressLevel] =
    useState(5);

  const [energyLevel, setEnergyLevel] =
    useState(5);

  const [sleepQuality, setSleepQuality] =
    useState(5);

  const [notes, setNotes] =
    useState("");

  const [showEmotionForm, setShowEmotionForm] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Usuario
  |--------------------------------------------------------------------------
  */

  const [userName, setUserName] =
    useState(
      localStorage.getItem("userName") ||
        "Usuario",
    );

  /*
  |--------------------------------------------------------------------------
  | Dashboard data
  |--------------------------------------------------------------------------
  */

  const [summary, setSummary] =
    useState<DashboardSummary | null>(
      null,
    );

  const [metrics, setMetrics] =
    useState<MetricsSummary | null>(
      null,
    );

  const [weekly, setWeekly] =
    useState<MetricsWeekly | null>(
      null,
    );

  const [habits, setHabits] =
    useState<HabitToday[]>([]);

  const [
    myMeds,
    setMyMeds,
  ] = useState<
    Array<{
      tomado: boolean;
    }>
  >([]);

  const [
    todayEmotion,
    setTodayEmotion,
  ] = useState<any>(null);

  /*
  |--------------------------------------------------------------------------
  | RECOMENDACIONES REALES
  |--------------------------------------------------------------------------
  */

  const [
    recommendations,
    setRecommendations,
  ] = useState<Recommendation[]>(
    [],
  );

  const [
    recommendationsLoading,
    setRecommendationsLoading,
  ] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Cargar datos
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    /*
     * Resumen dashboard
     */
    apiRequest<DashboardSummary>(
      "/dashboard/summary",
    )
      .then(setSummary)
      .catch(() => null);

    /*
     * Métricas actuales
     */
    apiRequest<MetricsSummary>(
      "/metrics/summary",
    )
      .then(setMetrics)
      .catch(() => null);

    /*
     * Métricas semanales
     */
    apiRequest<MetricsWeekly>(
      "/metrics/weekly",
    )
      .then(setWeekly)
      .catch(() => null);

    apiRequest<HabitToday[]>(
      `/habits/today?_=${Date.now()}`,
    )
      .then((result) => {
        setHabits(
          Array.isArray(result)
            ? result
            : [],
        );
      })
      .catch((error) => {
        console.error(
          "Error cargando hábitos del dashboard:",
          error,
        );
        setHabits([]);
      });

    /*
     * Medicamentos
     */
    apiRequest<
      Array<{
        tomado: boolean;
      }>
    >("/medications")
      .then((meds) =>
        setMyMeds(meds),
      )
      .catch(() => null);

    /*
     * Usuario autenticado
     */
    apiRequest<{
      name: string;
    }>("/auth/me")
      .then((profile) => {
        setUserName(profile.name);

        localStorage.setItem(
          "userName",
          profile.name,
        );
      })
      .catch(() => null);

    /*
     * Estado emocional de hoy
     */
    apiRequest(
      "/emotional-logs/today",
    )
      .then(setTodayEmotion)
      .catch(() => null);

    /*
     * RECOMENDACIONES PERSONALIZADAS
     *
     * Aquí está el cambio principal.
     *
     * El frontend ya NO inventa:
     *
     * "Tu fibra está baja..."
     * "Te faltan 400ml..."
     * "Sueño mejorado +12%..."
     *
     * Ahora obtiene recomendaciones
     * generadas por el backend a partir
     * de los datos reales del usuario.
     */
    apiRequest<RecommendationResponse>(
      "/recommendations",
    )
      .then((result) => {
        setRecommendations(
          result.recommendations ?? [],
        );
      })
      .catch((error) => {
        console.error(
          "Error cargando recomendaciones:",
          error,
        );

        setRecommendations([]);
      })
      .finally(() => {
        setRecommendationsLoading(
          false,
        );
      });
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Hora y saludo
  |--------------------------------------------------------------------------
  */

  const now = new Date();

  const hour = Number(
    new Intl.DateTimeFormat(
      "es-MX",
      {
        timeZone:
          "America/Mexico_City",
        hour: "numeric",
        hour12: false,
      },
    ).format(now),
  );

  const greeting =
    hour < 12
      ? "Buenos días"
      : hour < 18
        ? "Buenas tardes"
        : "Buenas noches";

  const greetingEmoji =
    hour < 12
      ? "☀️"
      : hour < 18
        ? "👋"
        : "🌙";

  const currentDateLabel =
    currentTime.toLocaleDateString(
      "es-MX",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      },
    );

  const currentTimeLabel =
    currentTime.toLocaleTimeString(
      "es-MX",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      },
    );

  /*
  |--------------------------------------------------------------------------
  | Tema
  |--------------------------------------------------------------------------
  */

  const bg = dark
    ? "#070A12"
    : "#F4F6FB";

  const cardBg = dark
    ? "#0D1322"
    : "#FFFFFF";

  const cardBorder = dark
    ? "rgba(148,163,184,0.14)"
    : "rgba(226,232,240,1)";

  const textMain = dark
    ? "#F8FAFC"
    : "#0F172A";

  const textMuted = dark
    ? "#9CA3AF"
    : "#64748B";

  /*
  |--------------------------------------------------------------------------
  | Bienestar
  |--------------------------------------------------------------------------
  */

  /*
  |--------------------------------------------------------------------------
  | Bienestar general
  |--------------------------------------------------------------------------
  |
  | Si backend entrega un valor > 0, se usa directamente.
  | Si devuelve 0/null, se calcula con los datos reales
  | de hábitos + adherencia de medicamentos.
  */

  const wellnessHabitGoals: Record<string, number> = {
    water: 2,
    exercise: 30,
    sleep: 8,
    nutrition: 3,
    meditation: 10,
  };

  const wellnessHabitPcts =
    Object.entries(wellnessHabitGoals).map(
      ([key, goal]) => {
        const habit = habits.find(
          (item) => item.key === key,
        );

        const value = Number(
          habit?.value ?? 0,
        );

        return goal > 0
          ? Math.min(
              100,
              Math.round(
                (value / goal) * 100,
              ),
            )
          : 0;
      },
    );

  const averageHabitCompletion =
    wellnessHabitPcts.length > 0
      ? Math.round(
          wellnessHabitPcts.reduce(
            (sum, value) =>
              sum + value,
            0,
          ) / wellnessHabitPcts.length,
        )
      : 0;

  const medicationAdherence = Number(
    metrics?.medsAdherence ?? 0,
  );

  const calculatedWellness = Math.round(
    averageHabitCompletion * 0.5 +
      medicationAdherence * 0.5,
  );

  const backendWellness = Number(
    metrics?.wellnessScore ??
      summary?.wellnessScore ??
      0,
  );

  const wellnessScore =
    backendWellness > 0
      ? Math.min(
          100,
          Math.round(backendWellness),
        )
      : calculatedWellness;

  const wellnessData = [
    {
      name: "Bienestar",
      value: Math.max(
        0,
        Math.min(100, wellnessScore),
      ),
      color: "#14B8A6",
    },
    {
      name: "Resto",
      value: Math.max(
        0,
        100 - wellnessScore,
      ),
      color: "rgba(255,255,255,0.15)",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Tarjetas métricas
  |--------------------------------------------------------------------------
  */

  const waterHabit = habits.find(
    (habit) => habit.key === "water",
  );

  const exerciseHabit = habits.find(
    (habit) => habit.key === "exercise",
  );

  const sleepHabit = habits.find(
    (habit) => habit.key === "sleep",
  );

  const meditationHabit = habits.find(
    (habit) => habit.key === "meditation",
  );

  const waterGoal = Number(
    waterHabit?.goal ??
      metrics?.waterGoalL ??
      2,
  );

  const waterValue = Number(
    waterHabit?.value ??
      metrics?.waterL ??
      0,
  );

  const exerciseGoal = Number(
    exerciseHabit?.goal ?? 30,
  );

  const exerciseValue = Number(
    exerciseHabit?.value ?? 0,
  );

  const sleepGoal = Number(
    sleepHabit?.goal ??
      metrics?.sleepGoalHours ??
      8,
  );

  const sleepValue = Number(
    sleepHabit?.value ??
      metrics?.sleepHours ??
      0,
  );

  const stepsGoal = Number(
    metrics?.stepsGoal ?? 10000,
  );

  const stepsValue = Number(
    metrics?.steps ?? 0,
  );

  const meditationValue = Number(
    meditationHabit?.value ?? 0,
  );

  const meditationGoal = Number(
    meditationHabit?.goal ?? 10,
  );

  const waterPct =
    waterGoal > 0
      ? Math.min(
          100,
          Math.round((waterValue / waterGoal) * 100),
        )
      : 0;

  const exercisePct =
    exerciseGoal > 0
      ? Math.min(
          100,
          Math.round((exerciseValue / exerciseGoal) * 100),
        )
      : 0;

  const sleepPct =
    sleepGoal > 0
      ? Math.min(
          100,
          Math.round((sleepValue / sleepGoal) * 100),
        )
      : 0;

  const stepsPct =
    stepsGoal > 0
      ? Math.min(
          100,
          Math.round((stepsValue / stepsGoal) * 100),
        )
      : 0;

  const meditationPct =
    meditationGoal > 0
      ? Math.min(
          100,
          Math.round((meditationValue / meditationGoal) * 100),
        )
      : 0;

  const metricCards = [
    {
      icon: Droplets,
      label: "Agua",
      value: `${waterValue.toFixed(2)}L`,
      target: `${waterGoal}L`,
      pct: waterPct,
      color: "#2563EB",
      sub:
        waterValue >= waterGoal
          ? "Meta de hidratación completada"
          : `${Math.max(0, waterGoal - waterValue).toFixed(2)}L pendiente`,
    },

    {
      icon: Activity,
      label: "Pasos",
      value: stepsValue.toLocaleString("es-MX"),
      target: `${(stepsGoal / 1000).toFixed(0)}k`,
      pct: stepsPct,
      color: "#22C55E",
      sub:
        stepsValue >= stepsGoal
          ? "Meta de pasos completada"
          : `${Math.max(0, stepsGoal - stepsValue).toLocaleString("es-MX")} restantes`,
    },

    {
      icon: Moon,
      label: "Sueño",
      value: `${sleepValue.toFixed(1)}h`,
      target: `${sleepGoal}h`,
      pct: sleepPct,
      color: "#8B5CF6",
      sub:
        sleepValue >= sleepGoal
          ? "Meta de sueño completada"
          : `${Math.max(0, sleepGoal - sleepValue).toFixed(1)}h pendientes`,
    },

    {
      icon: Heart,
      label: "Adherencia meds.",
      value: `${metrics?.medsAdherence ?? 0}%`,
      target: "100%",
      pct: metrics?.medsAdherence ?? 0,
      color: "#EF4444",
      sub: `Bienestar ${wellnessScore} pts`,
    },
  ];

  const saveEmotion =
    async () => {
      if (!selectedMood) {
        toast.error(
          "Selecciona cómo te sientes.",
        );

        return;
      }

      try {
        await apiRequest(
          "/emotional-logs",
          {
            method: "POST",

            body: JSON.stringify({
              mood: selectedMood,
              stress_level:
                stressLevel,
              energy_level:
                energyLevel,
              sleep_quality:
                sleepQuality,
              notes,
            }),
          },
        );

        toast.success(
          "Estado emocional registrado",
        );

        /*
         * Actualizamos inmediatamente
         * el estado de la pantalla.
         */
        setTodayEmotion({
          mood: selectedMood,
          stress_level:
            stressLevel,
          energy_level:
            energyLevel,
          sleep_quality:
            sleepQuality,
          notes,
        });

        /*
         * Después de registrar un nuevo
         * estado emocional, volvemos a
         * consultar recomendaciones.
         *
         * Así el dashboard puede cambiar
         * automáticamente.
         */
        setRecommendationsLoading(
          true,
        );

        apiRequest<RecommendationResponse>(
          "/recommendations",
        )
          .then((result) => {
            setRecommendations(
              result.recommendations ??
                [],
            );
          })
          .catch(() => null)
          .finally(() => {
            setRecommendationsLoading(
              false,
            );
          });

        setShowEmotionForm(false);
        setSelectedMood(null);
        setNotes("");
      } catch (error) {
        console.error(
          "Error guardando estado emocional:",
          error,
        );

        toast.error(
          "No se pudo guardar",
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Recomendaciones para dashboard
  |--------------------------------------------------------------------------
  |
  | Las alertas se reservan para la pantalla
  | completa de IA/Notificaciones.
  |
  */

  const dashboardRecommendations =
    recommendations
      .filter(
        (recommendation) =>
          recommendation.kind !==
          "alert",
      )
      .slice(0, 3);

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="min-h-full overflow-y-auto transition-colors"
      style={{
        backgroundColor: bg,
      }}
    >
      {/* -------------------------------------------------------------- */}
      {/* HEADER                                                         */}
      {/* -------------------------------------------------------------- */}

      <div
        className="relative px-5 md:px-8 xl:px-10 pt-8 md:pt-10 pb-6 md:pb-8 overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, #0A4B48 0%, #0F766E 48%, #1D4ED8 100%)",
          borderRadius: 0,
        }}
      >
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

        <div className="absolute bottom-[-20px] left-20 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 relative">
          <ImageWithFallback
            src={vitalMindLogo}
            alt="VitalMind AI"
            className="h-9 w-auto object-contain"
            style={{
              filter:
                "brightness(0) invert(1)",
            }}
          />

          <button
            type="button"
            onClick={() =>
              navigate(
                "/notificaciones",
              )
            }
            className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center relative border border-white/25"
          >
            <Bell
              size={18}
              className="text-white"
            />

            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F59E0B] rounded-full ring-1 ring-white/30" />
          </button>
        </div>

        {/* Greeting */}
        <p className="text-white/60 text-sm mb-0.5">
          {greeting}{" "}
          {greetingEmoji}
        </p>

        <p className="text-white/60 text-xs capitalize mb-1">
          {currentDateLabel} · {currentTimeLabel}
        </p>

        <h1 className="text-2xl font-bold text-white capitalize mb-5">
          {userName}
        </h1>

        {/* Wellness card */}
        <div className="bg-white/12 backdrop-blur-sm rounded-[24px] p-4 md:p-5 border border-white/20 flex items-center gap-4 md:max-w-2xl">
          <div className="relative w-[88px] h-[88px] flex-shrink-0">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    wellnessData
                  }
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={42}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {wellnessData.map(
                    (entry) => (
                      <Cell
                        key={`dash-${entry.name}`}
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
              <span className="text-xl font-bold text-white leading-none">
                {wellnessScore}
              </span>

              <span className="text-white/50 text-[9px] font-medium">
                pts
              </span>
            </div>
          </div>

          <div className="flex-1">
            <p className="text-white/60 text-xs mb-0.5">
              Bienestar general
            </p>

            <p className="text-white font-bold text-lg leading-tight mb-1">
              {wellnessScore >=
              80
                ? "Excelente estado"
                : wellnessScore >=
                    60
                  ? "Buen estado"
                  : wellnessScore >
                      0
                    ? "Puede mejorar"
                    : "Sin datos aún"}
            </p>

            <div className="flex items-center gap-1.5">
              <TrendingUp
                size={12}
                className="text-[#4ADE80]"
              />

              <span className="text-[#4ADE80] text-xs font-semibold">
                {metrics
                  ? `Adherencia meds. ${metrics.medsAdherence}%`
                  : "Registra tus hábitos"}
              </span>
            </div>
          </div>

          <div className="w-20 h-10 flex-shrink-0 opacity-70">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={
                  weekly?.Bienestar?.map(
                    (row) => ({
                      d: row.day,
                      v: row.value,
                    }),
                  ) ?? []
                }
              >
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#4ADE80"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/* CONTENIDO                                                      */}
      {/* -------------------------------------------------------------- */}

      <div className="px-5 md:px-8 xl:px-10 mt-5 md:mt-8 space-y-5 md:space-y-6 pb-6 md:pb-10">
        {/* ============================================================ */}
        {/* MÉTRICAS                                                     */}
        {/* ============================================================ */}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-base font-bold"
              style={{
                color: textMain,
              }}
            >
              Resumen de hoy
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/graficas",
                )
              }
              className="text-[#0F766E] text-xs font-semibold flex items-center gap-0.5"
            >
              Gráficas
              <ChevronRight
                size={14}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {metricCards.map(
              (metric) => {
                const Icon =
                  metric.icon;

                return (
                  <motion.div
                    key={
                      metric.label
                    }
                    whileTap={{
                      scale: 0.97,
                    }}
                    className="rounded-[20px] p-4 md:p-5 shadow-sm border"
                    style={{
                      backgroundColor:
                        cardBg,
                      borderColor:
                        cardBorder,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor:
                            `${metric.color}18`,
                        }}
                      >
                        <Icon
                          size={18}
                          style={{
                            color:
                              metric.color,
                          }}
                        />
                      </div>

                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          color:
                            textMuted,
                          backgroundColor:
                            dark
                              ? "rgba(255,255,255,0.05)"
                              : "#F1F5F9",
                        }}
                      >
                        {
                          metric.target
                        }
                      </span>
                    </div>

                    <p
                      className="text-lg font-bold leading-tight"
                      style={{
                        color:
                          textMain,
                      }}
                    >
                      {
                        metric.value
                      }
                    </p>

                    <p
                      className="text-[11px] mt-0.5 mb-2"
                      style={{
                        color:
                          textMuted,
                      }}
                    >
                      {
                        metric.label
                      }
                    </p>

                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{
                        backgroundColor:
                          dark
                            ? "rgba(255,255,255,0.08)"
                            : "#F1F5F9",
                      }}
                    >
                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${metric.pct}%`,
                        }}
                        transition={{
                          duration: 1,
                          delay: 0.2,
                        }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor:
                            metric.color,
                        }}
                      />
                    </div>

                    <p
                      className="text-[10px] mt-1.5"
                      style={{
                        color:
                          metric.color,
                      }}
                    >
                      {metric.sub}
                    </p>
                  </motion.div>
                );
              },
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/* MEDICAMENTOS + CITAS                                        */}
        {/* ============================================================ */}

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {/* Medicamentos */}
          <button
            type="button"
            onClick={() =>
              navigate(
                "/medicamentos",
              )
            }
            className="rounded-[20px] p-4 shadow-sm border flex flex-col gap-2 text-left active:scale-95 transition-all"
            style={{
              backgroundColor:
                cardBg,
              borderColor:
                cardBorder,
            }}
          >
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center"
              style={{
                backgroundColor:
                  "#0F766E18",
              }}
            >
              <Pill
                size={20}
                style={{
                  color: "#0F766E",
                }}
              />
            </div>

            <div>
              <p
                className="text-[11px] font-medium"
                style={{
                  color:
                    textMuted,
                }}
              >
                Medicamentos
              </p>

              <p
                className="text-base font-bold leading-tight"
                style={{
                  color:
                    textMain,
                }}
              >
                {
                  myMeds.filter(
                    (medication) =>
                      medication.tomado,
                  ).length
                }{" "}
                de{" "}
                {myMeds.length}
              </p>

              <p
                className="text-[10px]"
                style={{
                  color:
                    "#0F766E",
                }}
              >
                {myMeds.length
                  ? "tomados hoy"
                  : "Agrega tus medicamentos"}
              </p>
            </div>

            <div
              className="h-1.5 rounded-full overflow-hidden w-full"
              style={{
                backgroundColor:
                  dark
                    ? "rgba(255,255,255,0.08)"
                    : "#F1F5F9",
              }}
            >
              <div
                className="h-full rounded-full bg-[#0F766E]"
                style={{
                  width: `${
                    myMeds.length
                      ? Math.round(
                          (myMeds.filter(
                            (
                              medication,
                            ) =>
                              medication.tomado,
                          ).length /
                            myMeds.length) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </button>

          {/* Próxima cita */}
          <button
            type="button"
            onClick={() =>
              navigate(
                "/citas",
              )
            }
            className="rounded-[20px] p-4 shadow-sm border flex flex-col gap-2 text-left active:scale-95 transition-all"
            style={{
              backgroundColor:
                cardBg,
              borderColor:
                cardBorder,
            }}
          >
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center"
              style={{
                backgroundColor:
                  "#2563EB18",
              }}
            >
              <Calendar
                size={20}
                style={{
                  color:
                    "#2563EB",
                }}
              />
            </div>

            <div>
              <p
                className="text-[11px] font-medium"
                style={{
                  color:
                    textMuted,
                }}
              >
                Próxima cita
              </p>

              <p
                className="text-base font-bold leading-tight"
                style={{
                  color:
                    textMain,
                }}
              >
                {summary
                  ? String(
                      summary
                        .appointments
                        .upcoming,
                    )
                  : "Sin datos"}
              </p>

              <p
                className="text-[10px]"
                style={{
                  color:
                    "#2563EB",
                }}
              >
                {summary
                  ? `${summary.appointments.upcoming} próximas`
                  : "Registra tus citas"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Check
                size={11}
                style={{
                  color:
                    "#22C55E",
                }}
              />

              <span
                className="text-[10px]"
                style={{
                  color:
                    "#22C55E",
                }}
              >
                Seguimiento
              </span>
            </div>
          </button>
        </section>

        {/* ============================================================ */}
        {/* HÁBITOS SALUDABLES DE HOY                                    */}
        {/* ============================================================ */}

        <section
          className="rounded-[24px] p-5 md:p-6 shadow-sm border"
          style={{
            backgroundColor: cardBg,
            borderColor: cardBorder,
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-base font-bold"
              style={{ color: textMain }}
            >
              Hábitos saludables de hoy
            </h2>

            <button
              type="button"
              onClick={() => navigate("/habitos")}
              className="text-[#0F766E] text-xs font-semibold flex items-center gap-1"
            >
              Ver todos
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-5">
            <HabitProgressRow
              icon={Droplets}
              label="Agua"
              value={`${waterValue.toFixed(2)} L`}
              target={`${waterGoal} L`}
              percentage={waterPct}
              color="#2563EB"
              dark={dark}
              textMain={textMain}
              textMuted={textMuted}
            />

            <HabitProgressRow
              icon={Activity}
              label="Ejercicio"
              value={`${exerciseValue} min`}
              target={`${exerciseGoal} min`}
              percentage={exercisePct}
              color="#22C55E"
              dark={dark}
              textMain={textMain}
              textMuted={textMuted}
            />

            <HabitProgressRow
              icon={Moon}
              label="Sueño"
              value={`${sleepValue.toFixed(1)} h`}
              target={`${sleepGoal} h`}
              percentage={sleepPct}
              color="#8B5CF6"
              dark={dark}
              textMain={textMain}
              textMuted={textMuted}
            />

            <HabitProgressRow
              icon={Sparkles}
              label="Meditación"
              value={`${meditationValue} min`}
              target={`${meditationGoal} min`}
              percentage={meditationPct}
              color="#F59E0B"
              dark={dark}
              textMain={textMain}
              textMuted={textMuted}
            />
          </div>
        </section>

        {/* ============================================================ */}
        {/* ESTADO EMOCIONAL                                            */}
        {/* ============================================================ */}

        <section
          className="rounded-[24px] p-5 md:p-6 shadow-sm border"
          style={{
            backgroundColor:
              cardBg,
            borderColor:
              cardBorder,
          }}
        >
          {/* Header */}
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3
                className="text-base font-bold"
                style={{
                  color:
                    textMain,
                }}
              >
                ¿Cómo te sientes hoy?
              </h3>

              <p
                className="text-xs"
                style={{
                  color:
                    textMuted,
                }}
              >
                Registra tu estado
                emocional diario
              </p>
            </div>

            {todayEmotion && (
              <div
                className="rounded-xl p-3 flex items-center gap-3"
                style={{
                  background:
                    "#0F766E15",
                }}
              >
                <span className="text-2xl">
                  {
                    moods.find(
                      (mood) =>
                        mood.label ===
                        todayEmotion.mood,
                    )?.emoji
                  }
                </span>

                <div>
                  <p
                    className="text-xs"
                    style={{
                      color:
                        textMuted,
                    }}
                  >
                    Estado registrado
                    hoy
                  </p>

                  <p
                    className="font-bold"
                    style={{
                      color:
                        "#0F766E",
                    }}
                  >
                    {
                      todayEmotion.mood
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">
            {moods.map((mood) => (
              <button
                key={
                  mood.label
                }
                type="button"
                onClick={() => {
                  if (todayEmotion) {
                    toast.info(
                      "Ya registraste tu estado emocional de hoy",
                    );

                    return;
                  }

                  setSelectedMood(
                    mood.label,
                  );

                  setShowEmotionForm(
                    true,
                  );
                }}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl py-3 transition-all active:scale-95"
                style={{
                  backgroundColor:
                    selectedMood ===
                    mood.label
                      ? "#0F766E18"
                      : dark
                        ? "rgba(255,255,255,0.04)"
                        : "#F8FAFC",

                  border:
                    selectedMood ===
                    mood.label
                      ? "2px solid #0F766E"
                      : "1px solid transparent",
                }}
              >
                <span className="text-3xl">
                  {mood.emoji}
                </span>

                <span
                  className="text-[10px] font-semibold"
                  style={{
                    color:
                      selectedMood ===
                      mood.label
                        ? "#0F766E"
                        : textMuted,
                  }}
                >
                  {
                    mood.label
                  }
                </span>
              </button>
            ))}
          </div>

          {/* Formulario */}
          {showEmotionForm && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: "auto",
              }}
              transition={{
                duration: 0.3,
              }}
              className="mt-5 pt-5 border-t space-y-5"
              style={{
                borderColor:
                  cardBorder,
              }}
            >
              <div>
                <h4
                  className="text-sm font-bold mb-1"
                  style={{
                    color:
                      textMain,
                  }}
                >
                  {
                    moods.find(
                      (mood) =>
                        mood.label ===
                        selectedMood,
                    )?.emoji
                  }{" "}
                  Estado:{" "}
                  {selectedMood}
                </h4>

                <p
                  className="text-xs"
                  style={{
                    color:
                      textMuted,
                  }}
                >
                  Completa estos datos
                  para mejorar tu análisis
                  personalizado.
                </p>
              </div>

              {/* Estrés */}
              <div>
                <div className="flex justify-between mb-2">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color:
                        textMain,
                    }}
                  >
                    😰 Estrés
                  </span>

                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background:
                        "#EF444420",
                      color:
                        "#EF4444",
                    }}
                  >
                    {stressLevel}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={
                    stressLevel
                  }
                  onChange={(event) =>
                    setStressLevel(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="w-full accent-red-500"
                />
              </div>

              {/* Energía */}
              <div>
                <div className="flex justify-between mb-2">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color:
                        textMain,
                    }}
                  >
                    ⚡ Energía
                  </span>

                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background:
                        "#F59E0B20",
                      color:
                        "#F59E0B",
                    }}
                  >
                    {energyLevel}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={
                    energyLevel
                  }
                  onChange={(event) =>
                    setEnergyLevel(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="w-full accent-yellow-500"
                />
              </div>

              {/* Calidad del sueño */}
              <div>
                <div className="flex justify-between mb-2">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color:
                        textMain,
                    }}
                  >
                    🌙 Sueño
                  </span>

                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{
                      background:
                        "#8B5CF620",
                      color:
                        "#8B5CF6",
                    }}
                  >
                    {sleepQuality}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="10"
                  value={
                    sleepQuality
                  }
                  onChange={(event) =>
                    setSleepQuality(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                  className="w-full accent-purple-500"
                />
              </div>

              {/* Notas */}
              <textarea
                placeholder="¿Cómo fue tu día?"
                rows={3}
                className="w-full rounded-2xl border p-3 text-sm resize-none outline-none"
                style={{
                  backgroundColor:
                    dark
                      ? "#0F172A"
                      : "#F8FAFC",

                  borderColor:
                    cardBorder,

                  color:
                    textMain,
                }}
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target
                      .value,
                  )
                }
              />

              {/* Guardar */}
              <button
                type="button"
                onClick={
                  saveEmotion
                }
                className="w-full py-3.5 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition"
                style={{
                  background:
                    "linear-gradient(135deg,#0F766E,#2563EB)",
                }}
              >
                💚 Guardar estado
                emocional
              </button>
            </motion.div>
          )}
        </section>

        {/* ============================================================ */}
        {/* CONSEJOS IA REALES                                           */}
        {/* ============================================================ */}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-[#F59E0B] rounded-lg flex items-center justify-center">
              <Sparkles
                size={12}
                className="text-white"
              />
            </div>

            <h2
              className="text-base font-bold flex-1"
              style={{
                color:
                  textMain,
              }}
            >
              Consejos IA para hoy
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate("/ia")
              }
              className="text-[#0F766E] text-xs font-semibold flex items-center gap-0.5"
            >
              Ver todos
              <ChevronRight
                size={14}
              />
            </button>
          </div>

          {recommendationsLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              {[1, 2, 3].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-[18px] p-4 shadow-sm border animate-pulse"
                    style={{
                      backgroundColor:
                        cardBg,
                      borderColor:
                        cardBorder,
                    }}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl ${
                          dark
                            ? "bg-slate-800"
                            : "bg-slate-100"
                        }`}
                      />

                      <div className="flex-1">
                        <div
                          className={`h-3 rounded w-20 mb-3 ${
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
                          className={`h-3 rounded w-4/5 ${
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
            </div>
          ) : dashboardRecommendations.length ===
            0 ? (
            <div
              className="rounded-[18px] p-4 shadow-sm border"
              style={{
                backgroundColor:
                  cardBg,
                borderColor:
                  cardBorder,
              }}
            >
              <div className="flex gap-3 items-start">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor:
                      dark
                        ? "rgba(15,118,110,0.15)"
                        : "#F0FDFA",
                  }}
                >
                  <Sparkles
                    size={16}
                    style={{
                      color:
                        dark
                          ? "#2DD4BF"
                          : "#0F766E",
                    }}
                  />
                </div>

                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color:
                        textMain,
                    }}
                  >
                    Aún no hay
                    recomendaciones
                    para mostrar
                  </p>

                  <p
                    className="text-xs leading-relaxed mt-1"
                    style={{
                      color:
                        textMuted,
                    }}
                  >
                    Registra hábitos,
                    sueño, síntomas,
                    actividad o estado
                    emocional para que
                    VitalMind pueda
                    personalizar tus
                    recomendaciones.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
              {dashboardRecommendations.map(
                (
                  recommendation,
                  index,
                ) => {
                  const visual =
                    getRecommendationVisual(
                      recommendation,
                    );

                  const Icon =
                    visual.icon;

                  return (
                    <motion.div
                      key={`${recommendation.source}-${index}`}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay:
                          index *
                          0.08,
                      }}
                      className="rounded-[18px] p-3.5 shadow-sm border flex gap-3 items-start"
                      style={{
                        backgroundColor:
                          cardBg,
                        borderColor:
                          cardBorder,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor:
                            `${visual.color}18`,
                        }}
                      >
                        <Icon
                          size={16}
                          style={{
                            color:
                              visual.color,
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor:
                                `${visual.color}15`,
                              color:
                                visual.color,
                            }}
                          >
                            {
                              visual.tag
                            }
                          </span>

                          {recommendation.priority ===
                            "high" && (
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                dark
                                  ? "bg-red-500/10 text-red-300"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              PRIORIDAD
                            </span>
                          )}
                        </div>

                        <p
                          className="text-sm font-semibold leading-tight mt-2"
                          style={{
                            color:
                              textMain,
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
                              textMuted,
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
                              dark
                                ? "#64748B"
                                : "#94A3B8",
                          }}
                        >
                          {
                            recommendation.time
                          }
                        </p>
                      </div>
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* ACCESO RÁPIDO                                               */}
        {/* ============================================================ */}

        <section>
          <h2
            className="text-base font-bold mb-3"
            style={{
              color:
                textMain,
            }}
          >
            Acceso rápido
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-3">
            {quickActions.map(
              (action) => (
                <button
                  key={
                    action.path
                  }
                  type="button"
                  onClick={() =>
                    navigate(
                      action.path,
                    )
                  }
                  className="flex flex-col items-center gap-2 rounded-[16px] py-3.5 px-1 shadow-sm border active:scale-95 transition-all"
                  style={{
                    backgroundColor:
                      cardBg,
                    borderColor:
                      cardBorder,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center text-xl"
                    style={{
                      backgroundColor:
                        `${action.color}15`,
                    }}
                  >
                    {
                      action.emoji
                    }
                  </div>

                  <p
                    className="text-[9px] font-semibold text-center leading-tight"
                    style={{
                      color:
                        textMuted,
                    }}
                  >
                    {
                      action.label
                    }
                  </p>
                </button>
              ),
            )}
          </div>
        </section>
      </div>

      {/* ============================================================ */}
      {/* FAB                                                           */}
      {/* ============================================================ */}

      <button
        type="button"
        onClick={() =>
          navigate(
            "/registro",
          )
        }
        className="fixed z-50 bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all"
        style={{
          background:
            "linear-gradient(135deg, #0F766E, #2563EB)",
          boxShadow:
            "0 8px 24px rgba(15,118,110,0.4)",
        }}
      >
        <Plus
          size={24}
          className="text-white"
        />
      </button>
    </div>
  );
}