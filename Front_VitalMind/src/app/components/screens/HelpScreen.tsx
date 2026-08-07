import { useState } from "react";
import { StatusBar } from "../StatusBar";
import { TabBar } from "../TabBar";
import { HelpCircle, ChevronLeft, ChevronDown, ChevronUp, MessageCircle, Mail, Phone, Book } from "lucide-react";

interface HelpScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export function HelpScreen({ onNavigate, onBack }: HelpScreenProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿Cómo agrego un medicamento?",
      answer: "Ve a la pantalla de Inicio, desplázate hacia abajo hasta la sección 'Mis medicamentos' y toca el botón '+' al final de la lista. Completa el nombre, dosificación, frecuencia y hora de toma."
    },
    {
      question: "¿Cómo marco un medicamento como tomado?",
      answer: "En la pantalla de Recordatorios, verás las dosis pendientes. Toca el botón 'Tomar' en el medicamento correspondiente y confirma la acción."
    },
    {
      question: "¿Puedo editar o eliminar medicamentos?",
      answer: "Sí. En la pantalla de Inicio, toca los tres puntos (⋮) en la tarjeta del medicamento. Luego selecciona 'Editar' o 'Eliminar'."
    },
    {
      question: "¿Cómo gestiono mi stock de medicamentos?",
      answer: "Ve a la pantalla de Inicio, en la sección 'Mi Stock' toca 'Gestionar'. Desde ahí puedes aumentar, disminuir o agregar nuevos medicamentos a tu inventario."
    },
    {
      question: "¿Cómo veo mi historial de medicamentos?",
      answer: "Ve a la pestaña 'Actividades' y luego toca el botón 'Historial' en la esquina superior derecha. Ahí verás gráficos de adherencia y un registro completo."
    },
    {
      question: "¿Puedo exportar mi historial?",
      answer: "Sí. En la pantalla de Historial, toca el botón 'Exportar' en la parte superior. Se descargará un archivo CSV con todos tus datos."
    },
    {
      question: "¿Cómo uso el asistente virtual?",
      answer: "Ve a la pestaña de Chat (ícono de corazón). Escribe tu pregunta y el asistente te responderá con información útil y sugerencias."
    },
    {
      question: "¿Cómo activo el modo oscuro?",
      answer: "Ve a Configuración, busca la opción 'Modo oscuro' y activa el switch. La aplicación cambiará inmediatamente al tema oscuro."
    },
    {
      question: "¿Mis datos están seguros?",
      answer: "Esta es una aplicación de demostración. Para uso con datos médicos reales, debe implementarse con un backend seguro. Consulta nuestra Política de Privacidad para más detalles."
    },
    {
      question: "¿Qué hago si olvido tomar un medicamento?",
      answer: "Si pasaron menos de 2 horas, tómalo de inmediato. Si ya casi es hora de la siguiente dosis, omite la dosis olvidada. Nunca dobles la dosis sin consultar a tu médico."
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="max-w-[375px] mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </button>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6" />
            <h2>Ayuda y Soporte</h2>
          </div>
          <p className="text-sm opacity-90 mt-1">Estamos aquí para ayudarte</p>
        </div>
      </div>

      <div className="max-w-[375px] mx-auto px-4 pt-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('favorites')}
            className="bg-card border border-border rounded-xl p-4 hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-primary mb-2" />
            <p className="text-sm">Chat de Ayuda</p>
          </button>
          <button
            onClick={() => window.location.href = 'mailto:support@medalert.app'}
            className="bg-card border border-border rounded-xl p-4 hover:bg-muted transition-colors"
          >
            <Mail className="w-6 h-6 text-secondary mb-2" />
            <p className="text-sm">Enviar Email</p>
          </button>
        </div>

        {/* Preguntas Frecuentes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-primary" />
            <h3>Preguntas Frecuentes</h3>
          </div>
          
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors text-left"
                >
                  <span className="text-sm pr-2">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                
                {expandedFaq === index && (
                  <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground border-t border-border animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guía Rápida */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3>Guía Rápida de Uso</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary text-xs">1</div>
              <div>
                <p className="text-foreground">Agrega tus medicamentos</p>
                <p className="text-xs">Registra todos tus medicamentos con sus dosis y horarios</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary text-xs">2</div>
              <div>
                <p className="text-foreground">Configura recordatorios</p>
                <p className="text-xs">La app te recordará cuándo tomar cada medicamento</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary text-xs">3</div>
              <div>
                <p className="text-foreground">Marca como tomado</p>
                <p className="text-xs">Registra cuando tomes tus medicamentos para hacer seguimiento</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary text-xs">4</div>
              <div>
                <p className="text-foreground">Revisa tu adherencia</p>
                <p className="text-xs">Consulta estadísticas y gráficos en la sección de Historial</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto de Soporte */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h3>Contacto de Soporte</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm">Email de Soporte</p>
                <p className="text-sm text-muted-foreground">support@medalert.app</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm">Teléfono</p>
                <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm">Chat en Vivo</p>
                <p className="text-sm text-muted-foreground">Lun - Vie, 9am - 6pm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recursos Adicionales */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h3 className="mb-3">Recursos Adicionales</h3>
          <div className="space-y-2 text-sm">
            <button className="w-full text-left text-primary hover:underline">
              📚 Guía completa de usuario
            </button>
            <button className="w-full text-left text-primary hover:underline">
              🎥 Tutoriales en video
            </button>
            <button className="w-full text-left text-primary hover:underline">
              💡 Consejos y mejores prácticas
            </button>
            <button className="w-full text-left text-primary hover:underline">
              🔄 Novedades y actualizaciones
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-xs text-muted-foreground pb-4">
          <p>¿No encontraste lo que buscabas?</p>
          <button 
            onClick={() => onNavigate('favorites')}
            className="text-primary hover:underline mt-1"
          >
            Chatea con nuestro asistente virtual
          </button>
        </div>
      </div>

      <TabBar activeTab="profile" onTabChange={onNavigate} />
    </div>
  );
}
