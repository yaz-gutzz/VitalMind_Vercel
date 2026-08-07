import { useState, useEffect, useRef } from "react";
import { X, User, Mail, Phone, Calendar, Camera, Trash2 } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentEmail: string;
  currentPhoto?: string;
  onSave: (data: { name: string; phone: string; birthdate: string; photo?: string }) => void;
}

export function ProfileEditModal({ isOpen, onClose, currentName, currentEmail, currentPhoto, onSave }: ProfileEditModalProps) {
  const [name, setName] = useState(currentName);
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [photo, setPhoto] = useState(currentPhoto || "");
  const [photoPreview, setPhotoPreview] = useState(currentPhoto || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(currentName);
    setPhoto(currentPhoto || "");
    setPhotoPreview(currentPhoto || "");
  }, [currentName, currentPhoto]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onSave({ name, phone, birthdate, photo: photoPreview });
      onClose();
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 animate-in fade-in">
      <div className="bg-card w-full max-w-[375px] rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2>Editar perfil</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photo Upload Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            {photoPreview ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
                <ImageWithFallback 
                  src={photoPreview} 
                  alt={name} 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-4 border-primary/20">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
            
            {/* Camera Button */}
            <button
              onClick={handleCameraClick}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors border-2 border-card"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCameraClick}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Cambiar foto
            </button>
            {photoPreview && (
              <>
                <span className="text-muted-foreground">•</span>
                <button
                  onClick={handleRemovePhoto}
                  className="text-sm text-destructive hover:text-destructive/80 transition-colors"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Nombre completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={currentEmail}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-muted-foreground">El correo no puede ser modificado</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Teléfono (opcional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+51 999 999 999"
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Fecha de nacimiento (opcional)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onClose}
            className="py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}