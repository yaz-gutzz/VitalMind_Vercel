import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell,
} from "recharts";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type { MetricsWeekly } from "../../lib/types";

const tabs = ["Actividad", "Bienestar", "Sueño", "Peso", "Agua"] as const;
type TabKey = (typeof tabs)[number];

const tabMeta: Record<TabKey, { label: string; color: string; unit: string; chart: "line" | "bar" }> = {
  Actividad: { label: "Pasos diarios (estimados por ejercicio registrado)", color: "#22C55E", unit: "pasos", chart: "bar" },
  Bienestar: { label: "Índice de bienestar", color: "#0F766E", unit: "pts", chart: "line" },
  Sueño: { label: "Horas de sueño", color: "#8B5CF6", unit: "h", chart: "bar" },
  Peso: { label: "Peso corporal", color: "#F59E0B", unit: "kg", chart: "line" },
  Agua: { label: "Consumo de agua", color: "#2563EB", unit: "L", chart: "bar" },
};

export function GraficasScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>("Actividad");
  const [weekly, setWeekly] = useState<MetricsWeekly | null>(null);

  useEffect(() => {
    apiRequest<MetricsWeekly>("/metrics/weekly").then(setWeekly).catch(() => null);
  }, []);

  const meta = tabMeta[activeTab];
  const rows = weekly?.[activeTab] ?? [];

  const avg = rows.length ? (rows.reduce((s, r) => s + r.value, 0) / rows.length).toFixed(1) : "0.0";
  const max = rows.length ? Math.max(...rows.map((r) => r.value)) : 0;
  const min = rows.length ? Math.min(...rows.map((r) => r.value)) : 0;
  const pageBg = dark ? "#070A12" : "#F8FAFC";
  const surface = dark ? "#0D1322" : "#FFFFFF";
  const border = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const title = dark ? "#F8FAFC" : "#0F172A";
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
            <h1 className="text-2xl font-bold text-white">Gráficas</h1>
            <p className="text-white/70 text-sm">Visualiza tu progreso</p>
          </div>
        </div>

        {/* Tab scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === t ? "bg-white text-[#0F766E]" : "bg-white/20 text-white/80"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-6 space-y-5 pb-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Promedio", value: `${avg}${meta.unit}`, color: meta.color },
            { label: "Máximo", value: `${max}${meta.unit}`, color: "#22C55E" },
            { label: "Mínimo", value: `${min}${meta.unit}`, color: "#EF4444" },
          ].map((s) => (
            <div key={s.label} className="rounded-[20px] p-4 shadow-sm text-center" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: muted }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Main chart */}
        <div className="rounded-[20px] p-5 shadow-sm" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <p className="text-base font-bold mb-1" style={{ color: title }}>{meta.label}</p>
          <p className="text-xs mb-4" style={{ color: muted }}>Últimos 7 días</p>
          <div className="h-48">
            {!rows.length ? (
              <div className="h-full flex items-center justify-center text-sm text-center px-4" style={{ color: muted }}>
                Aún no tienes datos registrados. Registra tus hábitos para ver tu progreso aquí.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {meta.chart === "bar" ? (
                  <BarChart data={rows} barSize={28}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: muted }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 12, fontSize: 12, color: title }}
                      cursor={{ fill: dark ? "rgba(255,255,255,0.04)" : "#F1F5F9", radius: 8 }}
                      formatter={(val: number) => [`${val} ${meta.unit}`, meta.label]}
                    />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} isAnimationActive={false}>
                      {rows.map((_, i) => (
                        <Cell key={`graf-${activeTab}-${i}`} fill={meta.color} fillOpacity={i === rows.length - 1 ? 1 : 0.5} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <LineChart data={rows}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: muted }} />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: surface, border: `1px solid ${border}`, borderRadius: 12, fontSize: 12, color: title }}
                      formatter={(val: number) => [`${val} ${meta.unit}`, meta.label]}
                    />
                    <Line type="monotone" dataKey="value" stroke={meta.color} strokeWidth={3} dot={{ fill: meta.color, r: 5, strokeWidth: 2, stroke: "white" }} activeDot={{ r: 7 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detail table */}
        <div className="rounded-[20px] p-5 shadow-sm" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <p className="text-base font-bold mb-4" style={{ color: title }}>Detalle por día</p>
          <div className="space-y-3">
            {!rows.length ? (
              <p className="text-sm text-center py-2" style={{ color: muted }}>Sin registros todavía.</p>
            ) : (
              [...rows].reverse().map((row, idx) => {
                const pct = ((row.value - min) / (max - min || 1)) * 100;
                return (
                  <div key={`${row.day}-${idx}`} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-6" style={{ color: muted }}>{row.day}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark ? "rgba(255,255,255,0.06)" : "#F1F5F9" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                    </div>
                    <span className="text-sm font-bold w-16 text-right" style={{ color: title }}>{row.value} {meta.unit}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

