import { useState } from "react";
import { StatusBar } from "../StatusBar";
import { TabBar } from "../TabBar";
import { MedicationCard } from "../MedicationCard";
import { StockCard } from "../StockCard";
import { Toast } from "../Toast";
import { AddMedicationModal } from "../modals/AddMedicationModal";
import { EditMedicationModal } from "../modals/EditMedicationModal";
import { StockManagementModal } from "../modals/StockManagementModal";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import QuickActions from "../QuickActions";
import { Pill, Package, TrendingUp, Edit2, Trash2 } from "lucide-react";

interface HomeScreenProps {
  userName: string;
  userPhoto?: string;
  onNavigate: (screen: string) => void;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
}

export function HomeScreen({ userName, userPhoto, onNavigate }: HomeScreenProps) {
  const [medications, setMedications] = useState<Medication[]>([
    { id: 1, name: "Paracetamol", dosage: "500mg", frequency: "cada-8h", time: "08:00" },
    { id: 2, name: "Omeprazol", dosage: "20mg", frequency: "diaria", time: "07:00" },
    { id: 3, name: "Vitamina C", dosage: "1000mg", frequency: "diaria", time: "09:00" },
  ]);

  const [stockItems, setStockItems] = useState([
    { name: "Omeprazol", quantity: 10 },
    { name: "Paracetamol", quantity: 8 },
    { name: "Vitamina C", quantity: 2 },
    { name: "Ibuprofeno", quantity: 5 },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMedOptions, setShowMedOptions] = useState<number | null>(null);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "success" | "error" | "info" });

  const handleAddMedication = (newMed: { name: string; dosage: string; frequency: string; time: string }) => {
    const medication: Medication = {
      id: medications.length + 1,
      ...newMed
    };
    setMedications([...medications, medication]);
    setToast({ show: true, message: "Medicamento agregado exitosamente", type: "success" });
  };

  const handleEditClick = (med: Medication) => {
    setSelectedMed(med);
    setShowMedOptions(null);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedMed: Medication) => {
    setMedications(medications.map(m => m.id === updatedMed.id ? updatedMed : m));
    setToast({ show: true, message: "Medicamento actualizado", type: "success" });
  };

  const handleDeleteClick = (med: Medication) => {
    setSelectedMed(med);
    setShowMedOptions(null);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (selectedMed) {
      setMedications(medications.filter(med => med.id !== selectedMed.id));
      setToast({ show: true, message: "Medicamento eliminado", type: "info" });
    }
    setShowDeleteDialog(false);
    setSelectedMed(null);
  };

  const handleUpdateStock = (updates: { name: string; quantity: number }[]) => {
    setStockItems(updates);
    setToast({ show: true, message: "Stock actualizado", type: "success" });
  };

  const todayTaken = 3;
  const totalToday = 5;

  return (
    <div className="min-h-screen bg-background pb-24">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="max-w-[375px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Hola,</p>
              <h2 className="mt-1">{userName}</h2>
            </div>
            {userPhoto && (
              <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-white">
                <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-secondary h-full transition-all duration-500"
              style={{ width: `${(todayTaken / totalToday) * 100}%` }}
            />
          </div>
          <p className="text-xs mt-2 opacity-90">
            {todayTaken} de {totalToday} dosis tomadas hoy
          </p>
        </div>
      </div>

      <div className="max-w-[375px] mx-auto px-4 pt-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
            <Pill className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl">{medications.length}</p>
            <p className="text-xs text-muted-foreground">Medicamentos</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
            <Package className="w-5 h-5 text-secondary mb-2" />
            <p className="text-2xl">{stockItems.reduce((acc, item) => acc + item.quantity, 0)}</p>
            <p className="text-xs text-muted-foreground">Stock Total</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 shadow-sm">
            <TrendingUp className="w-5 h-5 mb-2" style={{ color: '#5AA622' }} />
            <p className="text-2xl">{Math.round((todayTaken / totalToday) * 100)}%</p>
            <p className="text-xs text-muted-foreground">Adherencia</p>
          </div>
        </div>

        {/* Medications Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2>Mis medicamentos</h2>
            <button 
              onClick={() => onNavigate('reminders')}
              className="text-sm text-primary hover:underline"
            >
              Ver recordatorios
            </button>
          </div>
          
          <div className="space-y-2">
            {medications.map((med) => (
              <div key={med.id} className="relative">
                <MedicationCard
                  name={med.name}
                  dosage={med.dosage}
                  onEdit={() => setShowMedOptions(showMedOptions === med.id ? null : med.id)}
                />
                
                {/* Options Menu */}
                {showMedOptions === med.id && (
                  <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                      onClick={() => handleEditClick(med)}
                      className="w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-muted transition-colors text-left"
                    >
                      <Edit2 className="w-4 h-4 text-primary" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(med)}
                      className="w-full px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-destructive/5 transition-colors text-destructive text-left border-t border-border"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            <MedicationCard 
              variant="add" 
              onEdit={() => setShowAddModal(true)} 
            />
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions onNavigate={onNavigate} />

        {/* Stock Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2>Mi Stock</h2>
            <button 
              onClick={() => setShowStockModal(true)}
              className="text-sm text-primary hover:underline"
            >
              Gestionar
            </button>
          </div>
          <StockCard
            title="Inventario de medicamentos"
            items={stockItems}
            onViewDetails={() => setShowStockModal(true)}
          />
        </div>
      </div>

      <TabBar activeTab="home" onTabChange={onNavigate} />

      {/* Close options menu when clicking outside */}
      {showMedOptions && (
        <div 
          className="fixed inset-0 z-[5]" 
          onClick={() => setShowMedOptions(null)}
        />
      )}

      {/* Modals */}
      <AddMedicationModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMedication}
      />

      <EditMedicationModal
        isOpen={showEditModal}
        medication={selectedMed}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
      />

      <StockManagementModal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        onUpdateStock={handleUpdateStock}
        items={stockItems}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Eliminar medicamento"
        message={`¿Estás seguro de que deseas eliminar ${selectedMed?.name}?`}
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
