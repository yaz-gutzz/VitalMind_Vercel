import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Brain, Apple, Dumbbell, Moon, Smile, AlertTriangle, MessageSquare, ChevronRight, Sparkles } from "lucide-react";
import { useTheme } from "../ThemeContext";

const categories = [
  {
    icon: Apple,
    label: "Alimentación",
    color: "#22C55E",
    tips: [
      "Aumenta tu consumo de vegetales verdes esta semana.",
      "Reduce el sodio — tu presión arterial lo agradecerá.",
      "Incluye omega-3 en tu dieta: salmón, nueces o linaza.",
    ],
  },
  {
    icon: Dumbbell,
    label: "Actividad física",
    color: "#2563EB",
    tips: [
      "30 minutos de caminata diaria reducen el riesgo cardiovascular.",
      "Hoy llevas 6,240 pasos. ¡Casi alcanzas tu meta!",
      "Prueba yoga por la mañana para reducir el estrés.",
    ],
  },
  {
    icon: Moon,
    label: "Descanso",
    color: "#8B5CF6",
    tips: [
      "Mantén un horario de sueño constante, incluso fines de semana.",
      "Evita pantallas 1 hora antes de dormir.",
      "Tu sueño esta semana fue de 7.5h en promedio. ¡Muy bien!",
    ],
  },
  {
    icon: Smile,
    label: "Bienestar emocional",
    color: "#F59E0B",
    tips: [
      "Practica 10 minutos de meditación al día.",
      "Registraste estrés 3 veces esta semana. Considera una rutina de relajación.",
      "Conectar con personas cercanas mejora tu estado emocional.",
    ],
  },
];

const alerts = [
  { text: "Tu glucosa estuvo elevada el martes. Consulta con tu médico.", level: "high" },
  { text: "No registraste tu presión arterial en 5 días.", level: "medium" },
];

export function RecomendacionesIAScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();

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
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Recomendaciones IA</h1>
            <p className="text-white/70 text-sm">Personalizadas para ti</p>
          </div>
        </div>

        {/* AI score card */}
        <div className="mt-4 bg-white/15 backdrop-blur-md rounded-[20px] p-4 border border-white/20 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-[#F59E0B]" />
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">Tu perfil de salud está al 78%</p>
            <p className="text-white/70 text-xs mt-0.5">Completa tu historial para mejores recomendaciones</p>
          </div>
          <button onClick={() => navigate("/medical-history")} className="text-white/80 hover:text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-5 pb-4">
        {/* Preventive alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2" style={{ color: title }}>
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              Alertas preventivas
            </h2>
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`rounded-[20px] p-4 border flex gap-3 ${
                  a.level === "high"
                    ? (dark ? "bg-[#1F0E12] border-[#F87171]/40" : "bg-[#FEF2F2] border-[#FCA5A5]")
                    : (dark ? "bg-[#211B07] border-[#FBBF24]/40" : "bg-[#FFFBEB] border-[#FCD34D]")
                }`}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${a.level === "high" ? "text-[#EF4444]" : "text-[#F59E0B]"}`} />
                <p className="text-sm leading-relaxed" style={{ color: body }}>{a.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[20px] border shadow-sm overflow-hidden"
              style={{ backgroundColor: surface, borderColor: border }}
            >
              <div className="flex items-center gap-3 p-4 pb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: cat.color + "15" }}>
                  <Icon className="w-5 h-5" style={{ color: cat.color }} />
                </div>
                <h3 className="text-base font-bold" style={{ color: title }}>{cat.label}</h3>
              </div>
              <div className="px-4 pb-4 space-y-2.5">
                {cat.tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: cat.color + "20" }}>
                      <span className="text-[10px] font-bold" style={{ color: cat.color }}>{i + 1}</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: body }}>{tip}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* CTA Chatbot */}
        <button
          onClick={() => navigate("/chatbot")}
          className="w-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white rounded-[20px] p-5 flex items-center gap-4 active:scale-95 transition-all"
          style={{ boxShadow: "0 8px 24px rgba(15,118,110,0.3)" }}
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-base">Chatbot inteligente</p>
            <p className="text-white/70 text-sm">Pregunta lo que quieras a tu IA</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70" />
        </button>
      </div>
    </div>
  );
}
