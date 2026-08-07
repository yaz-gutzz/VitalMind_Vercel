import { useState } from "react";
import { StatusBar } from "../StatusBar";
import { ForgotPasswordModal } from "../modals/ForgotPasswordModal";
import { GoogleAccountSelector } from "../modals/GoogleAccountSelector";
import { GoogleLoginModal } from "../modals/GoogleLoginModal";
import { FacebookAccountSelector } from "../modals/FacebookAccountSelector";
import { FacebookLoginModal } from "../modals/FacebookLoginModal";
import { Mail, Lock, Shield } from "lucide-react";

interface SignInScreenProps {
  onSignIn: (email: string, name: string, photoURL?: string) => void;
}

export function SignInScreen({ onSignIn }: SignInScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showGoogleAccountSelector, setShowGoogleAccountSelector] = useState(false);
  const [showGoogleLoginModal, setShowGoogleLoginModal] = useState(false);
  const [showFacebookAccountSelector, setShowFacebookAccountSelector] = useState(false);
  const [showFacebookLoginModal, setShowFacebookLoginModal] = useState(false);

  const handleSubmit = () => {
    if (email.trim() && password.trim()) {
      const name = email.split('@')[0];
      onSignIn(email, name.charAt(0).toUpperCase() + name.slice(1));
    }
  };

  const handleGoogleSignIn = () => {
    setShowGoogleAccountSelector(true);
  };

  const handleGoogleAccountSelect = (account: any) => {
    setShowGoogleAccountSelector(false);
    onSignIn(account.email, account.name, `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.id}`);
  };

  const handleUseOtherAccount = () => {
    setShowGoogleAccountSelector(false);
    setShowGoogleLoginModal(true);
  };

  const handleGoogleLoginContinue = (email: string) => {
    setShowGoogleLoginModal(false);
    const name = email.split('@')[0];
    onSignIn(email, name.charAt(0).toUpperCase() + name.slice(1), `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`);
  };

  const handleFacebookSignIn = () => {
    setShowFacebookAccountSelector(true);
  };

  const handleFacebookAccountSelect = (account: any) => {
    setShowFacebookAccountSelector(false);
    onSignIn(account.email, account.name, `https://api.dicebear.com/7.x/avataaars/svg?seed=${account.id}`);
  };

  const handleFacebookUseOtherAccount = () => {
    setShowFacebookAccountSelector(false);
    setShowFacebookLoginModal(true);
  };

  const handleFacebookLoginContinue = (email: string, password: string) => {
    setShowFacebookLoginModal(false);
    const name = email.split('@')[0];
    onSignIn(email, name.charAt(0).toUpperCase() + name.slice(1), `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 relative flex flex-col">
      <StatusBar />
      
      <div className="max-w-[375px] mx-auto px-4 pt-16 pb-24 relative z-10 flex-1 flex flex-col justify-center w-full">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-[2.5rem] tracking-tight mb-2 font-bold" style={{ color: '#0066cc' }}>
            MedAlert+
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Tu asistente de salud inteligente
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              activeTab === "login"
                ? "bg-[#0066cc] text-white shadow-md"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              activeTab === "register"
                ? "bg-[#0066cc] text-white shadow-md"
                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Registrarme
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <div className="space-y-5 animate-fade-in">
            {/* Social Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#0066cc] hover:shadow-sm transition-all flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path d="M19.805 10.227c0-.709-.064-1.39-.182-2.045H10.1v3.868h5.438a4.651 4.651 0 01-2.018 3.051v2.508h3.268c1.913-1.76 3.017-4.352 3.017-7.382z" fill="#4285F4"/>
                  <path d="M10.1 20c2.73 0 5.018-.905 6.691-2.455l-3.268-2.537c-.905.607-2.064.964-3.423.964-2.632 0-4.86-1.777-5.655-4.164H1.055v2.618A9.996 9.996 0 0010.1 20z" fill="#34A853"/>
                  <path d="M4.445 11.81A6.007 6.007 0 014.1 10c0-.627.109-1.237.345-1.809V5.573H1.055A9.996 9.996 0 000 10c0 1.618.391 3.145 1.055 4.5l3.39-2.69z" fill="#FBBC05"/>
                  <path d="M10.1 3.977c1.482 0 2.809.509 3.855 1.509l2.891-2.89C15.11.964 12.827 0 10.1 0 6.155 0 2.736 2.382 1.055 5.573l3.39 2.618c.796-2.387 3.024-4.214 5.655-4.214z" fill="#EB4335"/>
                </svg>
                <span className="text-sm text-slate-700 dark:text-slate-300">Continuar con Google</span>
              </button>

              <button 
                onClick={handleFacebookSignIn}
                className="w-full py-3.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
                </svg>
                <span className="text-sm">Continuar con Facebook</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-500 dark:text-slate-400">o ingresa con email</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Email & Password Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Tu contraseña"
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="text-right">
                <button 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-[#0066cc] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-[#0066cc] text-white rounded-xl hover:bg-[#0052a3] shadow-md hover:shadow-lg active:scale-[0.98] transition-all mt-2"
              >
                Iniciar Sesión
              </button>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Tus datos están encriptados y seguros</span>
              </div>
            </div>
          </div>
        )}

        {/* Register Form */}
        {activeTab === "register" && (
          <div className="space-y-5 animate-fade-in">
            {/* Social Buttons */}
            <div className="space-y-3">
              <button 
                onClick={handleGoogleSignIn}
                className="w-full py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#0066cc] hover:shadow-sm transition-all flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                  <path d="M19.805 10.227c0-.709-.064-1.39-.182-2.045H10.1v3.868h5.438a4.651 4.651 0 01-2.018 3.051v2.508h3.268c1.913-1.76 3.017-4.352 3.017-7.382z" fill="#4285F4"/>
                  <path d="M10.1 20c2.73 0 5.018-.905 6.691-2.455l-3.268-2.537c-.905.607-2.064.964-3.423.964-2.632 0-4.86-1.777-5.655-4.164H1.055v2.618A9.996 9.996 0 0010.1 20z" fill="#34A853"/>
                  <path d="M4.445 11.81A6.007 6.007 0 014.1 10c0-.627.109-1.237.345-1.809V5.573H1.055A9.996 9.996 0 000 10c0 1.618.391 3.145 1.055 4.5l3.39-2.69z" fill="#FBBC05"/>
                  <path d="M10.1 3.977c1.482 0 2.809.509 3.855 1.509l2.891-2.89C15.11.964 12.827 0 10.1 0 6.155 0 2.736 2.382 1.055 5.573l3.39 2.618c.796-2.387 3.024-4.214 5.655-4.214z" fill="#EB4335"/>
                </svg>
                <span className="text-sm text-slate-700 dark:text-slate-300">Registrarse con Google</span>
              </button>

              <button 
                onClick={handleFacebookSignIn}
                className="w-full py-3.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"/>
                </svg>
                <span className="text-sm">Registrarse con Facebook</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-500 dark:text-slate-400">o crea una cuenta</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>

            {/* Email & Password Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 mb-2 block">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-[#0066cc] text-white rounded-xl hover:bg-[#0052a3] shadow-md hover:shadow-lg active:scale-[0.98] transition-all mt-2"
              >
                Crear Cuenta Gratis
              </button>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed pt-2">
                Al registrarte aceptas nuestros{' '}
                <span className="text-[#0066cc] hover:underline cursor-pointer">términos</span>
                {' '}y{' '}
                <span className="text-[#0066cc] hover:underline cursor-pointer">política de privacidad</span>
              </p>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Tus datos están encriptados y seguros</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Home Indicator */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-[134px] h-[5px] bg-slate-900/20 dark:bg-slate-100/20 rounded-full" />
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />

      {/* Google Account Selector Modal */}
      <GoogleAccountSelector 
        isOpen={showGoogleAccountSelector}
        onClose={() => setShowGoogleAccountSelector(false)}
        onSelectAccount={handleGoogleAccountSelect}
        onUseOtherAccount={handleUseOtherAccount}
      />

      {/* Google Login Modal */}
      <GoogleLoginModal 
        isOpen={showGoogleLoginModal}
        onClose={() => setShowGoogleLoginModal(false)}
        onContinue={handleGoogleLoginContinue}
      />

      {/* Facebook Account Selector Modal */}
      <FacebookAccountSelector 
        isOpen={showFacebookAccountSelector}
        onClose={() => setShowFacebookAccountSelector(false)}
        onSelectAccount={handleFacebookAccountSelect}
        onUseOtherAccount={handleFacebookUseOtherAccount}
      />

      {/* Facebook Login Modal */}
      <FacebookLoginModal 
        isOpen={showFacebookLoginModal}
        onClose={() => setShowFacebookLoginModal(false)}
        onContinue={handleFacebookLoginContinue}
      />
    </div>
  );
}