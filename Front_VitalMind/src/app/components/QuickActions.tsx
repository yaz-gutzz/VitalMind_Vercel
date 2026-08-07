import React from 'react';
import { 
  Calendar, FileText, Shield, Users, 
  AlertCircle, Activity 
} from 'lucide-react';
import { Card } from './ui/card';

interface QuickActionsProps {
  onNavigate: (screen: string) => void;
}

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  const actions = [
    {
      id: 'appointments',
      icon: Calendar,
      label: 'Mis Citas',
      color: 'from-blue-500 to-purple-500',
      badge: 'Premium'
    },
    {
      id: 'caregivers',
      icon: Users,
      label: 'Familia',
      color: 'from-orange-500 to-pink-500',
      badge: 'Premium'
    },
    {
      id: 'activity',
      icon: Activity,
      label: 'Historial',
      color: 'from-purple-500 to-indigo-500',
      badge: null
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3>Accesos Rápidos</h3>
        <div className="flex items-center gap-1.5 text-purple-600">
          <Shield className="w-4 h-4" />
          <span className="text-xs">Gestión de Salud</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="p-3 cursor-pointer hover:shadow-lg transition-all active:scale-95 bg-white border border-border relative overflow-hidden group"
            >
              {/* Badge */}
              {action.badge && (
                <div className="absolute top-1.5 right-1.5">
                  <span className="text-[9px] bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium shadow-sm">
                    {action.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>

              {/* Label */}
              <p className="text-xs font-medium text-gray-900">{action.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Additional Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => alert('Funcionalidad Premium: Detector de Interacciones')}
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors text-purple-700 text-sm relative"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs">Interacciones</span>
          <span className="absolute top-1 right-1 text-[8px] bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium">PRO</span>
        </button>
        
        <button
          onClick={() => alert('Generando reporte básico...')}
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-blue-700 text-sm"
        >
          <FileText className="w-4 h-4" />
          <span className="text-xs">Reporte</span>
        </button>
      </div>
    </div>
  );
}
