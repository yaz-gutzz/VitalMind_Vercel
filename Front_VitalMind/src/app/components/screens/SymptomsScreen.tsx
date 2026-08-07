import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { apiRequest } from "../../lib/api";
import {ChevronLeft, Save, Thermometer, Heart, Droplets, Scale, Activity, Zap, CheckCircle,} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "../ThemeContext";

type Mood = 0 | 1 | 2 | 3 | 4;

const moods = [
  { emoji: "😄", label: "Muy bien", color: "#22C55E" },
  { emoji: "🙂", label: "Bien", color: "#14B8A6" },
  { emoji: "😐", label: "Regular", color: "#F59E0B" },
  { emoji: "😔", label: "Mal", color: "#F97316" },
  { emoji: "😢", label: "Muy mal", color: "#EF4444" },
];

const painColors = ["#22C55E", "#84CC16", "#F59E0B", "#F97316", "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D", "#450A0A", "#1A0000"];

export function SymptomsScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    pain: 0,
    temperature: "",
    systolic: "",
    diastolic: "",
    glucose: "",
    weight: "",
    heartRate: "",
    mood: null as Mood | null,
    notes: "",
  });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const cardClass = dark ? "bg-[#0D1322] border border-slate-700 shadow-black/20" : "bg-white border border-slate-100 shadow-sm";
  const titleClass = dark ? "text-slate-100" : "text-slate-800";
  const bodyClass = dark ? "text-slate-300" : "text-slate-700";
  const mutedClass = dark ? "text-slate-500" : "text-slate-400";
  const inputClass = dark
    ? "w-full bg-[#090D16] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0F766E]"
    : "w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#0F766E]";

