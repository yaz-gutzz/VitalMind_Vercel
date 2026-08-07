import { Package, ChevronRight, AlertCircle } from "lucide-react";

interface StockItem {
  name: string;
  quantity: number;
}

interface StockCardProps {
  title: string;
  items: StockItem[];
  onViewDetails?: () => void;
}

export function StockCard({ title, items, onViewDetails }: StockCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-secondary" />
          <h3>{title}</h3>
        </div>
        {onViewDetails && (
          <button 
            onClick={onViewDetails}
            className="text-primary hover:opacity-70 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="flex justify-between items-center py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              {item.quantity <= 2 && (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm">{item.name}</span>
            </div>
            <span className={`text-sm ${item.quantity <= 2 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {item.quantity} und
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
