import React from 'react';
import { FileText, Download, Printer, Share2, Calendar, User, Pill, Activity, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Medication {
  name: string;
  dose: string;
  frequency: string;
  times: string[];
  adherence: number;
}

interface ReportData {
  patientName: string;
  reportDate: Date;
  periodStart: Date;
  periodEnd: Date;
  medications: Medication[];
  overallAdherence: number;
  missedDoses: number;
  takenDoses: number;
  allergies: string[];
  conditions: string[];
}

interface ReportGeneratorProps {
  data: ReportData;
  onClose: () => void;
}

export default function ReportGenerator({ data, onClose }: ReportGeneratorProps) {
  const handleGeneratePDF = () => {
    // En una implementación real, esto generaría un PDF usando una biblioteca como jsPDF
    alert('Generando reporte en PDF...\n\nEn una versión de producción, esto descargaría un archivo PDF con toda la información médica.');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Reporte Médico - MedAlert+',
        text: `Reporte médico para ${data.patientName}`,
      }).catch(() => {
        alert('Error al compartir');
      });
    } else {
      alert('Función de compartir no disponible en este dispositivo');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - No Print */}
      <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] text-white p-4 sticky top-0 z-10 shadow-lg print:hidden">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center">Reporte Médico</h1>
          <div className="w-10" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleGeneratePDF}
            className="bg-white/20 hover:bg-white/30 border-0"
            size="sm"
          >
            <Download className="w-4 h-4 mr-1.5" />
            PDF
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-white/20 hover:bg-white/30 border-0"
            size="sm"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Imprimir
          </Button>
          <Button
            onClick={handleShare}
            className="bg-white/20 hover:bg-white/30 border-0"
            size="sm"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Report Content - Printable */}
      <div className="p-6 max-w-4xl mx-auto space-y-6 print:p-8">
        {/* Header */}
        <div className="text-center mb-8 print:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-blue-900 print:text-black">MedAlert+</h1>
              <p className="text-gray-600">Reporte Médico</p>
            </div>
          </div>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
        </div>

        {/* Patient Info */}
        <Card className="p-6 print:shadow-none print:border-2">
          <h2 className="mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Información del Paciente
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre del Paciente</p>
              <p className="font-medium">{data.patientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha del Reporte</p>
              <p className="font-medium">{formatDate(data.reportDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Período Reportado</p>
              <p className="font-medium">
                {formatDate(data.periodStart)} - {formatDate(data.periodEnd)}
              </p>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <Card className="p-6 print:shadow-none print:border-2">
          <h2 className="mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Resumen de Adherencia
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg print:border print:border-green-200">
              <p className="text-3xl text-green-600">{data.overallAdherence}%</p>
              <p className="text-sm text-gray-600">Adherencia Global</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg print:border print:border-blue-200">
              <p className="text-3xl text-blue-600">{data.takenDoses}</p>
              <p className="text-sm text-gray-600">Dosis Tomadas</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg print:border print:border-red-200">
              <p className="text-3xl text-red-600">{data.missedDoses}</p>
              <p className="text-sm text-gray-600">Dosis Omitidas</p>
            </div>
          </div>
        </Card>

        {/* Medications List */}
        <Card className="p-6 print:shadow-none print:border-2 print:break-inside-avoid">
          <h2 className="mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            Medicamentos Actuales
          </h2>
          <div className="space-y-4">
            {data.medications.map((med, index) => (
              <div key={index} className="pb-4 border-b last:border-b-0 print:break-inside-avoid">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{med.name}</h3>
                    <p className="text-sm text-gray-600">{med.dose}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      med.adherence >= 80 ? 'text-green-600' : 
                      med.adherence >= 60 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {med.adherence}%
                    </p>
                    <p className="text-xs text-gray-500">Adherencia</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="mb-1">
                    <span className="font-medium">Frecuencia:</span> {med.frequency}
                  </p>
                  <p>
                    <span className="font-medium">Horarios:</span> {med.times.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Allergies & Conditions */}
        <div className="grid md:grid-cols-2 gap-4 print:break-inside-avoid">
          <Card className="p-6 print:shadow-none print:border-2">
            <h3 className="mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Alergias
            </h3>
            {data.allergies.length > 0 ? (
              <ul className="space-y-2">
                {data.allergies.map((allergy, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    {allergy}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No se han registrado alergias</p>
            )}
          </Card>

          <Card className="p-6 print:shadow-none print:border-2">
            <h3 className="mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Condiciones Médicas
            </h3>
            {data.conditions.length > 0 ? (
              <ul className="space-y-2">
                {data.conditions.map((condition, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No se han registrado condiciones</p>
            )}
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t print:pt-12">
          <p>Este reporte fue generado automáticamente por MedAlert+</p>
          <p className="mt-1">Fecha de generación: {formatDate(new Date())}</p>
          <p className="mt-4 text-xs">
            Este documento es solo para fines informativos. Consulte con su médico antes de realizar cambios en su tratamiento.
          </p>
        </div>
      </div>
    </div>
  );
}
