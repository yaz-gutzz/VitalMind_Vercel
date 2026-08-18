import { getMySqlPool } from "../config/databases.js";

/*
|--------------------------------------------------------------------------
| Utilidades
|--------------------------------------------------------------------------
*/

function formatDate(date) {
  if (!date) {
    return null;
  }

  const value =
    date instanceof Date
      ? date
      : new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return value.toISOString().slice(0, 10);
}

function formatTime(time) {
  if (!time) {
    return null;
  }

  return String(time).slice(0, 5);
}

function round(value, decimals = 1) {
  if (value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return null;
  }

  const factor = 10 ** decimals;

  return Math.round(number * factor) / factor;
}

/*
|--------------------------------------------------------------------------
| Obtener datos del usuario
|--------------------------------------------------------------------------
*/

async function getUserProfile(userId) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        id,
        full_name,
        email,
        age,
        status,
        role,
        blood_type,
        phone,
        weight_kg,
        height_cm,
        last_active_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] ?? null;
}

/*
|--------------------------------------------------------------------------
| Medicamentos actuales
|--------------------------------------------------------------------------
*/

async function getUserMedications(userId) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        id,
        name,
        dose,
        frequency,
        time_label,
        taken,
        type,
        created_at,
        updated_at
      FROM medications
      WHERE user_id = ?
      ORDER BY time_label ASC, id ASC
    `,
    [userId],
  );

  return rows.map((medication) => ({
    id: medication.id,
    name: medication.name,
    dose: medication.dose,
    frequency: medication.frequency,
    time: medication.time_label,
    taken: Boolean(medication.taken),
    type: medication.type,
  }));
}

/*
|--------------------------------------------------------------------------
| Citas próximas
|--------------------------------------------------------------------------
*/

async function getUpcomingAppointments(userId) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        id,
        specialty,
        doctor,
        appointment_date,
        appointment_time,
        place,
        status
      FROM appointments
      WHERE user_id = ?
        AND status = 'proxima'
        AND appointment_date >= CURDATE()
      ORDER BY appointment_date ASC, appointment_time ASC
      LIMIT 5
    `,
    [userId],
  );

  return rows.map((appointment) => ({
    id: appointment.id,
    specialty: appointment.specialty,
    doctor: appointment.doctor,
    date: formatDate(
      appointment.appointment_date,
    ),
    time: formatTime(
      appointment.appointment_time,
    ),
    place: appointment.place,
    status: appointment.status,
  }));
}

/*
|--------------------------------------------------------------------------
| Hábitos recientes
|--------------------------------------------------------------------------
*/

async function getRecentHabits(userId) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        habit_key,
        log_date,
        value,
        goal
      FROM habit_logs
      WHERE user_id = ?
        AND log_date >= DATE_SUB(
          CURDATE(),
          INTERVAL 7 DAY
        )
      ORDER BY log_date DESC, habit_key ASC
    `,
    [userId],
  );

  return rows.map((habit) => ({
    type: habit.habit_key,
    date: formatDate(habit.log_date),
    value: round(habit.value, 2),
    goal: round(habit.goal, 2),
  }));
}

/*
|--------------------------------------------------------------------------
| Métricas recientes
|--------------------------------------------------------------------------
*/

async function getRecentHealthMetrics(userId) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        metric_date,
        water_l,
        steps,
        sleep_hours,
        weight_kg,
        wellness_score
      FROM health_metrics
      WHERE user_id = ?
        AND metric_date >= DATE_SUB(
          CURDATE(),
          INTERVAL 7 DAY
        )
      ORDER BY metric_date DESC
      LIMIT 7
    `,
    [userId],
  );

  return rows.map((metric) => ({
    date: formatDate(metric.metric_date),
    waterLiters: round(metric.water_l, 2),
    steps:
      metric.steps !== null
        ? Number(metric.steps)
        : null,
    sleepHours: round(
      metric.sleep_hours,
      2,
    ),
    weightKg: round(
      metric.weight_kg,
      2,
    ),
    wellnessScore:
      metric.wellness_score !== null
        ? Number(
            metric.wellness_score,
          )
        : null,
  }));
}

/*
|--------------------------------------------------------------------------
| Síntomas recientes
|--------------------------------------------------------------------------
*/

