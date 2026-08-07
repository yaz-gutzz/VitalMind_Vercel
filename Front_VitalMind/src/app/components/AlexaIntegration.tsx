import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, CheckCircle2, XCircle, Loader2, Radio } from 'lucide-react';

interface AlexaIntegrationProps {
  isEnabled: boolean;
  onStatusChange?: (status: 'idle' | 'listening' | 'processing' | 'speaking') => void;
}

export function AlexaIntegration({ isEnabled, onStatusChange }: AlexaIntegrationProps) {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isEnabled) {
      // Simular conexión con Alexa
      const timer = setTimeout(() => {
        setIsConnected(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsConnected(false);
    }
  }, [isEnabled]);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const handleVoiceCommand = (command: string) => {
    setStatus('processing');
    setLastCommand(command);

    // Simular procesamiento de comando
    setTimeout(() => {
      const responseText = processCommand(command);
      setResponse(responseText);
      setStatus('speaking');

      // Volver a idle después de hablar
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }, 1500);
  };

  const processCommand = (command: string): string => {
    const cmd = command.toLowerCase();

    // Escuchar horarios
    if (cmd.includes('horarios') || cmd.includes('próximas dosis') || cmd.includes('medicamentos')) {
      return 'Tienes 3 medicamentos programados para hoy: Paracetamol a las 14:00, Ibuprofeno a las 18:00, y Vitamina D a las 20:00.';
    }

    // Posponer medicamento
    if (cmd.includes('posponer') || cmd.includes('recordar más tarde')) {
      return 'He pospuesto tu recordatorio de Paracetamol por 15 minutos. Te avisaré a las 14:15.';
    }

    // Agregar horario
    if (cmd.includes('agregar') && cmd.includes('horario')) {
      return 'He agregado un nuevo horario para tu medicamento a las 22:00. ¿Deseas que te recuerde diariamente?';
    }

    // Confirmar toma
    if (cmd.includes('tomé') || cmd.includes('tomado')) {
      return 'Perfecto, he marcado tu dosis de Paracetamol como tomada a las 14:00. ¡Buen trabajo manteniendo tu adherencia!';
    }

    // Stock bajo
    if (cmd.includes('stock') || cmd.includes('quedan')) {
      return 'Te quedan 15 pastillas de Paracetamol. Con tu frecuencia actual, durarán aproximadamente 7 días. ¿Quieres que te recuerde reabastecerlo?';
    }

    return 'No entendí tu comando. Puedes decir: "Alexa, ¿cuáles son mis próximos horarios?" o "Alexa, posponer medicamento".';
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Status Badge */}
      {isConnected && (
        <div className="absolute -top-2 -left-2 z-10">
          <div className="relative">
            <div className="w-3 h-3 bg-secondary rounded-full animate-ping" />
            <div className="absolute top-0 left-0 w-3 h-3 bg-secondary rounded-full" />
          </div>
        </div>
      )}

      {/* Alexa Button */}
      <button
        onClick={() => status === 'idle' && handleVoiceCommand('¿Cuáles son mis próximos horarios?')}
        disabled={!isConnected || status !== 'idle'}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
          status === 'idle'
            ? 'bg-gradient-to-br from-[#00CAFF] to-[#1C90F3] hover:scale-110 hover:shadow-2xl'
            : status === 'listening'
            ? 'bg-gradient-to-br from-secondary to-accent-green animate-pulse'
            : status === 'processing'
            ? 'bg-gradient-to-br from-warning to-warning/80'
            : 'bg-gradient-to-br from-primary to-primary/80'
        } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isConnected ? 'Hablar con Alexa' : 'Conectando...'}
      >
        {status === 'idle' && <Mic className="w-7 h-7 text-white" />}
        {status === 'listening' && <Radio className="w-7 h-7 text-white animate-pulse" />}
        {status === 'processing' && <Loader2 className="w-7 h-7 text-white animate-spin" />}
        {status === 'speaking' && <Volume2 className="w-7 h-7 text-white animate-pulse" />}
      </button>

      {/* Response Bubble */}
      {(lastCommand || response) && status !== 'idle' && (
        <div className="absolute bottom-20 right-0 w-72 animate-slide-up">
          <div className="bg-card/95 backdrop-blur-lg border border-border rounded-2xl p-4 shadow-xl">
            {lastCommand && status === 'processing' && (
              <div className="mb-3 pb-3 border-b border-border">
                <p className="text-xs text-muted-foreground mb-1">Tú dijiste:</p>
                <p className="text-sm italic">"{lastCommand}"</p>
              </div>
            )}
            {response && status === 'speaking' && (
              <div>
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00CAFF] to-[#1C90F3] flex items-center justify-center flex-shrink-0">
                    <Volume2 className="w-3 h-3 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground">Alexa responde:</p>
                </div>
                <p className="text-sm">{response}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute bottom-20 right-0 w-48">
          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Conectando con Alexa...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
