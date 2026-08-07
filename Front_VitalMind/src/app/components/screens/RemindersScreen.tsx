import { useNavigate } from "react-router";
import { Bell, Check, Clock, X, MoreVertical } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useState } from "react";

const reminders = [
  {
    id: 1,
    medication: "Aspirina",
    dose: "100mg",
    time: "14:00",
    status: "pending",
    color: "#2563EB",
  },
  {
    id: 2,
    medication: "Vitamina D",
    dose: "1000 UI",
    time: "18:00",
    status: "pending",
    color: "#F59E0B",
  },
  {
    id: 3,
    medication: "Omeprazol",
    dose: "20mg",
    time: "20:00",
    status: "pending",
    color: "#22C55E",
  },
  {
    id: 4,
    medication: "Aspirina",
    dose: "100mg",
    time: "08:00",
    status: "taken",
    color: "#2563EB",
  },
  {
    id: 5,
    medication: "Omeprazol",
    dose: "20mg",
    time: "08:00",
    status: "taken",
    color: "#22C55E",
  },
];

export function RemindersScreen() {
  const navigate = useNavigate();
  const [remindersList, setRemindersList] = useState(reminders);

  const pendingReminders = remindersList.filter(r => r.status === "pending");
  const takenReminders = remindersList.filter(r => r.status === "taken");

  const handleTaken = (id: number) => {
    setRemindersList(prev =>
      prev.map(r => r.id === id ? { ...r, status: "taken" as const } : r)
    );
    toast.success("Medicamento marcado como tomado");
  };

  const handleSkip = (id: number) => {
    setRemindersList(prev => prev.filter(r => r.id !== id));
    toast.error("Medicamento omitido");
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-secondary px-6 pt-12 pb-6 rounded-b-[32px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Recordatorios</h1>
            <p className="text-white/80 text-sm">Martes, 30 de junio</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Pending */}
        {pendingReminders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Pendientes ({pendingReminders.length})
            </h2>
            <div className="space-y-3">
              {pendingReminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-[20px] p-5 shadow-sm"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${reminder.color}15` }}
                    >
                      <Clock 
                        className="w-6 h-6" 
                        style={{ color: reminder.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        {reminder.medication}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {reminder.dose} · {reminder.time}
                      </p>
                    </div>
                    <button className="w-8 h-8 text-muted-foreground">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleTaken(reminder.id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-[16px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Check className="w-5 h-5" />
                      Tomado
                    </button>
                    <button
                      onClick={() => handleSkip(reminder.id)}
                      className="bg-muted hover:bg-muted/80 text-foreground py-3 rounded-[16px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <X className="w-5 h-5" />
                      Omitir
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Taken */}
        {takenReminders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Completados ({takenReminders.length})
            </h2>
            <div className="space-y-3">
              {takenReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className="bg-accent-green/5 border border-accent-green/20 rounded-[20px] p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent-green/10 rounded-2xl flex items-center justify-center">
                      <Check className="w-6 h-6 text-accent-green" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {reminder.medication}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {reminder.dose} · {reminder.time}
                      </p>
                    </div>
                    <span className="text-accent-green text-sm font-medium">
                      ✓ Tomado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingReminders.length === 0 && takenReminders.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay recordatorios
            </h3>
            <p className="text-muted-foreground">
              ¡Todo al día! No tienes medicamentos pendientes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
