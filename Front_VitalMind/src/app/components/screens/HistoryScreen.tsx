import { useNavigate } from "react-router";
import { ArrowLeft, Calendar as CalendarIcon, Check, X } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

const historyData = [
  { date: "2026-06-30", medications: [
    { name: "Aspirina", time: "08:00", status: "taken" },
    { name: "Omeprazol", time: "08:00", status: "taken" },
    { name: "Aspirina", time: "14:00", status: "pending" },
  ]},
  { date: "2026-06-29", medications: [
    { name: "Aspirina", time: "08:00", status: "taken" },
    { name: "Omeprazol", time: "08:00", status: "missed" },
    { name: "Aspirina", time: "20:00", status: "taken" },
  ]},
  { date: "2026-06-28", medications: [
    { name: "Aspirina", time: "08:00", status: "taken" },
    { name: "Omeprazol", time: "08:00", status: "taken" },
    { name: "Aspirina", time: "20:00", status: "taken" },
  ]},
];

export function HistoryScreen() {
  const navigate = useNavigate();
  const [selectedMonth] = useState("Junio 2026");

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 pt-12 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate("/reports")}
            className="w-10 h-10 bg-muted rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Historial</h1>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between bg-muted rounded-[20px] px-4 py-3">
          <CalendarIcon className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium text-foreground">{selectedMonth}</span>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            Cambiar
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {historyData.map((day, index) => {
            const date = new Date(day.date);
            const takenCount = day.medications.filter(m => m.status === "taken").length;
            const missedCount = day.medications.filter(m => m.status === "missed").length;
            const totalCount = day.medications.filter(m => m.status !== "pending").length;

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 text-center">
                    <p className="text-sm text-muted-foreground">
                      {date.toLocaleDateString('es-ES', { weekday: 'short' }).toUpperCase()}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {date.getDate()}
                    </p>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  {totalCount > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {takenCount}/{totalCount} tomados
                      </p>
                    </div>
                  )}
                </div>

                {/* Medications */}
                <div className="space-y-2 ml-20">
                  {day.medications.map((med, medIndex) => {
                    if (med.status === "pending") return null;
                    
                    return (
                      <div
                        key={medIndex}
                        className={`rounded-[16px] p-4 flex items-center gap-3 ${
                          med.status === "taken"
                            ? "bg-accent-green/5 border border-accent-green/20"
                            : "bg-accent-red/5 border border-accent-red/20"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          med.status === "taken" ? "bg-accent-green/20" : "bg-accent-red/20"
                        }`}>
                          {med.status === "taken" ? (
                            <Check className="w-5 h-5 text-accent-green" />
                          ) : (
                            <X className="w-5 h-5 text-accent-red" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{med.name}</p>
                          <p className="text-sm text-muted-foreground">{med.time}</p>
                        </div>
                        <span className={`text-xs font-medium ${
                          med.status === "taken" ? "text-accent-green" : "text-accent-red"
                        }`}>
                          {med.status === "taken" ? "Tomado" : "Omitido"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
