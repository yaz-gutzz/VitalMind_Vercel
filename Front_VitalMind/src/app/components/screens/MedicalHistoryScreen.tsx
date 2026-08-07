import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ChevronLeft, ChevronRight, Plus, AlertCircle, Scissors, Stethoscope, Syringe, FileText, Pill, X,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type { MedicalHistoryCategory, MedicalHistoryItem } from "../../lib/types";

const sectionMeta: Record<MedicalHistoryCategory, { icon: typeof AlertCircle; label: string; color: string; placeholder: string }> = {
  diseases: { icon: AlertCircle, label: "Enfermedades", color: "#EF4444", placeholder: "ej. Hipertensión arterial (2019)" },
  allergies: { icon: AlertCircle, label: "Alergias", color: "#F59E0B", placeholder: "ej. Penicilina – Reacción severa" },
  medications: { icon: Pill, label: "Medicamentos actuales", color: "#0F766E", placeholder: "ej. Metformina 850mg – Diario" },
  surgeries: { icon: Scissors, label: "Cirugías", color: "#8B5CF6", placeholder: "ej. Apendicectomía (2018)" },
  consultations: { icon: Stethoscope, label: "Consultas médicas", color: "#2563EB", placeholder: "ej. Cardiología – 15 mayo 2025" },
  vaccines: { icon: Syringe, label: "Vacunas", color: "#22C55E", placeholder: "ej. Influenza – Oct 2024" },
  results: { icon: FileText, label: "Resultados clínicos", color: "#EC4899", placeholder: "ej. Hemograma – Junio 2025 · Normal" },
};

const categoryOrder: MedicalHistoryCategory[] = ["diseases", "allergies", "medications", "surgeries", "consultations", "vaccines", "results"];

export function MedicalHistoryScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [expanded, setExpanded] = useState<MedicalHistoryCategory | null>("diseases");
  const [items, setItems] = useState<MedicalHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingFor, setAddingFor] = useState<MedicalHistoryCategory | null>(null);
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    try {
      const data = await apiRequest<MedicalHistoryItem[]>("/medical-history");
      setItems(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el historial médico");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const itemsByCategory = useMemo(() => {
    const map = new Map<MedicalHistoryCategory, MedicalHistoryItem[]>();
    for (const category of categoryOrder) map.set(category, []);
    for (const item of items) {
      map.get(item.category)?.push(item);
    }
    return map;
  }, [items]);

  const addItem = () => {
    if (!addingFor) return;
    if (!newDescription.trim()) {
      toast.error("Escribe una descripción");
      return;
    }
    setSaving(true);
    apiRequest<MedicalHistoryItem>("/medical-history", {
      method: "POST",
      body: JSON.stringify({ category: addingFor, description: newDescription.trim() }),
    })
      .then(() => loadItems())
      .then(() => {
        toast.success("Registro agregado");
        setNewDescription("");
        setAddingFor(null);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo agregar el registro"))
      .finally(() => setSaving(false));
  };

  const deleteItem = (id: number) => {
    apiRequest(`/medical-history/${id}`, { method: "DELETE" })
      .then(() => loadItems())
      .then(() => toast.success("Registro eliminado"))
      .catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo eliminar el registro"));
  };

  const stats = [
    { label: "Enfermedades", value: itemsByCategory.get("diseases")?.length ?? 0, color: "#FCA5A5" },
    { label: "Medicamentos", value: itemsByCategory.get("medications")?.length ?? 0, color: "#6EE7B7" },
    { label: "Vacunas", value: itemsByCategory.get("vaccines")?.length ?? 0, color: "#93C5FD" },
  ];

  const pageBg = dark ? "#070A12" : "#F8FAFC";
  const surface = dark ? "#0D1322" : "#FFFFFF";
  const border = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const title = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#94A3B8" : "#64748B";
  const inputClass = dark
    ? "w-full rounded-[14px] px-4 py-3.5 text-sm border border-slate-700 focus:outline-none focus:border-[#0F766E] bg-[#090D16] text-slate-100"
    : "w-full rounded-[14px] px-4 py-3.5 text-sm border border-[#E2E8F0] focus:outline-none focus:border-[#0F766E] bg-[#F8FAFC] text-slate-800";

  return (
    <div className="h-full overflow-y-auto transition-colors" style={{ backgroundColor: pageBg }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-8" style={{ background: "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)" }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Historial Médico</h1>
            <p className="text-white/70 text-sm">Tu información de salud completa</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/20">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-white/70 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion sections */}
      <div className="px-5 mt-6 space-y-3 pb-6">
        {loading && (
          <p className="text-center text-sm text-slate-400 py-6">Cargando historial médico…</p>
        )}

        {!loading && categoryOrder.map((category) => {
          const meta = sectionMeta[category];
          const Icon = meta.icon;
          const isOpen = expanded === category;
          const categoryItems = itemsByCategory.get(category) ?? [];

          return (
            <div key={category} className="rounded-[20px] shadow-sm overflow-hidden" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
              <button
                onClick={() => setExpanded(isOpen ? null : category)}
                className="w-full flex items-center gap-3 p-4"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: meta.color + "15" }}>
                  <Icon className="w-5 h-5" style={{ color: meta.color }} />
                </div>
                <span className="flex-1 text-sm font-semibold text-left" style={{ color: title }}>{meta.label}</span>
                <span className="text-xs font-medium mr-1" style={{ color: muted }}>{categoryItems.length}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`} style={{ color: muted }} />
              </button>

              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t"
                  style={{ borderColor: border }}
                >
                  <div className="px-4 py-3 space-y-2.5">
                    {categoryItems.length === 0 && (
                      <p className="text-xs italic" style={{ color: muted }}>Sin registros todavía</p>
                    )}
                    {categoryItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 group">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                        <p className="text-sm flex-1" style={{ color: dark ? "#CBD5E1" : "#475569" }}>{item.description}</p>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? "hover:bg-red-500/10" : "hover:bg-red-50"}`}
                          aria-label="Eliminar registro"
                        >
                          <X className="w-3.5 h-3.5" style={{ color: dark ? "#64748B" : "#CBD5E1" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => { setAddingFor(category); setNewDescription(""); }}
                      className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-[14px] py-2.5 text-xs font-medium transition-colors ${dark ? "border-slate-700 text-slate-400 hover:border-[#0F766E] hover:text-[#8BE9D6]" : "border-[#E2E8F0] text-slate-400 hover:border-[#0F766E] hover:text-[#0F766E]"}`}
                    >
                      <Plus className="w-4 h-4" />
                      Agregar {meta.label.toLowerCase()}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {addingFor && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => !saving && setAddingFor(null)}>
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full max-w-2xl mx-auto rounded-t-[32px] p-6"
            style={{ backgroundColor: surface }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: title }}>Agregar {sectionMeta[addingFor].label.toLowerCase()}</h3>
              <button onClick={() => !saving && setAddingFor(null)} className={`w-8 h-8 rounded-full flex items-center justify-center ${dark ? "bg-slate-800" : "bg-slate-50"}`}>
                <X className="w-4 h-4" style={{ color: muted }} />
              </button>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: muted }}>Descripción</label>
              <input
                type="text"
                autoFocus
                placeholder={sectionMeta[addingFor].placeholder}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addItem(); }}
                className={inputClass}
              />
            </div>
            <button
              onClick={addItem}
              disabled={saving}
              className="w-full mt-5 py-4 rounded-[20px] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)", boxShadow: "0 8px 24px rgba(15,118,110,0.3)" }}
            >
              <Plus className="w-[18px] h-[18px]" /> {saving ? "Guardando..." : "Agregar registro"}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
