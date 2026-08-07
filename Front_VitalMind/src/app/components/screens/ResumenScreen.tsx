import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import {PieChart,Pie,Cell,ResponsiveContainer,BarChart,Bar,XAxis,YAxis,Tooltip,LineChart,Line} from "recharts";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type { HabitToday, MetricsSummary, MetricsWeekly, SymptomLog } from "../../lib/types";


const habitMeta: { key: HabitToday["key"]; label: string; color: string }[] = [
  { key: "water", label: "Agua", color: "#2563EB" },
  { key: "exercise", label: "Ejercicio", color: "#22C55E" },
  { key: "sleep", label: "Sueño", color: "#8B5CF6" },
  { key: "meditation", label: "Meditación", color: "#F59E0B" },
];


export function ResumenScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [weekly, setWeekly] = useState<MetricsWeekly | null>(null);
  const [habits, setHabits] = useState<HabitToday[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [emotions, setEmotions] = useState<any[]>([]);

  useEffect(() => {
    apiRequest<MetricsSummary>("/metrics/summary").then(setMetrics).catch(() => null);
    apiRequest<MetricsWeekly>("/metrics/weekly").then(setWeekly).catch(() => null);
    apiRequest<HabitToday[]>("/habits/today").then(setHabits).catch(() => null);
    apiRequest<SymptomLog[]>("/symptom-logs").then(setSymptoms).catch(() => null);
  apiRequest<any[]>("/emotional-logs/history").then(setEmotions).catch(()=>null); 
  }, []);

  const wellnessScore = metrics?.wellnessScore ?? 0;
  const wellnessData = [
    { name: "Bienestar", value: wellnessScore, color: "#0F766E" },
    { name: "Resto", value: 100 - wellnessScore, color: "#F1F5F9" },
  ];

  const weeklyActivity = weekly?.Bienestar?.map((r) => ({ day: r.day, value: r.value })) ?? [];

  const habitPcts = habitMeta.map((h) => {
    const row = habits.find((x) => x.key === h.key);
    const pct = row && row.goal ? Math.min(100, Math.round((row.value / row.goal) * 100)) : 0;
    return { ...h, pct };
  });

  const symptomChartData = symptoms
  .slice()
  .reverse()
  .map((s)=>({

  date:new Date(s.created_at)
  .toLocaleDateString("es-MX",{
  day:"2-digit",
  month:"short"
  }),

  dolor:Number(s.pain),

  temperatura:s.temperature 
  ? Number(s.temperature)
  : null,

  glucosa:s.glucose
  ? Number(s.glucose)
  : null,

  frecuencia:s.heart_rate
  ? Number(s.heart_rate)
  : null

  }));

const emotionChartData = emotions
  .slice()
  .sort(
    (a,b)=> 
    new Date(a.log_date).getTime() - 
    new Date(b.log_date).getTime()
  )
  .map((e)=>({

    date:new Date(e.log_date)
    .toLocaleDateString(
      "es-MX",
      {
        day:"2-digit",
        month:"short"
      }
    ),

    mood:
    e.mood==="Muy bien"
    ?5
    :e.mood==="Bien"
    ?4
    :e.mood==="Regular"
    ?3
    :e.mood==="Mal"
    ?2
    :1,


    estres:Number(e.stress_level),

    energia:Number(e.energy_level),

    sueno:Number(e.sleep_quality)

  }));

  const aiInsights: string[] = [];
  if (metrics) {
    if (metrics.sleepHours >= metrics.sleepGoalHours) {
      aiInsights.push(`Dormiste ${metrics.sleepHours}h hoy, alcanzando tu meta de ${metrics.sleepGoalHours}h. ¡Sigue así!`);
    } else if (metrics.sleepHours > 0) {
      aiInsights.push(`Llevas ${metrics.sleepHours}h de sueño hoy. Intenta llegar a tu meta de ${metrics.sleepGoalHours}h.`);
    }
    if (metrics.waterL >= metrics.waterGoalL) {
      aiInsights.push(`Ya cumpliste tu meta de hidratación de hoy: ${metrics.waterL}L. Excelente.`);
    } else {
      aiInsights.push(`Llevas ${metrics.waterL}L de agua. Te faltan ${(metrics.waterGoalL - metrics.waterL).toFixed(1)}L para tu meta.`);
    }
    aiInsights.push(`Tu adherencia a medicamentos es del ${metrics.medsAdherence}%.`);
  }
  

  const pageBg = dark ? "#070A12" : "#F8FAFC";
  const surface = dark ? "#0D1322" : "#FFFFFF";
  const border = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const title = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#94A3B8" : "#64748B";

  return (
    <div className="h-full overflow-y-auto transition-colors" style={{ backgroundColor: pageBg }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-8" style={{ background: "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)" }}>
        <h1 className="text-2xl font-bold text-white mb-1">Mi Resumen</h1>
        <p className="text-white/70 text-sm">Últimos 7 días</p>

        {/* Wellness indicator */}
        <div className="mt-5 bg-white/15 backdrop-blur-md rounded-[24px] p-5 border border-white/20 flex items-center gap-4">
          <div className="w-28 h-28 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={wellnessData} cx="50%" cy="50%" innerRadius={34} outerRadius={48} dataKey="value" startAngle={90} endAngle={-270} isAnimationActive={false}>
                  {wellnessData.map((e) => <Cell key={`w-${e.name}`} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{wellnessScore}</span>
              <span className="text-white/60 text-xs">pts</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white/70 text-xs mb-1">Nivel de bienestar</p>
            <p className="text-xl font-bold text-white mb-1">
              {wellnessScore >= 80 ? "Excelente" : wellnessScore >= 60 ? "Bueno" : wellnessScore > 0 ? "Puede mejorar" : "Sin datos"}
            </p>
            <div className="flex items-center gap-1 text-[#4ADE80] text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>{metrics ? `Adherencia meds. ${metrics.medsAdherence}%` : "Registra tus hábitos"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6 pb-4">
        {/* Weekly activity chart */}
        <div className="rounded-[20px] p-5 shadow-sm" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: title }}>Bienestar semanal</h2>
            <button onClick={() => navigate("/graficas")} className="text-[#0F766E] text-xs font-medium flex items-center gap-0.5">
              Ver gráficas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {weeklyActivity.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-sm text-center px-4" style={{ color: muted }}>
              Aún no tienes datos registrados. Registra tus hábitos para ver tu progreso aquí.
            </div>
          ) : (
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity} barSize={20}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: dark ? "#94A3B8" : "#94A3B8" }} />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: dark ? "#0D1322" : "white", border: `1px solid ${border}`, borderRadius: 12, fontSize: 12, color: title }}
                    cursor={{ fill: dark ? "rgba(255,255,255,0.04)" : "#F1F5F9", radius: 8 }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={false}>
                    {weeklyActivity.map((entry, i) => (
                      <Cell key={`bar-${entry.day}-${i}`} fill="#0F766E" fillOpacity={i === weeklyActivity.length - 1 ? 1 : 0.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Healthy habits */}
        <div className="rounded-[20px] p-5 shadow-sm" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold" style={{ color: title }}>Hábitos saludables de hoy</h2>
            <button onClick={() => navigate("/habitos")} className="text-[#0F766E] text-xs font-medium flex items-center gap-0.5">
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {habitPcts.map((h) => (
              <div key={h.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-medium" style={{ color: dark ? "#CBD5E1" : "#475569" }}>{h.label}</span>
                  <span className="text-sm font-bold" style={{ color: h.color }}>{h.pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${h.pct}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: h.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emotional chart */}

        <div className="rounded-[20px] p-5 shadow-sm" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>


        <h2 className="text-base font-bold mb-4" style={{ color: title }}>
        Evolución emocional
        </h2>


        {
        emotionChartData.length===0
        ?

        <p className="text-sm text-center py-8" style={{ color: muted }}>
        Registra tu estado emocional para ver tu progreso.
        </p>


        :

        <div className="h-72">


        <ResponsiveContainer
        width="100%"
        height="100%"
        >


        <LineChart data={emotionChartData}>


        <XAxis 
        dataKey="date"
        />


        <YAxis 
        domain={[0,5]}
        />


        <Tooltip />


        <Line
        type="monotone"
        dataKey="mood"
        stroke="#0F766E"
        strokeWidth={3}
        name="Ánimo"
        />


        <Line
        type="monotone"
        dataKey="estres"
        stroke="#EF4444"
        strokeWidth={3}
        name="Estrés"
        />


        <Line
        type="monotone"
        dataKey="energia"
        stroke="#F59E0B"
        strokeWidth={3}
        name="Energía"
        />


        <Line
        type="monotone"
        dataKey="sueno"
        stroke="#8B5CF6"
        strokeWidth={3}
        name="Sueño"
        />


        </LineChart>


        </ResponsiveContainer>


        </div>

        }


        </div>

        {/* Symptom chart */}
        <div className="bg-white rounded-[20px] p-5 border border-[#E2E8F0] shadow-sm">

          <h2 className="text-base font-bold text-slate-800 mb-4">
            Evolución de síntomas
          </h2>


          {
            symptomChartData.length === 0 ? (

              <p className="text-sm text-slate-400 text-center py-8">
                No hay datos suficientes para generar la gráfica.
              </p>

            ) : (

              <div className="h-72">

                <ResponsiveContainer width="100%" height="100%">

                  <LineChart data={symptomChartData}>

                    <XAxis 
                      dataKey="date"
                    />

                    <YAxis />

                    <Tooltip />


                    <Line
                      type="monotone"
                      dataKey="dolor"
                      stroke="#EF4444"
                      strokeWidth={3}
                      name="Dolor"
                    />


                    <Line
                      type="monotone"
                      dataKey="temperatura"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      name="Temperatura"
                    />


                    <Line
                      type="monotone"
                      dataKey="glucosa"
                      stroke="#2563EB"
                      strokeWidth={3}
                      name="Glucosa"
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            )

          }

        </div>

        {/* Symptom history */}
        <div className="bg-white rounded-[20px] p-5 border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Historial de síntomas</h2>
            <button onClick={() => navigate("/registro")} className="text-[#0F766E] text-xs font-medium">
              Nuevo registro</button>
          </div>
          {
            symptoms.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No tienes síntomas registrados todavía.
              </p>
            ) : (
              <div className="space-y-3">
                {symptoms.slice(0,5).map((s)=> (
                  <div
                    key={s.id}
                    className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-400">
                        {new Date(s.created_at).toLocaleDateString("es-MX")}
                      </span>
                      <span className={`text-xs font-bold ${
                        s.pain > 7
                        ? "text-red-500"
                        : s.pain > 3
                        ? "text-orange-500"
                        : "text-green-500"
                      }`}>
                        Dolor: {s.pain}/10
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                      {s.temperature && (<span>🌡️ {s.temperature}°C</span>)}
                      {s.heart_rate && (<span>❤️ {s.heart_rate} bpm</span> )}
                      {s.glucose && (<span>💧 {s.glucose} mg/dL</span> )}
                      {s.systolic && s.diastolic && (<span>🩺 {s.systolic}/{s.diastolic}</span>)}
                    </div>
                    {s.mood && (
                      <p className="mt-2 text-xs text-slate-500">
                        Estado: {s.mood}
                      </p>
                    )}
                    {s.notes && (
                      <p className="mt-2 text-xs text-slate-400 italic">
                        "{s.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* AI Insights */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-[#F59E0B]" />
            <h2 className="text-base font-bold text-slate-800">Insights generados por IA</h2>
          </div>
          <div className="space-y-3">
            {aiInsights.length === 0 && (
              <p className="text-sm text-slate-400">Registra tus hábitos hoy para recibir consejos personalizados.</p>
            )}
            {aiInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-r from-[#0F766E]/5 to-[#14B8A6]/5 border border-[#0F766E]/15 rounded-[20px] p-4 flex gap-3"
              >
                <div className="w-2 h-2 mt-1.5 bg-[#0F766E] rounded-full flex-shrink-0" />
                <p className="text-sm text-slate-600 leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
