import { getMySqlPool } from "../config/databases.js";

const DAY_LABELS = ["D", "L", "M", "M", "J", "V", "S"]; // índice = Date#getDay()
const STEPS_PER_EXERCISE_MINUTE = 1030; // pasos estimados por minuto de ejercicio registrado

const HABIT_GOALS = {
  water: 8,
  exercise: 30,
  sleep: 8,
  nutrition: 3,
  meditation: 10
};

function todayDate() {
  const d = new Date();
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function dateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function toDateKey(value) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
}

async function getUserProfile(pool, userId) {
  const [rows] = await pool.query("SELECT weight_kg AS weightKg FROM users WHERE id = ? LIMIT 1", [userId]);
  return rows[0] || { weightKg: null };
}

async function getMedsAdherence(pool, userId) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total, COALESCE(SUM(taken), 0) AS taken FROM medications WHERE user_id = ?",
    [userId]
  );
  const total = Number(rows[0].total);
  const taken = Number(rows[0].taken);
  return total ? Math.round((taken / total) * 100) : 0;
}

export async function getMetricsSummary(req, res, next) {
  try {
    const pool = getMySqlPool();
    const today = todayDate();
    const userId = req.user.sub;

  const [habitRows] = await pool.query(
      `SELECT * FROM habit_logs WHERE user_id = ? AND log_date = ? LIMIT 1`,
      [userId,today]
    );

    const habits = habitRows[0] || {};
    const waterVasos = Number(habits.water || 0);
    const sleepHours = Number(habits.sleep || 0);
    const exerciseMinutes = Number(habits.exercise || 0);

    const profile = await getUserProfile(pool, userId);
    const medsAdherence = await getMedsAdherence(pool, userId);

    const completionPcts = Object.keys(HABIT_GOALS).map((key)=>{
      const value = Number(habits[key] || 0);
      const goal = HABIT_GOALS[key];
      return Math.min(100,Math.round((value / goal) * 100));
    });

    const avgHabitCompletion = Math.round(completionPcts.reduce((a, b) => a + b, 0) / completionPcts.length);
    const wellnessScore = Math.round(avgHabitCompletion * 0.5 + medsAdherence * 0.5);

    return res.json({
      waterL: Number((waterVasos * 0.25).toFixed(2)),
      waterGoalL: 2,
      steps: Math.round(exerciseMinutes * STEPS_PER_EXERCISE_MINUTE),
      stepsGoal: 1000,
      sleepHours,
      sleepGoalHours: 8,
      weightKg: profile.weightKg !== null ? Number(profile.weightKg) : null,
      medsAdherence,
      wellnessScore,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMetricsWeekly(req, res, next) {
  try {
    const pool = getMySqlPool();
    const userId = req.user.sub;
    const startDate = dateNDaysAgo(6);

    const [habitRows] = await pool.query(
      `
      SELECT *
      FROM habit_logs
      WHERE user_id = ?
      AND log_date >= ?
      ORDER BY log_date ASC
      `,
      [
        userId,
        startDate
      ]
    );

    const profile = await getUserProfile(pool, userId);
    const medsAdherence = await getMedsAdherence(pool, userId);

    const days = [];
    for (let i = 6; i >= 0; i -= 1) days.push(dateNDaysAgo(i));

    const byDate = {};
    for (const row of habitRows) {
      byDate[toDateKey(row.log_date)] = row;
    }

    const rowsFor = (habitKey, transform) =>
    days.map((d) => {
      const entry = byDate[d];
      const day = new Date(`${d}T00:00:00`);
      return {
        day: DAY_LABELS[day.getDay()],
        value: transform(entry ? Number(entry[habitKey]) : 0)
      };
    });

    const agua = rowsFor(
      "water",
      (value) => Number((value * 0.25).toFixed(2))
    );


    const sueno = rowsFor(
      "sleep",
      (value) => value
    );


    const actividad = rowsFor(
      "exercise",
      (value) =>
        Math.round(value * STEPS_PER_EXERCISE_MINUTE)
    );

    const peso = days.map((d) => {
      const day = new Date(`${d}T00:00:00`);
      return { day: DAY_LABELS[day.getDay()], value: profile.weightKg !== null ? Number(profile.weightKg) : 0 };
    });

    const bienestar = days.map((d) => {
      const day = new Date(`${d}T00:00:00`);
      const habitKeys = ["water", "exercise", "sleep", "nutrition", "meditation"];
      const pcts = habitKeys.map((key) => {

        const entry = byDate[d];
        const value = entry 
          ? Number(entry[key] || 0)
          : 0;
        return Math.min(
        100,
        Math.round(
          (value / HABIT_GOALS[key]) * 100
        )
        );

      });
      const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
      return { day: DAY_LABELS[day.getDay()], value: Math.round(avg * 0.5 + medsAdherence * 0.5) };
    });

    return res.json({ Actividad: actividad, Bienestar: bienestar, Sueño: sueno, Peso: peso, Agua: agua });
  } catch (error) {
    return next(error);
  }
}
