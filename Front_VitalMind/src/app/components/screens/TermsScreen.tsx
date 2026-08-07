import { StatusBar } from "../StatusBar";
import { TabBar } from "../TabBar";
import { FileText, CheckCircle2, AlertCircle, Scale, ChevronLeft } from "lucide-react";

interface TermsScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export function TermsScreen({ onNavigate, onBack }: TermsScreenProps) {
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
            <FileText className="w-6 h-6" />
            <h2>Términos y Condiciones</h2>
          </div>
          <p className="text-sm opacity-90 mt-1">Condiciones de uso de MedAlert+</p>
        </div>
      </div>

      <div className="max-w-[375px] mx-auto px-4 pt-6 space-y-6">
        {/* Intro */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="mb-2">Acuerdo de Uso</h3>
              <p className="text-sm text-muted-foreground">
                Al usar MedAlert+, aceptas los siguientes términos y condiciones. 
                Por favor, léelos detenidamente.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Aceptación */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3>1. Aceptación de Términos</h3>
          <p className="text-sm text-muted-foreground">
            Al acceder y utilizar MedAlert+, aceptas estar legalmente vinculado por estos 
            términos y condiciones, así como por nuestra política de privacidad.
          </p>
          <p className="text-sm text-muted-foreground">
            Si no estás de acuerdo con alguno de estos términos, no debes usar esta aplicación.
          </p>
        </div>

        {/* 2. Uso del Servicio */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3>2. Uso del Servicio</h3>
          <p className="text-sm text-muted-foreground mb-2">
            MedAlert+ es una herramienta de apoyo para la gestión de medicamentos. Te comprometes a:
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground ml-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>Usar la aplicación de manera responsable</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>Proporcionar información veraz y actualizada</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>Mantener la confidencialidad de tu cuenta</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <span>Cumplir con las leyes aplicables</span>
            </li>
          </ul>
        </div>

        {/* 3. Responsabilidad Médica */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3>3. Responsabilidad Médica</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">MedAlert+ NO sustituye el consejo médico profesional.</strong>
            </p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• Esta aplicación es una herramienta de apoyo</li>
              <li>• No proporciona diagnósticos médicos</li>
              <li>• No reemplaza consultas con profesionales</li>
              <li>• Las decisiones médicas deben consultarse con un doctor</li>
            </ul>
          </div>
        </div>

        {/* 4. Limitación de Responsabilidad */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3>4. Limitación de Responsabilidad</h3>
          <p className="text-sm text-muted-foreground">
            MedAlert+ no se hace responsable de:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground ml-4">
            <li>• Errores en la toma de medicamentos</li>
            <li>• Reacciones adversas a medicamentos</li>
            <li>• Pérdida de datos por fallos técnicos</li>
            <li>• Interrupciones del servicio</li>
            <li>• Daños derivados del uso de la aplicación</li>
          </ul>
        </div>

        {/* 5. Propiedad Intelectual */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3>5. Propiedad Intelectual</h3>
          <p className="text-sm text-muted-foreground">
            Todo el contenido de MedAlert+ (diseño, código, logo, texto) está protegido 
            por derechos de autor y otras leyes de propiedad intelectual.
          </p>
          <p className="text-sm text-muted-foreground">
            No puedes copiar, modificar, distribuir o usar este contenido sin autorización 
            expresa por escrito.
          </p>
        </div>

        {/* 6. Modificaciones */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3>6. Modificaciones</h3>
          <p className="text-sm text-muted-foreground">
            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
            Los cambios serán efectivos inmediatamente después de su publicación en la aplicación.
          </p>
          <p className="text-sm text-muted-foreground">
            Es tu responsabilidad revisar estos términos periódicamente.
          </p>
        </div>

        {/* 7. Terminación */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3>7. Terminación</h3>
          <p className="text-sm text-muted-foreground">
            Puedes dejar de usar MedAlert+ en cualquier momento. Nos reservamos el derecho 
            de suspender o terminar tu acceso si violas estos términos.
          </p>
        </div>

        {/* Advertencia Importante */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-800 dark:text-red-500 mb-2">Advertencia Importante</h3>
              <p className="text-sm text-red-700 dark:text-red-600">
                Esta aplicación es una demostración. No debe usarse para gestionar medicamentos 
                reales sin supervisión médica profesional. Consulta siempre con tu médico.
              </p>
            </div>
          </div>
        </div>

        {/* Contacto Legal */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="mb-3">Contacto Legal</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Para consultas legales sobre estos términos:
          </p>
          <div className="space-y-2 text-sm">
            <p>📧 Email: legal@medalert.app</p>
            <p>🌐 Web: www.medalert.app/terms</p>
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
