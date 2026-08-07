import { useState, useRef, useEffect } from "react";
import { Send, Mic, Image as ImageIcon, Brain, User, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import vitalMindLogo from "../../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png";
import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const quickSuggestions = [
  "¿Cómo mejorar mi sueño?",
  "¿Qué ejercicio me recomiendas?",
  "Tengo dolor de cabeza frecuente",
  "¿Cuánta agua debo tomar?",
  "Consejos para reducir el estrés",
];

const WELCOME_MESSAGE = "Hola, soy VitalMind AI, tu asistente inteligente de salud 🧠. Puedo orientarte sobre síntomas, hábitos saludables y bienestar. ¿En qué te puedo ayudar hoy?";

export function ChatbotScreen() {
  const { dark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: WELCOME_MESSAGE, sender: "bot", timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = (text?: string) => {
    const msg = text ?? inputText;
    if (!msg.trim() || typing) return;

    const userMsg: Message = { id: Date.now(), text: msg, sender: "user", timestamp: new Date() };
    const history = messages
      .filter((m) => m.text !== WELCOME_MESSAGE)
      .map((m) => ({ role: m.sender === "user" ? ("user" as const) : ("assistant" as const), content: m.text }));

    setMessages((p) => [...p, userMsg]);
    setInputText("");
    setTyping(true);

    // Respuesta real generada por IA (Claude vía el backend), no frases fijas.
    apiRequest<{ reply: string }>("/chat/message", {
      method: "POST",
      body: JSON.stringify({ message: msg, history }),
    })
      .then((result) => {
        const botMsg: Message = { id: Date.now() + 1, text: result.reply, sender: "bot", timestamp: new Date() };
        setMessages((p) => [...p, botMsg]);
      })
      .catch((error) => {
        const errMsg: Message = {
          id: Date.now() + 1,
          text: error instanceof Error ? error.message : "No pude conectarme con el asistente de IA. Intenta de nuevo en un momento.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((p) => [...p, errMsg]);
      })
      .finally(() => setTyping(false));
  };

  return (
    <div className="h-full flex flex-col transition-colors" style={{ backgroundColor: dark ? "#070A12" : "#F8FAFC" }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-6 rounded-b-[32px]" style={{ background: "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)" }}>
        <div className="flex items-center justify-between mb-3">
          <ImageWithFallback src={vitalMindLogo} alt="VitalMind AI" className="h-8 w-auto object-contain brightness-0 invert" />
          <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-[#4ADE80] rounded-full animate-pulse" />
            <span className="text-white/80 text-xs font-medium">IA activa</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
            <Brain className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">VitalMind Chat</h1>
            <p className="text-white/70 text-xs">Tu asistente de salud inteligente</p>
          </div>
          <Sparkles className="w-5 h-5 text-[#F59E0B]" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`flex gap-2.5 max-w-[82%] ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "user" ? "bg-[#0F766E]" : "bg-[#14B8A6]"}`}>
                {msg.sender === "user" ? <User className="w-4 h-4 text-white" /> : <Brain className="w-4 h-4 text-white" />}
              </div>
              <div>
                <div className={`rounded-[20px] px-4 py-3 ${msg.sender === "user" ? "bg-[#0F766E] text-white" : dark ? "bg-[#0D1322] border border-slate-700 text-slate-200" : "bg-white border border-[#E2E8F0] text-slate-700"}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
                <p className="text-[10px] mt-1 px-2" style={{ color: dark ? "#64748B" : "#94A3B8" }}>
                  {msg.timestamp.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </motion.div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#14B8A6] flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className={`rounded-[20px] px-5 py-3.5 flex gap-1.5 ${dark ? "bg-[#0D1322] border border-slate-700" : "bg-white border border-[#E2E8F0]"}`}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                    className="w-2 h-2 bg-[#0F766E] rounded-full"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="px-5 pb-3">
          <p className="text-xs mb-2 font-medium" style={{ color: dark ? "#94A3B8" : "#94A3B8" }}>Sugerencias rápidas</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickSuggestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors ${dark ? "bg-[#0D1322] border border-slate-700 text-slate-300 hover:border-[#0F766E] hover:bg-[#111827]" : "bg-white border border-[#E2E8F0] text-slate-600 hover:border-[#0F766E] hover:bg-[#F0FDFA]"}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-5 pb-5 pt-2">
        <div className={`rounded-[24px] p-2 flex items-center gap-2 shadow-sm ${dark ? "bg-[#0D1322] border border-slate-700" : "bg-white border border-[#E2E8F0]"}`}>
          <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dark ? "bg-[#090D16] text-slate-500 hover:text-slate-300" : "bg-[#F8FAFC] text-slate-400 hover:text-slate-600"}`}>
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 bg-transparent px-2 py-2 focus:outline-none text-sm"
            style={{ color: dark ? "#F8FAFC" : "#0F172A" }}
          />
          <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${dark ? "bg-[#090D16] text-slate-500 hover:text-slate-300" : "bg-[#F8FAFC] text-slate-400 hover:text-slate-600"}`}>
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="w-10 h-10 bg-[#0F766E] text-white rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
