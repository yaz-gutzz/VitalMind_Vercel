import { useState } from "react";
import { X, Clock, Pill, AlertCircle } from "lucide-react";

interface AddMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (medication: { name: string; dosage: string; frequency: string; time: string }) => void;
}

export function AddMedicationModal({ isOpen, onClose, onAdd }: AddMedicationModalProps) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("diaria");
  const [time, setTime] = useState("08:00");
  const [errors, setErrors] = useState({ name: "", dosage: "" });

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = { name: "", dosage: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
      isValid = false;
    }

    if (!dosage.trim()) {
      newErrors.dosage = "La dosificación es obligatoria";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAdd({ name: name.trim(), dosage: dosage.trim(), frequency, time });
      // Reset form
      setName("");
      setDosage("");
      setFrequency("diaria");
      setTime("08:00");
      setErrors({ name: "", dosage: "" });
      onClose();
    }
  };

  const handleClose = () => {
    setName("");
    setDosage("");
    setFrequency("diaria");
    setTime("08:00");
    setErrors({ name: "", dosage: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-in fade-in">
      <div className="bg-card w-full max-w-[375px] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <h2>Agregar medicamento</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Nombre del medicamento <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="ej. Paracetamol"
              className={`w-full px-4 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.name ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.name && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Dosificación <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => {
                setDosage(e.target.value);
                if (errors.dosage) setErrors({ ...errors, dosage: "" });
              }}
              placeholder="ej. 500mg, 1 tableta, 5ml"
              className={`w-full px-4 py-3 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                errors.dosage ? 'border-destructive' : 'border-border'
              }`}
            />
            {errors.dosage && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.dosage}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Frecuencia</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="diaria">Diaria</option>
              <option value="cada-8h">Cada 8 horas</option>
              <option value="cada-12h">Cada 12 horas</option>
              <option value="cada-6h">Cada 6 horas</option>
              <option value="semanal">Semanal</option>
              <option value="cuando-necesario">Cuando sea necesario</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Hora de toma</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              💡 <span className="text-primary">Consejo:</span> Configura recordatorios para no olvidar tus medicamentos. Puedes gestionar las notificaciones en Configuración.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={handleClose}
            className="py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
