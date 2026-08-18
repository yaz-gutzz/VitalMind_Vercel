import bcrypt from "bcryptjs";
import { getMySqlPool } from "../config/databases.js";

let mysqlSeeded = false;

const defaultUsers = [
  {
    full_name: "Administrador",
    email: "admin@vitalmind.com",
    password: "Admin123!",
    age: 42,
    joined_label: "10 jun 2025",
    last_active_label: "Hace 1 min",
    status: "active",
    registros: 0,
    consultas: 0,
    color: "#0F766E",
    role: "admin",
  },

  {
    full_name: "María García",
    email: "maria@email.com",
    password: "Demo123!",
    age: 34,
    joined_label: "10 jun 2025",
    last_active_label: "Hace 5 min",
    status: "active",
    registros: 48,
    consultas: 23,
    color: "#0F766E",
    role: "patient",
  },

  {
    full_name: "Carlos Rodríguez",
    email: "carlos@email.com",
    password: "Demo123!",
    age: 41,
    joined_label: "8 jun 2025",
    last_active_label: "Hace 1 h",
    status: "active",
    registros: 31,
    consultas: 15,
    color: "#2563EB",
    role: "patient",
  },

  {
    full_name: "Ana Pérez",
    email: "ana@email.com",
    password: "Demo123!",
    age: 28,
    joined_label: "5 jun 2025",
    last_active_label: "Hace 2 h",
    status: "active",
    registros: 62,
    consultas: 40,
    color: "#8B5CF6",
    role: "patient",
  },

  {
    full_name: "Luis Martínez",
    email: "luis@email.com",
    password: "Demo123!",
    age: 55,
    joined_label: "1 jun 2025",
    last_active_label: "Hace 1 día",
    status: "inactive",
    registros: 12,
    consultas: 5,
    color: "#F59E0B",
    role: "patient",
  },

  {
    full_name: "Sara Vega",
    email: "sara@email.com",
    password: "Demo123!",
    age: 22,
    joined_label: "15 may 2025",
    last_active_label: "Hace 3 días",
    status: "pending",
    registros: 0,
    consultas: 0,
    color: "#EC4899",
    role: "patient",
  },

  {
    full_name: "Diego López",
    email: "diego@email.com",
    password: "Demo123!",
    age: 38,
    joined_label: "12 may 2025",
    last_active_label: "Hace 5 h",
    status: "active",
    registros: 27,
    consultas: 18,
    color: "#22C55E",
    role: "patient",
  },

  {
    full_name: "Laura Torres",
    email: "laura@email.com",
    password: "Demo123!",
    age: 45,
    joined_label: "3 may 2025",
    last_active_label: "Hace 2 días",
    status: "inactive",
    registros: 8,
    consultas: 3,
    color: "#F97316",
    role: "patient",
  },

  {
    full_name: "Marta Ruiz",
    email: "marta@email.com",
    password: "Demo123!",
    age: 30,
    joined_label: "28 abr 2025",
    last_active_label: "Hace 10 min",
    status: "active",
    registros: 55,
    consultas: 32,
    color: "#14B8A6",
    role: "patient",
  },
];

const defaultMedications = [
  {
    name: "Metformina",
    dose: "850mg",
    frequency: "Diario",
    time_label: "08:00",
    color: "#0F766E",
    taken: true,
    type: "pastilla",
  },

  {
    name: "Losartán",
    dose: "50mg",
    frequency: "Diario",
    time_label: "08:00",
    color: "#2563EB",
    taken: false,
    type: "pastilla",
  },

  {
    name: "Salbutamol",
    dose: "100mcg",
    frequency: "PRN",
    time_label: "Según necesidad",
    color: "#8B5CF6",
    taken: false,
    type: "inyeccion",
  },

  {
    name: "Vitamina D",
    dose: "1000UI",
    frequency: "Diario",
    time_label: "12:00",
    color: "#F59E0B",
    taken: true,
    type: "capsula",
  },

  {
    name: "Omega 3",
    dose: "1g",
    frequency: "Diario",
    time_label: "13:00",
    color: "#22C55E",
    taken: false,
    type: "capsula",
  },
];

