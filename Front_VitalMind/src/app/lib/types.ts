export type DashboardSummary = {
  users: { total: number; active: number; inactive: number; pending: number };
  medications: { total: number; taken: number; pending: number; adherence: number };
  appointments: { total: number; upcoming: number; completed: number; canceled: number };
  notifications: { unread: number };
  wellnessScore: number;
};

export type Medication = {
  id: number;
  nombre: string;
  dosis: string;
  frecuencia: string;
  hora: string;
  color: string;
  tomado: boolean;
  tipo: "pastilla" | "capsula" | "jarabe" | "inyeccion";
};

export type Appointment = {
  id: number;
  especialidad: string;
  doctor: string;
  fecha: string;
  hora: string;
  lugar: string;
  color: string;
  estado: "proxima" | "completada" | "cancelada";
};

export type MedicalHistoryCategory = "diseases" | "allergies" | "medications" | "surgeries" | "consultations" | "vaccines" | "results";

export type MedicalHistoryItem = {
  id: number;
  userId: number | null;
  category: MedicalHistoryCategory;
  description: string;
  createdAt: string;
};

export type HabitKey = "water" | "exercise" | "sleep" | "nutrition" | "meditation";

export type HabitToday = {
  key: HabitKey;
  value: number;
  goal: number;
};

export type HabitWeekly = {
  days: string[];
  tracking: Record<HabitKey, boolean[]>;
};

export type MetricsSummary = {
  waterL: number;
  waterGoalL: number;
  steps: number;
  stepsGoal: number;
  sleepHours: number;
  sleepGoalHours: number;
  weightKg: number | null;
  medsAdherence: number;
  wellnessScore: number;
};

export type MetricsWeeklyRow = { day: string; value: number };
export type MetricsWeekly = Record<"Actividad" | "Bienestar" | "Sueño" | "Peso" | "Agua", MetricsWeeklyRow[]>;

export type ProfileMe = {
  id: number;
  name: string;
  email: string;
  age: number;
  bloodType: string | null;
  phone: string | null;
  weightKg: number | null;
  heightCm: number | null;
};

export type ProfileStats = {
  diasActivo: number;
  registros: number;
  habitos: number;
};

export type NotificationItem = {
  id: string;
  kind: "tip" | "reminder" | "ai" | "alert";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

export interface SymptomLog {
  id: number;
  user_id: number;
  pain: number;
  temperature: number | null;
  systolic: number | null;
  diastolic: number | null;
  glucose: number | null;
  weight: number | null;
  heart_rate: number | null;
  mood: string | null;
  notes: string | null;
  created_at: string;
}