import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Users, Activity, Brain, Bell, TrendingUp, TrendingDown, ArrowUpRight, Clock, Shield, RefreshCw, Sun, Moon,
} from "lucide-react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import vitalMindLogo from "../../../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";
import { useAdminTheme } from "../../admin/AdminThemeContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { apiRequest } from "../../../lib/api";

type DashboardData = {
  kpis: {
    users: number;
    active: number;
    ai: number;
    notifications: number;
  };

  signups: {
    label: string;
    value: number;
  }[];

  activity: {
    user: string;
    action: string;
    time: string;
    color?: string;
  }[];
};

export function AdminDashboardScreen() {
  const navigate = useNavigate();
  const { dark, toggle } = useAdminTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard,setDashboard] = useState<DashboardData | null>(null);
  const [period,setPeriod] = useState<"day"|"week"|"month"|"months">("week");

useEffect(()=>{

    loadDashboard();

},[]);


async function loadDashboard(){

    try{

        const data: DashboardData = await apiRequest(`/admin/dashboard?period=${period}`);

        setDashboard(data);


    }catch(error){

        toast.error(
          "Error cargando dashboard"
        );

    }

}

  const bg = dark ? "#070A12" : "#F1F5F9";
  const card = dark ? "#0D1322" : "#FFFFFF";
  const border = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const text = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#9CA3AF" : "#64748B";
  const accent = "#14B8A6";

  const kpis = [
    {
      label: "Usuarios totales",
      value: dashboard?.kpis?.users ?? 0,
      change: "+12%",
      up:true,
      icon:Users,
      color:"#0F766E"
    },

    {
      label:"Activos hoy",
      value:dashboard?.kpis?.active ?? 0,
      change:"+8%",
      up:true,
      icon:Activity,
      color:"#2563EB"
    },

    {
      label:"Consultas IA",
      value:dashboard?.kpis?.ai ?? 0,
      change:"+23%",
      up:true,
      icon:Brain,
      color:"#8B5CF6"
    },

    {
      label:"Notif. enviadas",
      value:dashboard?.kpis?.notifications ?? 0,
      change:"-3%",
      up:false,
      icon:Bell,
      color:"#F59E0B"
    }
  ];

const handleRefresh = async()=>{

    setRefreshing(true);

    try{

        await loadDashboard();

        toast.success(
          "Dashboard actualizado"
        );


    }catch{

        toast.error(
          "Error al actualizar"
        );

    }


    setRefreshing(false);

};

  return (
    <div className="min-h-full overflow-y-auto" style={{ backgroundColor: bg }}>
      {/* Header */}
      <div className="mx-auto max-w-[1440px] px-5 lg:px-8 xl:px-10 pt-8 lg:pt-10 pb-5">
        <div className="flex items-center justify-between mb-1">
          <ImageWithFallback
            src={vitalMindLogo}
            alt="VitalMind AI"
            className="h-8 w-auto object-contain"
            style={{ filter: dark ? "brightness(0) invert(1) opacity(0.9)" : "none" }}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all"
              style={{ backgroundColor: card, borderColor: border }}
            >
              <RefreshCw size={15} style={{ color: muted }} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all"
              style={{ backgroundColor: card, borderColor: border }}
            >
              {dark ? <Sun size={15} style={{ color: "#F59E0B" }} /> : <Moon size={15} style={{ color: "#6366F1" }} />}
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ backgroundColor: accent + "20", borderColor: accent + "40" }}>
              <Shield size={12} style={{ color: accent }} />
              <span style={{ color: accent }} className="text-xs font-semibold">Admin</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: muted }}>Dashboard</p>
          <p style={{ color: muted }} className="text-xs mt-0.5">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 lg:px-8 xl:px-10 space-y-5 pb-24 lg:pb-10">
        {/* KPI grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="rounded-[20px] p-4 lg:p-5 border"
                style={{ backgroundColor: card, borderColor: border }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: k.color + "25" }}>
                    <Icon size={18} style={{ color: k.color }} />
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-0.5 ${k.up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {k.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {k.change}
                  </span>
                </div>
                <p className="text-2xl font-bold mb-0.5" style={{ color: text }}>{k.value}</p>
                <p className="text-xs" style={{ color: muted }}>{k.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Signups chart */}
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] gap-5">
        <div className="rounded-[20px] p-5 lg:p-6 border" style={{ backgroundColor: card, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold" style={{ color: text }}>Nuevos registros</p>
              <p className="text-xs mt-0.5" style={{ color: muted }}>Esta semana · {dashboard?.signups?.reduce((a,b)=>a+b.value,0) ?? 0} total</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: accent + "20", color: accent }}>+31%</span>
          </div>
          <div className="flex gap-2 mb-4">
          {
          [
          {id:"day",label:"Día"},
          {id:"week",label:"Semana"},
          {id:"month",label:"Mes"},
          {id:"months",label:"Meses"},
          ].map(item=>(

          <button
          key={item.id}
          onClick={()=>{

          setPeriod(item.id as any);

          loadDashboard();

          }}
          className="px-3 py-1 rounded-full text-xs font-semibold"
          style={{
          backgroundColor:
          period===item.id
          ? accent
          : accent+"20",

          color:
          period===item.id
          ?"white"
          :accent
          }}
          >
          {item.label}
          </button>

          ))

          }
          </div>
          <div className="h-32 lg:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
              data={dashboard?.signups ?? []}
              barSize={22}
              >
              <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize:11,
                fill:muted
              }}
              />
              <Tooltip contentStyle={{ backgroundColor: dark ? "#1E293B" : "#fff", border: `1px solid ${border}`, borderRadius: 10, fontSize: 12, color: text }} cursor={{ fill: dark ? "#ffffff08" : "#00000005" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                  {(dashboard?.signups ?? []).map((_, i) => (
                    <Cell key={`signup-${i}`} fill={accent} fillOpacity={i === 5 ? 1 : 0.35} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-[20px] p-5 lg:p-6 border" style={{ backgroundColor: card, borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold" style={{ color: text }}>Actividad reciente</p>
            <button
              onClick={() => navigate("/admin/users")}
              className="text-xs font-semibold flex items-center gap-0.5"
              style={{ color: accent }}
            >
              Ver usuarios <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {(dashboard?.activity ?? []).map((a,i)=>(
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: a.color + "25" }}>
                  <span className="text-[11px] font-bold">{a.user?.split(" ").map(x=>x[0]).join("").substring(0,2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: text }}>{a.user}</p>
                  <p className="text-xs truncate" style={{ color: muted }}>{a.action}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0" style={{ color: muted }}>
                  <Clock size={10} />
                  <span className="text-[10px]">{a.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
          {[
            { label: "Gestionar usuarios", path: "/admin/users", icon: Users, color: "#2563EB" },
            { label: "Ver reportes", path: "/admin/reports", icon: Activity, color: "#22C55E" },
            { label: "Enviar notificación", path: "/admin/notifications", icon: Bell, color: "#F59E0B" },
            { label: "Configuración", path: "/admin/settings", icon: Shield, color: "#8B5CF6" },
          ].map((l) => {
            const Icon = l.icon;
            return (
              <button
                key={l.label}
                onClick={() => navigate(l.path)}
                className="rounded-[20px] p-4 flex flex-col gap-3 border active:scale-95 transition-all text-left"
                style={{ backgroundColor: card, borderColor: border }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: l.color + "20" }}>
                  <Icon size={20} style={{ color: l.color }} />
                </div>
                <p className="text-xs font-semibold leading-tight" style={{ color: text }}>{l.label}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
