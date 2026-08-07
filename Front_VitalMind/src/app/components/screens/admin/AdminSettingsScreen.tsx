import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, Shield, Globe, Database, Bell, LogOut, Server, ChevronRight, Sun, Moon, Download, RefreshCw } from "lucide-react";
import { useAdminTheme } from "../../admin/AdminThemeContext";
import { toast } from "sonner";

export function AdminSettingsScreen() {
  const navigate = useNavigate();
  const { dark, toggle } = useAdminTheme();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [exporting, setExporting] = useState(false);

  const bg = dark ? "#070A12" : "#F1F5F9";
  const card = dark ? "#0D1322" : "#FFFFFF";
  const border = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const text = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#9CA3AF" : "#64748B";
  const accent = "#14B8A6";

  const handleMaintenance = () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    toast[next ? "warning" : "success"](
      next ? "Modo mantenimiento activado" : "Modo mantenimiento desactivado",
      { description: next ? "Los usuarios verán la pantalla de mantenimiento." : "La app está disponible para todos." }
    );
  };

  const handleExport = async () => {
    setExporting(true);
    await new Promise((r) => setTimeout(r, 2000));
    // Simulate CSV download
    const csv = "id,nombre,email,estado\n1,María García,maria@email.com,activo\n2,Carlos Rodríguez,carlos@email.com,activo";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vitalmind_usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
    toast.success("Base de datos exportada", { description: "Archivo CSV descargado exitosamente." });
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast.success("Sesión de administrador cerrada");
    navigate("/auth");
  };

  const Toggle = ({ value, onChange, color = accent }: { value: boolean; onChange: () => void; color?: string }) => (
    <button
      onClick={onChange}
      className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
      style={{ backgroundColor: value ? color : dark ? "rgba(255,255,255,0.1)" : "#CBD5E1" }}
    >
      <div
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
        style={{ left: value ? "calc(100% - 20px)" : "4px" }}
      />
    </button>
  );

  const sections = [
    {
      title: "Sistema",
      items: [
        { icon: Server, label: "Modo mantenimiento", sub: "Muestra pantalla de mantenimiento a usuarios", type: "toggle", value: maintenanceMode, onChange: handleMaintenance, color: "#EF4444" },
        { icon: Database, label: "Modo depuración", sub: "Registros detallados del servidor", type: "toggle", value: debugMode, onChange: () => { setDebugMode(!debugMode); toast.info(debugMode ? "Depuración desactivada" : "Depuración activada"); }, color: "#F59E0B" },
      ],
    },
    {
      title: "Funcionalidades",
      items: [
        { icon: Shield, label: "Chatbot IA activo", sub: "Permite consultas al asistente IA", type: "toggle", value: aiEnabled, onChange: () => { setAiEnabled(!aiEnabled); toast.success(aiEnabled ? "IA desactivada" : "IA activada"); }, color: "#0F766E" },
        { icon: Bell, label: "Push notifications", sub: "Envío de notificaciones push", type: "toggle", value: pushEnabled, onChange: () => { setPushEnabled(!pushEnabled); toast.success(pushEnabled ? "Push desactivado" : "Push activado"); }, color: "#2563EB" },
      ],
    },
  ];

  return (
    <div className="min-h-full overflow-y-auto" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8 xl:px-10 pt-8 lg:pt-10 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/admin/dashboard")} style={{ color: muted }}>
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: text }}>Configuración</h1>
            <p className="text-xs" style={{ color: muted }}>Parámetros del sistema</p>
          </div>
        </div>
      </div>

      {/* Version card */}
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8 xl:px-10 mb-5">
      <div className="rounded-[20px] p-4 lg:p-5 border flex items-center gap-3" style={{ backgroundColor: card, borderColor: border }}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0F766E, #2563EB)" }}>
          <Shield size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: text }}>VitalMind AI Admin</p>
          <p className="text-xs" style={{ color: muted }}>v1.0.0 · Producción</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse" />
          <span className="text-[#22C55E] text-xs font-semibold">Online</span>
        </div>
      </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-5 lg:px-8 xl:px-10 grid grid-cols-1 xl:grid-cols-2 gap-5 pb-24 lg:pb-10">
        {/* Theme toggle */}
        <div className="rounded-[20px] p-4 border flex items-center gap-3 xl:col-span-2" style={{ backgroundColor: card, borderColor: border }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: dark ? "#F59E0B20" : "#6366F120" }}>
            {dark ? <Sun size={18} style={{ color: "#F59E0B" }} /> : <Moon size={18} style={{ color: "#6366F1" }} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: text }}>{dark ? "Modo oscuro activo" : "Modo claro activo"}</p>
            <p className="text-xs" style={{ color: muted }}>Cambiar tema del panel</p>
          </div>
          <Toggle value={dark} onChange={toggle} color={dark ? "#F59E0B" : "#6366F1"} />
        </div>

        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5 px-1" style={{ color: muted }}>{section.title}</p>
            <div className="rounded-[20px] border overflow-hidden" style={{ backgroundColor: card, borderColor: border }}>
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 p-4 ${i < section.items.length - 1 ? "border-b" : ""}`}
                    style={{ borderColor: border }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + "20" }}>
                      <Icon size={17} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: text }}>{item.label}</p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: muted }}>{item.sub}</p>
                    </div>
                    <Toggle value={item.value} onChange={item.onChange} color={item.color} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Data management */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2.5 px-1" style={{ color: muted }}>Datos</p>
          <div className="space-y-2.5">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center gap-3 p-4 rounded-[20px] border active:scale-95 transition-all disabled:opacity-70"
              style={{ backgroundColor: card, borderColor: border }}
            >
              {exporting ? <RefreshCw size={18} style={{ color: "#22C55E" }} className="animate-spin" /> : <Download size={18} style={{ color: "#22C55E" }} />}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium" style={{ color: text }}>{exporting ? "Exportando..." : "Exportar usuarios (CSV)"}</p>
                <p className="text-xs" style={{ color: muted }}>Descarga un backup completo</p>
              </div>
              {!exporting && <ChevronRight size={16} style={{ color: muted }} />}
            </button>

            <button
              onClick={() => {
                toast.promise(new Promise((r) => setTimeout(r, 1500)), {
                  loading: "Ejecutando auditoría...",
                  success: "Sin vulnerabilidades detectadas",
                  error: "Error en auditoría",
                });
              }}
              className="w-full flex items-center gap-3 p-4 rounded-[20px] border active:scale-95 transition-all"
              style={{ backgroundColor: card, borderColor: border }}
            >
              <Shield size={18} style={{ color: "#8B5CF6" }} />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium" style={{ color: text }}>Auditoría de seguridad</p>
                <p className="text-xs" style={{ color: muted }}>Verificar logs de acceso</p>
              </div>
              <ChevronRight size={16} style={{ color: muted }} />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-[20px] font-semibold text-sm active:scale-95 transition-all xl:col-span-2"
          style={{ backgroundColor: "#EF444415", border: "1px solid #EF444430", color: "#EF4444" }}
        >
          <LogOut size={18} />
          Cerrar sesión de administrador
        </button>
      </div>
    </div>
  );
}
