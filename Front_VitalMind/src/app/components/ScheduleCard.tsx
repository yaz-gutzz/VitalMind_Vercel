import { Clock, Pill } from "lucide-react";

interface ScheduleItem {
  time: string;
  medication?: string;
}

interface ScheduleCardProps {
  title: string;
  schedule: ScheduleItem[];
}

export function ScheduleCard({ title, schedule }: ScheduleCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="text-sm">{title}</h3>
      </div>

      <div className="space-y-2">
        {schedule.map((item, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted transition-colors"
          >
            <span className="text-xs text-muted-foreground">{item.time}</span>
            {item.medication && (
              <div className="flex items-center gap-1">
                <Pill className="w-3 h-3 text-primary" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
