import { Check, Shield, Sparkles, HeartPulse, Bell, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import vitalMindLogo from '../../imports/Captura_de_pantalla_2026-07-07_185523-removebg-preview.png';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.10),transparent_28%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.10),transparent_32%),linear-gradient(180deg,#070A12_0%,#0F172A_48%,#111827_100%)] text-white">
      <div className="pointer-events-none absolute top-[-100px] right-[-70px] h-72 w-72 rounded-full bg-cyan-500/10" />
      <div className="pointer-events-none absolute bottom-[-80px] left-[-60px] h-64 w-64 rounded-full bg-blue-500/10" />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-5 pb-6 pt-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <ImageWithFallback src={vitalMindLogo} alt="VitalMind AI" className="h-9 w-auto object-contain brightness-0 invert" />
          <button
            onClick={onComplete}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            Omitir
          </button>
        </div>

        <div className="flex flex-1 items-center py-8 lg:py-10">
          <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-cyan-100 uppercase"
              >
                <Sparkles className="h-4 w-4" />
                Onboarding inicial
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="max-w-xl text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.95] tracking-tight"
              >
                Tu salud, organizada en un solo lugar.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
                className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg"
              >
                VitalMind te acompaña con historial médico, alertas inteligentes, hábitos y seguimiento diario sin llenar la pantalla de pasos innecesarios.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                className="mt-7 flex flex-wrap gap-3"
              >
                {[
                  { icon: HeartPulse, label: 'Salud diaria' },
                  { icon: Bell, label: 'Recordatorios' },
                  { icon: Shield, label: 'Privacidad' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-cyan-300" />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="mt-8 grid gap-3 sm:grid-cols-3"
              >
                {[
                  'Historial médico',
                  'IA personalizada',
                  'Hábitos saludables',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
                    <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-300">
                      <Check className="h-4 w-4" />
                    </div>
                    <p className="font-semibold text-white">{item}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">Acceso rápido desde tu panel principal.</p>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Button
                  onClick={onComplete}
                  className="h-14 rounded-2xl bg-[linear-gradient(135deg,#0F766E_0%,#2563EB_100%)] px-6 text-base font-semibold text-white shadow-[0_16px_40px_rgba(15,118,110,0.32)] hover:opacity-95"
                >
                  Empezar ahora
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <Shield className="h-5 w-5 text-cyan-300" />
                  Tus datos médicos se mantienen privados y protegidos.
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute -inset-6 rounded-[2.5rem] bg-cyan-500/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-6">
                <div className="rounded-[1.6rem] border border-white/10 bg-[#0B1220]/90 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Vista previa</p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm font-semibold text-white">Resumen rápido</p>
                      <p className="mt-1 text-sm text-slate-300">Tu bienestar está estable. Hoy te sugerimos hidratación y una caminata corta.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-slate-400">Recordatorios</p>
                        <p className="mt-1 text-2xl font-bold text-white">3</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-slate-400">Bienestar</p>
                        <p className="mt-1 text-2xl font-bold text-white">86</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
                      Empieza con un solo paso y deja que VitalMind organice el resto.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}