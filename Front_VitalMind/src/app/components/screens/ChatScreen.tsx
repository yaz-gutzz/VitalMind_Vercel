import { useState, useRef, useEffect } from "react";
import { StatusBar } from "../StatusBar";
import { TabBar } from "../TabBar";
import { Send, Bot, User as UserIcon, Pill, Calendar, Activity, Sparkles } from "lucide-react";

interface ChatScreenProps {
  userName: string;
  onNavigate: (screen: string) => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'doctor';
  time: string;
  suggestions?: string[];
}

export function ChatScreen({ userName, onNavigate }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `¡Hola ${userName}! 👋 Soy tu asistente médico virtual de MedAlert+. ¿En qué puedo ayudarte hoy?`,
      sender: 'doctor',
      time: '10:30 AM',
      suggestions: [
        '¿Cuándo tomar mis medicamentos?',
        'Agregar nuevo medicamento',
        'Ver mi adherencia'
      ]
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getContextualResponse = (userMessage: string) => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Horarios y tomas
    if (lowerMsg.includes('horario') || lowerMsg.includes('cuándo') || lowerMsg.includes('tomar')) {
      return {
        text: "📋 Tus próximos medicamentos son:\n\n• Omeprazol - 12:00 PM (20mg)\n• Paracetamol - 3:00 PM (500mg)\n• Vitamina C - 9:00 PM (1000mg)\n\n¿Necesitas posponer algún recordatorio?",
        suggestions: ['Ver calendario completo', 'Posponer recordatorio', 'Marcar como tomado']
      };
    } 
    // Agregar medicamentos
    else if (lowerMsg.includes('agregar') || lowerMsg.includes('nuevo') || lowerMsg.includes('añadir')) {
      return {
        text: "➕ Para agregar un nuevo medicamento:\n\n1. Ve a la pantalla de Inicio\n2. Toca el botón '+' al final de la lista\n3. Completa los datos del medicamento\n\n¿Necesitas ayuda con la dosificación?",
        suggestions: ['Ir a inicio', 'Explicar dosificación', '¿Cómo registrar frecuencia?']
      };
    } 
    // Adherencia
    else if (lowerMsg.includes('adherencia') || lowerMsg.includes('seguimiento') || lowerMsg.includes('estadística')) {
      return {
        text: "📊 Tu adherencia esta semana es del 92% - ¡Excelente trabajo!\n\nHas tomado 13 de 14 dosis programadas.\n\n✅ Mejor día: Viernes (100%)\n⚠️ Día a mejorar: Miércoles (75%)\n\n¿Te gustaría ver el historial completo?",
        suggestions: ['Ver historial completo', 'Consejos para mejorar', 'Exportar datos']
      };
    } 
    // Stock e inventario
    else if (lowerMsg.includes('stock') || lowerMsg.includes('inventario') || lowerMsg.includes('cuánto')) {
      return {
        text: "📦 Tu stock actual:\n\n✅ Paracetamol: 8 unidades\n✅ Omeprazol: 10 unidades\n⚠️ Vitamina C: 2 unidades (Bajo)\n✅ Ibuprofeno: 5 unidades\n\n💡 Te recomiendo reabastecer la Vitamina C pronto.",
        suggestions: ['Gestionar stock', 'Recordatorio de compra', 'Ver farmacia cercana']
      };
    } 
    // Dolor y síntomas
    else if (lowerMsg.includes('dolor') || lowerMsg.includes('síntoma') || lowerMsg.includes('malestar')) {
      return {
        text: "🩺 Si experimentas dolor o síntomas nuevos:\n\n1. Anota el síntoma y su intensidad\n2. No te automediques\n3. Consulta con tu médico\n\n⚠️ Si es urgente, busca atención médica inmediata.\n\n¿Es urgente tu situación?",
        suggestions: ['No es urgente', 'Necesito atención', 'Registrar síntoma']
      };
    } 
    // Olvido de medicamentos
    else if (lowerMsg.includes('olvid') || lowerMsg.includes('olvidé') || lowerMsg.includes('perdí')) {
      return {
        text: "⏰ Si olvidaste tomar una dosis:\n\n• Menos de 2 horas: Tómala ahora\n• Casi hora de la siguiente: Omítela\n• ⚠️ Nunca dobles la dosis\n\n¿Qué medicamento olvidaste tomar?",
        suggestions: ['Paracetamol', 'Omeprazol', 'Vitamina C', 'Ver recordatorios']
      };
    }
    // Efectos secundarios
    else if (lowerMsg.includes('efecto') || lowerMsg.includes('reacción') || lowerMsg.includes('secundario')) {
      return {
        text: "⚕️ Sobre efectos secundarios:\n\n• Lee siempre el prospecto\n• Reporta efectos inusuales a tu médico\n• No suspendas sin consultar\n\n¿Experimentas algún efecto secundario ahora?",
        suggestions: ['Sí, tengo efectos', 'Solo pregunto', 'Ver prospecto']
      };
    }
    // Interacciones
    else if (lowerMsg.includes('interacción') || lowerMsg.includes('combinar') || lowerMsg.includes('juntos')) {
      return {
        text: "⚗️ Sobre interacciones medicamentosas:\n\n• Consulta siempre con tu médico\n• Informa todos los medicamentos que tomas\n• Incluye suplementos y vitaminas\n\n¿Necesitas información sobre algún medicamento específico?",
        suggestions: ['Lista de medicamentos', 'Consultar médico', 'Ver perfil']
      };
    }
    // Recordatorios
    else if (lowerMsg.includes('recordatorio') || lowerMsg.includes('alarma') || lowerMsg.includes('notificación')) {
      return {
        text: "🔔 Sobre recordatorios:\n\n• Los recordatorios se envían automáticamente\n• Puedes posponerlos por 15 minutos\n• Configúralos en Ajustes\n\n¿Necesitas modificar tus recordatorios?",
        suggestions: ['Ver recordatorios', 'Ir a ajustes', 'Posponer actual']
      };
    }
    // Exportar datos
    else if (lowerMsg.includes('export') || lowerMsg.includes('descargar') || lowerMsg.includes('guardar')) {
      return {
        text: "💾 Para exportar tu historial:\n\n1. Ve a Actividades\n2. Toca 'Historial'\n3. Presiona el botón 'Exportar'\n\nSe descargará un archivo CSV con todos tus datos.",
        suggestions: ['Ir a historial', 'Ver actividades', '¿Qué incluye el CSV?']
      };
    }
    // Ayuda general
    else if (lowerMsg.includes('ayuda') || lowerMsg.includes('cómo') || lowerMsg.includes('usar')) {
      return {
        text: "🎯 Puedo ayudarte con:\n\n✅ Recordatorios de medicamentos\n✅ Información sobre tratamientos\n✅ Gestión de stock e inventario\n✅ Seguimiento de adherencia\n✅ Exportar historial médico\n\n¿Qué necesitas saber?",
        suggestions: ['Ver medicamentos', 'Ver recordatorios', 'Consultar stock']
      };
    }
    // Saludos
    else if (lowerMsg.includes('hola') || lowerMsg.includes('buenos') || lowerMsg.includes('buenas')) {
      return {
        text: `¡Hola de nuevo, ${userName}! 😊\n\n¿En qué puedo ayudarte hoy?`,
        suggestions: ['Ver horarios', 'Mi adherencia', 'Gestionar stock']
      };
    }
    // Agradecimientos
    else if (lowerMsg.includes('gracias') || lowerMsg.includes('perfecto') || lowerMsg.includes('excelente')) {
      return {
        text: "¡De nada! 😊 Estoy aquí para ayudarte.\n\n¿Hay algo más en lo que pueda asistirte?",
        suggestions: ['Ver recordatorios', 'Ver medicamentos', 'No, gracias']
      };
    }
    // Respuesta por defecto
    else {
      const responses = [
        {
          text: "💡 Puedo ayudarte con:\n\n• Recordatorios de medicamentos\n• Información sobre tu tratamiento\n• Gestión de stock\n• Seguimiento de adherencia\n\n¿Qué necesitas?",
          suggestions: ['Ver medicamentos', 'Ver recordatorios', 'Consultar stock']
        },
        {
          text: "🤔 No estoy seguro de entender. Pero puedo ayudarte con:\n\n• Horarios de medicamentos\n• Estadísticas de adherencia\n• Gestión de inventario\n\n¿Sobre qué quieres saber?",
          suggestions: ['Efectos secundarios', 'Interacciones', 'Horarios']
        },
        {
          text: "Entiendo. ¿Hay algo específico sobre tus medicamentos que quieras saber?\n\nPuedo ayudarte con horarios, stock, recordatorios y más.",
          suggestions: ['Ver horarios', 'Gestionar stock', 'Mi adherencia']
        }
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputMessage;
    if (messageText.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: messageText,
        sender: 'user',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputMessage("");
      
      // Show typing indicator
      setIsTyping(true);
      
      // Simulate doctor response after 1 second
      setTimeout(() => {
        setIsTyping(false);
        const response = getContextualResponse(messageText);
        const doctorResponse: Message = {
          id: messages.length + 2,
          text: response.text,
          sender: 'doctor',
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          suggestions: response.suggestions
        };
        setMessages(prev => [...prev, doctorResponse]);
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === 'Ver calendario completo' || suggestion === 'Ver recordatorios') {
      onNavigate('calendar');
    } else if (suggestion === 'Ir a inicio' || suggestion === 'Ver medicamentos') {
      onNavigate('home');
    } else if (suggestion === 'Ver historial completo' || suggestion === 'Ir a historial' || suggestion === 'Ver actividades') {
      onNavigate('activity');
    } else if (suggestion === 'Gestionar stock') {
      onNavigate('home');
    } else if (suggestion === 'Ir a ajustes' || suggestion === 'Ver perfil') {
      onNavigate('profile');
    } else if (suggestion === 'No, gracias') {
      // Do nothing
    } else {
      handleSend(suggestion);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="max-w-[375px] mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2>Asistente Médico</h2>
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-sm opacity-90">En línea • Responde al instante</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[375px] mx-auto w-full flex-1 flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div
                className={`flex items-start gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' ? 'bg-primary' : 'bg-secondary'
                }`}>
                  {message.sender === 'user' ? (
                    <UserIcon className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-card border border-border rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">{message.time}</span>
                </div>
              </div>
              
              {/* Suggestions */}
              {message.suggestions && message.sender === 'doctor' && (
                <div className={`flex flex-wrap gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ml-10`}>
                  {message.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-secondary">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors whitespace-nowrap text-sm"
            >
              <Pill className="w-4 h-4 text-primary" />
              Medicamentos
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors whitespace-nowrap text-sm"
            >
              <Calendar className="w-4 h-4 text-secondary" />
              Recordatorios
            </button>
            <button
              onClick={() => onNavigate('activity')}
              className="flex items-center gap-1 px-3 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors whitespace-nowrap text-sm"
            >
              <Activity className="w-4 h-4 text-blue-500" />
              Historial
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="px-4 pb-6 bg-background border-t border-border">
          <div className="mt-4 bg-card border border-border rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMessage.trim()}
              className="w-8 h-8 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      <TabBar activeTab="favorites" onTabChange={onNavigate} />
    </div>
  );
}
