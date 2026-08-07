import { useNavigate } from "react-router";
import { ArrowLeft, Pill, Calendar, Clock, RefreshCw, FileText, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AddMedicationScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    dose: "",
    presentation: "Tableta",
    frequency: "Diario",
    times: ["08:00"],
    duration: "30",
    notes: "",
  });

  const presentations = ["Tableta", "Cápsula", "Jarabe", "Inyección", "Gotas", "Crema"];
  const frequencies = ["Diario", "Cada 12h", "Cada 8h", "Cada 6h", "Semanal"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Medicamento agregado exitosamente");
    navigate("/medications");
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addTime = () => {
    setFormData({ ...formData, times: [...formData.times, "12:00"] });
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const removeTime = (index: number) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData({ ...formData, times: newTimes });
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 pt-12 pb-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/medications")}
            className="w-10 h-10 bg-muted rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Agregar Medicamento</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" />
              Nombre del Medicamento
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej: Aspirina"
              required
              className="w-full px-4 py-4 bg-card border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          {/* Dose & Presentation */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Dosis
              </label>
              <input
                type="text"
                value={formData.dose}
                onChange={(e) => handleChange("dose", e.target.value)}
                placeholder="Ej: 100mg"
                required
                className="w-full px-4 py-4 bg-card border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Presentación
              </label>
              <select
                value={formData.presentation}
                onChange={(e) => handleChange("presentation", e.target.value)}
                className="w-full px-4 py-4 bg-card border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none"
              >
                {presentations.map((pres) => (
                  <option key={pres} value={pres}>{pres}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              Frecuencia
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => handleChange("frequency", e.target.value)}
              className="w-full px-4 py-4 bg-card border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none"
            >
              {frequencies.map((freq) => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
          </div>

          {/* Times */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Horarios
              </label>
              <button
                type="button"
                onClick={addTime}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                + Agregar horario
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.times.map((time, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                    className="flex-1 px-4 py-4 bg-card border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  {formData.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(index)}
                      className="w-12 h-12 bg-accent-red/10 text-accent-red rounded-[16px] hover:bg-accent-red/20 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Duración (días)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => handleChange("duration", e.target.value)}
              placeholder="30"
              min="1"
              required
              className="w-full px-4 py-4 bg-card border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Notas (opcional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Ej: Tomar con alimentos"
              rows={3}
              className="w-full px-4 py-4 bg-card border border-border rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full mt-6 mb-8 bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-[20px] font-semibold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-5 h-5" />
          Guardar Medicamento
        </button>
      </form>
    </div>
  );
}
