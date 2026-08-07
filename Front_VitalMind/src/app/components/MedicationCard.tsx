import { Pill, Plus, MoreVertical, Clock } from "lucide-react";
import imgPastillas from "figma:asset/85a00f86b13fea77e55e2799ff7beeec9d6c2c51.png";

interface MedicationCardProps {
  name?: string;
  dosage?: string;
  icon?: string;
  nextDose?: string;
  onEdit?: () => void;
  variant?: 'default' | 'add';
}

export function MedicationCard({ name, dosage, icon, nextDose, onEdit, variant = 'default' }: MedicationCardProps) {
  if (variant === 'add') {
    return (
      <button 
        onClick={onEdit}
        className="bg-card border-2 border-dashed border-border rounded-xl px-4 py-4 flex items-center justify-center gap-3 hover:bg-accent hover:border-primary/50 transition-all duration-200 group shadow-sm hover:shadow-md"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Plus className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-muted-foreground group-hover:text-primary transition-colors font-medium">
          Agregar medicamento
        </span>
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 hover-lift">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/10">
          {icon ? (
            <img src={icon} alt="" className="w-6 h-6 object-contain" />
          ) : (
            <Pill className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {dosage && (
              <span className="text-xs text-muted-foreground">{dosage}</span>
            )}
            {nextDose && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">{nextDose}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <button 
        onClick={onEdit}
        className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 p-2 rounded-lg flex-shrink-0 ml-2"
        title="Editar medicamento"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
}
