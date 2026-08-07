import React, { useState } from 'react';
import { 
  Calendar, Clock, MapPin, Plus, Stethoscope, 
  CheckCircle, AlertCircle, Bell, FileText, Video, Phone, ChevronLeft, CalendarClock, Crown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { StatusBar } from '../StatusBar';

interface Appointment {
  id: string;
  type: 'consulta' | 'laboratorio' | 'vacuna' | 'control' | 'cirugia';
  doctor: string;
  specialty: string;
  date: Date;
  time: string;
  location: string;
  notes: string;
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  reminderSet: boolean;
  isVirtual?: boolean;
}

interface AppointmentsScreenProps {
  onBack: () => void;
}

export default function AppointmentsScreen({ onBack }: AppointmentsScreenProps) {
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
  const [showAddModal, setShowAddModal] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      type: 'consulta',
      doctor: 'Dr. Juan Pérez',
      specialty: 'Medicina General',
      date: new Date(2025, 10, 15, 10, 0),
      time: '10:00 AM',
      location: 'Hospital Central - Consultorio 305',
      notes: 'Revisión de resultados de laboratorio',
      status: 'confirmada',
      reminderSet: true,
      isVirtual: false
    },
    {
      id: '2',
      type: 'laboratorio',
      doctor: 'Lab. San Rafael',
      specialty: 'Análisis Clínicos',
      date: new Date(2025, 10, 12, 7, 30),
      time: '7:30 AM',
      location: 'Laboratorio San Rafael - Centro',
      notes: 'Perfil lipídico y glucosa en ayunas',
      status: 'pendiente',
      reminderSet: true,
      isVirtual: false
    },
    {
      id: '3',
      type: 'control',
      doctor: 'Dra. Ana Martínez',
      specialty: 'Cardiología',
      date: new Date(2025, 10, 20, 15, 30),
      time: '3:30 PM',
      location: 'Videoconsulta',
      notes: 'Control mensual de presión arterial',
      status: 'confirmada',
      reminderSet: true,
      isVirtual: true
    },
    {
      id: '4',
      type: 'vacuna',
      doctor: 'Centro de Vacunación',
      specialty: 'Inmunización',
      date: new Date(2025, 11, 1, 9, 0),
      time: '9:00 AM',
      location: 'Centro de Salud Municipal',
      notes: 'Vacuna antigripal anual',
      status: 'pendiente',
      reminderSet: false,
      isVirtual: false
    },
    {
      id: '5',
      type: 'consulta',
      doctor: 'Dr. Carlos López',
      specialty: 'Oftalmología',
      date: new Date(2025, 9, 28, 11, 0),
      time: '11:00 AM',
      location: 'Clínica Visión - Piso 2',
      notes: 'Examen de vista anual',
      status: 'completada',
      reminderSet: true,
      isVirtual: false
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'consulta': return <Stethoscope className="w-5 h-5" />;
      case 'laboratorio': return <FileText className="w-5 h-5" />;
      case 'vacuna': return <AlertCircle className="w-5 h-5" />;
      case 'control': return <CheckCircle className="w-5 h-5" />;
      case 'cirugia': return <Calendar className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'consulta': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'laboratorio': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      case 'vacuna': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'control': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'cirugia': return 'bg-red-500/10 text-red-600 border-red-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'confirmada':
        return <Badge className="bg-green-500">Confirmada</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'completada':
        return <Badge className="bg-blue-500">Completada</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-500">Cancelada</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const getDaysUntil = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Mañana';
    if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`;
    return `En ${diffDays} días`;
  };

  const upcomingAppointments = appointments
    .filter(apt => ['pendiente', 'confirmada'].includes(apt.status))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const pastAppointments = appointments
    .filter(apt => ['completada', 'cancelada'].includes(apt.status))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const displayAppointments = view === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <div className="min-h-screen bg-background pb-24">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md">
        <div className="max-w-[375px] mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Configuración</span>
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <h1>Citas Médicas</h1>
                <p className="text-sm opacity-90">Gestiona tus consultas</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-xs text-white">Premium</span>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm p-1 rounded-lg">
            <button
              onClick={() => setView('upcoming')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                view === 'upcoming'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <span className="text-sm">Próximas ({upcomingAppointments.length})</span>
            </button>
            <button
              onClick={() => setView('past')}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                view === 'past'
                  ? 'bg-white text-primary shadow-md'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <span className="text-sm">Historial ({pastAppointments.length})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        {view === 'upcoming' && upcomingAppointments.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">Esta semana</span>
              </div>
              <p className="text-2xl text-primary">{upcomingAppointments.filter(apt => {
                const daysUntil = Math.ceil((apt.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return daysUntil >= 0 && daysUntil <= 7;
              }).length}</p>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-xs text-muted-foreground">Recordatorios</span>
              </div>
              <p className="text-2xl text-secondary">{upcomingAppointments.filter(apt => apt.reminderSet).length}</p>
            </Card>
          </div>
        )}

        {/* Appointments List */}
        <div className="space-y-4">
          {displayAppointments.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-muted-foreground">
                {view === 'upcoming' 
                  ? 'No tienes citas próximas' 
                  : 'Sin historial de citas'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {view === 'upcoming' 
                  ? 'Agrega tu próxima consulta médica' 
                  : 'Las citas completadas aparecerán aquí'}
              </p>
            </Card>
          ) : (
            displayAppointments.map(appointment => (
              <Card 
                key={appointment.id} 
                className="p-4 bg-card shadow-sm border border-border hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-lg border ${getTypeColor(appointment.type)}`}>
                    {getTypeIcon(appointment.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(appointment.status)}
                    {appointment.isVirtual && (
                      <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-md flex items-center gap-1">
                        <Video className="w-3 h-3 text-purple-600" />
                        <span className="text-xs text-purple-600">Virtual</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div>
                    <h3>{appointment.doctor}</h3>
                    <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{formatDate(appointment.date)}</span>
                      <span className="text-muted-foreground">•</span>
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{appointment.time}</span>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{appointment.location}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Days Until Badge */}
                  {view === 'upcoming' && (
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-primary">
                          {getDaysUntil(appointment.date)}
                        </span>
                      </div>
                      {appointment.reminderSet && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-secondary/10 rounded-md">
                          <Bell className="w-3 h-3 text-secondary" />
                          <span className="text-xs text-secondary">Recordatorio activo</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {view === 'upcoming' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    {appointment.isVirtual ? (
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700" size="sm">
                        <Video className="w-4 h-4 mr-2" />
                        Unirse a videoconsulta
                      </Button>
                    ) : (
                      <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary/5" size="sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        Ver ubicación
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="w-12">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Add New Appointment Button */}
        <Button 
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
          size="lg"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Nueva Cita Médica
        </Button>

        {/* Premium Features Info */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200/50 dark:border-yellow-800/30 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="mb-1">Características Premium</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Gestiona tus citas médicas con recordatorios inteligentes, videoconsultas integradas y sincronización con tu calendario.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Recordatorios personalizados</li>
                <li>✓ Integración con videoconsulta</li>
                <li>✓ Exportar a calendario</li>
                <li>✓ Compartir con cuidadores</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}