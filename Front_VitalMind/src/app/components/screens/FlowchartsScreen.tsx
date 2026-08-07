import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface FlowchartsScreenProps {
  onBack: () => void;
}

export default function FlowchartsScreen({ onBack }: FlowchartsScreenProps) {
  const [currentFlow, setCurrentFlow] = useState(0);

  const flows = [
    {
      id: 1,
      title: 'FLOW 1',
      subtitle: 'Bienvenida a MedAlert+',
      image: 'https://images.unsplash.com/photo-1745045650344-fd019ababf92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwbWVkaWNhbCUyMHJvYm90JTIwaWxsdXN0cmF0aW9uJTIwYmx1ZXxlbnwxfHx8fDE3NjQ3NDY3NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'bg-primary',
      bgGradient: 'from-primary/20 to-blue-600/10',
      description: 'Presentación inicial de la aplicación con robot asistente médico que muestra las características principales de MedAlert+'
    },
    {
      id: 2,
      title: 'FLOW 2',
      subtitle: 'Recordatorios que Funcionan',
      image: 'https://images.unsplash.com/photo-1631130748362-156d28c00279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdCUyMHJlZCUyMGhlYXJ0JTIwaGVhbHRoY2FyZXxlbnwxfHx8fDE3NjQ3NDY3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'bg-red-500',
      bgGradient: 'from-red-500/20 to-orange-600/10',
      description: 'Robot con corazón mostrando el sistema de recordatorios y notificaciones personalizadas para nunca olvidar medicamentos'
    },
    {
      id: 3,
      title: 'FLOW 3',
      subtitle: 'Seguro y Privado',
      image: 'https://images.unsplash.com/photo-1664462149169-8332e5ffed0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdCUyMGdyZWVuJTIwc2VjdXJpdHklMjBzaGllbGR8ZW58MXx8fHwxNzY0NzQ2NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'bg-secondary',
      bgGradient: 'from-secondary/20 to-green-600/10',
      description: 'Robot con escudo de seguridad garantizando la privacidad y protección de datos médicos del usuario'
    },
    {
      id: 4,
      title: 'FLOW 4',
      subtitle: '¡Listo para Empezar!',
      image: 'https://images.unsplash.com/photo-1662103619893-9e20da456897?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2JvdCUyMHllbGxvdyUyMHdlbGxuZXNzJTIwaGVhbHRoY2FyZXxlbnwxfHx8fDE3NjQ3NDY3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      color: 'bg-amber-500',
      bgGradient: 'from-amber-500/20 to-yellow-600/10',
      description: 'Robot celebrando, listo para comenzar a usar MedAlert+ y cuidar tu salud con tecnología avanzada'
    }
  ];

  const handlePrevious = () => {
    setCurrentFlow((prev) => (prev > 0 ? prev - 1 : flows.length - 1));
  };

  const handleNext = () => {
    setCurrentFlow((prev) => (prev < flows.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 z-10">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:text-white hover:bg-white/10"
          >
            ← Atrás
          </Button>
          <h1 className="text-white">Flujos de la App</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="p-4 space-y-6 pb-20">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-white text-xl mb-2">Arquitectura de MedAlert+</h2>
          <p className="text-slate-400 text-sm">
            Explora los flujos principales de onboarding
          </p>
        </div>

        {/* Flow Counter */}
        <div className="text-center">
          <span className="text-white/60 text-sm">
            {currentFlow + 1} de {flows.length}
          </span>
        </div>

        {/* Main Flow Display */}
        <div className="relative">
          <motion.div
            key={currentFlow}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <Card className="overflow-hidden bg-slate-800 border-slate-700 p-0 shadow-2xl">
              {/* Flow Header */}
              <div className={`p-4 bg-gradient-to-r ${flows[currentFlow].bgGradient}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white">{flows[currentFlow].title}</h3>
                  <span className={`text-xs px-3 py-1 rounded-full ${flows[currentFlow].color} text-white shadow-lg`}>
                    Paso {currentFlow + 1}
                  </span>
                </div>
                <p className="text-sm text-white/90">{flows[currentFlow].subtitle}</p>
              </div>

              {/* Flow Image - Robot Mockup */}
              <div className={`p-6 bg-gradient-to-br ${flows[currentFlow].bgGradient}`}>
                <div className="rounded-2xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-sm p-4">
                  <div className="aspect-[9/16] rounded-xl overflow-hidden bg-slate-950 shadow-inner">
                    <ImageWithFallback
                      src={flows[currentFlow].image} 
                      alt={flows[currentFlow].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Flow Description */}
              <div className="p-4 bg-slate-900/50">
                <p className="text-sm text-slate-300 text-center leading-relaxed">
                  {flows[currentFlow].description}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
          {flows.map((flow, index) => (
            <button
              key={flow.id}
              onClick={() => setCurrentFlow(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentFlow 
                  ? 'w-8 bg-primary shadow-lg shadow-primary/50' 
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Grid View of All Flows */}
        <div className="space-y-3 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">Todos los Flujos</h3>
            <span className="text-xs text-slate-400">{flows.length} pantallas</span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {flows.map((flow, index) => (
              <motion.div
                key={flow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setCurrentFlow(index)}
                className="cursor-pointer"
              >
                <Card className={`overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  currentFlow === index 
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-slate-900 shadow-lg shadow-primary/20' 
                    : 'hover:shadow-lg'
                } bg-slate-800 border-slate-700`}>
                  <div className="flex items-center gap-3 p-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-950 shadow-inner">
                      <ImageWithFallback
                        src={flow.image} 
                        alt={flow.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${flow.color} text-white shadow-sm`}>
                          {flow.title}
                        </span>
                      </div>
                      <h4 className="text-white text-sm mb-1">{flow.subtitle}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {flow.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className={`w-5 h-5 transition-all ${
                      currentFlow === index ? 'text-primary' : 'text-slate-600'
                    }`} />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 shadow-lg">
          <div className="text-center">
            <h3 className="text-white mb-2">🤖 Sobre los Flujos</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Estos flujos muestran las pantallas de onboarding con nuestros robots 
              asistentes médicos. Cada robot presenta las características clave de 
              MedAlert+ de manera visual, amigable y profesional para dar la bienvenida 
              a nuevos usuarios.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}