import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell, Droplets, Heart, Moon, Activity, ChevronRight, Sparkles, Zap, Apple,
  TrendingUp, Plus, Pill, Calendar, Check,
} from "lucide-react";
import { motion } from "motion/react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from "recharts";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import vitalMindLogo from "../../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";
import { toast } from "sonner";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type { DashboardSummary, MetricsSummary, MetricsWeekly } from "../../lib/types";

const moods = [
  { label:"Muy bien", emoji:"😄" },
  { label:"Bien", emoji:"🙂" },
  { label:"Regular", emoji:"😐" },
  { label:"Mal", emoji:"😔" },
  { label:"Muy mal", emoji:"😭" },
];

const aiTips = [
  { icon: Apple, text: "Tu fibra está baja. Añade espinacas o legumbres hoy.", color: "#22C55E", tag: "Nutrición" },
  { icon: Droplets, text: "Te faltan 400ml para tu meta de hidratación.", color: "#2563EB", tag: "Agua" },
  { icon: Zap, text: "Sueño mejorado +12% esta semana. ¡Excelente ritmo!", color: "#F59E0B", tag: "Sueño" },
];

const quickActions = [
  { label: "Registrar síntoma", path: "/registro", emoji: "🩺", color: "#EF4444" },
  { label: "Medicamentos", path: "/medicamentos", emoji: "💊", color: "#0F766E" },
  { label: "Mis citas", path: "/citas", emoji: "📅", color: "#2563EB" },
  { label: "Chatbot IA", path: "/chatbot", emoji: "🤖", color: "#8B5CF6" },
  { label: "Mis hábitos", path: "/habitos", emoji: "💪", color: "#22C55E" },
  { label: "Historial médico", path: "/medical-history", emoji: "📋", color: "#F59E0B" },
];

export function DashboardScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [selectedMood,setSelectedMood] = useState<string | null>(null);
  const [stressLevel, setStressLevel] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [notes, setNotes] = useState("");
  const [showEmotionForm, setShowEmotionForm] = useState(false);  
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "Usuario");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [weekly, setWeekly] = useState<MetricsWeekly | null>(null);
  const [myMeds, setMyMeds] = useState<Array<{ tomado: boolean }>>([]);
  const [todayEmotion,setTodayEmotion] = useState<any>(null);

  useEffect(() => {
    apiRequest<DashboardSummary>("/dashboard/summary")
      .then(setSummary)
      .catch(() => null);

    apiRequest<MetricsSummary>("/metrics/summary")
      .then(setMetrics)
      .catch(() => null);

    apiRequest<MetricsWeekly>("/metrics/weekly")
      .then(setWeekly)
      .catch(() => null);

    apiRequest<Array<{ tomado: boolean }>>("/medications")
      .then((meds) => setMyMeds(meds))
      .catch(() => null);

    apiRequest<{ name: string }>("/auth/me")
      .then((profile) => setUserName(profile.name))
      .catch(() => null);

    apiRequest("/emotional-logs/today")
      .then(setTodayEmotion)
      .catch(()=>null);
  }, []);