const defaultAppointments = [
  {
    specialty: "Cardiología",
    doctor: "Dr. Martínez López",
    appointment_date: "2025-07-15",
    appointment_time: "10:30",
    place: "Clínica San Rafael",
    color: "#EF4444",
    status: "proxima",
  },

  {
    specialty: "Endocrinología",
    doctor: "Dra. García Ruiz",
    appointment_date: "2025-07-22",
    appointment_time: "09:00",
    place: "Hospital Central",
    color: "#8B5CF6",
    status: "proxima",
  },

  {
    specialty: "Médico general",
    doctor: "Dr. Sánchez Vega",
    appointment_date: "2025-06-10",
    appointment_time: "11:00",
    place: "Centro de Salud Norte",
    color: "#0F766E",
    status: "completada",
  },

  {
    specialty: "Oftalmología",
    doctor: "Dra. Torres Ramos",
    appointment_date: "2025-06-01",
    appointment_time: "15:30",
    place: "Óptica Visión Salud",
    color: "#2563EB",
    status: "completada",
  },
];

/*
|--------------------------------------------------------------------------
| Seed principal de MySQL
|--------------------------------------------------------------------------
*/

async function seedMySql() {
  const pool = getMySqlPool();

  const [userCountRows] = await pool.query(
    "SELECT COUNT(*) AS count FROM users",
  );

  /*
   * Solo inserta usuarios/demo si la tabla está vacía.
   */
  if (Number(userCountRows[0].count) === 0) {
    const hashedUsers = await Promise.all(
      defaultUsers.map(async (user) => ({
        ...user,
        password_hash: await bcrypt.hash(
          user.password,
          10,
        ),
      })),
    );

    for (const user of hashedUsers) {
      await pool.query(
        `
          INSERT INTO users (
            full_name,
            email,
            password_hash,
            age,
            joined_label,
            last_active_label,
            status,
            registros,
            consultas,
            color,
            role
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          user.full_name,
          user.email,
          user.password_hash,
          user.age,
          user.joined_label,
          user.last_active_label,
          user.status,
          user.registros,
          user.consultas,
          user.color,
          user.role,
        ],
      );
    }

    /*
     * Obtener usuarios creados para relacionar
     * medicamentos y citas con un usuario real.
     */
    const [users] = await pool.query(
      "SELECT id, email FROM users ORDER BY id ASC",
    );

    const userByEmail = new Map(
      users.map((user) => [
        user.email,
        user.id,
      ]),
    );

    /*
     * Medicamentos demo
     */
    for (const medication of defaultMedications) {
      await pool.query(
        `
          INSERT INTO medications (
            user_id,
            name,
            dose,
            frequency,
            time_label,
            color,
            taken,
            type
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userByEmail.get(
            "maria@email.com",
          ) || null,
          medication.name,
          medication.dose,
          medication.frequency,
          medication.time_label,
          medication.color,
          medication.taken ? 1 : 0,
          medication.type,
        ],
      );
    }

    /*
     * Citas demo
     */
    for (const appointment of defaultAppointments) {
      await pool.query(
        `
          INSERT INTO appointments (
            user_id,
            specialty,
            doctor,
            appointment_date,
            appointment_time,
            place,
            color,
            status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userByEmail.get(
            "maria@email.com",
          ) || null,
          appointment.specialty,
          appointment.doctor,
          appointment.appointment_date,
          appointment.appointment_time,
          appointment.place,
          appointment.color,
          appointment.status,
        ],
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| NOTIFICACIONES
|--------------------------------------------------------------------------
|
| Ya no se generan notificaciones falsas.
|
| Las notificaciones reales serán generadas
| posteriormente por el motor de recomendaciones
| utilizando los datos reales de cada usuario.
|
*/

async function seedNotifications() {
  // Intencionalmente vacío.
  //
  // Antes aquí se insertaban:
  // - Insight de IA
  // - Alertas genéricas
  // - Recordatorios de agua
  // - Consejos genéricos
  // - Metas de pasos
  //
  // Ahora el sistema utilizará recomendaciones
  // personalizadas por usuario.
}

/*
|--------------------------------------------------------------------------
| Seed inicial
|--------------------------------------------------------------------------
*/

export async function seedInitialData() {
  if (!mysqlSeeded) {
    await seedMySql();

    await seedNotifications();

    mysqlSeeded = true;
  }
}