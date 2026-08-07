import { Outlet, useLocation, useNavigate } from "react-router";
import { Home, BarChart2, ClipboardList, Brain, User, Sun, Moon, LogOut, Settings, Bell } from "lucide-react";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import vitalMindLogo from "../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";

const navItems = [
  { icon: Home,          label: "Inicio",   path: "/dashboard" },
  { icon: BarChart2,     label: "Resumen",  path: "/resumen" },
  { icon: ClipboardList, label: "Registro", path: "/registro" },
  { icon: Brain,         label: "IA",       path: "/ia" },
  { icon: User,          label: "Perfil",   path: "/profile" },
];

const hideNavPaths = ["/", "/splash", "/onboarding", "/auth"];

function isActive(current: string, path: string) {
  return (
    current === path ||
    (path === "/dashboard" && current.startsWith("/medical-history")) ||
    (path === "/resumen"   && current === "/graficas") ||
    (path === "/registro"  && current === "/habitos") ||
    (path === "/ia"        && (current === "/notificaciones" || current === "/chatbot"))
  );
}

function getDisplayName() {
  const storedName = localStorage.getItem("userName")?.trim();
  if (storedName) return storedName;

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      const name = parsed?.name || parsed?.nombre || parsed?.fullName;
      if (typeof name === "string" && name.trim()) return name.trim();
    } catch {
      return "Usuario";
    }
  }

  return "Usuario";
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length || name === "Usuario") return "U";
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

function RootContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const showNav = !hideNavPaths.includes(location.pathname);
  const displayName = getDisplayName();
  const initials = getInitials(displayName);

  useEffect(() => {
    const authenticated = localStorage.getItem("isAuthenticated");
    if (["/", "/splash", "/onboarding"].includes(location.pathname)) return;
    if (!authenticated && location.pathname !== "/auth") navigate("/auth");
    else if (authenticated && location.pathname === "/") navigate("/dashboard");
  }, [location.pathname, navigate]);

  /* ── colour tokens ─────────────────────────────────────── */
  const frameBg      = dark ? "#070A12" : "#F8FAFC";
  const navBg        = dark ? "#090D16" : "#FFFFFF";
  const navBorder    = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const iconActive   = "#14B8A6";
  const iconInactive = dark ? "#7C8798" : "#64748B";
  const textPrimary  = dark ? "#F8FAFC" : "#0F172A";
  const textMuted    = dark ? "#9CA3AF" : "#64748B";

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/auth");
  };

  return (
    /*
     * Single unified layout — sidebar hidden on mobile, bottom-nav hidden on desktop.
     * <Outlet /> is rendered ONCE so charts always have real dimensions.
     */
    <div
      className="flex h-[100dvh] overflow-hidden vm-shell"
      style={{ backgroundColor: frameBg }}
    >
      <Toaster position="top-center" richColors />

      {/* ── Sidebar (desktop only) ─────────────────────────── */}
      {showNav && (
        <aside
          className="hidden md:flex flex-col w-64 xl:w-72 flex-shrink-0 h-full border-r"
          style={{ backgroundColor: navBg, borderColor: navBorder }}
        >
          {/* Logo */}
          <div className="px-5 py-6 border-b flex-shrink-0" style={{ borderColor: navBorder }}>
            <ImageWithFallback
              src={vitalMindLogo}
              alt="VitalMind AI"
              className="h-10 w-auto object-contain"
              style={dark ? { filter: "brightness(0) invert(1) opacity(0.92)" } : {}}
            />
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3 mt-2" style={{ color: textMuted }}>
              Menú principal
            </p>
            {navItems.map(({ icon: Icon, label, path }) => {
              const active = isActive(location.pathname, path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="group relative w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all text-left hover:translate-x-0.5 hover:bg-white/5"
                  style={{
                    backgroundColor: active ? "rgba(20,184,166,0.12)" : "transparent",
                    color: active ? iconActive : iconInactive,
                  }}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full" style={{ backgroundColor: iconActive }} />
                  )}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ backgroundColor: active ? "rgba(20,184,166,0.18)" : dark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}

            <div className="h-px mx-3 my-3" style={{ backgroundColor: navBorder }} />
            <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: textMuted }}>
              Herramientas
            </p>

            {[
              { icon: Bell,     label: "Notificaciones", path: "/notificaciones" },
              { icon: Settings, label: "Chatbot IA",     path: "/chatbot" },
            ].map(({ icon: Icon, label, path }) => {
              const active = isActive(location.pathname, path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="group relative w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all text-left hover:translate-x-0.5 hover:bg-white/5"
                  style={{ backgroundColor: active ? "rgba(20,184,166,0.12)" : "transparent", color: active ? iconActive : iconInactive }}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full" style={{ backgroundColor: iconActive }} />
                  )}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: active ? "rgba(20,184,166,0.18)" : dark ? "rgba(255,255,255,0.03)" : "#F8FAFC" }}>
                    <Icon size={18} />
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t flex-shrink-0 space-y-2" style={{ borderColor: navBorder }}>
            <button
              onClick={toggle}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all text-left hover:bg-white/5"
            >
              {dark
                ? <Sun size={16} style={{ color: "#F59E0B" }} />
                : <Moon size={16} style={{ color: "#6366F1" }} />}
              <span className="text-sm font-medium" style={{ color: textPrimary }}>
                {dark ? "Modo claro" : "Modo oscuro"}
              </span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all text-left hover:bg-red-500/10"
              style={{ color: "#EF4444" }}
            >
              <LogOut size={16} />
              <span className="text-sm font-medium">Cerrar sesión</span>
            </button>

            <div
              className="flex items-center gap-3 px-3 py-3 rounded-2xl mt-1"
              style={{ backgroundColor: dark ? "rgba(255,255,255,0.045)" : "#F8FAFC", border: `1px solid ${navBorder}` }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white ring-2 ring-white/10"
                style={{ background: "linear-gradient(135deg, #14B8A6, #2563EB)" }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: textPrimary }}>{displayName}</p>
                <p className="text-[10px] truncate" style={{ color: textMuted }}>Mi perfil</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ── Main content (single Outlet render) ────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Scrollable area — pad bottom on mobile for bottom nav */}
        <div
          className={`flex-1 overflow-y-auto overscroll-contain min-h-0 ${showNav ? "pb-[72px] md:pb-0" : ""}`}
        >
          {/* On desktop, cap width and centre; on mobile, full width */}
          <div className="min-h-full w-full md:max-w-[1440px] 2xl:max-w-[1600px] md:mx-auto">
            <Outlet />
          </div>
        </div>

        {/* ── Bottom nav (mobile only) ───────────────────────── */}
        {showNav && (
          <nav
            className="md:hidden flex-shrink-0 border-t flex items-center justify-around px-1 py-2 z-40"
            style={{ backgroundColor: navBg, borderColor: navBorder }}
          >
            {navItems.map(({ icon: Icon, label, path }) => {
              const active = isActive(location.pathname, path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all min-w-[56px]"
                >
                  <div className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all ${active ? "bg-[#0F766E]/10" : ""}`}>
                    <Icon size={20} style={{ color: active ? iconActive : iconInactive }} />
                  </div>
                  <span className="text-[10px] font-medium mt-0.5" style={{ color: active ? iconActive : iconInactive }}>
                    {label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}

export function Root() {
  return (
    <ThemeProvider>
      <RootContent />
    </ThemeProvider>
  );
}
