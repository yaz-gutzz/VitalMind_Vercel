import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ChevronLeft,
  Plus,
  Droplets,
  Activity,
  Moon,
  Apple,
  Brain,
  Check,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";

type HabitKey =
  | "water"
  | "exercise"
  | "sleep"
  | "nutrition"
  | "meditation";

type HabitFromApi = {
  id?: number | null;
  key: HabitKey;
  label?: string;
  value: number;
  goal: number;
  unit?: string;
  completed?: boolean;
};

type HabitView = HabitFromApi & {
  displayValue: string;
  displayGoal: string;
  percentage: number;
  displayUnit: string;
};

const HABIT_META: Record<
  HabitKey,
  {
    label: string;
    color: string;
    icon: typeof Droplets;
    unit: string;
    goal: number;
    defaultStep: number;
  }
> = {
  water: {
    label: "Agua",
    color: "#2563EB",
    icon: Droplets,
    unit: "vasos",
    goal: 8,
    defaultStep: 0.25,
  },

  exercise: {
    label: "Ejercicio",
    color: "#22C55E",
    icon: Activity,
    unit: "min",
    goal: 30,
    defaultStep: 5,
  },

  sleep: {
    label: "Sueño",
    color: "#8B5CF6",
    icon: Moon,
    unit: "h",
    goal: 8,
    defaultStep: 1,
  },

  nutrition: {
    label: "Alimentación",
    color: "#F59E0B",
    icon: Apple,
    unit: "comidas",
    goal: 3,
    defaultStep: 1,
  },

  meditation: {
    label: "Meditación",
    color: "#F97316",
    icon: Brain,
    unit: "min",
    goal: 10,
    defaultStep: 5,
  },
};

const HABIT_ORDER: HabitKey[] = [
  "water",
  "exercise",
  "sleep",
  "nutrition",
  "meditation",
];

function clampPercentage(
  value: number,
  goal: number,
) {
  if (!Number.isFinite(value) || goal <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((value / goal) * 100),
  );
}

function litersToGlasses(
  liters: number,
) {
  /*
   * VitalMind usa 250 ml por vaso.
   *
   * 1 L = 4 vasos
   * 2 L = 8 vasos
   */
  return Math.round(
    liters * 4,
  );
}

function formatWaterLiters(
  liters: number,
) {
  return `${liters.toFixed(2)} L`;
}

