import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  User, ChevronRight, Bell, Shield, Lock, LogOut, HelpCircle, Heart, Edit2, Camera,
  Sun, Moon, X, Eye, EyeOff, Check, Info, Phone, Droplets, Star, Zap, Target,
  Award, Flame, TrendingUp, Activity, Scale,
} from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import vitalMindLogo from "../../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";
import mediTechLogo from "../../../imports/image_1.png";
import { useTheme } from "../ThemeContext";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { apiRequest, clearSession } from "../../lib/api";
import type { MetricsSummary, ProfileMe, ProfileStats, HabitToday } from "../../lib/types";

type Modal = "editProfile" | "personalInfo" | "changePassword" | "privacy" | null;

const baseAchievements = [
  { icon: Flame, label: "Racha", color: "#EF4444", bg: "#EF444415" },
  { icon: Droplets, label: "Hidratación", color: "#2563EB", bg: "#2563EB15" },
  { icon: Activity, label: "Actividad", color: "#22C55E", bg: "#22C55E15" },
  { icon: Star, label: "Bienestar", color: "#F59E0B", bg: "#F59E0B15" },
  { icon: Zap, label: "Energía", color: "#8B5CF6", bg: "#8B5CF615" },
];

export function ProfileScreen() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [modal, setModal] = useState<Modal>(null);

  const storedName = localStorage.getItem("userName") || "Usuario";
  const [displayName, setDisplayName] = useState(storedName);
  const [profile, setProfile] = useState<ProfileMe | null>(null);
  const [stats, setStats] = useState<ProfileStats>({ diasActivo: 0, registros: 0, habitos: 0 });
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [habits, setHabits] = useState<HabitToday[]>([]);

  // Campos del formulario "Editar perfil" (información personal completa)
  const [editName, setEditName] = useState(storedName);
  const [editEmail, setEditEmail] = useState(`${storedName}@vitalmind.ai`);
  const [editAge, setEditAge] = useState("");
  const [editBloodType, setEditBloodType] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [saving, setSaving] = useState(false);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const loadProfile = () =>
    apiRequest<ProfileMe>("/auth/me").then((p) => {
      setProfile(p);
      setDisplayName(p.name);
      setEditName(p.name);
      setEditEmail(p.email);
      setEditAge(p.age ? String(p.age) : "");
      setEditBloodType(p.bloodType ?? "");
      setEditPhone(p.phone ?? "");
      setEditWeight(p.weightKg !== null ? String(p.weightKg) : "");
      setEditHeight(p.heightCm !== null ? String(p.heightCm) : "");
    });

  useEffect(() => {
    loadProfile().catch(() => null);
    apiRequest<ProfileStats>("/auth/me/stats").then(setStats).catch(() => null);
    apiRequest<MetricsSummary>("/metrics/summary").then(setMetrics).catch(() => null);
    apiRequest<HabitToday[]>("/habits/today")
      .then((result) => {
        setHabits(Array.isArray(result) ? result : []);
      })
      .catch((error) => {
        console.error("Error cargando hábitos del perfil:", error);
        setHabits([]);
      });
  }, []);

  const bg = dark ? "#0F172A" : "#F8FAFC";
  const card = dark ? "#1E293B" : "#FFFFFF";
  const cardBorder = dark ? "rgba(255,255,255,0.07)" : "#E2E8F0";
  const text = dark ? "#F1F5F9" : "#0F172A";
  const muted = dark ? "#64748B" : "#94A3B8";
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "#F8FAFC";

  const weight = profile?.weightKg ?? null;
  const height = profile?.heightCm ?? null;
  const bmi = weight && height ? parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1)) : null;
  const bmiLabel = bmi === null ? "Sin datos" : bmi < 18.5 ? "Bajo peso" : bmi < 25 ? "Normal" : bmi < 30 ? "Sobrepeso" : "Obesidad";
  const bmiColor = bmi === null ? "#94A3B8" : bmi < 18.5 ? "#F59E0B" : bmi < 25 ? "#22C55E" : bmi < 30 ? "#F59E0B" : "#EF4444";
  const bmiPct = bmi === null ? 0 : Math.min(100, Math.round(((bmi - 10) / (40 - 10)) * 100));
  const wellnessScore = metrics?.wellnessScore ?? 0;
  const healthScore = [
    {
      name: "score",
      value: wellnessScore,
      fill: "#14B8A6",
    },
    {
      name: "rest",
      value: 100 - wellnessScore,
      fill: dark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
    },
  ];

  const getHabit = (key: string) =>
    habits.find((habit) => habit.key === key);

  const waterHabit = getHabit("water");
  const exerciseHabit = getHabit("exercise");
  const sleepHabit = getHabit("sleep");
  const meditationHabit = getHabit("meditation");

  const waterCurrent = Number(
    waterHabit?.value ?? metrics?.waterL ?? 0,
  );
  const waterTarget = Number(
    waterHabit?.goal ?? metrics?.waterGoalL ?? 2,
  );

  const exerciseCurrent = Number(
    exerciseHabit?.value ?? 0,
  );
  const exerciseTarget = Number(
    exerciseHabit?.goal ?? 30,
  );

  const sleepCurrent = Number(
    sleepHabit?.value ?? metrics?.sleepHours ?? 0,
  );
  const sleepTarget = Number(
    sleepHabit?.goal ?? metrics?.sleepGoalHours ?? 8,
  );

  const meditationCurrent = Number(
    meditationHabit?.value ?? 0,
  );
  const meditationTarget = Number(
    meditationHabit?.goal ?? 10,
  );

  const stepsCurrent = Number(
    metrics?.steps ?? 0,
  );
  const stepsTarget = Number(
    metrics?.stepsGoal ?? 10000,
  );

  const medicationPct = Number(
    metrics?.medsAdherence ?? 0,
  );

  const pct = (current: number, target: number) =>
    target > 0
      ? Math.min(100, Math.round((current / target) * 100))
      : 0;

  const dailyGoals = [
    {
      label: "Hidratación",
      current: waterCurrent,
      target: waterTarget,
      unit: "L",
      pct: pct(waterCurrent, waterTarget),
      color: "#2563EB",
    },
    {
      label: "Pasos",
      current: stepsCurrent,
      target: stepsTarget,
      unit: "pasos",
      pct: pct(stepsCurrent, stepsTarget),
      color: "#22C55E",
    },
    {
      label: "Sueño",
      current: sleepCurrent,
      target: sleepTarget,
      unit: "h",
      pct: pct(sleepCurrent, sleepTarget),
      color: "#8B5CF6",
    },
    {
      label: "Ejercicio",
      current: exerciseCurrent,
      target: exerciseTarget,
      unit: "min",
      pct: pct(exerciseCurrent, exerciseTarget),
      color: "#14B8A6",
    },
    {
      label: "Meditación",
      current: meditationCurrent,
      target: meditationTarget,
      unit: "min",
      pct: pct(meditationCurrent, meditationTarget),
      color: "#F59E0B",
    },
    {
      label: "Medicamentos",
      current: medicationPct,
      target: 100,
      unit: "%",
      pct: medicationPct,
      color: "#EF4444",
    },
  ];

  const achievements = [
    {
      ...baseAchievements[0],
      label:
        stats.diasActivo > 0
          ? `Racha ${stats.diasActivo}d`
          : "Racha",
      unlocked: stats.diasActivo > 0,
    },
    {
      ...baseAchievements[1],
      label:
        pct(waterCurrent, waterTarget) >= 100
          ? "Hidratación"
          : "Hidratación pendiente",
      unlocked:
        pct(waterCurrent, waterTarget) >= 100,
    },
    {
      ...baseAchievements[2],
      label:
        pct(exerciseCurrent, exerciseTarget) >= 100
          ? "Actividad completa"
          : "Actividad pendiente",
      unlocked:
        pct(exerciseCurrent, exerciseTarget) >= 100,
    },
    {
      ...baseAchievements[3],
      label:
        wellnessScore >= 80
          ? "Bienestar excelente"
          : wellnessScore >= 60
            ? "Buen bienestar"
            : "Mejorando bienestar",
      unlocked: wellnessScore >= 60,
    },
    {
      ...baseAchievements[4],
      label:
        pct(meditationCurrent, meditationTarget) >= 100
          ? "Energía y calma"
          : "Meditación pendiente",
      unlocked:
        pct(meditationCurrent, meditationTarget) >= 100,
    },
  ];

  const statsData = [
    { label: "Días activo", value: String(stats.diasActivo) },
    { label: "Registros", value: String(stats.registros) },
    { label: "Hábitos", value: String(stats.habitos) },
  ];

  const handleLogout = () => {
    clearSession();
    toast.success("Sesión cerrada");
    navigate("/auth");
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) { toast.error("El nombre no puede estar vacío"); return; }
    if (!editEmail.trim()) { toast.error("El correo no puede estar vacío"); return; }

    setSaving(true);
    apiRequest<ProfileMe>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify({
        name: editName.trim(),
        email: editEmail.trim(),
        age: editAge ? Number(editAge) : undefined,
        bloodType: editBloodType.trim() || null,
        phone: editPhone.trim() || null,
        weightKg: editWeight ? Number(editWeight) : null,
        heightCm: editHeight ? Number(editHeight) : null,
      }),
    })
      .then(() => {
        setDisplayName(editName.trim());
        localStorage.setItem("userName", editName.trim());
        toast.success("Perfil actualizado");
        setModal(null);
        return loadProfile();
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : "No se pudo guardar el perfil"))
      .finally(() => setSaving(false));
  };

  const handleChangePassword = () => {
    if (!oldPass || !newPass || !confirmPass) { toast.error("Completa todos los campos"); return; }
    if (newPass !== confirmPass) { toast.error("Las contraseñas no coinciden"); return; }
    if (newPass.length < 6) { toast.error("La contraseña debe tener al menos 6 caracteres"); return; }
    toast.success("Contraseña actualizada");
    setOldPass(""); setNewPass(""); setConfirmPass("");
    setModal(null);
  };

  const menuSections = [
    {
      title: "Cuenta",
      items: [
        { icon: User, label: "Información personal", color: "#0F766E", action: () => setModal("personalInfo") },
        { icon: Bell, label: "Notificaciones", color: "#2563EB", action: () => navigate("/notificaciones") },
        { icon: Heart, label: "Historial médico", color: "#EF4444", action: () => navigate("/medical-history") },
      ],
    },
    {
      title: "Seguridad",
      items: [
        { icon: Lock, label: "Cambiar contraseña", color: "#F59E0B", action: () => setModal("changePassword") },
        { icon: Shield, label: "Privacidad y datos", color: "#8B5CF6", action: () => setModal("privacy") },
      ],
    },
    {
      title: "Soporte",
      items: [
        { icon: HelpCircle, label: "Ayuda y soporte", color: "#14B8A6", action: () => toast.info("soporte@vitalmind.ai · Lun-Vie 9:00-18:00") },
        { icon: Info, label: "Acerca de VitalMind AI", color: "#64748B", action: () => toast.info("VitalMind AI v1.0.0 · © 2025 MediTech") },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto transition-colors" style={{ backgroundColor: bg }}>
      {/* ── Header gradient ── */}
      <div
        className="relative px-5 pt-12 pb-7 overflow-hidden"
        style={{ background: "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)", borderRadius: 0 }}
      >
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute bottom-[-20px] left-10 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6 relative">
          <ImageWithFallback
            src={vitalMindLogo}
            alt="VitalMind AI"
            className="h-8 w-auto object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-xs font-medium">Mi perfil</span>
            <button
              onClick={toggle}
              className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center border border-white/25"
            >
              {dark ? <Sun size={14} className="text-[#F59E0B]" /> : <Moon size={14} className="text-white" />}
            </button>
          </div>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40">
              <User className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#F59E0B] rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white capitalize">{displayName}</h2>
            <p className="text-white/70 text-sm">{profile?.email ?? `${displayName}@vitalmind.ai`}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={11} className="text-[#F59E0B]" fill="#F59E0B" />
              <span className="text-[#F59E0B] text-xs font-medium">Plan Premium</span>
            </div>
            <button
              onClick={() => { setEditName(displayName); setModal("editProfile"); }}
              className="mt-2 flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-white text-xs font-medium active:scale-95 transition-all border border-white/20"
            >
              <Edit2 className="w-3 h-3" />
              Editar perfil
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 relative">
          {statsData.map((s) => (
            <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/20">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-white/70 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-5 pb-8">
        {/* ── Health score + Body metrics ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Health score */}
          <div className="rounded-[20px] p-4 border shadow-sm" style={{ backgroundColor: card, borderColor: cardBorder }}>
            <p className="text-xs font-bold mb-1" style={{ color: muted }}>Puntuación salud</p>
            <div className="relative h-20 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" startAngle={220} endAngle={-40} data={healthScore} barSize={8}>
                  <RadialBar dataKey="value" background={false} cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: "#14B8A6" }}>{wellnessScore}</span>
                <span className="text-[9px]" style={{ color: muted }}>pts</span>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp size={11} className="text-[#22C55E]" />
              <span className="text-[10px] font-semibold text-[#22C55E]">{metrics ? `Adherencia meds. ${metrics.medsAdherence}%` : "Registra tus hábitos"}</span>
            </div>
          </div>

          {/* BMI card */}
          <div className="rounded-[20px] p-4 border shadow-sm" style={{ backgroundColor: card, borderColor: cardBorder }}>
            <p className="text-xs font-bold mb-1" style={{ color: muted }}>Índice de masa</p>
            <p className="text-2xl font-bold" style={{ color: bmiColor }}>{bmi ?? "—"}</p>
            <p className="text-xs font-semibold mb-2" style={{ color: bmiColor }}>{bmiLabel}</p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: dark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }}>
              <div className="h-full rounded-full" style={{ width: `${bmiPct}%`, backgroundColor: bmiColor }} />
            </div>
            <div className="flex justify-between mt-2">
              <div className="text-center">
                <p className="text-base font-bold" style={{ color: text }}>{weight ?? "—"}<span className="text-[10px] ml-0.5" style={{ color: muted }}>kg</span></p>
                <p className="text-[9px]" style={{ color: muted }}>Peso</p>
              </div>
              <div className="w-px self-stretch" style={{ backgroundColor: cardBorder }} />
              <div className="text-center">
                <p className="text-base font-bold" style={{ color: text }}>{height ?? "—"}<span className="text-[10px] ml-0.5" style={{ color: muted }}>cm</span></p>
                <p className="text-[9px]" style={{ color: muted }}>Altura</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Daily goals ── */}
        <div className="rounded-[20px] p-5 border shadow-sm" style={{ backgroundColor: card, borderColor: cardBorder }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "#0F766E18" }}>
                <Target size={14} style={{ color: "#0F766E" }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: text }}>Metas de hoy</h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#0F766E15", color: "#0F766E" }}>
              {dailyGoals.filter((g) => g.pct >= 100).length}/{dailyGoals.length || 4} completas
            </span>
          </div>
          <div className="space-y-3">
            {dailyGoals.length === 0 && <p className="text-xs" style={{ color: muted }}>Registra tus hábitos hoy para ver tus metas.</p>}
            {dailyGoals.map((g) => (
              <div key={g.label}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium" style={{ color: text }}>{g.label}</span>
                  <span className="text-xs" style={{ color: muted }}>
                    <span className="font-semibold" style={{ color: g.color }}>
                      {g.label === "Pasos"
                        ? Math.round(g.current).toLocaleString("es-MX")
                        : g.label === "Sueño"
                          ? g.current.toFixed(1)
                          : g.label === "Hidratación"
                            ? g.current.toFixed(2)
                            : g.label === "Medicamentos"
                              ? Math.round(g.current)
                              : Math.round(g.current)}
                    </span>
                    /
                    {g.label === "Pasos"
                      ? Math.round(g.target).toLocaleString("es-MX")
                      : g.label === "Sueño"
                        ? g.target.toFixed(0)
                        : g.label === "Hidratación"
                          ? g.target.toFixed(2)
                          : Math.round(g.target)}{" "}
                    {g.unit}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: dark ? "rgba(255,255,255,0.08)" : "#F1F5F9" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.pct}%` }}
                    transition={{ duration: 0.9, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Achievements ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ backgroundColor: "#F59E0B18" }}>
                <Award size={14} style={{ color: "#F59E0B" }} />
              </div>
              <h3 className="text-sm font-bold" style={{ color: text }}>Logros</h3>
            </div>
            <span className="text-[10px]" style={{ color: muted }}>{achievements.filter((a) => a.unlocked).length} desbloqueados</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.label}
                  whileTap={{ scale: 0.93 }}
                  className="flex-shrink-0 flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-14 h-14 rounded-[18px] flex items-center justify-center border"
                    style={{
                      backgroundColor: a.unlocked ? a.bg : (dark ? "rgba(255,255,255,0.04)" : "#F8FAFC"),
                      borderColor: a.unlocked ? a.color + "30" : cardBorder,
                      opacity: a.unlocked ? 1 : 0.55,
                    }}
                  >
                    <Icon size={24} style={{ color: a.unlocked ? a.color : muted }} />
                  </div>
                  <span
                    className="text-[9px] font-semibold text-center leading-tight"
                    style={{ color: a.unlocked ? muted : muted }}
                  >
                    {a.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Health card ── */}
        <button
          onClick={() => navigate("/medical-history")}
          className="w-full flex items-center gap-4 p-4 rounded-[20px] border shadow-sm text-left active:scale-[0.98] transition-all"
          style={{ backgroundColor: card, borderColor: cardBorder }}
        >
          <div className="w-12 h-12 bg-[#FFF1F2] rounded-2xl flex items-center justify-center flex-shrink-0">
            <Heart className="w-6 h-6 text-[#EF4444]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: text }}>Mi tarjeta de salud</p>
            <p className="text-xs mt-0.5" style={{ color: muted }}>Grupo sanguíneo · Alergias · Medicamentos</p>
          </div>
          <ChevronRight className="w-5 h-5" style={{ color: muted }} />
        </button>

        {/* ── Menu sections ── */}
        {menuSections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5 px-1" style={{ color: muted }}>{section.title}</p>
            <div className="rounded-[20px] border overflow-hidden shadow-sm" style={{ backgroundColor: card, borderColor: cardBorder }}>
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-4 px-5 py-4 transition-colors active:opacity-70 ${
                      i < section.items.length - 1 ? "border-b" : ""
                    }`}
                    style={{ borderColor: cardBorder }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + "15" }}>
                      <Icon size={18} style={{ color: item.color }} />
                    </div>
                    <span className="flex-1 text-sm font-medium text-left" style={{ color: text }}>{item.label}</span>
                    <ChevronRight className="w-4 h-4" style={{ color: muted }} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full rounded-[20px] py-4 flex items-center justify-center gap-2 font-semibold text-sm active:scale-95 transition-all"
          style={{ backgroundColor: "#EF444415", border: "1px solid #EF444430", color: "#EF4444" }}
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: muted }}>Desarrollado por</p>
          <ImageWithFallback
            src={mediTechLogo}
            alt="MediTech"
            className="h-6 w-auto object-contain"
            style={{ opacity: 0.5, filter: dark ? "brightness(0) invert(1)" : "none" }}
          />
          <p className="text-[10px]" style={{ color: muted }}>VitalMind AI v1.0.0 · © 2025</p>
        </div>
      </div>

      {/* ── MODALS ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full max-w-2xl mx-auto rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto"
            style={{ backgroundColor: card }}
          >
            {/* Edit Profile (incluye toda la información personal) */}
            {modal === "editProfile" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold" style={{ color: text }}>Editar perfil</h3>
                  <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: inputBg }}>
                    <X size={16} style={{ color: muted }} />
                  </button>
                </div>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-[#0F766E]/15 rounded-full flex items-center justify-center">
                      <User size={36} className="text-[#0F766E]" />
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#F59E0B] rounded-full flex items-center justify-center">
                      <Camera size={13} className="text-white" />
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: muted }}>Toca para cambiar foto</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Nombre completo</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-[14px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#0F766E] border"
                      style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Correo electrónico</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full rounded-[14px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#0F766E] border"
                      style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Edad</label>
                      <input type="number" min={0} placeholder="años" value={editAge} onChange={(e) => setEditAge(e.target.value)}
                        className="w-full rounded-[14px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#0F766E] border"
                        style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Grupo sanguíneo</label>
                      <input type="text" placeholder="ej. O+" value={editBloodType} onChange={(e) => setEditBloodType(e.target.value)}
                        className="w-full rounded-[14px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#0F766E] border"
                        style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Teléfono</label>
                    <input type="tel" placeholder="+52 55 1234 5678" value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full rounded-[14px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#0F766E] border"
                      style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Peso (kg)</label>
                      <input type="number" min={0} step="0.1" placeholder="ej. 74" value={editWeight} onChange={(e) => setEditWeight(e.target.value)}
                        className="w-full rounded-[14px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#0F766E] border"
                        style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Altura (cm)</label>
                      <input type="number" min={0} step="0.1" placeholder="ej. 175" value={editHeight} onChange={(e) => setEditHeight(e.target.value)}
                        className="w-full rounded-[14px] px-4 py-3.5 text-sm focus:outline-none focus:border-[#0F766E] border"
                        style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                    </div>
                  </div>
                </div>
                <button onClick={handleSaveProfile} disabled={saving}
                  className="w-full mt-5 py-4 rounded-[20px] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)", boxShadow: "0 8px 24px rgba(15,118,110,0.3)" }}>
                  <Check size={18} /> {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </>
            )}

            {/* Personal Info (solo lectura, con datos reales de la BD) */}
            {modal === "personalInfo" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold" style={{ color: text }}>Información personal</h3>
                  <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: inputBg }}>
                    <X size={16} style={{ color: muted }} />
                  </button>
                </div>
                <div className="space-y-3 pb-2">
                  {[
                    { label: "Nombre", value: displayName, icon: User, color: "#0F766E" },
                    { label: "Correo", value: profile?.email ?? "—", icon: Bell, color: "#2563EB" },
                    { label: "Edad", value: profile?.age ? `${profile.age} años` : "Sin registrar", icon: Info, color: "#F59E0B" },
                    { label: "Grupo sanguíneo", value: profile?.bloodType || "Sin registrar", icon: Droplets, color: "#EF4444" },
                    { label: "Teléfono", value: profile?.phone || "Sin registrar", icon: Phone, color: "#8B5CF6" },
                    { label: "Peso / Altura", value: weight && height ? `${weight}kg · ${height}cm` : "Sin registrar", icon: Scale, color: "#14B8A6" },
                  ].map((row) => {
                    const Icon = row.icon;
                    return (
                      <div key={row.label} className="flex items-center gap-3 p-3 rounded-[14px] border" style={{ backgroundColor: inputBg, borderColor: cardBorder }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: row.color + "15" }}>
                          <Icon size={15} style={{ color: row.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-medium" style={{ color: muted }}>{row.label}</p>
                          <p className="text-sm font-semibold" style={{ color: text }}>{row.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => { setModal(null); setTimeout(() => setModal("editProfile"), 150); }}
                  className="w-full mt-4 py-3.5 rounded-[20px] text-white font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)" }}
                >
                  Editar información
                </button>
              </>
            )}

            {/* Change Password */}
            {modal === "changePassword" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold" style={{ color: text }}>Cambiar contraseña</h3>
                  <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: inputBg }}>
                    <X size={16} style={{ color: muted }} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Contraseña actual</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: muted }} />
                      <input type={showOld ? "text" : "password"} placeholder="••••••••" value={oldPass} onChange={(e) => setOldPass(e.target.value)}
                        className="w-full rounded-[14px] pl-11 pr-11 py-3.5 text-sm focus:outline-none border"
                        style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                      <button onClick={() => setShowOld(!showOld)} className="absolute right-4 top-1/2 -translate-y-1/2">
                        {showOld ? <EyeOff size={15} style={{ color: muted }} /> : <Eye size={15} style={{ color: muted }} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Nueva contraseña</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: muted }} />
                      <input type={showNew ? "text" : "password"} placeholder="Mín. 6 caracteres" value={newPass} onChange={(e) => setNewPass(e.target.value)}
                        className="w-full rounded-[14px] pl-11 pr-11 py-3.5 text-sm focus:outline-none border"
                        style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                      <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2">
                        {showNew ? <EyeOff size={15} style={{ color: muted }} /> : <Eye size={15} style={{ color: muted }} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: muted }}>Confirmar nueva contraseña</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: muted }} />
                      <input type="password" placeholder="Repite la contraseña" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                        className="w-full rounded-[14px] pl-11 pr-4 py-3.5 text-sm focus:outline-none border"
                        style={{ backgroundColor: inputBg, borderColor: cardBorder, color: text }} />
                    </div>
                  </div>
                  {newPass.length > 0 && (
                    <div className="flex gap-1.5">
                      {[newPass.length >= 6, /[A-Z]/.test(newPass), /[0-9]/.test(newPass)].map((ok, i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all ${ok ? "bg-[#22C55E]" : "bg-slate-200"}`} />
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={handleChangePassword}
                  className="w-full mt-5 py-4 rounded-[20px] text-white font-semibold text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)", boxShadow: "0 8px 24px rgba(15,118,110,0.25)" }}>
                  <Shield size={18} /> Actualizar contraseña
                </button>
              </>
            )}

            {/* Privacy */}
            {modal === "privacy" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold" style={{ color: text }}>Privacidad y datos</h3>
                  <button onClick={() => setModal(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: inputBg }}>
                    <X size={16} style={{ color: muted }} />
                  </button>
                </div>
                <div className="space-y-3 pb-2">
                  {[
                    { title: "Análisis de datos", desc: "Permite mejorar la IA con datos anónimos", enabled: true },
                    { title: "Compartir con médicos", desc: "Comparte tu historial con profesionales de salud", enabled: false },
                    { title: "Notificaciones push", desc: "Recibe alertas y recordatorios de salud", enabled: true },
                    { title: "Seguimiento de ubicación", desc: "Para registrar actividad física al aire libre", enabled: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-[16px] border" style={{ backgroundColor: inputBg, borderColor: cardBorder }}>
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: text }}>{item.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: muted }}>{item.desc}</p>
                      </div>
                      <div className="w-11 h-6 rounded-full relative flex-shrink-0 mt-0.5" style={{ backgroundColor: item.enabled ? "#0F766E" : dark ? "rgba(255,255,255,0.1)" : "#CBD5E1" }}>
                        <div className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" style={{ left: item.enabled ? "calc(100% - 20px)" : "4px" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { toast.success("Preferencias guardadas"); setModal(null); }}
                  className="w-full mt-4 py-3.5 rounded-[20px] text-white font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)" }}
                >
                  Guardar preferencias
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
