import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Droplets, Dumbbell, Moon, Apple, Brain, Target, ChevronLeft, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type { HabitKey, HabitToday, HabitWeekly } from "../../lib/types";

const habitDefs: { key: HabitKey; icon: typeof Droplets; label: string; unit: string; goal: number; color: string; emoji: string }[] = [
  { key: "water", icon: Droplets, label: "Agua", unit: "vasos", goal: 8, color: "#2563EB", emoji: "💧" },
  { key: "exercise", icon: Dumbbell, label: "Ejercicio", unit: "min", goal: 30, color: "#22C55E", emoji: "🏃" },
  { key: "sleep", icon: Moon, label: "Sueño", unit: "horas", goal: 8, color: "#8B5CF6", emoji: "🌙" },
  { key: "nutrition", icon: Apple, label: "Alimentación", unit: "comidas sanas", goal: 3, color: "#F59E0B", emoji: "🥗" },
  { key: "meditation", icon: Brain, label: "Meditación", unit: "min", goal: 10, color: "#EC4899", emoji: "🧘" },
];

function getWeekDaysEndingToday() {
  const days = ["D", "L", "M", "M", "J", "V", "S"];
  const today = new Date();
  const todayIndex = today.getDay(); // 0=Domingo, 1=Lunes...
  const weekDays = [];
  for (let i = 1; i <= 7; i++) {
    const index = (todayIndex + i) % 7;
    weekDays.push(days[index]);
  }
  return weekDays;
}


const weekDays = getWeekDaysEndingToday();

export function HabitosScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [progress, setProgress] = useState<Record<string, number>>({
    water: 0, exercise: 0, sleep: 0, nutrition: 0, meditation: 0,
  });
  const [weeklyTracking, setWeeklyTracking] = useState<Record<string, boolean[]>>({});
  const [loading, setLoading] = useState(true);

  const loadToday = async () => {
    const data = await apiRequest<HabitToday[]>("/habits/today");
    const next: Record<string, number> = {};
    data.forEach((h) => { next[h.key] = h.value; });
    setProgress(next);
  };

  const loadWeekly = async () => {
    const data = await apiRequest<HabitWeekly>("/habits/weekly");
    setWeeklyTracking(data.tracking as Record<string, boolean[]>);
  };

  useEffect(() => {
    Promise.all([loadToday(), loadWeekly()])
      .catch(() => toast.error("No se pudieron cargar tus hábitos"))
      .finally(() => setLoading(false));
  }, []);

  const increment = (key: HabitKey, max: number) => {
    // Actualización optimista para que se sienta instantáneo, y luego se
    // guarda de verdad en la base de datos.
    setProgress((p) => ({ ...p, [key]: Math.min((p[key] ?? 0) + 1, max) }));
    apiRequest<{ key: string; value: number; goal: number }>(`/habits/${key}/increment`, {
      method: "PATCH",
      body: JSON.stringify({ step: 1 }),
    })
      .then((result) => {
        setProgress((p) => ({ ...p, [key]: result.value }));
        toast.success("¡Hábito actualizado!");
        loadWeekly().catch(() => null);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "No se pudo guardar el hábito");
        loadToday().catch(() => null);
      });
  };

  const overallPct = Math.round(
    (habitDefs.reduce((sum, h) => sum + Math.min((progress[h.key] ?? 0) / h.goal, 1), 0) / habitDefs.length) * 100
  );

  const pageBg = dark ? "#070A12" : "#F8FAFC";
  const surface = dark ? "#0D1322" : "#FFFFFF";
  const border = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const title = dark ? "#F8FAFC" : "#0F172A";
  const body = dark ? "#CBD5E1" : "#475569";
  const muted = dark ? "#94A3B8" : "#64748B";

  return (
    <div className="h-full overflow-y-auto transition-colors" style={{ backgroundColor: pageBg }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-8" style={{ background: "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)" }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Hábitos Saludables</h1>
            <p className="text-white/70 text-sm">Registra tu progreso diario</p>
          </div>
        </div>

        {/* Overall progress */}
        <div className="bg-white/15 backdrop-blur-md rounded-[20px] p-4 border border-white/20 flex items-center gap-4">
          <Target className="w-10 h-10 text-[#F59E0B]" />
          <div className="flex-1">
            <p className="text-white/70 text-xs mb-1">Progreso general de hoy</p>
            <p className="text-2xl font-bold text-white">{loading ? "—" : `${overallPct}%`}</p>
            <div className="h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${loading ? 0 : overallPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-4 pb-4">
        {/* Habit cards */}
        {habitDefs.map((h) => {
          const Icon = h.icon;
          const current = progress[h.key] ?? 0;
          const pct = Math.min((current / h.goal) * 100, 100);
          const done = current >= h.goal;

          return (
            <motion.div
              key={h.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[20px] p-5 shadow-sm"
              style={{ backgroundColor: surface, border: `1px solid ${border}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: h.color + "15" }}>
                  {h.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold" style={{ color: title }}>{h.label}</p>
                  <p className="text-sm" style={{ color: muted }}>
                    {current} / {h.goal} {h.unit}
                  </p>
                </div>
                <button
                  onClick={() => increment(h.key, h.goal)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                    done ? "bg-[#22C55E]" : ""
                  }`}
                  style={!done ? { backgroundColor: h.color } : undefined}
                >
                  {done ? <Check className="w-5 h-5 text-white" /> : <Plus className="w-5 h-5 text-white" />}
                </button>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: done ? "#22C55E" : h.color }}
                />
              </div>
              {done && (
                <p className="text-xs font-semibold mt-2 flex items-center gap-1" style={{ color: "#22C55E" }}>
                  <Check className="w-3 h-3" /> ¡Meta alcanzada!
                </p>
              )}
            </motion.div>
          );
        })}

        {/* Weekly tracking */}
        <div className="rounded-[20px] p-5 shadow-sm" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <h2 className="text-base font-bold mb-4" style={{ color: title }}>Seguimiento semanal</h2>
          <div className="space-y-3">
            {habitDefs.map((h) => (
              <div key={h.key} className="flex items-center gap-3">
                <span className="text-xs font-medium w-20 truncate" style={{ color: muted }}>{h.label}</span>
                <div className="flex gap-1.5 flex-1">
                  {weekDays.map((d, i) => (
                    <div
                      key={d}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full aspect-square rounded-md"
                        style={{ backgroundColor: weeklyTracking[h.key]?.[i] ? h.color : dark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }}
                      />
                      <span className="text-[8px]" style={{ color: muted }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
