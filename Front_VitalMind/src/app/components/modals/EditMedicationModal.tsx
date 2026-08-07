import { useState, useEffect } from "react";
import { X, Clock, Pill } from "lucide-react";

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
}

interface EditMedicationModalProps {
  isOpen: boolean;
  medication: Medication | null;
  onClose: () => void;
  onSave: (medication: Medication) => void;
}

export function EditMedicationModal({ isOpen, medication, onClose, onSave }: EditMedicationModalProps) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("diaria");
  const [time, setTime] = useState("08:00");

  useEffect(() => {
    if (medication) {
      setName(medication.name);
      setDosage(medication.dosage);
      setFrequency(medication.frequency);
      setTime(medication.time);
    }
  }, [medication]);

  if (!isOpen || !medication) return null;

  const handleSubmit = () => {
    if (name && dosage && time) {
      onSave({ ...medication, name, dosage, frequency, time });
      onClose();
    }
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
            <h2>Editar medicamento</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Nombre del medicamento</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Paracetamol"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Dosificación</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="ej. 500mg"
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
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
              <option value="semanal">Semanal</option>
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
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onClose}
            className="py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