async function getRecentSymptoms(userId) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        id,
        pain,
        temperature,
        systolic,
        diastolic,
        glucose,
        weight,
        heart_rate,
        mood,
        notes,
        created_at
      FROM symptom_logs
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `,
    [userId],
  );

  return rows.map((symptom) => ({
    id: symptom.id,
    pain:
      symptom.pain !== null
        ? Number(symptom.pain)
        : null,
    temperature:
      symptom.temperature !== null
        ? Number(symptom.temperature)
        : null,
    systolic:
      symptom.systolic !== null
        ? Number(symptom.systolic)
        : null,
    diastolic:
      symptom.diastolic !== null
        ? Number(symptom.diastolic)
        : null,
    glucose:
      symptom.glucose !== null
        ? Number(symptom.glucose)
        : null,
    weight:
      symptom.weight !== null
        ? Number(symptom.weight)
        : null,
    heartRate:
      symptom.heart_rate !== null
        ? Number(symptom.heart_rate)
        : null,
    mood: symptom.mood,
    notes: symptom.notes,
    createdAt:
      symptom.created_at,
  }));
}

/*
|--------------------------------------------------------------------------
| Registros emocionales recientes
|--------------------------------------------------------------------------
*/

async function getRecentEmotionalLogs(userId) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        id,
        mood,
        stress_level,
        energy_level,
        sleep_quality,
        notes,
        log_date,
        created_at
      FROM emotional_logs
      WHERE user_id = ?
        AND log_date >= DATE_SUB(
          CURDATE(),
          INTERVAL 7 DAY
        )
      ORDER BY log_date DESC
      LIMIT 7
    `,
    [userId],
  );

  return rows.map((log) => ({
    id: log.id,
    mood: log.mood,
    stressLevel:
      Number(log.stress_level),
    energyLevel:
      Number(log.energy_level),
    sleepQuality:
      Number(log.sleep_quality),
    notes: log.notes,
    date: formatDate(log.log_date),
    createdAt:
      log.created_at,
  }));
}

/*
|--------------------------------------------------------------------------
| Historial médico
|--------------------------------------------------------------------------
*/

async function getMedicalHistory(userId) {
  const pool = getMySqlPool();

  const [rows] = await pool.query(
    `
      SELECT
        id,
        category,
        description,
        created_at,
        updated_at
      FROM medical_history_items
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `,
    [userId],
  );

  return rows.map((item) => ({
    id: item.id,
    category: item.category,
    description: item.description,
    createdAt:
      item.created_at,
    updatedAt:
      item.updated_at,
  }));
}

/*
|--------------------------------------------------------------------------
| Analizar datos
|--------------------------------------------------------------------------
*/

