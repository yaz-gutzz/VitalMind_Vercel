import { useNavigate } from "react-router";
import { ArrowLeft, Bluetooth, Wifi, Battery, RefreshCw, Settings, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";

export function PillboxScreen() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleConnect = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setIsConnected(true);
      toast.success("Pastillero conectado exitosamente");
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast.success("Pastillero desconectado");
  };

  const compartments = [
    { id: 1, name: "Aspirina", filled: true, time: "08:00" },
    { id: 2, name: "Omeprazol", filled: true, time: "08:00" },
    { id: 3, name: "Vitamina D", filled: true, time: "18:00" },
    { id: 4, name: "Metformina", filled: false, time: "20:00" },
  ];

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-blue to-primary px-6 pt-12 pb-6 rounded-b-[32px]">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate("/profile")}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Pastillero</h1>
            <p className="text-white/80 text-sm flex items-center gap-2">
              {isConnected ? (
                <>
                  <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
                  Conectado
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                  Desconectado
                </>
              )}
            </p>
          </div>
        </div>

        {/* Device Info */}
        {isConnected && (
          <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-5 border border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Battery className="w-6 h-6 text-white mx-auto mb-1" />
                <p className="text-white font-semibold">85%</p>
                <p className="text-white/60 text-xs">Batería</p>
              </div>
              <div>
                <Wifi className="w-6 h-6 text-white mx-auto mb-1" />
                <p className="text-white font-semibold">WiFi</p>
                <p className="text-white/60 text-xs">Conectado</p>
              </div>
              <div>
                <Bluetooth className="w-6 h-6 text-white mx-auto mb-1" />
                <p className="text-white font-semibold">BLE</p>
                <p className="text-white/60 text-xs">Activo</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {!isConnected ? (
          /* Connection Screen */
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <motion.div
              animate={isScanning ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: isScanning ? Infinity : 0, duration: 1.5 }}
              className="w-32 h-32 bg-accent-blue/10 rounded-full flex items-center justify-center mb-6"
            >
              <Bluetooth className="w-16 h-16 text-accent-blue" />
            </motion.div>

            <h2 className="text-2xl font-bold text-foreground mb-3">
              {isScanning ? "Buscando dispositivos..." : "Conectar Pastillero"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isScanning 
                ? "Asegúrate de que tu pastillero esté encendido"
                : "Sincroniza tu pastillero inteligente para gestionar tus medicamentos"
              }
            </p>

            <button
              onClick={handleConnect}
              disabled={isScanning}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-[20px] font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Escaneando...
                </>
              ) : (
                <>
                  <Bluetooth className="w-5 h-5" />
                  Conectar Dispositivo
                </>
              )}
            </button>
          </div>
        ) : (
          /* Connected Screen */
          <div className="space-y-6">
            {/* Next Dispensation */}
            <div className="bg-primary/5 border border-primary/20 rounded-[20px] p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Próxima dispensación</p>
                  <p className="text-xl font-bold text-foreground">14:00 hrs</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Aspirina - 100mg</p>
            </div>

            {/* Compartments */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Compartimientos
              </h2>
              <div className="space-y-3">
                {compartments.map((comp) => (
                  <div
                    key={comp.id}
                    className="bg-card border border-border rounded-[20px] p-5 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      comp.filled 
                        ? "bg-accent-green/10" 
                        : "bg-accent-red/10"
                    }`}>
                      {comp.filled ? (
                        <CheckCircle className="w-6 h-6 text-accent-green" />
                      ) : (
                        <XCircle className="w-6 h-6 text-accent-red" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        Compartimiento {comp.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {comp.name} · {comp.time}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      comp.filled
                        ? "bg-accent-green/20 text-accent-green"
                        : "bg-accent-red/20 text-accent-red"
                    }`}>
                      {comp.filled ? "Lleno" : "Vacío"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pb-8">
              <button className="bg-card border border-border hover:bg-muted text-foreground py-4 rounded-[20px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-95">
                <Settings className="w-5 h-5" />
                Configurar
              </button>
              <button
                onClick={handleDisconnect}
                className="bg-accent-red/10 hover:bg-accent-red/20 text-accent-red border border-accent-red/30 py-4 rounded-[20px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <XCircle className="w-5 h-5" />
                Desconectar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
