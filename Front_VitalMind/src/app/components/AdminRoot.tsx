import { Outlet, useLocation, useNavigate, Navigate } from "react-router";
import { LayoutDashboard, Users, BarChart2, Bell, Settings, LogOut, Sun, Moon, Shield } from "lucide-react";
import { Toaster } from "sonner";
import { AdminThemeProvider, useAdminTheme } from "./admin/AdminThemeContext";
import { getSession, clearSession } from "../lib/session";
import { useSessionTimeout } from "../hooks/useSessionTimeout";

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Usuarios", path: "/admin/users" },
  { icon: BarChart2, label: "Reportes", path: "/admin/reports" },
  { icon: Bell, label: "Notifs.", path: "/admin/notifications" },
  { icon: Settings, label: "Config.", path: "/admin/settings" },
];

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useAdminTheme();

  useSessionTimeout({
    enabled: true,
    routeKey: location.pathname,
    onExpire: () => navigate("/auth", { replace: true }),
  });

  const bg = dark ? "#070A12" : "#F8FAFC";
  const panelBg = dark ? "#090D16" : "#FFFFFF";
  const panelBorder = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const text = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#9CA3AF" : "#64748B";
  const activeColor = "#14B8A6";
  const inactiveColor = dark ? "#7C8798" : "#64748B";

  const goTo = (path: string) => navigate(path);

  return (
    <div className="min-h-screen vm-shell" style={{ backgroundColor: bg }}>
      <Toaster position="top-center" richColors />

      {/* Desktop layout */}
      <div className="hidden lg:grid min-h-screen lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside
          className="flex flex-col border-r p-6"
          style={{ backgroundColor: panelBg, borderColor: panelBorder }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ backgroundColor: activeColor + "20" }}>
              <Shield className="w-6 h-6" style={{ color: activeColor }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: text }}>VitalMind AI</p>
              <p className="text-xs" style={{ color: muted }}>Panel de administración</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  className="relative w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all hover:translate-x-0.5 hover:bg-white/5"
                  style={{
                    backgroundColor: isActive ? activeColor + "15" : "transparent",
                    color: isActive ? activeColor : text,
                  }}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full" style={{ backgroundColor: activeColor }} />
                  )}
                  <Icon className="w-5 h-5" style={{ color: isActive ? activeColor : inactiveColor }} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 space-y-3">
            <button
              onClick={toggle}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
              style={{ backgroundColor: dark ? "rgba(255,255,255,0.045)" : "#F8FAFC", color: text, border: `1px solid ${panelBorder}` }}
            >
              {dark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="text-sm font-medium">{dark ? "Modo oscuro" : "Modo claro"}</span>
            </button>

            <button
              onClick={() => {
                clearSession();
                navigate("/auth", { replace: true });
              }}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
              style={{ backgroundColor: dark ? "rgba(255,255,255,0.045)" : "#F8FAFC", color: text, border: `1px solid ${panelBorder}` }}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>
          </div>
        </aside>

        <main className="overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden min-h-screen">
        <header
          className="sticky top-0 z-20 flex items-center justify-between border-b px-4 py-3"
          style={{ backgroundColor: panelBg, borderColor: panelBorder }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: activeColor + "20" }}>
              <Shield className="w-5 h-5" style={{ color: activeColor }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: text }}>Admin</p>
              <p className="text-xs" style={{ color: muted }}>Vista web</p>
            </div>
          </div>

          <button
            onClick={toggle}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: dark ? "#111827" : "#F8FAFC", border: `1px solid ${panelBorder}` }}
          >
            {dark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </header>

        <div className="pb-20">
          <Outlet />
        </div>

        <nav
          className="fixed bottom-0 left-0 right-0 z-30 border-t"
          style={{ backgroundColor: panelBg, borderColor: panelBorder }}
        >
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => goTo(item.path)}
                  className="flex flex-col items-center justify-center rounded-2xl py-2 transition-all"
                  style={{ backgroundColor: isActive ? activeColor + "15" : "transparent" }}
                >
                  <Icon className="w-5 h-5" style={{ color: isActive ? activeColor : inactiveColor }} />
                  <span className="mt-1 text-[10px] font-medium" style={{ color: isActive ? activeColor : inactiveColor }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export function AdminRoot() {
  const session = getSession();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (session.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AdminThemeProvider>
      <AdminLayout />
    </AdminThemeProvider>
  );
}
