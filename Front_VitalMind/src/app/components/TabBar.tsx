import { Home, Calendar, Activity, MessageCircle, Settings } from "lucide-react";

interface TabBarProps {
  activeTab?: 'home' | 'calendar' | 'activity' | 'favorites' | 'profile';
  onTabChange?: (tab: string) => void;
}

export function TabBar({ activeTab = 'home', onTabChange }: TabBarProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'calendar', icon: Calendar, label: 'Recordatorios' },
    { id: 'activity', icon: Activity, label: 'Actividad' },
    { id: 'favorites', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-xl safe-area-inset-bottom">
      <div className="max-w-[375px] mx-auto">
        <div className="flex justify-around items-center h-[64px] px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
                
                {/* Icon with background for active state */}
                <div className={`relative transition-all duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}>
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 rounded-lg blur-sm" />
                  )}
                  <Icon className="w-5 h-5 relative" />
                </div>
                
                <span className={`text-[10px] font-medium transition-all ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {/* Home Indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-[134px] h-[4px] bg-foreground/20 dark:bg-foreground/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}
