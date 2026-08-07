import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Bell, Sparkles, Clock, AlertTriangle, Lightbulb, ChevronLeft, Check } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";
import type { NotificationItem } from "../../lib/types";

type NotifKind = "tip" | "reminder" | "ai" | "alert";

interface Notif {
  id: number;
  kind: NotifKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const kindConfig: Record<NotifKind, { icon: typeof Bell; color: string; bg: string; label: string }> = {
  tip: { icon: Lightbulb, color: "#F59E0B", bg: "#FFFBEB", label: "Consejo" },
  reminder: { icon: Clock, color: "#2563EB", bg: "#EFF6FF", label: "Recordatorio" },
  ai: { icon: Sparkles, color: "#0F766E", bg: "#F0FDFA", label: "IA" },
  alert: { icon: AlertTriangle, color: "#EF4444", bg: "#FEF2F2", label: "Alerta" },
};

export function NotificacionesScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [notifications, setNotifications] = useState<Notif[]>([]);

  useEffect(() => {
    apiRequest<NotificationItem[]>("/notifications")
      .then((items) => setNotifications(items.map((item) => ({
        id: Number.parseInt(item.id, 10) || Date.now(),
        kind: item.kind,
        title: item.title,
        body: item.body,
        time: item.time,
        read: item.read,
      }))))
      .catch(() => null);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    apiRequest("/notifications/mark-all-read", { method: "PATCH" })
      .then(() => apiRequest<NotificationItem[]>("/notifications"))
      .then((items) => setNotifications(items.map((item) => ({
        id: Number.parseInt(item.id, 10) || Date.now(),
        kind: item.kind,
        title: item.title,
        body: item.body,
        time: item.time,
        read: item.read,
      }))))
      .catch(() => null);
  };

  return (
    <div className="h-full overflow-y-auto transition-colors" style={{ backgroundColor: dark ? "#070A12" : "#F8FAFC" }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-8" style={{ background: "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)" }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
            <p className="text-white/70 text-sm">{unread} sin leer</p>
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-white text-xs font-medium">
              <Check className="w-3.5 h-3.5" />
              Marcar todo leído
            </button>
          )}
        </div>
      </div>

      <div className="px-5 mt-6 space-y-3 pb-4">
        {notifications.map((notif, i) => {
          const cfg = kindConfig[notif.kind];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-[20px] p-4 border shadow-sm flex gap-3 transition-all ${
                dark
                  ? !notif.read
                    ? "border-cyan-400/20 bg-[#0D1322]"
                    : "border-slate-700 bg-[#0D1322]"
                  : !notif.read
                  ? "border-[#0F766E]/20 bg-[#F0FDFA]"
                  : "border-[#E2E8F0] bg-white"
              }`}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                <Icon className="w-5 h-5" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${dark ? "text-slate-100" : !notif.read ? "text-slate-800" : "text-slate-600"}`}>{notif.title}</p>
                  {!notif.read && <div className="w-2 h-2 bg-[#0F766E] rounded-full flex-shrink-0 mt-1" />}
                </div>
                <p className={`text-xs leading-relaxed mt-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>{notif.body}</p>
                <p className={`text-[10px] mt-1.5 ${dark ? "text-slate-500" : "text-slate-400"}`}>{notif.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
