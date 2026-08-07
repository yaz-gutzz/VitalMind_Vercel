import { Send } from "lucide-react";
import { useState } from "react";
import imgDoctor from "figma:asset/d620d0cd49578a557c096c38db34a7e3cc732e52.png";

export function MedicalChatWidget() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      console.log("Enviando mensaje:", message);
      setMessage("");
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h3 className="mb-3">Chat de apoyo Médico</h3>
      
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-white flex items-center justify-center">
          <img src={imgDoctor} alt="Doctor" className="w-8 h-8 object-contain" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">¿Cómo puedo ayudarte?</p>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe una respuesta..."
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1742a1]/20"
        />
        <button
          onClick={handleSend}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1742a1] hover:opacity-70 transition-opacity"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
