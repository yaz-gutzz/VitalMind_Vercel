import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Pill, Shield } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

interface InteractionCheckerProps {
  medications: string[];
  className?: string;
}

export default function InteractionChecker({ medications, className = '' }: InteractionCheckerProps) {
  // Base de datos simulada de interacciones medicamentosas
  const interactionDatabase: DrugInteraction[] = [
    {
      drug1: 'Losartán',
      drug2: 'Ibuprofeno',
      severity: 'medium',
      description: 'El ibuprofeno puede reducir la efectividad del losartán y aumentar el riesgo de problemas renales.',
      recommendation: 'Use paracetamol en lugar de ibuprofeno. Consulte a su médico.'
    },
    {
      drug1: 'Warfarina',
      drug2: 'Aspirina',
      severity: 'high',
      description: 'Combinación de anticoagulantes que aumenta significativamente el riesgo de sangrado.',
      recommendation: 'NO tome estos medicamentos juntos sin supervisión médica. Contacte a su médico inmediatamente.'
    },
    {
      drug1: 'Metformina',
      drug2: 'Alcohol',
      severity: 'high',
      description: 'El alcohol combinado con metformina puede causar acidosis láctica, una condición potencialmente mortal.',
      recommendation: 'Evite completamente el consumo de alcohol mientras tome metformina.'
    },
    {
      drug1: 'Atorvastatina',
      drug2: 'Pomelo',
      severity: 'medium',
      description: 'El pomelo (toronja) aumenta los niveles de atorvastatina en sangre, aumentando el riesgo de efectos secundarios.',
      recommendation: 'Evite consumir pomelo y jugo de pomelo.'
    },
    {
      drug1: 'Omeprazol',
      drug2: 'Clopidogrel',
      severity: 'medium',
      description: 'El omeprazol puede reducir la efectividad del clopidogrel para prevenir coágulos.',
      recommendation: 'Considere usar pantoprazol como alternativa. Consulte a su médico.'
    }
  ];

  const checkInteractions = (): DrugInteraction[] => {
    const interactions: DrugInteraction[] = [];
    
    medications.forEach(med1 => {
      medications.forEach(med2 => {
        if (med1 !== med2) {
          const interaction = interactionDatabase.find(
            i => (i.drug1.toLowerCase().includes(med1.toLowerCase()) && 
                  i.drug2.toLowerCase().includes(med2.toLowerCase())) ||
                 (i.drug2.toLowerCase().includes(med1.toLowerCase()) && 
                  i.drug1.toLowerCase().includes(med2.toLowerCase()))
          );
          
          if (interaction && !interactions.find(i => 
            (i.drug1 === interaction.drug1 && i.drug2 === interaction.drug2) ||
            (i.drug1 === interaction.drug2 && i.drug2 === interaction.drug1)
          )) {
            interactions.push(interaction);
          }
        }
      });
    });
    
    return interactions;
  };

  const interactions = checkInteractions();
  const highSeverity = interactions.filter(i => i.severity === 'high').length;
  const mediumSeverity = interactions.filter(i => i.severity === 'medium').length;
  const lowSeverity = interactions.filter(i => i.severity === 'low').length;

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'high':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'low':
        return <Info className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high':
        return 'bg-red-500/10 border-red-200';
      case 'medium':
        return 'bg-orange-500/10 border-orange-200';
      case 'low':
        return 'bg-yellow-500/10 border-yellow-200';
      default:
        return 'bg-gray-500/10 border-gray-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'high':
        return <Badge className="bg-red-500">Alta</Badge>;
      case 'medium':
        return <Badge className="bg-orange-500">Media</Badge>;
      case 'low':
        return <Badge className="bg-yellow-500">Baja</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={className}>
      {/* Summary Card */}
      <Card className="p-4 bg-white shadow-md mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3>Detector de Interacciones</h3>
            <p className="text-sm text-gray-600">
              {medications.length} medicamentos analizados
            </p>
          </div>
        </div>

        {interactions.length === 0 ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">No se detectaron interacciones</p>
                <p className="text-sm text-green-700">Tus medicamentos parecen ser compatibles</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {highSeverity > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-2xl text-red-600">{highSeverity}</p>
                <p className="text-xs text-red-700">Alta</p>
              </div>
            )}
            {mediumSeverity > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                <p className="text-2xl text-orange-600">{mediumSeverity}</p>
                <p className="text-xs text-orange-700">Media</p>
              </div>
            )}
            {lowSeverity > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-2xl text-yellow-600">{lowSeverity}</p>
                <p className="text-xs text-yellow-700">Baja</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Interactions List */}
      {interactions.length > 0 && (
        <div className="space-y-3">
          <h4>Interacciones Detectadas</h4>
          
          {interactions.map((interaction, index) => (
            <Card 
              key={index} 
              className={`p-4 border ${getSeverityColor(interaction.severity)}`}
            >
              <div className="flex items-start gap-3 mb-3">
                {getSeverityIcon(interaction.severity)}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium">
                        {interaction.drug1} + {interaction.drug2}
                      </h5>
                    </div>
                    {getSeverityBadge(interaction.severity)}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {interaction.description}
                  </p>

                  <div className="p-3 bg-white rounded-lg">
                    <div className="flex items-start gap-2">
                      <Pill className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Recomendación:
                        </p>
                        <p className="text-sm text-blue-800">
                          {interaction.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Disclaimer */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Información Importante</p>
                <p>
                  Esta herramienta es solo para referencia. Siempre consulte con su médico o 
                  farmacéutico antes de hacer cambios en sus medicamentos.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
