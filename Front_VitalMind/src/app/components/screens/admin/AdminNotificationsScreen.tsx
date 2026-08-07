import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ChevronLeft, Send, Users, User, Bell, Sparkles, CheckCircle, Clock, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useAdminTheme } from "../../admin/AdminThemeContext";
import { apiRequest } from "../../../lib/api";

type Target = "all" | "active" | "inactive" | "specific";
type NotifType = "tip" | "reminder" | "ai" | "alert";

const notifTypes: { key: NotifType; label: string; icon: typeof Bell; color: string }[] = [
  { key: "tip", label: "Consejo", icon: Sparkles, color: "#F59E0B" },
  { key: "reminder", label: "Recordatorio", icon: Clock, color: "#2563EB" },
  { key: "ai", label: "IA", icon: Sparkles, color: "#0F766E" },
  { key: "alert", label: "Alerta", icon: Bell, color: "#EF4444" },
];


export function AdminNotificationsScreen() {
  const [stats,setStats]=useState({
  all:0,
  active:0,
  inactive:0
  });
  const navigate = useNavigate();
  const { dark, toggle } = useAdminTheme();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<Target>("all");
  const [notifType, setNotifType] = useState<NotifType>("tip");
  const [tab, setTab] = useState<"send" | "history">("send");
  const [sending, setSending] = useState(false);
  const [history,setHistory]=useState<any[]>([]);

 useEffect(()=>{

  loadHistory();
  loadTargetStats();

  },[]);

  const bg = dark ? "#070A12" : "#F1F5F9";
  const card = dark ? "#0D1322" : "#FFFFFF";
  const border = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const text = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#9CA3AF" : "#64748B";
  const inputBg = dark ? "#0B1120" : "#F8FAFC";

  const handleSend = async()=>{
  if(!title.trim() || !body.trim()){
  toast.error(
  "Completa el título y el mensaje"
  );
  return;
  }
  try{
  setSending(true);
  await apiRequest(
  "/admin/notifications",
  {
  method:"POST",
  body:JSON.stringify({
  title,
  body,
  kind:notifType,
  target
  })
  }
  );
  toast.success(
  "Notificación enviada"
  );
  setTitle("");
  setBody("");
  loadHistory();
  }catch(error){
  toast.error("Error enviando notificación");
  }
  finally{setSending(false);
  }};

  const targets: {
  key: Target;
  label:string;
  icon: typeof Users;
  count:number | string;
  }[] = [

  {
  key:"all",
  label:"Todos los usuarios",
  icon:Users,
  count:stats.all
  },

  {
  key:"active",
  label:"Usuarios activos",
  icon:CheckCircle,
  count:stats.active
  },

  {
  key:"inactive",
  label:"Usuarios inactivos",
  icon:Clock,
  count:stats.inactive
  },

  {
  key:"specific",
  label:"Usuario específico",
  icon:User,
  count:"—"
  }

  ];

  const typeConfig: Record<NotifType, { color: string; label: string }> = {
    tip: { color: "#F59E0B", label: "Consejo" },
    reminder: { color: "#2563EB", label: "Recordatorio" },
    ai: { color: "#0F766E", label: "IA" },
    alert: { color: "#EF4444", label: "Alerta" },
  };


  async function loadHistory(){

  try{

  const data=await apiRequest("/admin/notifications");
  setHistory(data);
  }catch(error){
  toast.error("Error cargando historial");
  }}

  async function loadTargetStats(){

  try{

  const data=await apiRequest(
  "/admin/notifications/stats"
  );

  setStats(data);


  }catch(error){

  toast.error(
  "Error cargando usuarios"
  );

  }}


  return (
    <div className="min-h-full overflow-y-auto" style={{ backgroundColor: bg }}>
      {/* Header */}
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8 xl:px-10 pt-8 lg:pt-10 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/admin/dashboard")} style={{ color: muted }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: text }}>Notificaciones</h1>
            <p className="text-xs" style={{ color: muted }}>Envía mensajes push a usuarios</p>
          </div>
          <button onClick={toggle}>{dark ? <Sun size={16} style={{ color: "#F59E0B" }} /> : <Moon size={16} style={{ color: "#6366F1" }} />}</button>
        </div>

        {/* Tabs */}
        <div className="flex max-w-md rounded-2xl p-1 gap-1 border" style={{ backgroundColor: card, borderColor: border }}>
          {(["send", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === t ? "bg-[#0F766E] text-white" : "text-slate-400"
              }`}
            >
              {t === "send" ? "Enviar" : "Historial"}
            </button>
          ))}
        </div>
      </div>

      {tab === "send" ? (
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 xl:px-10 space-y-5 pb-24 lg:pb-10">
          {/* Notification type */}
          <div>
            <p className="text-xs text-slate-400 font-medium mb-2.5 uppercase tracking-wider">Tipo de notificación</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:max-w-2xl">
              {notifTypes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setNotifType(t.key)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-[16px] border transition-all ${
                      notifType === t.key ? "border-current" : ""
                    }`}
                    style={notifType === t.key ? { borderColor: t.color, backgroundColor: t.color + "15" } : { backgroundColor: inputBg, borderColor: border }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: notifType === t.key ? t.color : "#64748B" }} size={18} />
                    <span className="text-[10px] font-medium" style={{ color: notifType === t.key ? t.color : "#64748B" }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target audience */}
          <div>
            <p className="text-xs text-slate-400 font-medium mb-2.5 uppercase tracking-wider">Destinatarios</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {targets.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTarget(t.key)}
                    className={`w-full flex items-center gap-3 p-4 rounded-[16px] border transition-all ${
                      target === t.key ? "border-[#0F766E] bg-[#0F766E]/10" : ""
                    }`}
                    style={target === t.key ? undefined : { backgroundColor: inputBg, borderColor: border }}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${target === t.key ? "bg-[#0F766E]/20" : "bg-white/5"}`}>
                      <Icon className={`w-4.5 h-4.5 ${target === t.key ? "text-[#0F766E]" : "text-slate-500"}`} size={18} />
                    </div>
                    <span className={`flex-1 text-sm font-medium text-left ${target === t.key ? "text-white" : ""}`} style={target === t.key ? undefined : { color: muted }}>
                      {t.label}
                    </span>
                    <span className={`text-xs font-bold ${target === t.key ? "text-[#0F766E]" : "text-slate-500"}`}>{t.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs text-slate-400 font-medium mb-2.5 uppercase tracking-wider">Mensaje</p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título de la notificación"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={60}
                className="w-full rounded-[16px] px-4 py-3.5 placeholder-slate-500 focus:outline-none focus:border-[#0F766E] text-sm"
                style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text }}
              />
              <div className="relative">
                <textarea
                  placeholder="Cuerpo del mensaje..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={160}
                  rows={4}
                  className="w-full rounded-[16px] px-4 py-3.5 placeholder-slate-500 focus:outline-none focus:border-[#0F766E] text-sm resize-none"
                  style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text }}
                />
                <span className="absolute bottom-3 right-4 text-[10px] text-slate-600">{body.length}/160</span>
              </div>
            </div>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="rounded-[20px] p-4 border" style={{ backgroundColor: card, borderColor: border }}>
              <p className="text-xs text-slate-500 mb-3 font-medium">Vista previa</p>
              <div className="bg-[#1E293B] rounded-[16px] p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#0F766E] to-[#14B8A6] rounded-md flex items-center justify-center">
                    <Bell className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">VitalMind AI</span>
                  <span className="text-xs text-slate-500 ml-auto">ahora</span>
                </div>
                {title && <p className="text-sm font-semibold text-white mb-0.5">{title}</p>}
                {body && <p className="text-xs text-slate-400 leading-relaxed">{body}</p>}
              </div>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!title.trim() || !body.trim() || sending}
            className="w-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white font-semibold py-4 rounded-[20px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
            style={{ boxShadow: "0 8px 24px rgba(15,118,110,0.3)" }}
          >
            <Send className="w-5 h-5" />
            {sending ? "Enviando..." : "Enviar notificación"}
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 xl:px-10 grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 pb-24 lg:pb-10">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Últimas enviadas</p>
          {history.map((n, i) => {
            const cfg = typeConfig.tip;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-[20px] p-4 border"
                style={{ backgroundColor: card, borderColor: border }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-0.5" style={{ color: text }}>{n.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: cfg.color + "20", color: cfg.color }}>{cfg.label}</span>
                      <span className="text-[10px] text-slate-500">→ {n.target}</span>
                      <span className="text-[10px] text-slate-500">· Enviada</span>
                      <span className="text-[10px] text-slate-600">· {n.sent}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
