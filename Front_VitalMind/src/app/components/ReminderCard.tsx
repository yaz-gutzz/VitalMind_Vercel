import { Clock, Bell, Check, BellRing, Pill } from "lucide-react";
import imgImage from "figma:asset/f62b54fb1bb55bfe3f6083607b676a0acc48ca62.png";

interface ReminderCardProps {
  medication: string;
  time: string;
  onTake?: () => void;
  onSnooze?: () => void;
}

export function ReminderCard({ medication, time, onTake, onSnooze }: ReminderCardProps) {
  return (
    <div className="relative bg-gradient-to-br from-primary/8 via-primary/5 to-secondary/8 rounded-2xl p-4 border-2 border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-slide-up">
      {/* Decorative background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl -z-0" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                  <BellRing className="w-5 h-5 text-primary-foreground animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-ping" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full" />
              </div>
              <div>
                <h3 className="text-primary font-semibold">¡Recordatorio!</h3>
                <p className="text-xs text-muted-foreground">Es hora de tu medicina</p>
              </div>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white dark:bg-card border border-border p-2 shadow-sm">
            <img src={imgImage} alt="" className="w-full h-full object-contain" />
          </div>
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 mb-4 border border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <Pill className="w-4 h-4 text-primary" />
            <p className="font-medium">{medication}</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{time}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onTake}
            className="h-11 bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-xl hover:from-primary/90 hover:to-primary/80 transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 font-medium"
          >
            <Check className="w-5 h-5" />
            <span>Marcar</span>
          </button>
          <button
            onClick={onSnooze}
            className="h-11 bg-card border-2 border-border text-foreground rounded-xl hover:bg-muted hover:border-primary/30 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
          >
            <Clock className="w-4 h-4" />
            <span>Posponer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
