import { AlertCircle, CheckCircle, LogOut, AlertTriangle, Info } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'danger' | 'logout';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  type = 'info',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm, 
  onCancel 
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch(type) {
      case 'logout':
        return {
          icon: <LogOut className="w-12 h-12" />,
          iconBg: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
          iconColor: 'text-orange-600',
          confirmBg: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600',
          confirmText: 'text-white'
        };
      case 'danger':
        return {
          icon: <AlertTriangle className="w-12 h-12" />,
          iconBg: 'bg-destructive/10',
          iconColor: 'text-destructive',
          confirmBg: 'bg-destructive hover:bg-destructive/90',
          confirmText: 'text-destructive-foreground'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-12 h-12" />,
          iconBg: 'bg-yellow-500/10',
          iconColor: 'text-yellow-600',
          confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
          confirmText: 'text-white'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-12 h-12" />,
          iconBg: 'bg-secondary/10',
          iconColor: 'text-secondary',
          confirmBg: 'bg-secondary hover:bg-secondary/90',
          confirmText: 'text-white'
        };
      default:
        return {
          icon: <Info className="w-12 h-12" />,
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          confirmBg: 'bg-primary hover:bg-primary/90',
          confirmText: 'text-primary-foreground'
        };
    }
  };

  const { icon, iconBg, iconColor, confirmBg, confirmText: confirmTextColor } = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div className="bg-card w-full max-w-[340px] rounded-2xl p-6 animate-in zoom-in-95 duration-200 border border-border shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-5">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-full ${iconBg} flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
          
          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col gap-3 w-full pt-2">
            <button
              onClick={onConfirm}
              className={`w-full py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 ${confirmBg} ${confirmTextColor}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 bg-muted/50 text-foreground rounded-xl hover:bg-muted transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}