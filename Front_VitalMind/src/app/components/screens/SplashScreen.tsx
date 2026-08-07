import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { useTheme } from "../ThemeContext";
import vitalMindLogo from "../../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";
import mediTechLogo from "../../../imports/image_1.png";

export function SplashScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");
    if (isAuthenticated) navigate(userRole === "admin" ? "/admin/dashboard" : "/dashboard");
    else navigate("/onboarding");
  };

  return (
    <div className={`h-full flex flex-col relative overflow-hidden ${dark ? "bg-[#070A12]" : "bg-white"}`}>
      {/* Soft background wash */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 left-0 right-0 h-[55%] ${dark ? "bg-gradient-to-b from-[#07131B] to-[#070A12]" : "bg-gradient-to-b from-[#F0FDFA] to-white"}`} />
        <div className={`absolute top-[-120px] right-[-80px] w-72 h-72 rounded-full ${dark ? "bg-[#0F766E]/10" : "bg-[#0F766E]/6"}`} />
        <div className={`absolute top-[30%] left-[-60px] w-48 h-48 rounded-full ${dark ? "bg-[#2563EB]/10" : "bg-[#2563EB]/5"}`} />
        <div className={`absolute bottom-[15%] right-[-40px] w-36 h-36 rounded-full ${dark ? "bg-[#14B8A6]/12" : "bg-[#14B8A6]/8"}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.35 }}
          className="mb-6"
        >
          <ImageWithFallback
            src={vitalMindLogo}
            alt="VitalMind AI"
            className="w-52 h-auto object-contain"
          />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mb-3"
        >
          <p className={`text-base font-medium ${dark ? "text-slate-300" : "text-slate-500"}`}>Tu salud inteligente, siempre contigo</p>
        </motion.div>

        {/* Descriptor pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex gap-2 flex-wrap justify-center mb-12"
        >
          {["Historial médico", "IA personalizada", "Hábitos saludables"].map((tag) => (
            <span key={tag} className={`text-xs font-medium px-3 py-1 rounded-full ${dark ? "text-[#8BE9D6] bg-white/5 border border-white/10" : "text-[#0F766E] bg-[#F0FDFA] border border-[#0F766E]/20"}`}>
              {tag}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 16 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-[300px]"
        >
          <button
            onClick={handleStart}
            className="w-full text-white font-semibold text-base py-4 rounded-2xl active:scale-95 transition-all"
            style={{
              background: "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)",
              boxShadow: "0 10px 32px rgba(15,118,110,0.28)",
            }}
          >
            Comenzar
          </button>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showButton ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="flex gap-2 mt-10"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"
            />
          ))}
        </motion.div>
      </div>

      {/* MediTech footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="relative z-10 pb-8 flex flex-col items-center gap-2"
      >
        <p className={`text-[10px] font-medium uppercase tracking-widest ${dark ? "text-slate-500" : "text-slate-300"}`}>Desarrollado por</p>
        <ImageWithFallback
          src={mediTechLogo}
          alt="MediTech"
          className={`h-7 w-auto object-contain ${dark ? "opacity-60" : "opacity-70"}`}
        />
      </motion.div>
    </div>
  );
}