export function HabitosScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [
    habits,
    setHabits,
  ] = useState<HabitFromApi[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingKey,
    setUpdatingKey,
  ] = useState<HabitKey | null>(
    null,
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  /*
  |--------------------------------------------------------------------------
  | Pasos
  |--------------------------------------------------------------------------
  |
  | Los pasos viven en health_metrics, no en habit_logs.
  */

  const [steps, setSteps] = useState(0);
  const [stepsGoal, setStepsGoal] = useState(10000);
  const [stepsLoading, setStepsLoading] = useState(true);
  const [stepsUpdating, setStepsUpdating] = useState(false);
  const [showStepsEditor, setShowStepsEditor] = useState(false);
  const [stepsInput, setStepsInput] = useState("");
  const [savingSteps, setSavingSteps] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Cargar hábitos reales
  |--------------------------------------------------------------------------
  */

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await apiRequest<
          HabitFromApi[]
        >("/habits/today");

      if (!Array.isArray(response)) {
        throw new Error(
          "La respuesta de hábitos no tiene un formato válido.",
        );
      }

      setHabits(response);
    } catch (err) {
      console.error(
        "Error cargando hábitos:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los hábitos.",
      );

      setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSteps = async () => {
    try {
      setStepsLoading(true);

      const response =
        await apiRequest<{
          steps: number;
          stepsGoal: number;
        }>("/metrics/summary");

      setSteps(
        Number(
          response.steps ?? 0,
        ),
      );

      setStepsGoal(
        Number(
          response.stepsGoal ?? 10000,
        ),
      );
    } catch (err) {
      console.error(
        "Error cargando pasos:",
        err,
      );

      setSteps(0);
      setStepsGoal(10000);
    } finally {
      setStepsLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      loadHabits(),
      loadSteps(),
    ]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Normalizar hábitos
  |--------------------------------------------------------------------------
  */

  const habitRows =
    useMemo<HabitView[]>(() => {
      return HABIT_ORDER.map(
        (key) => {
          const meta =
            HABIT_META[key];

          const apiHabit =
            habits.find(
              (item) =>
                item.key === key,
            );

          const value = Number(
            apiHabit?.value ?? 0,
          );

          const goalFromApi =
            Number(
              apiHabit?.goal ?? 0,
            );

          /*
           * Para agua:
           *
           * Backend = litros
           * Frontend = vasos
           */
          if (key === "water") {
            const glasses =
              litersToGlasses(
                value,
              );

            const percentage =
              clampPercentage(
                value,
                2,
              );

            return {
              id:
                apiHabit?.id ??
                null,

              key,

              label:
                meta.label,

              color:
                meta.color,

              icon:
                meta.icon,

              value,

              goal:
                2,

              unit:
                "L",

              completed:
                value >= 2,

              displayValue:
                String(
                  Math.min(
                    glasses,
                    8,
                  ),
                ),

              displayGoal:
                "8",

              percentage,

              displayUnit:
                "vasos",
            };
          }

          const goal =
            goalFromApi > 0
              ? goalFromApi
              : meta.goal;

          return {
            id:
              apiHabit?.id ??
              null,

            key,

            label:
              meta.label,

            color:
              meta.color,

            icon:
              meta.icon,

            value,

            goal,

            unit:
              meta.unit,

            completed:
              value >= goal,

            displayValue:
              key ===
              "sleep"
                ? value.toFixed(
                    1,
                  )
                : String(
                    Math.round(
                      value,
                    ),
                  ),

            displayGoal:
              key ===
              "sleep"
                ? goal.toFixed(
                    0,
                  )
                : String(
                    Math.round(
                      goal,
                    ),
                  ),

            percentage:
              clampPercentage(
                value,
                goal,
              ),

            displayUnit:
              meta.unit,
          };
        },
      );
    }, [habits]);

  /*
  |--------------------------------------------------------------------------
  | Progreso general
  |--------------------------------------------------------------------------
  */

  const generalProgress =
    useMemo(() => {
      if (
        habitRows.length === 0
      ) {
        return 0;
      }

      const total =
        habitRows.reduce(
          (
            sum,
            habit,
          ) =>
            sum +
            habit.percentage,
          0,
        );

      return Math.round(
        total /
          habitRows.length,
      );
    }, [habitRows]);

  const completedCount =
    habitRows.filter(
      (habit) =>
        habit.completed,
    ).length;

  /*
  |--------------------------------------------------------------------------
  | Incrementar hábito
  |--------------------------------------------------------------------------
  */

  const incrementHabit =
    async (
      key: HabitKey,
    ) => {
      if (updatingKey) {
        return;
      }

      const habit =
        habitRows.find(
          (item) =>
            item.key ===
            key,
        );

      if (!habit) {
        return;
      }

      if (habit.completed) {
        toast.success(
          `${habit.label}: meta completada.`,
        );

        return;
      }

      const meta =
        HABIT_META[key];

      try {
        setUpdatingKey(
          key,
        );

        await apiRequest(
          `/habits/${key}/increment`,
          {
            method: "POST",
            body: JSON.stringify({
              step: meta.defaultStep,
            }),
          },
        );

        /*
         * Volvemos a consultar al backend.
         *
         * Esto evita que el frontend tenga
         * un valor diferente de MySQL.
         */
        await loadHabits();

        toast.success(
          key === "water"
            ? "Agua registrada."
            : `${meta.label} actualizado.`,
        );
      } catch (err) {
        console.error(
          "Error incrementando hábito:",
          err,
        );

        toast.error(
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el hábito.",
        );
      } finally {
        setUpdatingKey(
          null,
        );
      }
    };

  /*
  |--------------------------------------------------------------------------
  | Gestión de pasos
  |--------------------------------------------------------------------------
  */

  const stepsPercentage =
    stepsGoal > 0
      ? Math.min(
          100,
          Math.round(
            (steps / stepsGoal) * 100,
          ),
        )
      : 0;

  const incrementSteps = async () => {
    if (stepsUpdating) {
      return;
    }

    if (steps >= stepsGoal) {
      toast.success(
        "Ya alcanzaste tu meta de pasos.",
      );
      return;
    }

    try {
      setStepsUpdating(true);

      const response =
        await apiRequest<{
          steps: number;
          goal: number;
        }>("/metrics/steps/increment", {
          method: "POST",
          body: JSON.stringify({
            step: 500,
          }),
        });

      setSteps(
        Number(
          response.steps ?? steps,
        ),
      );

      setStepsGoal(
        Number(
          response.goal ?? stepsGoal,
        ),
      );

      toast.success(
        "500 pasos agregados.",
      );
    } catch (err) {
      console.error(
        "Error incrementando pasos:",
        err,
      );

      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudieron agregar los pasos.",
      );
    } finally {
      setStepsUpdating(false);
    }
  };

  const openStepsEditor = () => {
    setStepsInput(
      String(steps),
    );
    setShowStepsEditor(true);
  };

  const saveSteps = async () => {
    const value = Number(
      stepsInput,
    );

    if (
      !Number.isFinite(value) ||
      value < 0
    ) {
      toast.error(
        "Introduce una cantidad válida de pasos.",
      );
      return;
    }

    try {
      setSavingSteps(true);

      const response =
        await apiRequest<{
          steps: number;
          goal: number;
        }>("/metrics/steps", {
          method: "PATCH",
          body: JSON.stringify({
            steps: Math.round(value),
          }),
        });

      setSteps(
        Number(
          response.steps ?? value,
        ),
      );

      setStepsGoal(
        Number(
          response.goal ?? stepsGoal,
        ),
      );

      setShowStepsEditor(false);

      toast.success(
        "Pasos actualizados.",
      );
    } catch (err) {
      console.error(
        "Error actualizando pasos:",
        err,
      );

      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudieron actualizar los pasos.",
      );
    } finally {
      setSavingSteps(false);
    }
  };

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

  const muted = dark
    ? "#94A3B8"
    : "#64748B";

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div
        className="h-full overflow-y-auto"
        style={{
          backgroundColor:
            pageBg,
        }}
      >
        <div
          className="px-6 pt-12 pb-8"
          style={{
            background:
              "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                navigate(-1)
              }
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Hábitos Saludables
              </h1>

              <p className="text-white/70 text-sm">
                Registrando tu progreso diario
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6 space-y-4">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className={`h-28 rounded-[20px] animate-pulse ${
                dark
                  ? "bg-slate-800"
                  : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="h-full overflow-y-auto transition-colors"
      style={{
        backgroundColor:
          pageBg,
      }}
    >
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}

      <div
        className="px-6 pt-12 pb-8"
        style={{
          background:
            "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              Hábitos Saludables
            </h1>

            <p className="text-white/70 text-sm">
              Registra tu progreso diario
            </p>
          </div>

          <button
            type="button"
            onClick={refreshAll}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw
              className="w-4 h-4 text-white"
              style={{
                animation:
                  loading
                    ? "spin 1s linear infinite"
                    : undefined,
              }}
            />
          </button>
        </div>

        {/* ========================================================== */}
        {/* PROGRESO GENERAL                                           */}
        {/* ========================================================== */}

        <div className="mt-5 rounded-[20px] bg-white/15 backdrop-blur-sm border border-white/20 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/20 flex items-center justify-center">
              <span className="text-2xl">
                🎯
              </span>
            </div>

            <div className="flex-1">
              <p className="text-white/70 text-xs">
                Progreso general de hoy
              </p>

              <p className="text-2xl font-bold text-white">
                {generalProgress}%
              </p>
            </div>

            <p className="text-white/70 text-xs">
              {completedCount}/
              {
                habitRows.length
              }{" "}
              completos
            </p>
          </div>

          <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${generalProgress}%`,
              }}
              transition={{
                duration: 0.6,
              }}
              className="h-full rounded-full bg-white"
            />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ERROR                                                        */}
      {/* ============================================================ */}

      {error && (
        <div className="px-5 mt-5">
          <div
            className={`rounded-[18px] border p-4 ${
              dark
                ? "bg-red-950/30 border-red-900 text-red-300"
                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >
            <p className="text-sm font-medium">
              {error}
            </p>

            <button
              type="button"
              onClick={loadHabits}
              className="mt-3 text-xs font-semibold underline"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PASOS                                                         */}
      {/* ============================================================ */}

      <div className="px-5 mt-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-[20px] p-4 shadow-sm border"
          style={{
            backgroundColor: surface,
            borderColor: border,
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-emerald-500/10">
              <Activity className="w-6 h-6 text-emerald-500" />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold"
                style={{
                  color: title,
                }}
              >
                Pasos
              </p>

              {stepsLoading ? (
                <p
                  className="text-xs mt-1"
                  style={{
                    color: muted,
                  }}
                >
                  Cargando...
                </p>
              ) : (
                <>
                  <p
                    className="text-xs mt-1"
                    style={{
                      color: muted,
                    }}
                  >
                    {steps.toLocaleString(
                      "es-MX",
                    )}{" "}
                    /{" "}
                    {stepsGoal.toLocaleString(
                      "es-MX",
                    )}{" "}
                    pasos
                  </p>

                  <p
                    className="text-[10px] mt-0.5"
                    style={{
                      color:
                        steps >=
                        stepsGoal
                          ? "#22C55E"
                          : muted,
                    }}
                  >
                    {steps >= stepsGoal
                      ? "Meta completada"
                      : `Faltan ${Math.max(
                          0,
                          stepsGoal -
                            steps,
                        ).toLocaleString(
                          "es-MX",
                        )} pasos`}
                  </p>
                </>
              )}
            </div>

            <div className="text-right">
              <p
                className="text-xs font-bold"
                style={{
                  color:
                    steps >= stepsGoal
                      ? "#22C55E"
                      : "#10B981",
                }}
              >
                {stepsPercentage}%
              </p>

              <button
                type="button"
                onClick={incrementSteps}
                disabled={
                  stepsUpdating ||
                  steps >= stepsGoal
                }
                className="mt-2 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed bg-emerald-500 text-white"
                title="Agregar 500 pasos"
              >
                {steps >= stepsGoal ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{
                backgroundColor:
                  dark
                    ? "rgba(255,255,255,0.07)"
                    : "#F1F5F9",
              }}
            >
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${stepsPercentage}%`,
                }}
                transition={{
                  duration: 0.6,
                }}
                className="h-full rounded-full bg-emerald-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={openStepsEditor}
            className="mt-3 text-xs font-semibold text-emerald-600"
          >
            Editar pasos
          </button>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* HÁBITOS                                                       */}
      {/* ============================================================ */}

      <div className="px-5 mt-4 space-y-4 pb-8">
        {habitRows.map(
          (habit) => {
            const Icon =
              habit.icon;

            const isUpdating =
              updatingKey ===
              habit.key;

            return (
              <motion.div
                key={
                  habit.key
                }
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="rounded-[20px] p-4 shadow-sm border"
                style={{
                  backgroundColor:
                    surface,
                  borderColor:
                    border,
                }}
              >
                {/* ----------------------------------------------- */}
                {/* TITULO                                           */}
                {/* ----------------------------------------------- */}

                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor:
                        `${habit.color}15`,
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{
                        color:
                          habit.color,
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color:
                          title,
                      }}
                    >
                      {
                        habit.label
                      }
                    </p>

                    {/* AGUA */}
                    {habit.key ===
                    "water" ? (
                      <div>
                        <p
                          className="text-xs mt-0.5"
                          style={{
                            color:
                              muted,
                          }}
                        >
                          {
                            habit.displayValue
                          }{" "}
                          /{" "}
                          {
                            habit.displayGoal
                          }{" "}
                          vasos
                        </p>

                        <p
                          className="text-[10px] mt-0.5"
                          style={{
                            color:
                              muted,
                          }}
                        >
                          {
                            formatWaterLiters(
                              habit.value,
                            )
                          }{" "}
                          de 2.00 L
                        </p>
                      </div>
                    ) : (
                      <p
                        className="text-xs mt-0.5"
                        style={{
                          color:
                            muted,
                        }}
                      >
                        {
                          habit.displayValue
                        }{" "}
                        /{" "}
                        {
                          habit.displayGoal
                        }{" "}
                        {
                          habit.displayUnit
                        }
                      </p>
                    )}
                  </div>

                  {/* PORCENTAJE */}
                  <span
                    className="text-xs font-bold"
                    style={{
                      color:
                        habit.color,
                    }}
                  >
                    {
                      habit.percentage
                    }%
                  </span>

                  {/* BOTON */}
                  <button
                    type="button"
                    onClick={() =>
                      incrementHabit(
                        habit.key,
                      )
                    }
                    disabled={
                      isUpdating ||
                      habit.completed
                    }
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        habit.completed
                          ? "#22C55E"
                          : habit.color,
                      opacity:
                        isUpdating
                          ? 0.6
                          : 1,
                    }}
                    title={
                      habit.completed
                        ? "Meta completada"
                        : "Agregar progreso"
                    }
                  >
                    {habit.completed ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Plus className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>

                {/* ----------------------------------------------- */}
                {/* BARRA                                            */}
                {/* ----------------------------------------------- */}

                <div className="mt-4">
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{
                      backgroundColor:
                        dark
                          ? "rgba(255,255,255,0.07)"
                          : "#F1F5F9",
                    }}
                  >
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${habit.percentage}%`,
                      }}
                      transition={{
                        duration: 0.5,
                      }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          habit.color,
                      }}
                    />
                  </div>
                </div>

                {/* ----------------------------------------------- */}
                {/* MENSAJE                                          */}
                {/* ----------------------------------------------- */}

                <div className="mt-2 flex justify-between">
                  <p
                    className="text-[10px]"
                    style={{
                      color:
                        muted,
                    }}
                  >
                    {habit.completed
                      ? "Meta completada"
                      : habit.key ===
                          "water"
                        ? `Faltan ${Math.max(
                            0,
                            2 -
                              habit.value,
                          ).toFixed(
                            2,
                          )} L`
                        : `Faltan ${Math.max(
                            0,
                            habit.goal -
                              habit.value,
                          ).toFixed(
                            habit.key ===
                              "sleep"
                              ? 1
                              : 0,
                          )} ${
                            habit.displayUnit
                          }`}
                  </p>

                  <p
                    className="text-[10px] font-medium"
                    style={{
                      color:
                        habit.color,
                    }}
                  >
                    +{" "}
                    {habit.key ===
                    "water"
                      ? "1 vaso"
                      : `${HABIT_META[habit.key].defaultStep} ${habit.displayUnit}`}
                  </p>
                </div>
              </motion.div>
            );
          },
        )}

        {/* ======================================================== */}
        {/* INFORMACIÓN                                              */}
        {/* ======================================================== */}

        <div
          className={`rounded-[20px] p-4 border ${
            dark
              ? "bg-[#0D1322] border-slate-800"
              : "bg-white border-slate-200"
          }`}
        >
          <p
            className="text-xs leading-relaxed"
            style={{
              color:
                muted,
            }}
          >
            Los datos mostrados corresponden a
            los registros del día actual. El agua
            se almacena en litros y se presenta
            también como vasos para facilitar el
            registro.
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL EDITAR PASOS                                           */}
      {/* ============================================================ */}

      {showStepsEditor && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
          onClick={() => {
            if (!savingSteps) {
              setShowStepsEditor(
                false,
              );
            }
          }}
        >
          <motion.div
            initial={{
              y: "100%",
            }}
            animate={{
              y: 0,
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="w-full max-w-2xl mx-auto rounded-t-[32px] p-6"
            style={{
              backgroundColor: surface,
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{
                    color: title,
                  }}
                >
                  Editar pasos de hoy
                </h3>

                <p
                  className="text-xs mt-1"
                  style={{
                    color: muted,
                  }}
                >
                  Introduce el número exacto de pasos registrados.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!savingSteps) {
                    setShowStepsEditor(
                      false,
                    );
                  }
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    dark
                      ? "#1E293B"
                      : "#F1F5F9",
                }}
              >
                <X
                  className="w-4 h-4"
                  style={{
                    color: muted,
                  }}
                />
              </button>
            </div>

            <label
              className="text-xs font-medium mb-1.5 block"
              style={{
                color: muted,
              }}
            >
              Pasos
            </label>

            <input
              type="number"
              min="0"
              step="1"
              value={stepsInput}
              onChange={(event) =>
                setStepsInput(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  saveSteps();
                }
              }}
              className="w-full rounded-[14px] px-4 py-3.5 text-sm border focus:outline-none focus:border-[#0F766E]"
              style={{
                backgroundColor:
                  dark
                    ? "#090D16"
                    : "#F8FAFC",
                borderColor: border,
                color: title,
              }}
            />

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={() =>
                  !savingSteps &&
                  setShowStepsEditor(
                    false,
                  )
                }
                className="flex-1 py-3.5 rounded-[16px] font-semibold"
                style={{
                  backgroundColor:
                    dark
                      ? "#1E293B"
                      : "#F1F5F9",
                  color: title,
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={saveSteps}
                disabled={
                  savingSteps
                }
                className="flex-1 py-3.5 rounded-[16px] text-white font-semibold disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg,#0F766E,#2563EB)",
                }}
              >
                {savingSteps
                  ? "Guardando..."
                  : "Guardar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}