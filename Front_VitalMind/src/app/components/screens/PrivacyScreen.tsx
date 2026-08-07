import { StatusBar } from "../StatusBar";
import { TabBar } from "../TabBar";
import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle, ChevronLeft } from "lucide-react";

interface PrivacyScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export function PrivacyScreen({ onNavigate, onBack }: PrivacyScreenProps) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground">
        <div className="max-w-[375px] mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Volver</span>
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <h2>Privacidad y Seguridad</h2>
          </div>
          <p className="text-sm opacity-90 mt-1">Tu información está protegida</p>
        </div>
      </div>

      <div className="max-w-[375px] mx-auto px-4 pt-6 space-y-6">
        {/* Intro */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="mb-2">Tu privacidad es nuestra prioridad</h3>
              <p className="text-sm text-muted-foreground">
                En MedAlert+ nos tomamos muy en serio la protección de tus datos médicos y personales.
              </p>
            </div>
          </div>
        </div>

        {/* Recopilación de Datos */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            <h3>Recopilación de Datos</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Recopilamos únicamente la información necesaria para brindarte el mejor servicio:</p>
            <ul className="space-y-1 ml-4">
              <li>• Información de medicamentos y dosis</li>
              <li>• Horarios de recordatorios</li>
              <li>• Historial de adherencia</li>
              <li>• Datos de perfil básicos (nombre, email)</li>
            </ul>
          </div>
        </div>

        {/* Uso de Datos */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            <h3>Uso de tus Datos</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Utilizamos tu información para:</p>
            <ul className="space-y-1 ml-4">
              <li>• Enviar recordatorios de medicamentos</li>
              <li>• Generar estadísticas de adherencia</li>
              <li>• Mejorar la experiencia de usuario</li>
              <li>• Personalizar recomendaciones</li>
            </ul>
            <p className="text-xs italic mt-2">
              Nunca compartimos tu información médica con terceros sin tu consentimiento explícito.
            </p>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <h3>Medidas de Seguridad</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Protegemos tus datos mediante:</p>
            <ul className="space-y-1 ml-4">
              <li>• Encriptación de datos en tránsito (SSL/TLS)</li>
              <li>• Almacenamiento seguro local</li>
              <li>• Autenticación protegida</li>
              <li>• Backups automáticos encriptados</li>
            </ul>
          </div>
        </div>

        {/* Tus Derechos */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            <h3>Tus Derechos</h3>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Tienes derecho a:</p>
            <ul className="space-y-1 ml-4">
              <li>• Acceder a tu información personal</li>
              <li>• Rectificar datos incorrectos</li>
              <li>• Solicitar la eliminación de tus datos</li>
              <li>• Exportar tu información</li>
              <li>• Revocar permisos en cualquier momento</li>
            </ul>
          </div>
        </div>

        {/* Nota Importante */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-800 dark:text-yellow-500 mb-2">Nota Importante</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-600">
                Esta es una aplicación de demostración. Para uso en producción con datos médicos reales, 
                debe implementarse con un backend seguro certificado (HIPAA, GDPR) y encriptación completa.
              </p>
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="mb-3">Contacto de Privacidad</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Para consultas sobre privacidad y seguridad:
          </p>
          <div className="space-y-2 text-sm">
            <p>📧 Email: privacy@medalert.app</p>
            <p>🌐 Web: www.medalert.app/privacy</p>
          </div>
        </div>

        {/* Última Actualización */}
        <div className="text-center text-xs text-muted-foreground pb-4">
          <p>Última actualización: 10 de noviembre, 2025</p>
          <p className="mt-1">Versión 1.0.0</p>
        </div>
      </div>

      <TabBar activeTab="profile" onTabChange={onNavigate} />
    </div>
  );
}
