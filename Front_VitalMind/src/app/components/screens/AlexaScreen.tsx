import { useState } from 'react';
import { 
  ArrowLeft, 
  Mic, 
  Volume2, 
  Clock, 
  Plus, 
  Bell,
  CheckCircle2,
  Info,
  Smartphone,
  Zap,
  Shield,
  Radio
} from 'lucide-react';

interface AlexaScreenProps {
  onBack: () => void;
}

export function AlexaScreen({ onBack }: AlexaScreenProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  const voiceCommands = [
    {
      category: '🔔 Consultar Horarios',
      commands: [
        {
          phrase: '"Alexa, ¿cuáles son mis próximos medicamentos?"',
          description: 'Escucha todos tus medicamentos programados para hoy',
          icon: Clock,
        },
        {
          phrase: '"Alexa, ¿qué medicamentos tengo pendientes?"',
          description: 'Lista de medicamentos que aún no has tomado',
          icon: Bell,
        },
        {
          phrase: '"Alexa, horario de Paracetamol"',
          description: 'Horarios específicos de un medicamento',
          icon: Info,
        },
      ],
    },
    {
      category: '⏸️ Posponer Medicamentos',
      commands: [
        {
          phrase: '"Alexa, posponer medicamento"',
          description: 'Pospone el recordatorio actual por 15 minutos',
          icon: Clock,
        },
        {
          phrase: '"Alexa, recordar más tarde"',
          description: 'Pospone el próximo medicamento por 30 minutos',
          icon: Bell,
        },
        {
          phrase: '"Alexa, posponer Ibuprofeno 1 hora"',
          description: 'Pospone un medicamento específico por tiempo definido',
          icon: Clock,
        },
      ],
    },
    {
      category: '➕ Agregar Horarios',
      commands: [
        {
          phrase: '"Alexa, agregar horario a las 10 PM"',
          description: 'Agrega un nuevo horario a tu medicamento actual',
          icon: Plus,
        },
        {
          phrase: '"Alexa, nueva dosis a las 8 de la mañana"',
          description: 'Crea un nuevo horario de toma',
          icon: Clock,
        },
        {
          phrase: '"Alexa, agregar Paracetamol a las 3 PM"',
          description: 'Agrega horario específico para un medicamento',
          icon: Plus,
        },
      ],
    },
    {
      category: '✅ Confirmar Tomas',
      commands: [
        {
          phrase: '"Alexa, tomé mi medicamento"',
          description: 'Marca el medicamento actual como tomado',
          icon: CheckCircle2,
        },
        {
          phrase: '"Alexa, confirmar toma de Ibuprofeno"',
          description: 'Confirma un medicamento específico',
          icon: CheckCircle2,
        },
      ],
    },
    {
      category: '📦 Gestión de Stock',
      commands: [
        {
          phrase: '"Alexa, ¿cuánto Paracetamol me queda?"',
          description: 'Consulta el stock disponible',
          icon: Info,
        },
        {
          phrase: '"Alexa, recordar comprar medicamentos"',
          description: 'Crea un recordatorio de reabastecimiento',
          icon: Bell,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#00CAFF]/10 via-[#1C90F3]/5 to-primary/10 border-b border-border">
        <div className="max-w-[375px] mx-auto px-4 pt-16 pb-6">
          <button
            onClick={onBack}
            className="mb-4 text-foreground hover:text-primary transition-colors p-2 -ml-2 rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00CAFF] to-[#1C90F3] flex items-center justify-center shadow-lg">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold mb-1">Integración Alexa</h1>
              <p className="text-sm text-muted-foreground">Control por voz de tus medicamentos</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className={`p-4 rounded-xl border-2 ${
            isConnected 
              ? 'bg-secondary/10 border-secondary/30' 
              : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-secondary' : 'bg-muted-foreground'
                }`}>
                  {isConnected && (
                    <>
                      <div className="absolute w-3 h-3 bg-secondary rounded-full animate-ping" />
                      <div className="relative w-3 h-3 bg-secondary rounded-full" />
                    </>
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {isConnected ? 'Conectado' : 'Desconectado'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isConnected ? 'Alexa lista para comandos' : 'Conecta tu dispositivo Alexa'}
                  </p>
                </div>
              </div>
              {isConnected && <Radio className="w-5 h-5 text-secondary animate-pulse" />}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[375px] mx-auto px-4 py-6">
        {/* Connect Button */}
        {!isConnected && (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full mb-6 h-14 bg-gradient-to-br from-[#00CAFF] to-[#1C90F3] text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg shadow-[#00CAFF]/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isConnecting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Conectando...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Smartphone className="w-5 h-5" />
                <span>Conectar con Alexa</span>
              </div>
            )}
          </button>
        )}

        {isConnected && (
          <button
            onClick={handleDisconnect}
            className="w-full mb-6 h-14 bg-card border-2 border-border text-foreground rounded-xl hover:bg-muted transition-all duration-200 font-medium"
          >
            Desconectar Alexa
          </button>
        )}

        {/* Features */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-medium">Rápido</p>
            <p className="text-xs text-muted-foreground mt-0.5">Control instantáneo</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-xs font-medium">Manos libres</p>
            <p className="text-xs text-muted-foreground mt-0.5">Control por voz</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent-green/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-green" />
            </div>
            <p className="text-xs font-medium">Seguro</p>
            <p className="text-xs text-muted-foreground mt-0.5">Privado y cifrado</p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-6 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Cómo funciona
          </h3>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">1</span>
              <div>
                <p className="font-medium">Conecta tu dispositivo Alexa</p>
                <p className="text-xs text-muted-foreground mt-0.5">Vincula MedAlert+ con tu cuenta de Amazon</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">2</span>
              <div>
                <p className="font-medium">Activa la skill de MedAlert+</p>
                <p className="text-xs text-muted-foreground mt-0.5">Busca "MedAlert Plus" en la app de Alexa</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">3</span>
              <div>
                <p className="font-medium">Usa comandos de voz</p>
                <p className="text-xs text-muted-foreground mt-0.5">Di "Alexa, abre MedAlert Plus"</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Voice Commands */}
        <h2 className="font-semibold mb-4">Comandos de Voz</h2>
        <div className="space-y-4">
          {voiceCommands.map((category, index) => (
            <div key={index} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-4 py-3 border-b border-border">
                <h3 className="font-medium">{category.category}</h3>
              </div>
              <div className="p-4 space-y-4">
                {category.commands.map((cmd, cmdIndex) => {
                  const Icon = cmd.icon;
                  return (
                    <div key={cmdIndex} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary mb-1">{cmd.phrase}</p>
                        <p className="text-xs text-muted-foreground">{cmd.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-6 bg-accent/50 border border-border rounded-xl p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Consejos útiles
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span>•</span>
              <span>Habla claramente y pausadamente para mejor reconocimiento</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Puedes usar nombres cortos para tus medicamentos</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Alexa confirmará cada acción antes de ejecutarla</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Los comandos funcionan 24/7, incluso en modo no molestar</span>
            </li>
          </ul>
        </div>

        {/* Privacy Note */}
        <div className="mt-4 p-4 bg-muted/50 rounded-xl">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Privacidad garantizada</p>
              <p>Tus datos de salud están encriptados y solo se procesan localmente. Amazon no tiene acceso a tu información médica sensible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