const handleSave = async () => {

    try{


        await apiRequest(
            "/symptom-logs",
            {
                method:"POST",

                body:JSON.stringify({

                  user_id: form.userId,

                    pain:form.pain,

                    temperature:
                    form.temperature || null,


                    systolic:
                    form.systolic || null,


                    diastolic:
                    form.diastolic || null,


                    glucose:
                    form.glucose || null,


                    weight:
                    form.weight || null,


                    heartRate:
                    form.heartRate || null,


                    mood:
                    form.mood !== null
                    ? moods[form.mood].label
                    : null,


                    notes:
                    form.notes

                })

            }
        );



        setSaved(true);


        toast.success(
            "Síntomas registrados exitosamente",
            {
                description:
                "Tu historial ha sido actualizado."
            }
        );



        setTimeout(()=>{

            navigate("/resumen");

        },1400);



    }catch(error){

        toast.error(
            "No se pudo guardar el registro"
        );

    }

};

  const filled = form.temperature || form.systolic || form.glucose || form.weight || form.heartRate || form.mood !== null;
  const pageBg = dark ? "#070A12" : "#F4F6FB";
  const surface = dark ? "#0D1322" : "#FFFFFF";
  const surfaceSoft = dark ? "#090D16" : "#F8FAFC";
  const border = dark ? "rgba(148,163,184,0.16)" : "#E2E8F0";
  const title = dark ? "#F8FAFC" : "#0F172A";
  const body = dark ? "#CBD5E1" : "#475569";
  const muted = dark ? "#94A3B8" : "#64748B";

  return (
    <div className="h-full flex flex-col overflow-hidden transition-colors" style={{ backgroundColor: pageBg }}>
      {/* ── Header ── */}
      <div
        className="px-5 pt-12 pb-6 flex-shrink-0"
        style={{ background: "linear-gradient(140deg, #0D6B64 0%, #0F766E 50%, #1D4ED8 100%)", borderRadius: "0 0 32px 32px" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center border border-white/20"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Registro de síntomas</h1>
            <p className="text-white/60 text-xs">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          {filled && (
            <div className="flex items-center gap-1 bg-white/15 px-3 py-1.5 rounded-full border border-white/20">
              <div className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse" />
              <span className="text-white/80 text-[10px] font-medium">En progreso</span>
            </div>
          )}
        </div>

        {/* Progress pills */}
        <div className="flex gap-1.5">
          {["Dolor", "Vitales", "Glucosa", "Emoción", "Notas"].map((s, i) => (
            <div key={s} className="flex-1 h-1 rounded-full" style={{ backgroundColor: i <= (form.pain > 0 ? 0 : -1) + (form.temperature ? 1 : 0) + (form.glucose ? 1 : 0) + (form.mood !== null ? 1 : 0) + (form.notes ? 1 : 0) - 1 && i <= 4 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)" }} />
          ))}
        </div>
      </div>

      {/* ── Scrollable form ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 pb-6">
        {/* Pain slider */}
        <div className="rounded-[20px] p-5 shadow-sm transition-colors" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EF4444]/10 flex items-center justify-center">
                <Zap size={18} className="text-[#EF4444]" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: title }}>Nivel de dolor</p>
                <p className="text-[11px]" style={{ color: muted }}>0 = sin dolor · 10 = insoportable</p>
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: painColors[form.pain] + "20" }}
            >
              <span className="text-2xl font-black" style={{ color: painColors[form.pain] }}>{form.pain}</span>
            </div>
          </div>
          <input
            type="range" min={0} max={10} value={form.pain}
            onChange={(e) => set("pain", Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: painColors[form.pain] }}
          />
          <div className="flex justify-between mt-2">
            {[0, 2, 4, 6, 8, 10].map((n) => (
              <span key={n} className="text-[10px] font-medium" style={{ color: muted }}>{n}</span>
            ))}
          </div>
        </div>

        {/* Vitals row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Temperature */}
          <div className="rounded-[20px] p-4 shadow-sm transition-colors" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                <Thermometer size={16} className="text-[#F59E0B]" />
              </div>
              <p className="text-xs font-bold" style={{ color: body }}>Temperatura</p>
            </div>
            <div className="flex items-end gap-1">
              <input
                type="number" placeholder="36.5" value={form.temperature}
                onChange={(e) => set("temperature", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ backgroundColor: surfaceSoft, border: `1px solid ${border}`, color: title }}
              />
              <span className="text-xs pb-2.5 ml-1 flex-shrink-0" style={{ color: muted }}>°C</span>
            </div>
          </div>
          {/* Heart rate */}
          <div className="rounded-[20px] p-4 shadow-sm transition-colors" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#EF4444]/10 flex items-center justify-center">
                <Heart size={16} className="text-[#EF4444]" />
              </div>
              <p className="text-xs font-bold" style={{ color: body }}>Frec. cardiaca</p>
            </div>
            <div className="flex items-end gap-1">
              <input
                type="number" placeholder="72" value={form.heartRate}
                onChange={(e) => set("heartRate", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ backgroundColor: surfaceSoft, border: `1px solid ${border}`, color: title }}
              />
              <span className="text-xs pb-2.5 ml-1 flex-shrink-0" style={{ color: muted }}>bpm</span>
            </div>
          </div>
        </div>

        {/* Blood pressure */}
        <div className="rounded-[20px] p-4 shadow-sm transition-colors" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
              <Activity size={16} className="text-[#2563EB]" />
            </div>
            <p className="text-sm font-bold" style={{ color: body }}>Presión arterial</p>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ color: muted, backgroundColor: dark ? "rgba(148,163,184,0.12)" : "#F8FAFC" }}>Normal: 120/80</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-[10px] mb-1.5 font-medium" style={{ color: muted }}>Sistólica</p>
              <input
                type="number" placeholder="120" value={form.systolic}
                onChange={(e) => set("systolic", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ backgroundColor: surfaceSoft, border: `1px solid ${border}`, color: title }}
              />
            </div>
            <span className="text-xl mt-4 font-light" style={{ color: muted }}>/</span>
            <div className="flex-1">
              <p className="text-[10px] mb-1.5 font-medium" style={{ color: muted }}>Diastólica</p>
              <input
                type="number" placeholder="80" value={form.diastolic}
                onChange={(e) => set("diastolic", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ backgroundColor: surfaceSoft, border: `1px solid ${border}`, color: title }}
              />
            </div>
            <span className="text-[10px] mt-4" style={{ color: muted }}>mmHg</span>
          </div>
        </div>

        {/* Glucose & Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[20px] p-4 shadow-sm transition-colors" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                <Droplets size={16} className="text-[#22C55E]" />
              </div>
              <p className="text-xs font-bold" style={{ color: body }}>Glucosa</p>
            </div>
            <div className="flex items-end gap-1">
              <input
                type="number" placeholder="90" value={form.glucose}
                onChange={(e) => set("glucose", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ backgroundColor: surfaceSoft, border: `1px solid ${border}`, color: title }}
              />
              <span className="text-[10px] pb-2.5 ml-0.5 flex-shrink-0" style={{ color: muted }}>mg/dL</span>
            </div>
          </div>
          <div className="rounded-[20px] p-4 shadow-sm transition-colors" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                <Scale size={16} className="text-[#8B5CF6]" />
              </div>
              <p className="text-xs font-bold" style={{ color: body }}>Peso</p>
            </div>
            <div className="flex items-end gap-1">
              <input
                type="number" placeholder="70" value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                style={{ backgroundColor: surfaceSoft, border: `1px solid ${border}`, color: title }}
              />
              <span className="text-xs pb-2.5 ml-1 flex-shrink-0" style={{ color: muted }}>kg</span>
            </div>
          </div>
        </div>

        {/* Emotional state */}
        <div className="rounded-[20px] p-5 shadow-sm transition-colors" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <p className="text-sm font-bold mb-1" style={{ color: title }}>Estado emocional</p>
          <p className="text-[11px] mb-4" style={{ color: muted }}>¿Cómo te sientes en este momento?</p>
          <div className="flex gap-2">
            {moods.map((m, i) => (
              <button
                key={i}
                onClick={() => set("mood", i)}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[16px] border-2 transition-all active:scale-90"
                style={{
                  borderColor: form.mood === i ? m.color : "#F1F5F9",
                  backgroundColor: form.mood === i ? m.color + "12" : surfaceSoft,
                }}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="text-[9px] font-semibold leading-tight text-center" style={{ color: form.mood === i ? m.color : muted }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-[20px] p-5 shadow-sm transition-colors" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
          <p className="text-sm font-bold mb-3" style={{ color: title }}>Notas adicionales</p>
          <textarea
            placeholder="Describe síntomas adicionales, medicamentos tomados hoy, circunstancias especiales..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={4}
            className="w-full rounded-[16px] px-4 py-3 text-sm focus:outline-none resize-none leading-relaxed"
            style={{ backgroundColor: surfaceSoft, border: `1px solid ${border}`, color: title }}
          />
        </div>
      </div>

      {/* ── Save button ── */}
      <div className="px-5 pb-6">
        <motion.button
          onClick={handleSave}
          disabled={saved}
          whileTap={{ scale: 0.97 }}
          className="w-full text-white font-semibold py-4 rounded-[20px] flex items-center justify-center gap-2.5 transition-all disabled:opacity-80"
          style={{
            background: saved
              ? "linear-gradient(135deg, #22C55E, #16A34A)"
              : "linear-gradient(135deg, #0F766E, #1D4ED8)",
            boxShadow: "0 8px 28px rgba(15,118,110,0.35)",
          }}
        >
          {saved ? (
            <><CheckCircle size={20} /> Guardado exitosamente</>
          ) : (
            <><Save size={20} /> Guardar registro</>
          )}
        </motion.button>
      </div>
    </div>
  );
}
