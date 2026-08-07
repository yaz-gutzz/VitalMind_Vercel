import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, Plus, Pill, Clock, CheckCircle, AlertCircle, X, Check } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type { Medication } from "../../lib/types";

interface Medicamento {
  id: number;
  name: string;
  dosis: string;
  frecuencia: string;
  hora: string;
  color: string;
  tomado: boolean;
  tipo: "pastilla" | "capsula" | "jarabe" | "inyeccion" | "tableta" | "gota" | "crema" | "parche";
}

export function MedicamentosScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [meds, setMeds] = useState<Medicamento[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newFrecuencia, setNewFrecuencia] = useState("Diario");
  const [newTipo, setNewTipo] = useState<Medicamento["tipo"]>("pastilla");
  const [newNombre, setNewNombre] = useState("");
  const [newDosis, setNewDosis] = useState("");
  const [newDaysDuration, setNewDaysDuration] = useState(1);
  const [newHora, setNewHora] = useState("08:00");

  const bg = dark ? "#0F172A" : "#F8FAFC";
  const card = dark ? "#1E293B" : "#FFFFFF";
  const border = dark ? "rgba(255,255,255,0.07)" : "#E2E8F0";
  const text = dark ? "#F1F5F9" : "#0F172A";
  const muted = dark ? "#64748B" : "#94A3B8";
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "#F8FAFC";

  const loadMeds = async () => {
    const data = await apiRequest<Array<{ id: number; name: string; dose: string; frequency: string; time: string; color: string; taken: boolean; type: Medicamento["tipo"] }>>("/medications");
    setMeds(data.map((item) => ({ id: item.id, name: item.name, dosis: item.dose, frecuencia: item.frequency, hora: item.time, color: item.color, tomado: item.taken, tipo: item.type })));
  };

  useEffect(() => {
    loadMeds().catch(() => null);
  }, []);

  const toggleTomado = (id: number) => {

    const nextItem = meds.find((med) => med.id === id);
    if (!nextItem) return;

    apiRequest(`/medications/${id}/taken`, {
      method: "POST"
    })
    .then(() => {
      loadMeds();
      toast.success(
        `${nextItem.name } registrado como tomado`
      );
    })
    .catch((error) => {
      toast.error(
        error instanceof Error 
        ? error.message 
        : "No se pudo registrar la toma"
      );
    });
  };

  const addMed = () => {
    if (!newNombre.trim() || !newDosis.trim()) { toast.error("Completa nombre y dosis"); return; }
    apiRequest("/medications", {
      method: "POST",
      body: JSON.stringify({ name: newNombre, dose: newDosis, frequency: newFrecuencia, time_label: newHora, color: "#0F766E", taken: false, type: newTipo, days_duration: newDaysDuration}),
    })
      .then(() => loadMeds())
      .then(() => {
        toast.success(`${newNombre} agregado`);
        setNewNombre(""); setNewDosis(""); setNewHora("08:00");
        setShowAdd(false);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo agregar"));
  };

  const deleteMed = (id: number, nombre: string) => {
    apiRequest(`/medications/${id}`, { method: "DELETE" })
      .then(() => loadMeds())
      .then(() => toast.success(`${nombre} eliminado`))
      .catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo eliminar"));
  };

  const tomados = meds.filter((m) => m.tomado).length;
  const pct = meds.length ? Math.round((tomados / meds.length) * 100) : 0;

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
            <h1 className="text-2xl font-bold text-white">Medicamentos</h1>
            <p className="text-white/70 text-sm">Control de tu medicación diaria</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/25"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>

        {/* Progress */}
        <div className="bg-white/15 backdrop-blur-sm rounded-[20px] p-4 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm font-semibold">Adherencia de hoy</p>
            <span className="text-white font-bold">{tomados}/{meds.length}</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
              className="h-full rounded-full bg-[#4ADE80]"
            />
          </div>
          <p className="text-white/60 text-xs mt-1.5">{pct}% completado · {meds.length - tomados} pendientes</p>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-3 pb-6">
        <p className="text-[10px] font-bold uppercase tracking-wider px-1" style={{ color: muted }}>Medicamentos activos</p>

        {meds.map((med, i) => (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-[20px] p-4 border flex items-center gap-3 shadow-sm"
            style={{ backgroundColor: card, borderColor: border }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: med.color + "18" }}>
              <Pill size={22} style={{ color: med.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: text }}>{med.name}</p>
              <p className="text-xs" style={{ color: muted }}>{med.dosis} · {med.frecuencia}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock size={11} style={{ color: muted }} />
                <span className="text-[10px]" style={{ color: muted }}>{med.hora}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate(`/medicamentos/${med.id}`)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#0F766E20" }}
              >
                <Pill size={13} className="text-[#0F766E]" />
              </button>
              
              <button
                onClick={() => toggleTomado(med.id)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ backgroundColor: med.tomado ? "#22C55E" : border }}
              >
                {med.tomado
                  ? <Check size={16} className="text-white" />
                  : <CheckCircle size={16} style={{ color: muted }} />
                }
              </button>
            </div>
          </motion.div>
        ))}

        {/* Alert */}
        <div className="rounded-[20px] p-4 border flex items-start gap-3" style={{ backgroundColor: "#F59E0B10", borderColor: "#F59E0B30" }}>
          <AlertCircle size={18} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#F59E0B]">Recordatorio</p>
            <p className="text-xs text-[#F59E0B]/80 mt-0.5">Tienes {meds.length - tomados} medicamentos pendientes para hoy. No olvides tomarlos a la hora indicada.</p>
          </div>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: text }}>Agregar medicamento</h3>
              <button onClick={() => setShowAdd(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: inputBg }}>
                <X size={16} style={{ color: muted }} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Nombre del medicamento</label>
                <input type="text" placeholder="ej. Aspirina" value={newNombre} onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full rounded-[14px] px-4 py-3.5 text-sm border focus:outline-none focus:border-[#0F766E]"
                  style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Dosis</label>
                  <input type="text" placeholder="ej. 500mg" value={newDosis} onChange={(e) => setNewDosis(e.target.value)}
                    className="w-full rounded-[14px] px-4 py-3.5 text-sm border focus:outline-none focus:border-[#0F766E]"
                    style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Hora</label>
                  <input type="time" value={newHora} onChange={(e) => setNewHora(e.target.value)}
                    className="w-full rounded-[14px] px-4 py-3.5 text-sm border focus:outline-none focus:border-[#0F766E]"
                    style={{ backgroundColor: inputBg, borderColor: border, color: text }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Frecuencia</label>
                  <select
                    value={newFrecuencia}
                    onChange={(e)=>setNewFrecuencia(e.target.value)}
                    className="w-full rounded-[14px] px-4 py-3.5 text-sm border"
                    style={{backgroundColor: inputBg, borderColor: border, color: text}}>
                    <option value="Diario">Diario</option>
                    <option value="Cada 8 horas">Cada 8 horas</option>
                    <option value="Cada 12 horas">Cada 12 horas</option>
                    <option value="Cada 24 horas">Cada 24 horas</option>
                    <option value="Semanal">Semanal</option>
                    <option value="Solo cuando sea necesario">
                      Solo cuando sea necesario
                    </option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: muted }}> Presentación </label>
                  <select
                    value={newTipo}
                    onChange={(e)=>setNewTipo(e.target.value as Medicamento["tipo"])}
                    className="w-full rounded-[14px] px-4 py-3.5 text-sm border"
                    style={{backgroundColor: inputBg, borderColor: border, color: text}}>
                    <option value="pastilla">Pastilla</option>
                    <option value="tableta">Tableta</option>
                    <option value="capsula">Cápsula</option>
                    <option value="jarabe">Jarabe</option>
                    <option value="inyeccion">Inyección</option>
                    <option value="gota">Gotas</option>
                    <option value="crema">Crema</option>
                    <option value="parche">Parche</option>
                  </select>
                </div>
                <div>
                  <label 
                    className="text-xs font-medium mb-1 block" 
                    style={{ color: muted }}
                  >
                    Duración del tratamiento (días)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={newDaysDuration}
                    onChange={(e)=>setNewDaysDuration(Number(e.target.value))}
                    className="w-full rounded-[14px] px-4 py-3.5 text-sm border"
                    style={{
                      backgroundColor: inputBg,
                      borderColor: border,
                      color: text
                    }}
                  />

                </div>

              </div>
            </div>
            <button onClick={addMed}
              className="w-full mt-5 py-4 rounded-[20px] text-white font-semibold flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)", boxShadow: "0 8px 24px rgba(15,118,110,0.3)" }}>
              <Plus size={18} /> Agregar medicamento
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