const now = new Date();

  const hour = Number(new Intl.DateTimeFormat("es-MX", {timeZone: "America/Mexico_City", hour: "numeric", hour12: false}).format(now));
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const greetingEmoji = hour < 12 ? "☀️" : hour < 18 ? "👋" : "🌙";

  const bg = dark ? "#070A12" : "#F4F6FB";
  const cardBg = dark ? "#0D1322" : "#FFFFFF";
  const cardBorder = dark ? "rgba(148,163,184,0.14)" : "rgba(226,232,240,1)";
  const textMain = dark ? "#F8FAFC" : "#0F172A";
  const textMuted = dark ? "#9CA3AF" : "#64748B";

  const wellnessScore = metrics?.wellnessScore ?? summary?.wellnessScore ?? 0;
  const wellnessData = [
    { name: "Bienestar", value: wellnessScore, color: "#14B8A6" },
    { name: "Resto", value: 100 - wellnessScore, color: "rgba(255,255,255,0.15)" },
  ];

  const metricCards = [
    {
      icon: Droplets, label: "Agua",
      value: `${(metrics?.waterL ?? 0).toFixed(1)}L`, target: `${metrics?.waterGoalL ?? 2}L`,
      pct: metrics ? Math.min(100, Math.round((metrics.waterL / metrics.waterGoalL) * 100)) : 0,
      color: "#2563EB", sub: metrics ? `${Math.max(0, (metrics.waterGoalL - metrics.waterL)).toFixed(1)}L pendiente` : "Sin datos",
    },
    {
      icon: Activity, label: "Pasos",
      value: (metrics?.steps ?? 0).toLocaleString("es-MX"), target: `${((metrics?.stepsGoal ?? 10000) / 1000).toFixed(0)}k`,
      pct: metrics ? Math.min(100, Math.round((metrics.steps / metrics.stepsGoal) * 100)) : 0,
      color: "#22C55E", sub: metrics ? `${Math.max(0, metrics.stepsGoal - metrics.steps).toLocaleString("es-MX")} restantes` : "Sin datos",
    },
    {
      icon: Moon, label: "Sueño",
      value: `${metrics?.sleepHours ?? 0}h`, target: `${metrics?.sleepGoalHours ?? 8}h`,
      pct: metrics ? Math.min(100, Math.round((metrics.sleepHours / metrics.sleepGoalHours) * 100)) : 0,
      color: "#8B5CF6", sub: metrics && metrics.sleepHours >= metrics.sleepGoalHours ? "Muy bueno" : "Registra tu sueño en Hábitos",
    },
    {
      icon: Heart, label: "Adherencia meds.",
      value: `${metrics?.medsAdherence ?? 0}%`, target: "100%",
      pct: metrics?.medsAdherence ?? 0,
      color: "#EF4444", sub: `Bienestar ${wellnessScore} pts`,
    },
  ];

    const saveEmotion = async()=>{

    try{

    await apiRequest(
    "/emotional-logs",
    {
    method:"POST",

    body:JSON.stringify({

    mood:selectedMood,

    stress_level:stressLevel,

    energy_level:energyLevel,

    sleep_quality:sleepQuality,

    notes

    })

    });


    toast.success(
    "Estado emocional registrado"
    );


    setShowEmotionForm(false);


    }catch(error){

    toast.error(
    "No se pudo guardar"
    );

    }

    };

  return (
    <div className="min-h-full overflow-y-auto transition-colors" style={{ backgroundColor: bg }}>
      {/* ── Header ── */}
      <div
        className="relative px-5 md:px-8 xl:px-10 pt-8 md:pt-10 pb-6 md:pb-8 overflow-hidden"
        style={{ background: "linear-gradient(140deg, #0A4B48 0%, #0F766E 48%, #1D4ED8 100%)", borderRadius: 0 }}
      >
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-20px] left-20 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5 relative">
          <ImageWithFallback
            src={vitalMindLogo}
            alt="VitalMind AI"
            className="h-9 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <button
            onClick={() => navigate("/notificaciones")}
            className="w-10 h-10 bg-white/15 rounded-full flex items-center justify-center relative border border-white/25"
          >
            <Bell size={18} className="text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F59E0B] rounded-full ring-1 ring-white/30" />
          </button>
        </div>

        {/* Greeting */}
        <p className="text-white/60 text-sm mb-0.5">{greeting} {greetingEmoji}</p>
        <h1 className="text-2xl font-bold text-white capitalize mb-5">{userName}</h1>

        {/* Wellness card */}
        <div className="bg-white/12 backdrop-blur-sm rounded-[24px] p-4 md:p-5 border border-white/20 flex items-center gap-4 md:max-w-2xl">
          <div className="relative w-[88px] h-[88px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={wellnessData} cx="50%" cy="50%" innerRadius={30} outerRadius={42} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                  {wellnessData.map((e) => <Cell key={`dash-${e.name}`} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-white leading-none">{wellnessScore}</span>
              <span className="text-white/50 text-[9px] font-medium">pts</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white/60 text-xs mb-0.5">Bienestar general</p>
            <p className="text-white font-bold text-lg leading-tight mb-1">
              {wellnessScore >= 80 ? "Excelente estado" : wellnessScore >= 60 ? "Buen estado" : wellnessScore > 0 ? "Puede mejorar" : "Sin datos aún"}
            </p>
            <div className="flex items-center gap-1.5">
              <TrendingUp size={12} className="text-[#4ADE80]" />
              <span className="text-[#4ADE80] text-xs font-semibold">{metrics ? `Adherencia meds. ${metrics.medsAdherence}%` : "Registra tus hábitos"}</span>
            </div>
          </div>
          <div className="w-20 h-10 flex-shrink-0 opacity-70">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly?.Bienestar?.map((r) => ({ d: r.day, v: r.value })) ?? []}>
                <Line type="monotone" dataKey="v" stroke="#4ADE80" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-8 xl:px-10 mt-5 md:mt-8 space-y-5 md:space-y-6 pb-6 md:pb-10">
        {/* ── Metrics 2×2 ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold" style={{ color: textMain }}>Resumen de hoy</h2>
            <button onClick={() => navigate("/graficas")} className="text-[#0F766E] text-xs font-semibold flex items-center gap-0.5">
              Gráficas <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {metricCards.map((m) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.label}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-[20px] p-4 md:p-5 shadow-sm border"
                  style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: m.color + "18" }}>
                      <Icon size={18} style={{ color: m.color }} />
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ color: textMuted, backgroundColor: dark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }}>{m.target}</span>
                  </div>
                  <p className="text-lg font-bold leading-tight" style={{ color: textMain }}>{m.value}</p>
                  <p className="text-[11px] mt-0.5 mb-2" style={{ color: textMuted }}>{m.label}</p>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: dark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                    />
                  </div>
                  <p className="text-[10px] mt-1.5" style={{ color: m.color }}>{m.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Medicamentos + Citas mini cards ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {/* Medicamentos de hoy */}
          <button
            onClick={() => navigate("/medicamentos")}
            className="rounded-[20px] p-4 shadow-sm border flex flex-col gap-2 text-left active:scale-95 transition-all"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: "#0F766E18" }}>
              <Pill size={20} style={{ color: "#0F766E" }} />
            </div>
            <div>
              <p className="text-[11px] font-medium" style={{ color: textMuted }}>Medicamentos</p>
              <p className="text-base font-bold leading-tight" style={{ color: textMain }}>{myMeds.filter((m) => m.tomado).length} de {myMeds.length}</p>
                <p className="text-[10px]" style={{ color: "#0F766E" }}>{myMeds.length ? "tomados hoy" : "Agrega tus medicamentos"}</p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden w-full" style={{ backgroundColor: dark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }}>
                <div className="h-full rounded-full bg-[#0F766E]" style={{ width: `${myMeds.length ? Math.round((myMeds.filter((m) => m.tomado).length / myMeds.length) * 100) : 0}%` }} />
            </div>
          </button>

          {/* Próxima cita */}
          <button
            onClick={() => navigate("/citas")}
            className="rounded-[20px] p-4 shadow-sm border flex flex-col gap-2 text-left active:scale-95 transition-all"
            style={{ backgroundColor: cardBg, borderColor: cardBorder }}
          >
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ backgroundColor: "#2563EB18" }}>
              <Calendar size={20} style={{ color: "#2563EB" }} />
            </div>
            <div>
              <p className="text-[11px] font-medium" style={{ color: textMuted }}>Próxima cita</p>
              <p className="text-base font-bold leading-tight" style={{ color: textMain }}>{summary ? String(summary.appointments.upcoming) : "15 jul"}</p>
              <p className="text-[10px]" style={{ color: "#2563EB" }}>{summary ? `${summary.appointments.upcoming} próximas` : "Cardiología 10:30"}</p>
            </div>
            <div className="flex items-center gap-1">
              <Check size={11} style={{ color: "#22C55E" }} />
              <span className="text-[10px]" style={{ color: "#22C55E" }}>Confirmada</span>
            </div>
          </button>
        </section>

        {/* ── Estado emocional ── */}

        <section
        className="rounded-[24px] p-5 md:p-6 shadow-sm border"
        style={{
        backgroundColor: cardBg,
        borderColor: cardBorder
        }}
        >


        {/* Header */}

        <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">


        <div>

        <h3 
        className="text-base font-bold"
        style={{color:textMain}}
        >
        ¿Cómo te sientes hoy?
        
        </h3>
        <p
        className="text-xs"
        style={{color:textMuted}}
        >
        Registra tu estado emocional diario
        </p>

        

        </div>
        {
        todayEmotion && (

        <div
        className="
        rounded-xl
        p-3
        flex
        items-center
        gap-3
        "
        style={{
        background:"#0F766E15"
        }}
        >

        <span className="text-2xl">
        {
        moods.find(
        m=>m.label===todayEmotion.mood
        )?.emoji
        }
        </span>


        <div>

        <p
        className="text-xs"
        style={{color:textMuted}}
        >
        Estado registrado hoy
        </p>


        <p
        className="font-bold"
        style={{color:"#0F766E"}}
        >
        {todayEmotion.mood}
        </p>

        </div>


        </div>

        )
        }
        </div>



        {/* Selector emociones */}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 md:gap-3">


        {moods.map((m)=>(

        <button

        key={m.label}

        onClick={()=>{

        if(todayEmotion){

        toast.info(
        "Ya registraste tu estado emocional de hoy"
        );

        return;

        }


        setSelectedMood(m.label);
        setShowEmotionForm(true);

        }}

        className="
        flex
        flex-col
        items-center
        justify-center
        gap-1
        rounded-2xl
        py-3
        transition-all
        active:scale-95
        "

        style={{

        backgroundColor:
        selectedMood === m.label
        ?
        "#0F766E18"
        :
        dark
        ?
        "rgba(255,255,255,0.04)"
        :
        "#F8FAFC",

        border:
        selectedMood === m.label
        ?
        "2px solid #0F766E"
        :
        "1px solid transparent"

        }}

        >

        <span className="text-3xl">
        {m.emoji}
        </span>


        <span
        className="text-[10px] font-semibold"
        style={{
        color:
        selectedMood === m.label
        ?
        "#0F766E"
        :
        textMuted
        }}
        >
        {m.label}
        </span>


        </button>

        ))}


        </div>





        {/* Formulario emocional */}

        {

        showEmotionForm && (

        <motion.div

        initial={{
        opacity:0,
        height:0
        }}

        animate={{
        opacity:1,
        height:"auto"
        }}

        transition={{
        duration:0.3
        }}

        className="mt-5 pt-5 border-t space-y-5"

        style={{
        borderColor:cardBorder
        }}

        >


        <div>

        <h4
        className="text-sm font-bold mb-1"
        style={{color:textMain}}
        >
        {moods.find(m=>m.label===selectedMood)?.emoji}
        Estado: {selectedMood}
        </h4>

        <p
        className="text-xs"
        style={{color:textMuted}}
        >
        Completa estos datos para mejorar tu análisis IA
        </p>

        </div>





        {/* Estrés */}

        <div>

        <div className="flex justify-between mb-2">

        <span
        className="text-sm font-semibold"
        style={{color:textMain}}
        >
        😰 Estrés
        </span>


        <span
        className="px-3 py-1 rounded-full text-sm font-bold"
        style={{
        background:"#EF444420",
        color:"#EF4444"
        }}
        >
        {stressLevel}
        </span>

        </div>


        <input
        type="range"
        min="1"
        max="10"
        value={stressLevel}
        onChange={(e)=>setStressLevel(Number(e.target.value))}
        className="w-full accent-red-500"
        />

        </div>





        {/* Energía */}

        <div>

        <div className="flex justify-between mb-2">

        <span
        className="text-sm font-semibold"
        style={{color:textMain}}
        >
        ⚡ Energía
        </span>


        <span
        className="px-3 py-1 rounded-full text-sm font-bold"
        style={{
        background:"#F59E0B20",
        color:"#F59E0B"
        }}
        >
        {energyLevel}
        </span>

        </div>


        <input
        type="range"
        min="1"
        max="10"
        value={energyLevel}
        onChange={(e)=>setEnergyLevel(Number(e.target.value))}
        className="w-full accent-yellow-500"
        />

        </div>






        {/* Sueño */}

        <div>

        <div className="flex justify-between mb-2">

        <span
        className="text-sm font-semibold"
        style={{color:textMain}}
        >
        🌙 Sueño
        </span>


        <span
        className="px-3 py-1 rounded-full text-sm font-bold"
        style={{
        background:"#8B5CF620",
        color:"#8B5CF6"
        }}
        >
        {sleepQuality}
        </span>

        </div>


        <input
        type="range"
        min="1"
        max="10"
        value={sleepQuality}
        onChange={(e)=>setSleepQuality(Number(e.target.value))}
        className="w-full accent-purple-500"
        />

        </div>







        {/* Notas */}

        <textarea

        placeholder="¿Cómo fue tu día?"

        rows={3}

        className="
        w-full
        rounded-2xl
        border
        p-3
        text-sm
        resize-none
        outline-none
        "

        style={{

        backgroundColor:
        dark
        ?
        "#0F172A"
        :
        "#F8FAFC",

        borderColor:cardBorder,

        color:textMain

        }}

        value={notes}

        onChange={(e)=>setNotes(e.target.value)}

        />







        <button

        onClick={saveEmotion}

        className="
        w-full
        py-3.5
        rounded-2xl
        font-bold
        text-white
        shadow-lg
        active:scale-95
        transition
        "

        style={{
        background:
        "linear-gradient(135deg,#0F766E,#2563EB)"
        }}

        >

        💚 Guardar estado emocional

        </button>


        </motion.div>

        )

        }


        </section>


        {/* ── AI Tips ── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-[#F59E0B] rounded-lg flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <h2 className="text-base font-bold flex-1" style={{ color: textMain }}>Consejos IA para hoy</h2>
            <button onClick={() => navigate("/ia")} className="text-[#0F766E] text-xs font-semibold flex items-center gap-0.5">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            {aiTips.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-[18px] p-3.5 shadow-sm border flex gap-3 items-start"
                  style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tip.color + "18" }}>
                    <Icon size={16} style={{ color: tip.color }} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mr-2" style={{ backgroundColor: tip.color + "15", color: tip.color }}>
                      {tip.tag}
                    </span>
                    <p className="text-sm leading-relaxed mt-1" style={{ color: textMuted }}>{tip.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Quick actions ── */}
        <section>
          <h2 className="text-base font-bold mb-3" style={{ color: textMain }}>Acceso rápido</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 md:gap-3">
            {quickActions.map((a) => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className="flex flex-col items-center gap-2 rounded-[16px] py-3.5 px-1 shadow-sm border active:scale-95 transition-all"
                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
              >
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-xl" style={{ backgroundColor: a.color + "15" }}>
                  {a.emoji}
                </div>
                <p className="text-[9px] font-semibold text-center leading-tight" style={{ color: textMuted }}>{a.label}</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate("/registro")}
        className="fixed z-50 bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all"
        style={{ background: "linear-gradient(135deg, #0F766E, #2563EB)", boxShadow: "0 8px 24px rgba(15,118,110,0.4)" }}
      >
        <Plus size={24} className="text-white" />
      </button>
    </div>
  );
}
