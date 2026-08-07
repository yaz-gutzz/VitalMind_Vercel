import { useState, useEffect } from "react";
import { StatusBar } from "../StatusBar";
import { TabBar } from "../TabBar";
import { Switch } from "../ui/switch";
import { ConfirmDialog } from "../modals/ConfirmDialog";
import { ProfileEditModal } from "../modals/ProfileEditModal";
import { Toast } from "../Toast";
import { ChevronRight, Bell, Calendar, AlertCircle, LogOut, User, Edit, Moon, Sun, Shield, FileText, HelpCircle, Mic, CalendarClock, Users as UsersIcon, GitBranch } from "lucide-react";

interface SettingsScreenProps {
  userName: string;
  userEmail: string;
  userPhoto?: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function SettingsScreen({ userName, userEmail, userPhoto, onNavigate, onLogout }: SettingsScreenProps) {
  const [settings, setSettings] = useState({
    dailyNotifications: true,
    emergencyAlerts: true,
    darkMode: document.documentElement.classList.contains('dark'),
  });

  // Sincronizar el estado con el DOM al montar
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setSettings(prev => ({ ...prev, darkMode: isDark }));
  }, []);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "info" as "success" | "error" | "info" });
  const [currentName, setCurrentName] = useState(userName);
  const [currentPhoto, setCurrentPhoto] = useState(userPhoto || "");

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    if (key === 'darkMode') {
      document.documentElement.classList.toggle('dark');
      setToast({ 
        show: true, 
        message: `Modo ${!settings.darkMode ? 'oscuro' : 'claro'} activado`, 
        type: "success" 
      });
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutDialog(false);
    onLogout();
  };

  const handleSaveProfile = (data: { name: string; phone: string; birthdate: string; photo?: string }) => {
    setCurrentName(data.name);
    if (data.photo !== undefined) {
      setCurrentPhoto(data.photo);
    }
    setToast({ show: true, message: "Perfil actualizado exitosamente", type: "success" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="max-w-[375px] mx-auto px-4 py-6">
          <h2>Configuración</h2>
          <p className="text-sm opacity-90 mt-1">Personaliza tu experiencia</p>
        </div>
      </div>

      <div className="max-w-[375px] mx-auto px-4 pt-6 space-y-6">
        {/* Profile Card */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
          <div className="flex items-center gap-4">
            {currentPhoto ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                <img src={currentPhoto} alt={currentName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h3>{currentName}</h3>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
            <button
              onClick={() => setShowProfileEdit(true)}
              className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
            >
              <Edit className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border space-y-1">
          <h3 className="mb-3">Notificaciones</h3>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <span>Recordatorios diarios</span>
                <p className="text-xs text-muted-foreground">Notificaciones de medicamentos</p>
              </div>
            </div>
            <Switch
              checked={settings.dailyNotifications}
              onCheckedChange={() => toggleSetting('dailyNotifications')}
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <span>Alertas de emergencia</span>
                <p className="text-xs text-muted-foreground">Stock bajo y vencimientos</p>
              </div>
            </div>
            <Switch
              checked={settings.emergencyAlerts}
              onCheckedChange={() => toggleSetting('emergencyAlerts')}
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
              <div>
                <span>Modo oscuro</span>
                <p className="text-xs text-muted-foreground">Tema oscuro para tus ojos</p>
              </div>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={() => toggleSetting('darkMode')}
            />
          </div>
        </div>

        {/* Health Management */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <h3 className="px-4 pt-4 pb-2 text-muted-foreground text-sm">Gestión de Salud Premium</h3>
          
          <button 
            onClick={() => onNavigate('appointments')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <span>Citas Médicas</span>
                <p className="text-xs text-muted-foreground">Consultas y laboratorios</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-medium shadow-sm">Premium</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>

          <button 
            onClick={() => onNavigate('caregivers')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/10 to-pink-500/10 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <span>Cuidadores y Familia</span>
                <p className="text-xs text-muted-foreground">Compartir información</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-medium shadow-sm">Premium</span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </button>
        </div>

        {/* App Settings */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <h3 className="px-4 pt-4 pb-2 text-muted-foreground text-sm">Configuración General</h3>
          
          <button 
            onClick={() => onNavigate('alexa')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00CAFF]/10 to-[#1C90F3]/10 flex items-center justify-center">
                <Mic className="w-5 h-5 text-[#00CAFF]" />
              </div>
              <div className="text-left">
                <span>Integración Alexa</span>
                <p className="text-xs text-muted-foreground">Control por voz</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button 
            onClick={() => onNavigate('flowcharts')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <span>Flujos de la App</span>
                <p className="text-xs text-muted-foreground">Arquitectura y navegación</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button 
            onClick={() => onNavigate('privacy')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div className="text-left">
                <span>Privacidad y seguridad</span>
                <p className="text-xs text-muted-foreground">Gestiona tus datos</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button 
            onClick={() => onNavigate('terms')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div className="text-left">
                <span>Términos y condiciones</span>
                <p className="text-xs text-muted-foreground">Lee nuestros términos</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button 
            onClick={() => onNavigate('help')}
            className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-secondary" />
              <div className="text-left">
                <span>Ayuda y soporte</span>
                <p className="text-xs text-muted-foreground">Obtén ayuda</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Logout Section */}
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <button 
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-between p-4 hover:bg-destructive/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center group-hover:from-orange-500/20 group-hover:to-red-500/20 transition-colors">
                <LogOut className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <span className="text-orange-600">Cerrar sesión</span>
                <p className="text-xs text-muted-foreground">Salir de tu cuenta</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-orange-600" />
          </button>
        </div>

        {/* App Version */}
        <div className="text-center text-sm text-muted-foreground">
          <p>MedAlert+ v2.5.0</p>
          <p className="text-xs mt-1">© 2025 MedAlert+. Todos los derechos reservados.</p>
        </div>
      </div>

      <TabBar activeTab="profile" onTabChange={onNavigate} />

      <ConfirmDialog
        isOpen={showLogoutDialog}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas salir de tu cuenta? Tendrás que volver a iniciar sesión para acceder a la aplicación."
        type="logout"
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutDialog(false)}
      />

      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        currentName={currentName}
        currentEmail={userEmail}
        currentPhoto={currentPhoto}
        onSave={handleSaveProfile}
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