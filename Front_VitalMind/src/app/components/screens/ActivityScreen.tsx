import { useState } from "react";
import { StatusBar } from "../StatusBar";
import { TabBar } from "../TabBar";
import { Calendar } from "../ui/calendar";
import { HistoryScreen } from "./HistoryScreen";
import { Clock, Activity as ActivityIcon, History, CalendarIcon } from "lucide-react";

interface ActivityScreenProps {
  userName: string;
  onNavigate: (screen: string) => void;
}

export function ActivityScreen({ userName, onNavigate }: ActivityScreenProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'calendar' | 'history'>('calendar');

  const schedules = [
    { time: "8:30 AM", medication: "Omeprazol", taken: true },
    { time: "10:00 AM", medication: "Vitamina C", taken: true },
    { time: "12:00 PM", medication: "Omeprazol", taken: false },
    { time: "3:00 PM", medication: "Paracetamol", taken: false },
    { time: "9:00 PM", medication: "Vitamina C", taken: false },
  ];

  if (view === 'history') {
    return <HistoryScreen userName={userName} onNavigate={onNavigate} />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="max-w-[375px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ActivityIcon className="w-5 h-5" />
              <h2>Actividades</h2>
            </div>
            <button
              onClick={() => setView('history')}
              className="flex items-center gap-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              <History className="w-4 h-4" />
              Historial
            </button>
          </div>
          <p className="text-sm opacity-90 mt-1">Calendario y horarios</p>
        </div>
      </div>

      <div className="max-w-[375px] mx-auto px-4 pt-6 space-y-6">
        {/* Calendar Card */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 hover:bg-accent hover:text-accent-foreground rounded-md",
              day_range_end: "day-range-end",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
        </div>

        {/* Schedule List */}
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3>Horarios del día</h3>
          </div>

          <div className="space-y-2">
            {schedules.map((schedule, index) => (
              <div
                key={index}
                className={`flex items-center justify-between py-3 px-3 rounded-lg border transition-colors ${
                  schedule.taken 
                    ? 'bg-secondary/10 border-secondary/20' 
                    : 'bg-muted border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${schedule.taken ? 'bg-secondary' : 'bg-muted-foreground'}`} />
                  <div>
                    <p className="text-sm">{schedule.medication}</p>
                    <p className="text-xs text-muted-foreground">{schedule.time}</p>
                  </div>
                </div>
                {schedule.taken && (
                  <span className="text-xs text-secondary">✓ Tomado</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-4">
          <h3 className="mb-3">Acceso rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setView('history')}
              className="py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors flex flex-col items-center gap-1"
            >
              <History className="w-5 h-5 text-primary" />
              <span className="text-xs">Ver historial</span>
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors flex flex-col items-center gap-1"
            >
              <CalendarIcon className="w-5 h-5" style={{ color: '#5AA622' }} />
              <span className="text-xs">Recordatorios</span>
            </button>
          </div>
        </div>
      </div>

      <TabBar activeTab="activity" onTabChange={onNavigate} />
    </div>
  );
}
