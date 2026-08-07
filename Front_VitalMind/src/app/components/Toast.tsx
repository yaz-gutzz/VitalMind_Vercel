import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X, CheckCheck } from "lucide-react";

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-secondary" />,
      bg: 'bg-secondary/10 border-secondary/30',
      accentBar: 'bg-secondary',
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-destructive" />,
      bg: 'bg-destructive/10 border-destructive/30',
      accentBar: 'bg-destructive',
    },
    info: {
      icon: <Info className="w-5 h-5 text-primary" />,
      bg: 'bg-primary/10 border-primary/30',
      accentBar: 'bg-primary',
    },
  };

  const current = config[type];

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up px-4">
      <div className={`relative max-w-[340px] ${current.bg} backdrop-blur-lg border rounded-xl shadow-xl flex items-center gap-3 overflow-hidden`}>
        {/* Accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${current.accentBar}`} />
        
        <div className="flex items-center gap-3 p-4 pl-5">
          <div className="flex-shrink-0">
            {current.icon}
          </div>
          <p className="text-sm font-medium flex-1">{message}</p>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
