import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, Plus, Calendar, Clock, MapPin, User, X, Check, Stethoscope, Heart, Eye, Brain } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type { Appointment } from "../../lib/types";

interface Cita {
  id: number;
  especialidad: string;
  doctor: string;
  fecha: string;
  hora: string;
  lugar: string;
  color: string;
  icon: typeof Stethoscope;
  estado: "proxima" | "completada" | "cancelada";
}

const estadoConfig = {
  proxima: { label: "Próxima", color: "#0F766E", bg: "#0F766E15" },
  completada: { label: "Completada", color: "#22C55E", bg: "#22C55E15" },
  cancelada: { label: "Cancelada", color: "#EF4444", bg: "#EF444415" },
};

function formatFecha(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "long" });
}

export function CitasScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [citas, setCitas] = useState<Cita[]>([]);
  const [tab, setTab] = useState<"proximas" | "historial">("proximas");
  const [showAdd, setShowAdd] = useState(false);
  const [newEsp, setNewEsp] = useState("");
  const [newDoc, setNewDoc] = useState("");
  const [newFecha, setNewFecha] = useState("");
  const [newHora, setNewHora] = useState("09:00");
  const [newLugar, setNewLugar] = useState("");

  const bg = dark ? "#0F172A" : "#F8FAFC";
  const card = dark ? "#1E293B" : "#FFFFFF";
  const border = dark ? "rgba(255,255,255,0.07)" : "#E2E8F0";
  const text = dark ? "#F1F5F9" : "#0F172A";
  const muted = dark ? "#64748B" : "#94A3B8";
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "#F8FAFC";

  const resolveIcon = (especialidad: string) => {
    const normalized = especialidad.toLowerCase();
    if (normalized.includes("cardio")) return Heart;
    if (normalized.includes("endo")) return Brain;
    if (normalized.includes("oftal")) return Eye;
    return Stethoscope;
  };

  const loadCitas = async () => {
    const data = await apiRequest<Appointment[]>("/appointments");
    setCitas(data.map((item) => ({
      id: item.id,
      especialidad: item.especialidad,
      doctor: item.doctor,
      fecha: item.fecha,
      hora: item.hora,
      lugar: item.lugar,
      color: item.color,
      icon: resolveIcon(item.especialidad),
      estado: item.estado,
    })));
  };

  useEffect(() => {
    loadCitas().catch(() => null);
  }, []);

  const proximas = citas.filter((c) => c.estado === "proxima");
  const historial = citas.filter((c) => c.estado !== "proxima");

  const cancelarCita = (id: number) => {
    apiRequest(`/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: "cancelada" }) })
      .then(() => loadCitas())
      .then(() => toast.success("Cita cancelada"))
      .catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo cancelar"));
  };

  const addCita = () => {
    if (!newEsp.trim() || !newFecha) { toast.error("Completa especialidad y fecha"); return; }
    apiRequest("/appointments", {
      method: "POST",
      body: JSON.stringify({ specialty: newEsp, doctor: newDoc || "Por confirmar", appointmentDate: newFecha, appointmentTime: newHora, place: newLugar || "Por confirmar", color: "#0F766E", status: "proxima" }),
    })
      .then(() => loadCitas())
      .then(() => {
        toast.success("Cita agendada");
        setNewEsp(""); setNewDoc(""); setNewFecha(""); setNewHora("09:00"); setNewLugar("");
        setShowAdd(false);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo agendar"));
  };

  const shown = tab === "proximas" ? proximas : historial;

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: bg }}>
      {/* Header */}
      <div
        className="px-5 pt-12 pb-7 relative overflow-hidden"
        style={{ background: "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)", borderRadius: 0 }}
      >
        <div className="absolute top-[-40px] right-[-40px] w-36 h-36 rounded-full bg-white/5" />
        <div className="flex items-center gap-3 mb-4 relative">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Mis citas</h1>
            <p className="text-white/70 text-sm">Gestiona tus citas médicas</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/25">
            <Plus size={18} className="text-white" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Próximas", value: proximas.length, color: "#4ADE80" },
            { label: "Completadas", value: historial.filter(c => c.estado === "completada").length, color: "#93C5FD" },
            { label: "Este mes", value: 2, color: "#FCD34D" },
          ].map((s) => (
            <div key={s.label} className="bg-white/15 rounded-[16px] p-3 text-center border border-white/20">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-white/70 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5">
        {/* Tabs */}
        <div className="flex rounded-2xl p-1 gap-1 mb-5 border" style={{ backgroundColor: card, borderColor: border }}>
          {(["proximas", "historial"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-[#0F766E] text-white" : ""}`}
              style={{ color: tab === t ? "white" : muted }}
            >
              {t === "proximas" ? "Próximas" : "Historial"}
            </button>
          ))}
        </div>

        <div className="space-y-3 pb-6">
          {shown.length === 0 && (
            <div className="text-center py-12" style={{ color: muted }}>
              <Calendar size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay citas {tab === "proximas" ? "próximas" : "en el historial"}</p>
            </div>
          )}

          {shown.map((cita, i) => {
            const Icon = cita.icon;
            const est = estadoConfig[cita.estado];
            return (
              <motion.div
                key={cita.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-[20px] p-4 border shadow-sm"
                style={{ backgroundColor: card, borderColor: border }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cita.color + "18" }}>
                    <Icon size={22} style={{ color: cita.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-bold truncate" style={{ color: text }}>{cita.especialidad}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: est.color, backgroundColor: est.bg }}>{est.label}</span>
                    </div>
                    <p className="text-xs mb-2" style={{ color: muted }}>{cita.doctor}</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={11} style={{ color: muted }} />
                        <span className="text-[11px]" style={{ color: muted }}>{formatFecha(cita.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={11} style={{ color: muted }} />
                        <span className="text-[11px]" style={{ color: muted }}>{cita.hora}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={11} style={{ color: muted }} />
                        <span className="text-[11px] truncate" style={{ color: muted }}>{cita.lugar}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {cita.estado === "proxima" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: border }}>
                    <button onClick={() => cancelarCita(cita.id)}
                      className="flex-1 py-2 rounded-[12px] text-xs font-semibold"
                      style={{ backgroundColor: "#EF444415", color: "#EF4444" }}>
                      Cancelar
                    </button>
                    <button onClick={() => { toast.success("Recordatorio configurado"); }}
                      className="flex-1 py-2 rounded-[12px] text-xs font-semibold flex items-center justify-center gap-1"
                      style={{ backgroundColor: "#0F766E18", color: "#0F766E" }}>
                      <Check size={13} /> Recordar
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full max-w-2xl mx-auto rounded-t-[32px] p-6"
            style={{ backgroundColor: card }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: text }}>Nueva cita</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: inputBg }}>
                <X size={16} style={{ color: muted }} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Especialidad *</label>
                <input type="text" placeholder="ej. Cardiología" value={newEsp} onChange={(e) => setNewEsp(e.target.value)}
                  className="w-full rounded-[14px] px-4 py-3.5 text-sm border focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Doctor</label>
                <input type="text" placeholder="ej. Dr. García" value={newDoc} onChange={(e) => setNewDoc(e.target.value)}
                  className="w-full rounded-[14px] px-4 py-3.5 text-sm border focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Fecha *</label>
                  <input type="date" value={newFecha} onChange={(e) => setNewFecha(e.target.value)}
                    className="w-full rounded-[14px] px-4 py-3.5 text-sm border focus:outline-none focus:border-[#0F766E]"
                    style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Hora</label>
                  <input type="time" value={newHora} onChange={(e) => setNewHora(e.target.value)}
                    className="w-full rounded-[14px] px-4 py-3.5 text-sm border focus:outline-none focus:border-[#0F766E]"
                    style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Lugar</label>
                <input type="text" placeholder="ej. Hospital Central" value={newLugar} onChange={(e) => setNewLugar(e.target.value)}
                  className="w-full rounded-[14px] px-4 py-3.5 text-sm border focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
              </div>
            </div>
            <button onClick={addCita}
              className="w-full mt-5 py-4 rounded-[20px] text-white font-semibold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)", boxShadow: "0 8px 24px rgba(15,118,110,0.3)" }}>
              <Calendar size={18} /> Agendar cita
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
