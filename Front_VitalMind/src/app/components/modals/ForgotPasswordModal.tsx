import { useState } from "react";
import { X, Mail, CheckCircle2, AlertCircle, Lock, Shield } from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"input" | "success" | "error">("input");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico");
      return;
    }
    
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return;
    }

    // Simular envío de correo
    setError("");
    setStep("success");
  };

  const handleClose = () => {
    setEmail("");
    setStep("input");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-300">
        {step === "input" && (
          <>
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 opacity-5" />
              <div className="relative flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3>Recuperar Contraseña</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Restablece tu acceso</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-foreground mb-1">Recuperación Segura</p>
                  <p className="text-muted-foreground text-xs">
                    Te enviaremos un enlace de verificación a tu correo electrónico registrado. El enlace será válido por 24 horas.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm">Correo Electrónico Registrado</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="tu@email.com"
                    className="w-full pl-11 pr-4 py-3 bg-input-background border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Si no recibes el correo en unos minutos, verifica tu carpeta de spam o correo no deseado.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-3 p-6 border-t border-border">
              <button
                onClick={handleSubmit}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                Enviar Enlace de Recuperación
              </button>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-muted/50 text-foreground rounded-xl hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/90 opacity-5" />
              <div className="relative flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3>Correo Enviado</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Revisa tu bandeja de entrada</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Success Content */}
            <div className="p-6 space-y-5">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-secondary" />
                </div>
                
                <div className="space-y-2 mb-5">
                  <h3>¡Enlace Enviado Exitosamente!</h3>
                  <p className="text-sm text-muted-foreground">
                    Hemos enviado las instrucciones de recuperación a:
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary">{email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs text-primary">1</span>
                  </div>
                  <p className="text-sm">Revisa tu correo electrónico</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs text-primary">2</span>
                  </div>
                  <p className="text-sm">Haz clic en el enlace de recuperación</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs text-primary">3</span>
                  </div>
                  <p className="text-sm">Crea tu nueva contraseña segura</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs text-primary">4</span>
                  </div>
                  <p className="text-sm">Inicia sesión con tu nueva contraseña</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200/50 dark:border-yellow-800/30 rounded-xl">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  El enlace de recuperación expirará en 24 horas por razones de seguridad. Si no lo recibes, verifica tu carpeta de spam.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border">
              <button
                onClick={handleClose}
                className="w-full py-3 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-xl hover:from-secondary/90 hover:to-secondary shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                Entendido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
