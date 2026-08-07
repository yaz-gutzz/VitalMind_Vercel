import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FacebookAccount {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  color: string;
}

interface FacebookAccountSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: FacebookAccount) => void;
  onUseOtherAccount: () => void;
}

export function FacebookAccountSelector({ 
  isOpen, 
  onClose, 
  onSelectAccount,
  onUseOtherAccount 
}: FacebookAccountSelectorProps) {
  const accounts: FacebookAccount[] = [
    {
      id: '1',
      name: 'Ana Martínez',
      email: 'ana.martinez@outlook.com',
      initials: 'AM',
      color: 'bg-indigo-500'
    },
    {
      id: '2',
      name: 'Roberto Silva',
      email: 'roberto.silva@gmail.com',
      initials: 'RS',
      color: 'bg-purple-500'
    },
    {
      id: '3',
      name: 'Laura Fernández',
      email: 'laura.fernandez@yahoo.com',
      initials: 'LF',
      color: 'bg-pink-500'
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
              {/* Facebook Logo and Title */}
              <div className="flex items-center gap-3 pb-2">
                <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-[#1877F2]">Iniciar sesión</h2>
                  <p className="text-sm text-slate-500">Continuar con Facebook</p>
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
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 hover:border-[#1877F2]"
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
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 hover:border-[#1877F2]"
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
                  className="w-full text-[#1877F2] hover:text-[#1877F2] hover:bg-[#1877F2]/10"
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
