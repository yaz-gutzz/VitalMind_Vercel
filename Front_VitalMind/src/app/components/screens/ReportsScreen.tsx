import { useNavigate } from "react-router";
import { Activity, Calendar, TrendingUp, Download, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const adherenceData = [
  { name: "Tomados", value: 85, color: "#0F766E" },
  { name: "Omitidos", value: 15, color: "#EF4444" },
];

const monthlyData = [
  { month: "Ene", adherence: 78 },
  { month: "Feb", adherence: 82 },
  { month: "Mar", adherence: 85 },
  { month: "Abr", adherence: 88 },
  { month: "May", adherence: 90 },
  { month: "Jun", adherence: 85 },
];

export function ReportsScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-secondary px-6 pt-12 pb-6 rounded-b-[32px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Reportes</h1>
            <p className="text-white/80 text-sm">Análisis de tu salud</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-[20px] p-4 text-center">
            <p className="text-3xl font-bold text-primary mb-1">85%</p>
            <p className="text-xs text-muted-foreground">Adherencia</p>
          </div>
          <div className="bg-card border border-border rounded-[20px] p-4 text-center">
            <p className="text-3xl font-bold text-accent-green mb-1">156</p>
            <p className="text-xs text-muted-foreground">Tomados</p>
          </div>
          <div className="bg-card border border-border rounded-[20px] p-4 text-center">
            <p className="text-3xl font-bold text-accent-red mb-1">28</p>
            <p className="text-xs text-muted-foreground">Omitidos</p>
          </div>
        </div>

        {/* Adherence Pie */}
        <div className="bg-card border border-border rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Adherencia Mensual</h2>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">
              Ver detalle
            </button>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={adherenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {adherenceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-card border border-border rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Tendencia (6 meses)</h2>
            <TrendingUp className="w-5 h-5 text-accent-green" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="adherence" fill="#0F766E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Más opciones</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate("/history")}
              className="w-full bg-card border border-border rounded-[20px] p-5 flex items-center justify-between hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <span className="font-medium text-foreground">Ver Historial Completo</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button 
              onClick={() => navigate("/symptoms")}
              className="w-full bg-card border border-border rounded-[20px] p-5 flex items-center justify-between hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-primary" />
                <span className="font-medium text-foreground">Registrar Síntomas</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-[20px] p-5 flex items-center justify-center gap-2 transition-all active:scale-95">
              <Download className="w-5 h-5" />
              <span className="font-semibold">Exportar Reporte PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
