import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Search, Pill, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const medications = [
  { 
    id: 1, 
    name: "Aspirina", 
    dose: "100mg", 
    frequency: "Diario", 
    time: "08:00",
    status: "active",
    color: "#2563EB",
    stock: 28
  },
  { 
    id: 2, 
    name: "Vitamina D", 
    dose: "1000 UI", 
    frequency: "Diario", 
    time: "08:00",
    status: "active",
    color: "#F59E0B",
    stock: 45
  },
  { 
    id: 3, 
    name: "Omeprazol", 
    dose: "20mg", 
    frequency: "Cada 12h", 
    time: "08:00, 20:00",
    status: "active",
    color: "#22C55E",
    stock: 15
  },
  { 
    id: 4, 
    name: "Metformina", 
    dose: "500mg", 
    frequency: "Cada 8h", 
    time: "08:00, 16:00, 00:00",
    status: "active",
    color: "#EF4444",
    stock: 5
  },
  { 
    id: 5, 
    name: "Losartán", 
    dose: "50mg", 
    frequency: "Diario", 
    time: "20:00",
    status: "paused",
    color: "#64748B",
    stock: 30
  },
];

export function MedicationsListScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMeds = medications.filter(med => 
    med.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 pt-12 pb-4">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-10 h-10 bg-muted rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Medicamentos</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar medicamentos..."
            className="w-full pl-12 pr-4 py-3 bg-muted border border-transparent rounded-[20px] focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      {/* Medications List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-3">
          {filteredMeds.map((med, index) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/medications/${med.id}`)}
              className="bg-card border border-border rounded-[20px] p-5 shadow-sm active:scale-98 transition-transform"
            >
              <div className="flex items-start gap-4">
                {/* Color Indicator */}
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${med.color}15` }}
                >
                  <Pill 
                    className="w-6 h-6" 
                    style={{ color: med.color }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">
                        {med.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {med.dose} · {med.frequency}
                      </p>
                    </div>
                    {med.status === "paused" && (
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                        Pausado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{med.time}</span>
                    </div>
                    
                    <div className={`flex items-center gap-1 ${
                      med.stock < 10 ? "text-accent-red" : "text-muted-foreground"
                    }`}>
                      <AlertCircle className="w-4 h-4" />
                      <span>{med.stock} días</span>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${Math.min(med.stock * 2, 100)}%`,
                        backgroundColor: med.stock < 10 ? "#EF4444" : med.color
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredMeds.length === 0 && (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground">No se encontraron medicamentos</p>
          </div>
        )}
      </div>

      {/* FAB - Add Medication */}
      <button
        onClick={() => navigate("/medications/add")}
        className="fixed bottom-24 right-6 w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 z-50"
      >
        <Plus className="w-8 h-8" />
      </button>
    </div>
  );
}
