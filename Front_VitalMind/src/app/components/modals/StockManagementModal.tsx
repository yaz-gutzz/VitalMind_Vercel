import { useState } from "react";
import { X, Package, Plus, Minus, PlusCircle } from "lucide-react";

interface StockManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStock: (updates: { name: string; quantity: number }[]) => void;
  items: { name: string; quantity: number }[];
}

export function StockManagementModal({ isOpen, onClose, onUpdateStock, items }: StockManagementModalProps) {
  const [localItems, setLocalItems] = useState(items);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("1");

  if (!isOpen) return null;

  const handleIncrease = (index: number) => {
    const newItems = [...localItems];
    newItems[index].quantity += 1;
    setLocalItems(newItems);
  };

  const handleDecrease = (index: number) => {
    const newItems = [...localItems];
    if (newItems[index].quantity > 0) {
      newItems[index].quantity -= 1;
      setLocalItems(newItems);
    }
  };

  const handleAddNewItem = () => {
    if (newItemName.trim() && parseInt(newItemQuantity) > 0) {
      const newItem = {
        name: newItemName.trim(),
        quantity: parseInt(newItemQuantity)
      };
      setLocalItems([...localItems, newItem]);
      setNewItemName("");
      setNewItemQuantity("1");
      setShowAddNew(false);
    }
  };

  const handleSave = () => {
    onUpdateStock(localItems);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-in fade-in">
      <div className="bg-card w-full max-w-[375px] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-secondary" />
            </div>
            <h2>Gestionar Stock</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-3 flex-1 overflow-y-auto mb-4">
          {localItems.map((item, index) => (
            <div key={index} className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span>{item.name}</span>
                <span className={`text-sm ${item.quantity <= 2 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {item.quantity} unidades
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDecrease(index)}
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center text-xl">{item.quantity}</div>
                <button
                  onClick={() => handleIncrease(index)}
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary/10 hover:border-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add New Item Form */}
          {showAddNew ? (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Nombre del medicamento</label>
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="ej. Ibuprofeno"
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Cantidad inicial</label>
                <input
                  type="number"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  min="1"
                  className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddNew(false)}
                  className="flex-1 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNewItem}
                  className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  Agregar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddNew(true)}
              className="w-full py-3 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Agregar nuevo medicamento</span>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
