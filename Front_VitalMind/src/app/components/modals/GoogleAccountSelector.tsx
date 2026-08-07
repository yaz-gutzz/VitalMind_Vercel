import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import googleLogo from 'figma:asset/4b71bfcc460c501fed789573138c5ca88b528f1e.png';

interface GoogleAccount {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  color: string;
}

interface GoogleAccountSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAccount) => void;
  onUseOtherAccount: () => void;
}

export function GoogleAccountSelector({ 
  isOpen, 
  onClose, 
  onSelectAccount,
  onUseOtherAccount 
}: GoogleAccountSelectorProps) {
  const accounts: GoogleAccount[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan.perez@gmail.com',
      initials: 'JP',
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'María García',
      email: 'maria.garcia@gmail.com',
      initials: 'MG',
      color: 'bg-cyan-500'
    },
    {
      id: '3',
      name: 'Carlos López',
      email: 'carlos.lopez@gmail.com',
      initials: 'CL',
      color: 'bg-blue-600'
    }
  ];

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
            <Card className="w-full max-w-sm bg-white shadow-2xl p-6 space-y-4">
              {/* Google Logo and Title */}
              <div className="flex items-center gap-3 pb-2">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div>
                  <h2 className="text-primary">Iniciar sesión</h2>
                  <p className="text-sm text-slate-500">Continuar con Google</p>
                </div>
              </div>

              {/* Info Text */}
              <p className="text-xs text-slate-600 pb-2">
                Elige una cuenta para continuar con MedAlert+
              </p>

              {/* Accounts List */}
              <div className="space-y-2">
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => onSelectAccount(account)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 hover:border-primary"
                  >
                    <div className={`w-10 h-10 rounded-full ${account.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {account.initials}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-slate-900">{account.name}</p>
                      <p className="text-xs text-slate-500">{account.email}</p>
                    </div>
                  </button>
                ))}

                {/* Use Other Account */}
                <button
                  onClick={onUseOtherAccount}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 hover:border-primary"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm text-slate-900">Usar otra cuenta</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Cancel Button */}
              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full text-primary hover:text-primary hover:bg-primary/10"
                >
                  Cancelar
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
