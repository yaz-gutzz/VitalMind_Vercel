import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, Download, TrendingUp, Users, Brain, Activity, Sun, Moon } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie } from "recharts";
import { useAdminTheme } from "../../admin/AdminThemeContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { apiRequest } from "../../../lib/api";

const periods = ["7 días", "30 días", "3 meses"];

const icons={
  Users,
  Activity,
  Brain,
  TrendingUp
};

const userGrowth = [
  { day: "S1", value: 2420 }, { day: "S2", value: 2580 }, { day: "S3", value: 2650 },
  { day: "S4", value: 2720 }, { day: "S5", value: 2790 }, { day: "S6", value: 2847 },
];

const symptomsTop = [
  { name: "Dolor de cabeza", count: 842, color: "#EF4444" },
  { name: "Cansancio", count: 715, color: "#F59E0B" },
  { name: "Estrés", count: 634, color: "#8B5CF6" },
  { name: "Insomnio", count: 421, color: "#2563EB" },
  { name: "Dolor muscular", count: 318, color: "#22C55E" },
];

const ageDistribution = [
  { name: "18-24", value: 18, color: "#14B8A6" },
  { name: "25-34", value: 32, color: "#0F766E" },
  { name: "35-44", value: 25, color: "#2563EB" },
  { name: "45-54", value: 15, color: "#8B5CF6" },
  { name: "55+", value: 10, color: "#F59E0B" },
];

const aiUsage = [
  { day: "L", value: 180 }, { day: "M", value: 240 }, { day: "M", value: 195 },
  { day: "J", value: 310 }, { day: "V", value: 270 }, { day: "S", value: 220 }, { day: "D", value: 194 },
];



type ReportsData={

summaryMetrics:any[];

userGrowth:{
day:string;
value:number;
}[];

symptomsTop:any[];

ageDistribution:any[];

aiUsage:any[];

}
export function AdminReportsScreen() {
  const navigate = useNavigate();
  const { dark, toggle } = useAdminTheme();
  const [period, setPeriod] = useState("30 días");
  const [reports,setReports]=useState<ReportsData|null>(null);
  useEffect(()=>{

  loadReports();

  },[period]);
  const bg = dark ? "#070A12" : "#F1F5F9";
  const card = dark ? "#0D1322" : "#FFFFFF";
  const border = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const text = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#9CA3AF" : "#64748B";
  const sub = dark ? "#111827" : "#F1F5F9";
  const tooltipBg = dark ? "#0D1322" : "#FFFFFF";

  const cs = (extra = "") => ({ backgroundColor: card, borderColor: border }) as React.CSSProperties;

  const handleExport = () => {
    toast.promise(new Promise((r) => setTimeout(r, 1500)), {
      loading: "Generando reporte PDF...",
      success: "Reporte exportado exitosamente",
      error: "Error al exportar",
    });
  };
  async function loadReports(){

  try{

  let days="30";


  if(period==="7 días")
  days="7";


  if(period==="3 meses")
  days="90";


  const data=await apiRequest(
  `/admin/reports?period=${days}`
  );


  setReports(data);


  }catch(error){

  toast.error(
  "Error cargando reportes"
  );

  }

  }


  return (
    <div className="min-h-full overflow-y-auto" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-[1440px] px-5 lg:px-8 xl:px-10 pt-8 lg:pt-10 pb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin/dashboard")} style={{ color: muted }}>
              <ChevronLeft size={22} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: text }}>Reportes</h1>
              <p className="text-xs" style={{ color: muted }}>Analíticas de la plataforma</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle}>{dark ? <Sun size={16} style={{ color: "#F59E0B" }} /> : <Moon size={16} style={{ color: "#6366F1" }} />}</button>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold" style={{ backgroundColor: "#0F766E20", border: "1px solid #0F766E40", color: "#0F766E" }}>
              <Download size={13} /> Exportar
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={period === p
                ? { backgroundColor: "#0F766E", color: "#fff" }
                : { backgroundColor: card, color: muted, border: `1px solid ${border}` }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 lg:px-8 xl:px-10 space-y-5 pb-24 lg:pb-10">
        {/* Summary metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
          {(reports?.summaryMetrics ?? []).map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="rounded-[20px] p-4 lg:p-5 border" style={cs()}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: m.color + "20" }}>
                    <Icon size={16} style={{ color: m.color }} />
                  </div>
                  <span className="text-[#22C55E] text-xs font-semibold flex items-center gap-0.5">
                    <TrendingUp size={11} />{m.change}
                  </span>
                </div>
                <p className="text-xl font-bold mb-0.5" style={{ color: text }}>{m.value}</p>
                <p className="text-xs" style={{ color: muted }}>{m.label}</p>
              </div>
            );
          })}
        </div>

        {/* User growth chart */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] gap-5">
        <div className="rounded-[20px] p-5 lg:p-6 border" style={cs()}>
          <p className="text-sm font-bold mb-1" style={{ color: text }}>Crecimiento de usuarios</p>
          <p className="text-xs mb-4" style={{ color: muted }}>Últimas 6 semanas</p>
          <div className="h-36 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reports?.userGrowth ?? []}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: muted }} />
                <YAxis hide domain={["dataMin - 100", "dataMax + 50"]} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${border}`, borderRadius: 10, fontSize: 12, color: text }} />
                <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={2.5} dot={{ fill: "#0F766E", r: 4, strokeWidth: 2, stroke: bg }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Symptoms top */}
        <div className="rounded-[20px] p-5 lg:p-6 border" style={cs()}>
          <p className="text-sm font-bold mb-4" style={{ color: text }}>Síntomas más frecuentes</p>
          <div className="space-y-3.5">
            {(reports?.symptomsTop ?? []).map((s, i) => {
              const maxCount = reports?.symptomsTop?.[0]?.count || 1;
              const pct = (s.count / maxCount) * 100;
              return (
                <div key={s.name}>
                  <div className="flex justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold w-4" style={{ color: muted }}>{i + 1}</span>
                      <span className="text-xs" style={{ color: text }}>{s.name}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: sub }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </div>

        {/* Age distribution */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="rounded-[20px] p-5 lg:p-6 border" style={cs()}>
          <p className="text-sm font-bold mb-4" style={{ color: text }}>Distribución por edad</p>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reports?.ageDistribution ?? []} cx="50%" cy="50%" innerRadius={28} outerRadius={48} dataKey="value" startAngle={90} endAngle={-270} isAnimationActive={false}>
                    {ageDistribution.map((e) => <Cell key={`age-${e.name}`} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {ageDistribution.map((a) => (
                <div key={a.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                  <span className="text-xs flex-1" style={{ color: muted }}>{a.name}</span>
                  <span className="text-xs font-bold" style={{ color: text }}>{a.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI usage */}
        <div className="rounded-[20px] p-5 lg:p-6 border" style={cs()}>
          <p className="text-sm font-bold mb-1" style={{ color: text }}>Uso del Chatbot IA</p>
          <p className="text-xs mb-4" style={{ color: muted }}>Consultas diarias esta semana</p>
          <div className="h-32 lg:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reports?.aiUsage ?? []}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: muted }} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${border}`, borderRadius: 10, fontSize: 12, color: text }} cursor={{ fill: dark ? "#ffffff08" : "#00000005" }} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]} isAnimationActive={false}>
                  {aiUsage.map((_, i) => (
                    <Cell key={`ai-${i}`} fill="#8B5CF6" fillOpacity={i === 3 ? 1 : 0.4} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
