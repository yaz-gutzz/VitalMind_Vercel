import React, { useState } from 'react';
import { 
  User, Heart, Phone, Stethoscope, Shield, AlertCircle, 
  Plus, Edit, Trash2, Camera, FileText, MapPin 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';

interface Allergy {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
  reaction: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  address: string;
}

interface MedicalProfileScreenProps {
  onBack: () => void;
}

export default function MedicalProfileScreen({ onBack }: MedicalProfileScreenProps) {
  const [editing, setEditing] = useState(false);
  
  // Perfil médico básico
  const [bloodType, setBloodType] = useState('O+');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [insurance, setInsurance] = useState('BlueCross Premium');
  const [insuranceNumber, setInsuranceNumber] = useState('BC-123456789');
  const [medicalConditions, setMedicalConditions] = useState('Hipertensión, Diabetes Tipo 2');
  
  // Alergias
  const [allergies, setAllergies] = useState<Allergy[]>([
    { id: '1', name: 'Penicilina', severity: 'high', reaction: 'Erupción cutánea severa' },
    { id: '2', name: 'Maní', severity: 'high', reaction: 'Anafilaxia' },
    { id: '3', name: 'Polen', severity: 'low', reaction: 'Rinitis' }
  ]);
  
  // Contactos de emergencia
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'María García', relationship: 'Esposa', phone: '+1 555-0101', isPrimary: true },
    { id: '2', name: 'Pedro García', relationship: 'Hijo', phone: '+1 555-0102', isPrimary: false }
  ]);
  
  // Médicos
  const [doctors, setDoctors] = useState<Doctor[]>([
    { 
      id: '1', 
      name: 'Dr. Juan Pérez', 
      specialty: 'Medicina General', 
      phone: '+1 555-0201',
      address: 'Calle Principal 123, Ciudad'
    },
    { 
      id: '2', 
      name: 'Dra. Ana Martínez', 
      specialty: 'Cardiología', 
      phone: '+1 555-0202',
      address: 'Av. Salud 456, Ciudad'
    }
  ]);

  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddDoctor, setShowAddDoctor] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'medium': return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'low': return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="flex-1 text-center">Perfil Médico</h1>
          <button 
            onClick={() => setEditing(!editing)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* Información Personal */}
        <Card className="p-4 bg-white shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <h2>Información Personal</h2>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo de Sangre</Label>
                <Input 
                  value={bloodType} 
                  onChange={(e) => setBloodType(e.target.value)}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Altura (cm)</Label>
                <Input 
                  value={height} 
                  onChange={(e) => setHeight(e.target.value)}
                  disabled={!editing}
                  className="mt-1"
                  type="number"
                />
              </div>
            </div>
            
            <div>
              <Label>Peso (kg)</Label>
              <Input 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)}
                disabled={!editing}
                className="mt-1"
                type="number"
              />
            </div>

            <div>
              <Label>Condiciones Médicas</Label>
              <Textarea 
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                disabled={!editing}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Seguro Médico */}
        <Card className="p-4 bg-white shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h2>Seguro Médico</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label>Aseguradora</Label>
              <Input 
                value={insurance} 
                onChange={(e) => setInsurance(e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Número de Póliza</Label>
              <Input 
                value={insuranceNumber} 
                onChange={(e) => setInsuranceNumber(e.target.value)}
                disabled={!editing}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Alergias */}
        <Card className="p-4 bg-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2>Alergias</h2>
            </div>
            <button 
              onClick={() => setShowAddAllergy(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          <div className="space-y-2">
            {allergies.map(allergy => (
              <div 
                key={allergy.id}
                className={`p-3 rounded-lg border ${getSeverityColor(allergy.severity)}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="font-medium">{allergy.name}</p>
                    <p className="text-sm opacity-80">{allergy.reaction}</p>
                  </div>
                  {editing && (
                    <button className="p-1 hover:bg-black/5 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <span className="text-xs px-2 py-1 bg-white/50 rounded-full">
                  {allergy.severity === 'high' ? 'Severidad Alta' : 
                   allergy.severity === 'medium' ? 'Severidad Media' : 'Severidad Baja'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Contactos de Emergencia */}
        <Card className="p-4 bg-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-xl">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <h2>Contactos de Emergencia</h2>
            </div>
            <button 
              onClick={() => setShowAddContact(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          <div className="space-y-3">
            {emergencyContacts.map(contact => (
              <div 
                key={contact.id}
                className={`p-3 rounded-lg border ${
                  contact.isPrimary 
                    ? 'bg-orange-500/5 border-orange-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{contact.name}</p>
                      {contact.isPrimary && (
                        <span className="text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full">
                          Principal
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.relationship}</p>
                    <p className="text-sm text-blue-600 mt-1">{contact.phone}</p>
                  </div>
                  {editing && (
                    <button className="p-1 hover:bg-black/5 rounded">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Médicos */}
        <Card className="p-4 bg-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Stethoscope className="w-6 h-6 text-purple-600" />
              </div>
              <h2>Mis Médicos</h2>
            </div>
            <button 
              onClick={() => setShowAddDoctor(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
          </div>

          <div className="space-y-3">
            {doctors.map(doctor => (
              <div 
                key={doctor.id}
                className="p-3 rounded-lg bg-purple-50 border border-purple-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium">{doctor.name}</p>
                    <p className="text-sm text-purple-600">{doctor.specialty}</p>
                  </div>
                  {editing && (
                    <button className="p-1 hover:bg-black/5 rounded">
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Acciones */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            onClick={() => alert('Generando reporte médico PDF...')}
          >
            <FileText className="w-5 h-5 mr-2" />
            Exportar Perfil Médico (PDF)
          </Button>
        </div>
      </div>
    </div>
  );
}
