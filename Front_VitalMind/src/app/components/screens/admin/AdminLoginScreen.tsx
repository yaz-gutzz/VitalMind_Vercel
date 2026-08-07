import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import vitalMindLogo from "../../../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";
import mediTechLogo from "../../../../imports/image_1.png";
import { apiRequest, setSession } from "../../../lib/api";

export function AdminLoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }
    try {
      const result = await apiRequest<{ token: string; user: { name: string; role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (result.user.role !== "admin") {
        setError("No tienes permisos de administrador");
        return;
      }

      setSession(result.token, result.user.name, result.user.role);
      localStorage.setItem("isAdmin", "true");
      toast.success("Bienvenido al panel de administración");
      navigate("/admin/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Credenciales incorrectas");
    }
  };

  return (
    <div className="h-full bg-[#0F172A] flex flex-col overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] right-[-100px] w-80 h-80 rounded-full bg-[#0F766E]/10" />
        <div className="absolute bottom-[-80px] left-[-60px] w-60 h-60 rounded-full bg-[#2563EB]/10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-8 text-center"
        >
          <ImageWithFallback
            src={vitalMindLogo}
            alt="VitalMind AI"
            className="h-20 w-auto object-contain mx-auto mb-4"
          />
          <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <Shield className="w-3.5 h-3.5 text-[#14B8A6]" />
            <p className="text-slate-400 text-xs font-medium">Panel Administrativo · Acceso restringido</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full space-y-4"
        >
          {error && (
            <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-[14px] px-4 py-3">
              <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0" />
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="email"
              placeholder="Correo administrativo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[16px] pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#0F766E] text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full bg-white/5 border border-white/10 rounded-[16px] pl-12 pr-12 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#0F766E] text-sm"
            />
            <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showPass ? <EyeOff className="w-5 h-5 text-slate-500" /> : <Eye className="w-5 h-5 text-slate-500" />}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-[#0F766E] to-[#14B8A6] text-white font-semibold py-4 rounded-[20px] mt-2 active:scale-95 transition-all text-base"
            style={{ boxShadow: "0 8px 32px rgba(15,118,110,0.4)" }}
          >
            Ingresar al panel
          </button>

          <button
            onClick={() => navigate("/auth")}
            className="w-full text-slate-500 text-sm py-2"
          >
            ← Volver a la aplicación
          </button>

          <div className="bg-white/5 border border-white/10 rounded-[14px] p-3 mt-2">
            <p className="text-slate-500 text-xs text-center">Demo: admin@vitalmind.com / Admin123!</p>
          </div>
        </motion.div>
      </div>

      {/* MediTech footer */}
      <div className="relative z-10 pb-8 flex flex-col items-center gap-1.5">
        <p className="text-slate-600 text-[10px] uppercase tracking-widest font-medium">Desarrollado por</p>
        <ImageWithFallback src={mediTechLogo} alt="MediTech" className="h-6 w-auto object-contain opacity-40" />
      </div>
    </div>
  );
}
