import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Mail, Lock, User, Eye, EyeOff, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { useTheme } from "../ThemeContext";
import vitalMindLogo from "../../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";
import mediTechLogo from "../../../imports/image_1.png";
import { apiRequest, setSession } from "../../lib/api";

export function AuthScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "", email: "", age: "", sex: "", weight: "", height: "", password: "", confirmPassword: "",
  });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) { toast.error("Completa todos los campos"); return; }
    try {
      const result = await apiRequest<{ token: string; user: { name: string; role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      });
      setSession(result.token, result.user.name, result.user.role);
      toast.success("Bienvenido a VitalMind AI");
      navigate(result.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión");
    }
  };

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password) { toast.error("Completa los campos obligatorios"); return; }
    if (registerForm.password !== registerForm.confirmPassword) { toast.error("Las contraseñas no coinciden"); return; }
    try {
      const result = await apiRequest<{ token: string; user: { name: string; role: string } }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          age: Number(registerForm.age) || 0,
        }),
      });
      setSession(result.token, result.user.name, result.user.role);
      toast.success("Cuenta creada exitosamente");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar");
    }
  };

  const inputClass = `w-full rounded-2xl pl-12 pr-4 py-4 text-sm shadow-sm focus:outline-none focus:border-[#0F766E] ${dark ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500" : "bg-white border-[#E2E8F0] text-slate-800 placeholder-slate-400"}`;

  return (
    <div className={`min-h-[100dvh] flex flex-col overflow-y-auto relative ${dark ? "bg-[#070A12]" : "bg-white"}`}>

      {/* ── Decorative background — identical to splash ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 h-[42%] ${dark ? "bg-gradient-to-b from-[#07131B] to-[#070A12]" : "bg-gradient-to-b from-[#F0FDFA] to-white"}`} />
        <div className={`absolute top-[-100px] right-[-70px] w-72 h-72 rounded-full ${dark ? "bg-[#0F766E]/10" : "bg-[#0F766E]/6"}`} />
        <div className={`absolute top-[18%] left-[-60px] w-52 h-52 rounded-full ${dark ? "bg-[#2563EB]/10" : "bg-[#2563EB]/5"}`} />
        <div className={`absolute bottom-[12%] right-[-40px] w-40 h-40 rounded-full ${dark ? "bg-[#14B8A6]/10" : "bg-[#14B8A6]/6"}`} />
        <div className={`absolute bottom-[30%] left-[-30px] w-28 h-28 rounded-full ${dark ? "bg-[#0F766E]/8" : "bg-[#0F766E]/4"}`} />
      </div>

      {/* ── Header with logo ── */}
      <div className="relative z-10 flex flex-col items-center pt-14 pb-6 px-6">
        <ImageWithFallback
          src={vitalMindLogo}
          alt="VitalMind AI"
          className="w-24 h-24 object-contain mb-4"
        />
        <h1 className={`text-2xl font-bold mb-1 ${dark ? "text-slate-100" : "text-slate-800"}`}>
          {tab === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
        </h1>
        <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-400"}`}>
          {tab === "login" ? "Inicia sesión para continuar" : "Únete a VitalMind AI"}
        </p>
      </div>

      {/* ── Form card ── */}
      <div className="relative z-10 flex-1 px-5 pb-6">

        {/* Tabs */}
        <div className={`flex rounded-2xl p-1 mb-5 shadow-sm ${dark ? "bg-slate-900 border border-slate-700" : "bg-white border border-[#E8F4F2]"}`}>
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                tab === t
                  ? "text-white shadow-sm"
                  : dark
                  ? "text-slate-400"
                  : "text-slate-400"
              }`}
              style={tab === t ? { background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)" } : {}}
            >
              {t === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        {/* Login form */}
        {tab === "login" && (
          <motion.div key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" placeholder="Correo electrónico" value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                className={inputClass} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type={showPass ? "text" : "password"} placeholder="Contraseña" value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full bg-white border border-[#E2E8F0] rounded-2xl pl-12 pr-12 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F766E] text-sm shadow-sm" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showPass ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </button>
            </div>

            <button className={`text-sm font-medium block text-right w-full ${dark ? "text-[#8BE9D6]" : "text-[#0F766E]"}`}>
              ¿Olvidaste tu contraseña?
            </button>

            <button onClick={handleLogin}
              className="w-full text-white font-semibold py-4 rounded-2xl active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)", boxShadow: "0 8px 24px rgba(15,118,110,0.28)" }}>
              Iniciar Sesión
            </button>


            <div className="flex items-center gap-4 pt-1">
              <div className={`flex-1 h-px ${dark ? "bg-slate-700" : "bg-[#E8F4F2]"}`} />
              <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>o continúa con</span>
              <div className={`flex-1 h-px ${dark ? "bg-slate-700" : "bg-[#E8F4F2]"}`} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium active:scale-95 transition-all shadow-sm ${dark ? "bg-slate-900 border border-slate-700 text-slate-200" : "bg-white border border-[#E2E8F0] text-slate-700"}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium active:scale-95 transition-all shadow-sm ${dark ? "bg-slate-900 border border-slate-700 text-slate-200" : "bg-white border border-[#E2E8F0] text-slate-700"}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>
          </motion.div>
        )}

        {/* Register form */}
        {tab === "register" && (
          <motion.div key="register" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }} className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" placeholder="Nombre completo" value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                className={inputClass} />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" placeholder="Correo electrónico" value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Edad" value={registerForm.age}
                onChange={(e) => setRegisterForm({ ...registerForm, age: e.target.value })}
                className={dark ? "bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0F766E] text-sm shadow-sm" : "bg-white border border-[#E2E8F0] rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F766E] text-sm shadow-sm"} />
              <div className="relative">
                <select value={registerForm.sex}
                  onChange={(e) => setRegisterForm({ ...registerForm, sex: e.target.value })}
                  className={dark ? "w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4 text-slate-100 focus:outline-none focus:border-[#0F766E] text-sm appearance-none shadow-sm" : "w-full bg-white border border-[#E2E8F0] rounded-2xl px-4 py-4 text-slate-800 focus:outline-none focus:border-[#0F766E] text-sm appearance-none shadow-sm"}>
                  <option value="">Sexo</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Peso (kg)" value={registerForm.weight}
                onChange={(e) => setRegisterForm({ ...registerForm, weight: e.target.value })}
                className={dark ? "bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0F766E] text-sm shadow-sm" : "bg-white border border-[#E2E8F0] rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F766E] text-sm shadow-sm"} />
              <input type="number" placeholder="Estatura (cm)" value={registerForm.height}
                onChange={(e) => setRegisterForm({ ...registerForm, height: e.target.value })}
                className={dark ? "bg-slate-900 border border-slate-700 rounded-2xl px-4 py-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0F766E] text-sm shadow-sm" : "bg-white border border-[#E2E8F0] rounded-2xl px-4 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F766E] text-sm shadow-sm"} />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type={showPass ? "text" : "password"} placeholder="Contraseña" value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className="w-full bg-white border border-[#E2E8F0] rounded-2xl pl-12 pr-12 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F766E] text-sm shadow-sm" />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showPass ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type={showConfirmPass ? "text" : "password"} placeholder="Confirmar contraseña" value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                className="w-full bg-white border border-[#E2E8F0] rounded-2xl pl-12 pr-12 py-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0F766E] text-sm shadow-sm" />
              <button onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2">
                {showConfirmPass ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </button>
            </div>

            <button onClick={handleRegister}
              className="w-full text-white font-semibold py-4 rounded-2xl active:scale-95 transition-all"
              style={{ background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)", boxShadow: "0 8px 24px rgba(15,118,110,0.28)" }}>
              Crear cuenta
            </button>

          </motion.div>
        )}

        {/* Footer */}
        <div className="flex flex-col items-center gap-1.5 pt-6 pb-2">
          <p className={`text-[10px] uppercase tracking-widest font-medium ${dark ? "text-slate-500" : "text-slate-300"}`}>Desarrollado por</p>
          <ImageWithFallback src={mediTechLogo} alt="MediTech" className={`h-6 w-auto object-contain ${dark ? "opacity-35" : "opacity-50"}`} />
        </div>
      </div>
    </div>
  );
}