function buildRecommendations(data) {
  const recommendations = [];

  const {
    medications,
    appointments,
    habits,
    healthMetrics,
    symptoms,
    emotionalLogs,
    medicalHistory,
  } = data;

  /*
   * 1. MEDICAMENTOS
   *
   * No modificamos dosis ni recomendamos cambios.
   * Solo podemos recordar que existe un medicamento
   * registrado y sugerir mantener el registro actualizado.
   */

  if (medications.length > 0) {
    const nextMedication =
      medications.find(
        (medication) =>
          medication.time &&
          !medication.taken,
      );

    if (nextMedication) {
      recommendations.push({
        kind: "reminder",
        priority: "high",
        source: "medications",

        title:
          "Revisa tu próxima toma",

        body:
          `Tienes registrado ${nextMedication.name}` +
          ` (${nextMedication.dose}) para las ` +
          `${nextMedication.time}. ` +
          `Recuerda registrar la toma cuando corresponda.`,

        time: "Ahora",
      });
    }
  }

  /*
   * 2. CITAS
   */

  if (appointments.length > 0) {
    const appointment =
      appointments[0];

    recommendations.push({
      kind: "reminder",
      priority: "high",
      source: "appointments",

      title:
        "Tienes una cita próxima",

      body:
        `Tienes una cita de ${appointment.specialty}` +
        ` programada para el ${appointment.date}` +
        ` a las ${appointment.time}.`,

      time: "Próximamente",
    });
  }

  /*
   * 3. SUEÑO
   *
   * Utilizamos únicamente el dato registrado.
   */

  const sleepMetrics =
    healthMetrics.filter(
      (metric) =>
        metric.sleepHours !== null,
    );

  if (sleepMetrics.length > 0) {
    const averageSleep =
      sleepMetrics.reduce(
        (sum, metric) =>
          sum +
          metric.sleepHours,
        0,
      ) / sleepMetrics.length;

    if (averageSleep < 7) {
      recommendations.push({
        kind: "ai",
        priority: "medium",
        source: "sleep",

        title:
          "Tu descanso merece atención",

        body:
          `Tus registros recientes muestran ` +
          `un promedio aproximado de ` +
          `${round(averageSleep, 1)} horas de sueño.` +
          ` Procura mantener horarios de descanso ` +
          `consistentes y observa cómo evoluciona tu sueño.`,

        time: "Hoy",
      });
    }
  }

  /*
   * 4. HIDRATACIÓN
   */

  const waterMetrics =
    healthMetrics.filter(
      (metric) =>
        metric.waterLiters !== null,
    );

  if (waterMetrics.length > 0) {
    const averageWater =
      waterMetrics.reduce(
        (sum, metric) =>
          sum +
          metric.waterLiters,
        0,
      ) / waterMetrics.length;

    if (averageWater < 1.5) {
      recommendations.push({
        kind: "tip",
        priority: "medium",
        source: "hydration",

        title:
          "Revisa tu hidratación",

        body:
          `Tus registros recientes muestran ` +
          `un promedio aproximado de ` +
          `${round(averageWater, 1)} L de agua al día.` +
          ` Procura mantener una hidratación adecuada ` +
          `a lo largo del día.`,

        time: "Hoy",
      });
    }
  }

  /*
   * 5. ACTIVIDAD FÍSICA
   */

  const exerciseLogs =
    habits.filter(
      (habit) =>
        habit.type ===
        "exercise",
    );

  if (exerciseLogs.length > 0) {
    const exerciseBelowGoal =
      exerciseLogs.filter(
        (item) =>
          Number(item.goal) > 0 &&
          Number(item.value) <
            Number(item.goal),
      );

    if (
      exerciseBelowGoal.length >=
      3
    ) {
      recommendations.push({
        kind: "tip",
        priority: "medium",
        source: "exercise",

        title:
          "Puedes trabajar tu actividad física",

        body:
          "Tus registros recientes muestran varios días por debajo de tu objetivo de ejercicio. Intenta incorporar pequeños periodos de actividad durante el día de forma gradual.",

        time: "Esta semana",
      });
    }
  }

  /*
   * 6. ESTRÉS
   */

  const highStressLogs =
    emotionalLogs.filter(
      (log) =>
        log.stressLevel >= 8,
    );

  if (
    highStressLogs.length >= 2
  ) {
    recommendations.push({
      kind: "ai",
      priority: "high",
      source: "emotional",

      title:
        "Has registrado estrés elevado",

      body:
        `En tus registros recientes aparecen ` +
        `${highStressLogs.length} días con ` +
        `niveles altos de estrés.` +
        ` Considera reservar momentos de descanso ` +
        `y observar qué situaciones coinciden ` +
        `con estos registros.`,

      time: "Esta semana",
    });
  }

  /*
   * 7. ENERGÍA BAJA
   */

  const lowEnergyLogs =
    emotionalLogs.filter(
      (log) =>
        log.energyLevel <= 3,
    );

  if (
    lowEnergyLogs.length >= 2
  ) {
    recommendations.push({
      kind: "ai",
      priority: "medium",
      source: "energy",

      title:
        "Has registrado energía baja",

      body:
        `Tus registros recientes muestran ` +
        `${lowEnergyLogs.length} días con ` +
        `niveles bajos de energía.` +
        ` Puede ser útil observar la relación ` +
        `con tu sueño, actividad y estado emocional.`,

      time: "Esta semana",
    });
  }

  /*
   * 8. CALIDAD DEL SUEÑO EMOCIONAL
   */

  const poorSleepQuality =
    emotionalLogs.filter(
      (log) =>
        log.sleepQuality <= 4,
    );

  if (
    poorSleepQuality.length >= 2
  ) {
    recommendations.push({
      kind: "ai",
      priority: "medium",
      source: "sleep_quality",

      title:
        "Tu calidad de sueño ha sido baja",

      body:
        `Has registrado varios días con una calidad ` +
        `de sueño baja. Mantén un horario estable ` +
        `y continúa registrando cómo descansas para ` +
        `identificar patrones.`,

      time: "Esta semana",
    });
  }

  /*
   * 9. SÍNTOMAS
   */

  if (symptoms.length > 0) {
    const recentSymptom =
      symptoms[0];

    if (
      recentSymptom.pain !== null &&
      recentSymptom.pain >= 7
    ) {
      recommendations.push({
        kind: "alert",
        priority: "high",
        source: "symptoms",

        title:
          "Registraste dolor intenso",

        body:
          "Registraste un nivel de dolor elevado recientemente. Si el dolor persiste, empeora o se acompaña de otros síntomas importantes, considera buscar valoración médica.",

        time: "Recientemente",
      });
    }
  }

  /*
   * 10. PRESIÓN ARTERIAL
   *
   * No diagnosticamos.
   * Solo señalamos que existe un registro elevado
   * para que el usuario lo revise.
   */

  const recentPressure =
    symptoms.find(
      (symptom) =>
        symptom.systolic !== null &&
        symptom.diastolic !== null,
    );

  if (recentPressure) {
    if (
      recentPressure.systolic >=
        140 ||
      recentPressure.diastolic >=
        90
    ) {
      recommendations.push({
        kind: "alert",
        priority: "high",
        source: "blood_pressure",

        title:
          "Revisa tu registro de presión",

        body:
          `Registraste una presión de ` +
          `${recentPressure.systolic}/` +
          `${recentPressure.diastolic} mmHg.` +
          ` Si estos valores se repiten o tienes ` +
          `síntomas, consulta a un profesional de salud.`,

        time: "Recientemente",
      });
    }
  }

  /*
   * 11. GLUCOSA
   *
   * No diagnosticamos.
   */

  const recentGlucose =
    symptoms.find(
      (symptom) =>
        symptom.glucose !== null,
    );

  if (
    recentGlucose &&
    recentGlucose.glucose >= 126
  ) {
    recommendations.push({
      kind: "alert",
      priority: "high",
      source: "glucose",

      title:
        "Revisa tu registro de glucosa",

      body:
        `Registraste una glucosa de ` +
        `${recentGlucose.glucose} mg/dL.` +
        ` Un registro aislado no permite establecer ` +
        `un diagnóstico; si estos valores se repiten, ` +
        `coméntalo con un profesional de salud.`,

      time: "Recientemente",
    });
  }

  /*
   * 12. HISTORIAL MÉDICO
   */

  if (
    medicalHistory.length > 0
  ) {
    recommendations.push({
      kind: "tip",
      priority: "low",
      source: "medical_history",

      title:
        "Mantén actualizado tu historial",

      body:
        "Tienes información registrada en tu historial médico. Mantenerla actualizada puede facilitar el seguimiento de tu bienestar y tus consultas.",

      time: "Hoy",
    });
  }

  /*
   * Orden por prioridad
   */

  const priorityOrder = {
    high: 1,
    medium: 2,
    low: 3,
  };

  recommendations.sort(
    (a, b) =>
      priorityOrder[a.priority] -
      priorityOrder[b.priority],
  );

  /*
   * Máximo de recomendaciones
   * visibles.
   */

  return recommendations.slice(
    0,
    6,
  );
}

/*
|--------------------------------------------------------------------------
| Función principal
|--------------------------------------------------------------------------
*/

export async function buildPersonalizedRecommendations(
  userId,
) {
  const [
    profile,
    medications,
    appointments,
    habits,
    healthMetrics,
    symptoms,
    emotionalLogs,
    medicalHistory,
  ] = await Promise.all([
    getUserProfile(userId),
    getUserMedications(userId),
    getUpcomingAppointments(userId),
    getRecentHabits(userId),
    getRecentHealthMetrics(userId),
    getRecentSymptoms(userId),
    getRecentEmotionalLogs(userId),
    getMedicalHistory(userId),
  ]);

  if (!profile) {
    const error = new Error(
      "Usuario no encontrado.",
    );

    error.status = 404;

    throw error;
  }

  const data = {
    profile,
    medications,
    appointments,
    habits,
    healthMetrics,
    symptoms,
    emotionalLogs,
    medicalHistory,
  };

  const recommendations =
    buildRecommendations(data);

  return {
    user: {
      id: String(profile.id),
      name: profile.full_name,
    },

    data,
    recommendations,
  };
}