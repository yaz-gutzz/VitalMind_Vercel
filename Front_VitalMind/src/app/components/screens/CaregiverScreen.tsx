import React, { useState } from 'react';
import { 
  Users, UserPlus, Mail, Shield, Bell, Eye, 
  Check, X, Share2, QrCode, Link as LinkIcon, ChevronLeft, Crown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { StatusBar } from '../StatusBar';

interface Caregiver {
  id: string;
  name: string;
  email: string;
  relationship: string;
  permissions: {
    viewMedications: boolean;
    viewHistory: boolean;
    receiveAlerts: boolean;
    editMedications: boolean;
  };
  status: 'active' | 'pending' | 'inactive';
  addedDate: Date;
}

interface CaregiverScreenProps {
  onBack: () => void;
}

export default function CaregiverScreen({ onBack }: CaregiverScreenProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [shareMethod, setShareMethod] = useState<'email' | 'qr' | 'link'>('email');
  
  const [caregivers, setCaregivers] = useState<Caregiver[]>([
    {
      id: '1',
      name: 'María García',
      email: 'maria.garcia@email.com',
      relationship: 'Esposa',
      permissions: {
        viewMedications: true,
        viewHistory: true,
        receiveAlerts: true,
        editMedications: true
      },
      status: 'active',
      addedDate: new Date(2025, 9, 1)
    },
    {
      id: '2',
      name: 'Pedro García',
      email: 'pedro.garcia@email.com',
      relationship: 'Hijo',
      permissions: {
        viewMedications: true,
        viewHistory: true,
        receiveAlerts: true,
        editMedications: false
      },
      status: 'active',
      addedDate: new Date(2025, 9, 15)
    },
    {
      id: '3',
      name: 'Dr. Juan Pérez',
      email: 'juan.perez@hospital.com',
      relationship: 'Médico de Cabecera',
      permissions: {
        viewMedications: true,
        viewHistory: true,
        receiveAlerts: false,
        editMedications: false
      },
      status: 'pending',
      addedDate: new Date(2025, 10, 5)
    }
  ]);

  const [newCaregiver, setNewCaregiver] = useState({
    name: '',
    email: '',
    relationship: '',
    permissions: {
      viewMedications: true,
      viewHistory: true,
      receiveAlerts: true,
      editMedications: false
    }
  });

  const handleAddCaregiver = () => {
    if (!newCaregiver.name || !newCaregiver.email) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const caregiver: Caregiver = {
      id: Date.now().toString(),
      ...newCaregiver,
      status: 'pending',
      addedDate: new Date()
    };

    setCaregivers([...caregivers, caregiver]);
    setShowAddModal(false);
    setNewCaregiver({
      name: '',
      email: '',
      relationship: '',
      permissions: {
        viewMedications: true,
        viewHistory: true,
        receiveAlerts: true,
        editMedications: false
      }
    });
  };

  const handleRemoveCaregiver = (id: string) => {
    if (confirm('¿Estás seguro de que quieres remover este cuidador?')) {
      setCaregivers(caregivers.filter(c => c.id !== id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Activo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pendiente</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 text-white">Inactivo</Badge>;
      default:
        return null;
    }
  };

  const activeCaregivers = caregivers.filter(c => c.status === 'active').length;
  const pendingCaregivers = caregivers.filter(c => c.status === 'pending').length;

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
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1>Cuidadores y Familia</h1>
                <p className="text-sm opacity-90">Comparte tu información</p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-xs text-white">Premium</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[375px] mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-xs text-muted-foreground">Activos</span>
            </div>
            <p className="text-2xl text-secondary">{activeCaregivers}</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border-yellow-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-yellow-600" />
              </div>
              <span className="text-xs text-muted-foreground">Pendientes</span>
            </div>
            <p className="text-2xl text-yellow-600">{pendingCaregivers}</p>
          </Card>
        </div>

        {/* Privacy Info Card */}
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="mb-1">Control Total de Privacidad</h3>
              <p className="text-sm text-muted-foreground">
                Los cuidadores solo pueden acceder a la información que tú autorices. Puedes modificar o revocar permisos en cualquier momento.
              </p>
            </div>
          </div>
        </Card>

        {/* Caregivers List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3>Cuidadores Autorizados</h3>
            <span className="text-sm text-muted-foreground">({caregivers.length})</span>
          </div>
          
          {caregivers.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-muted-foreground">No hay cuidadores</h3>
              <p className="text-sm text-muted-foreground">
                Agrega a tus familiares o cuidadores para compartir información
              </p>
            </Card>
          ) : (
            caregivers.map(caregiver => (
              <Card key={caregiver.id} className="p-4 bg-card shadow-sm border border-border hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <span className="text-lg">{caregiver.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4>{caregiver.name}</h4>
                      <p className="text-sm text-muted-foreground">{caregiver.relationship}</p>
                      <p className="text-sm text-primary truncate">{caregiver.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(caregiver.status)}
                </div>

                {/* Permissions */}
                <div className="space-y-2.5 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">Permisos concedidos</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-2.5 rounded-lg border ${
                      caregiver.permissions.viewMedications 
                        ? 'bg-secondary/5 border-secondary/20' 
                        : 'bg-muted border-border'
                    }`}>
                      <div className="flex items-center gap-2">
                        {caregiver.permissions.viewMedications ? (
                          <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-xs">Ver medicamentos</span>
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-lg border ${
                      caregiver.permissions.viewHistory 
                        ? 'bg-secondary/5 border-secondary/20' 
                        : 'bg-muted border-border'
                    }`}>
                      <div className="flex items-center gap-2">
                        {caregiver.permissions.viewHistory ? (
                          <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-xs">Ver historial</span>
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-lg border ${
                      caregiver.permissions.receiveAlerts 
                        ? 'bg-secondary/5 border-secondary/20' 
                        : 'bg-muted border-border'
                    }`}>
                      <div className="flex items-center gap-2">
                        {caregiver.permissions.receiveAlerts ? (
                          <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-xs">Recibir alertas</span>
                      </div>
                    </div>

                    <div className={`p-2.5 rounded-lg border ${
                      caregiver.permissions.editMedications 
                        ? 'bg-secondary/5 border-secondary/20' 
                        : 'bg-muted border-border'
                    }`}>
                      <div className="flex items-center gap-2">
                        {caregiver.permissions.editMedications ? (
                          <Check className="w-4 h-4 text-secondary flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="text-xs">Editar info</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button variant="outline" className="flex-1" size="sm">
                    Editar Permisos
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveCaregiver(caregiver.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Add Caregiver Button */}
        <Button 
          onClick={() => setShowAddModal(true)}
          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
          size="lg"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Agregar Cuidador o Familiar
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
                Comparte de manera segura tu información médica con familiares y cuidadores de confianza.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Compartir en tiempo real</li>
                <li>✓ Permisos granulares personalizables</li>
                <li>✓ Notificaciones a cuidadores</li>
                <li>✓ Acceso temporal o permanente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add Caregiver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <Card className="w-full max-w-md bg-card p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <h3>Agregar Cuidador</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Share Method Selection */}
            <div className="mb-6">
              <Label className="mb-3 block">Método de Invitación</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setShareMethod('email')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    shareMethod === 'email'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <Mail className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <span className="text-xs">Email</span>
                </button>
                <button
                  onClick={() => setShareMethod('qr')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    shareMethod === 'qr'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <QrCode className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <span className="text-xs">Código QR</span>
                </button>
                <button
                  onClick={() => setShareMethod('link')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    shareMethod === 'link'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <LinkIcon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <span className="text-xs">Enlace</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="mb-2">Nombre Completo *</Label>
                <Input
                  value={newCaregiver.name}
                  onChange={(e) => setNewCaregiver({...newCaregiver, name: e.target.value})}
                  placeholder="Ej: María García"
                />
              </div>

              <div>
                <Label className="mb-2">Correo Electrónico *</Label>
                <Input
                  type="email"
                  value={newCaregiver.email}
                  onChange={(e) => setNewCaregiver({...newCaregiver, email: e.target.value})}
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <Label className="mb-2">Relación</Label>
                <Input
                  value={newCaregiver.relationship}
                  onChange={(e) => setNewCaregiver({...newCaregiver, relationship: e.target.value})}
                  placeholder="Ej: Esposa, Hijo, Médico..."
                />
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label>Permisos de Acceso</Label>
                
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm cursor-pointer">Ver medicamentos</Label>
                  </div>
                  <Switch
                    checked={newCaregiver.permissions.viewMedications}
                    onCheckedChange={(checked) => 
                      setNewCaregiver({
                        ...newCaregiver,
                        permissions: {...newCaregiver.permissions, viewMedications: checked}
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm cursor-pointer">Ver historial</Label>
                  </div>
                  <Switch
                    checked={newCaregiver.permissions.viewHistory}
                    onCheckedChange={(checked) => 
                      setNewCaregiver({
                        ...newCaregiver,
                        permissions: {...newCaregiver.permissions, viewHistory: checked}
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm cursor-pointer">Recibir alertas</Label>
                  </div>
                  <Switch
                    checked={newCaregiver.permissions.receiveAlerts}
                    onCheckedChange={(checked) => 
                      setNewCaregiver({
                        ...newCaregiver,
                        permissions: {...newCaregiver.permissions, receiveAlerts: checked}
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm cursor-pointer">Editar medicamentos</Label>
                  </div>
                  <Switch
                    checked={newCaregiver.permissions.editMedications}
                    onCheckedChange={(checked) => 
                      setNewCaregiver({
                        ...newCaregiver,
                        permissions: {...newCaregiver.permissions, editMedications: checked}
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddCaregiver}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Invitación
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
