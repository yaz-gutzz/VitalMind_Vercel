import { getMySqlPool } from "../config/databases.js";

const DAY_LABELS = [
  "D",
  "L",
  "M",
  "M",
  "J",
  "V",
  "S",
];

/*
|--------------------------------------------------------------------------
| Metas
|--------------------------------------------------------------------------
*/

const HABIT_GOALS = {
  water: 2,        // litros
  exercise: 30,    // minutos
  sleep: 8,        // horas
  nutrition: 3,    // comidas
  meditation: 10,  // minutos
};

const STEPS_GOAL = 10000;

/*
|--------------------------------------------------------------------------
| Fechas
|--------------------------------------------------------------------------
*/

function todayDate() {
  const d = new Date();

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function dateNDaysAgo(n) {
  const d = new Date();

  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function toDateKey(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const year = value.getFullYear();

    const month = String(
      value.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      value.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}

/*
|--------------------------------------------------------------------------
| Usuario autenticado
|--------------------------------------------------------------------------
*/

function getUserId(req) {
  const userId = Number(
    req.user?.sub ?? req.user?.id,
  );

  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return null;
  }

  return userId;
}

/*
|--------------------------------------------------------------------------
| Perfil
|--------------------------------------------------------------------------
*/

async function getUserProfile(pool, userId) {
  const [rows] = await pool.query(
    `
      SELECT
        weight_kg AS weightKg
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId],
  );

  return (
    rows[0] || {
      weightKg: null,
    }
  );
}

/*
|--------------------------------------------------------------------------
| Adherencia de medicamentos
|--------------------------------------------------------------------------
*/

async function getMedsAdherence(pool, userId) {
  const [rows] = await pool.query(
    `
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(taken), 0) AS taken
      FROM medications
      WHERE user_id = ?
    `,
    [userId],
  );

  const total = Number(
    rows[0]?.total ?? 0,
  );

  const taken = Number(
    rows[0]?.taken ?? 0,
  );

  return total > 0
    ? Math.round(
        (taken / total) * 100,
      )
    : 0;
}

/*
|--------------------------------------------------------------------------
| Métrica real del día
|--------------------------------------------------------------------------
*/

async function getTodayHealthMetric(
  pool,
  userId,
) {
  const today = todayDate();

  const [rows] = await pool.query(
    `
      SELECT
        id,
        metric_date,
        water_l,
        steps,
        sleep_hours,
        weight_kg,
        wellness_score
      FROM health_metrics
      WHERE user_id = ?
        AND DATE(metric_date) = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [
      userId,
      today,
    ],
  );

  return rows[0] || null;
}

/*
|--------------------------------------------------------------------------
| MÉTRICAS DEL DÍA
|--------------------------------------------------------------------------
*/

export async function getMetricsSummary(
  req,
  res,
  next,
) {
  try {
    const pool = getMySqlPool();

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario.",
      });
    }

    const today = todayDate();

    /*
     * ================================================================
     * HABITS
     * ================================================================
     *
     * habit_logs tiene:
     * user_id
     * habit_key
     * log_date
     * value
     * goal
     */

    const [habitRows] = await pool.query(
      `
        SELECT
          habit_key,
          value,
          goal
        FROM habit_logs
        WHERE user_id = ?
          AND log_date = ?
      `,
      [
        userId,
        today,
      ],
    );

    const habits = {};

    for (const row of habitRows) {
      habits[row.habit_key] = {
        value: Number(
          row.value ?? 0,
        ),
        goal: Number(
          row.goal ?? 0,
        ),
      };
    }

    /*
     * ================================================================
     * PERFIL
     * ================================================================
     */

    const profile =
      await getUserProfile(
        pool,
        userId,
      );

    /*
     * ================================================================
     * MEDICAMENTOS
     * ================================================================
     */

    const medsAdherence =
      await getMedsAdherence(
        pool,
        userId,
      );

    /*
     * ================================================================
     * HEALTH METRICS
     * ================================================================
     *
     * Los pasos salen de aquí.
     */

    const healthMetric =
      await getTodayHealthMetric(
        pool,
        userId,
      );

    /*
     * Agua
     *
     * Preferencia:
     * health_metrics.water_l
     * fallback: habit_logs.water
     */

    const waterL = Number(
      healthMetric?.water_l ??
        (
          Number(
            habits.water?.value ?? 0,
          )
        ),
    );

    /*
     * Sueño
     */

    const sleepHours = Number(
      healthMetric?.sleep_hours ??
        (
          Number(
            habits.sleep?.value ?? 0,
          )
        ),
    );

    /*
     * PASOS REALES
     *
     * No se calculan con ejercicio.
     */

    const steps = Number(
      healthMetric?.steps ?? 0,
    );

    /*
     * Peso
     */

    let weightKg = null;

    if (
      healthMetric?.weight_kg !==
        null &&
      healthMetric?.weight_kg !==
        undefined
    ) {
      weightKg = Number(
        healthMetric.weight_kg,
      );
    } else if (
      profile.weightKg !==
      null
    ) {
      weightKg = Number(
        profile.weightKg,
      );
    }

    /*
     * ================================================================
     * BIENESTAR
     * ================================================================
     */

    const completionPcts =
      Object.keys(
        HABIT_GOALS,
      ).map((key) => {
        const value =
          Number(
            habits[key]?.value ??
              0,
          );

        const goal =
          Number(
            habits[key]?.goal ??
              HABIT_GOALS[key],
          );

        if (goal <= 0) {
          return 0;
        }

        return Math.min(
          100,
          Math.round(
            (value / goal) * 100,
          ),
        );
      });

    const avgHabitCompletion =
      completionPcts.length > 0
        ? Math.round(
            completionPcts.reduce(
              (a, b) => a + b,
              0,
            ) /
              completionPcts.length,
          )
        : 0;

    const wellnessScore =
      healthMetric?.wellness_score !==
        null &&
      healthMetric?.wellness_score !==
        undefined
        ? Number(
            healthMetric.wellness_score,
          )
        : Math.round(
            avgHabitCompletion *
              0.5 +
              medsAdherence *
                0.5,
          );

    /*
     * ================================================================
     * RESPUESTA
     * ================================================================
     */

    return res.json({
      waterL: Number(
        waterL.toFixed(2),
      ),

      waterGoalL: 2,

      steps,

      stepsGoal:
        STEPS_GOAL,

      sleepHours: Number(
        sleepHours.toFixed(1),
      ),

      sleepGoalHours: 8,

      weightKg,

      medsAdherence,

      wellnessScore,
    });
  } catch (error) {
    console.error(
      "Metrics summary error:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| MÉTRICAS SEMANALES
|--------------------------------------------------------------------------
*/

export async function getMetricsWeekly(
  req,
  res,
  next,
) {
  try {
    const pool = getMySqlPool();

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario.",
      });
    }

    const startDate =
      dateNDaysAgo(6);

    /*
     * ================================================================
     * HABITS
     * ================================================================
     */

    const [habitRows] = await pool.query(
      `
        SELECT
          habit_key,
          log_date,
          value,
          goal
        FROM habit_logs
        WHERE user_id = ?
          AND log_date >= ?
        ORDER BY log_date ASC
      `,
      [
        userId,
        startDate,
      ],
    );

    /*
     * ================================================================
     * HEALTH METRICS
     * ================================================================
     */

    const [healthRows] = await pool.query(
      `
        SELECT
          id,
          metric_date,
          water_l,
          steps,
          sleep_hours,
          weight_kg,
          wellness_score
        FROM health_metrics
        WHERE user_id = ?
          AND DATE(metric_date) >= ?
        ORDER BY
          metric_date ASC,
          id ASC
      `,
      [
        userId,
        startDate,
      ],
    );

    const profile =
      await getUserProfile(
        pool,
        userId,
      );

    const medsAdherence =
      await getMedsAdherence(
        pool,
        userId,
      );

    /*
     * ================================================================
     * DÍAS
     * ================================================================
     */

    const days = [];

    for (
      let i = 6;
      i >= 0;
      i -= 1
    ) {
      days.push(
        dateNDaysAgo(i),
      );
    }

    /*
     * ================================================================
     * INDEXAR HÁBITOS
     * ================================================================
     */

    const habitsByDate = {};

    for (const row of habitRows) {
      const date = toDateKey(
        row.log_date,
      );

      if (!habitsByDate[date]) {
        habitsByDate[date] = {};
      }

      habitsByDate[date][
        row.habit_key
      ] = Number(
        row.value ?? 0,
      );
    }

    /*
     * ================================================================
     * INDEXAR MÉTRICAS
     * ================================================================
     */

    const metricsByDate = {};

    for (const row of healthRows) {
      const date = toDateKey(
        row.metric_date,
      );

      metricsByDate[date] = {
        waterL: Number(
          row.water_l ?? 0,
        ),

        steps: Number(
          row.steps ?? 0,
        ),

        sleepHours: Number(
          row.sleep_hours ?? 0,
        ),

        weightKg:
          row.weight_kg !==
          null
            ? Number(
                row.weight_kg,
              )
            : null,

        wellnessScore:
          row.wellness_score !==
          null
            ? Number(
                row.wellness_score,
              )
            : null,
      };
    }

    /*
     * ================================================================
     * ACTIVIDAD = PASOS REALES
     * ================================================================
     */

    const actividad =
      days.map((date) => {
        const day =
          new Date(
            `${date}T00:00:00`,
          );

        const metric =
          metricsByDate[date];

        return {
          day:
            DAY_LABELS[
              day.getDay()
            ],

          value: Number(
            metric?.steps ?? 0,
          ),
        };
      });

    /*
     * ================================================================
     * AGUA
     * ================================================================
     */

    const agua =
      days.map((date) => {
        const day =
          new Date(
            `${date}T00:00:00`,
          );

        const metric =
          metricsByDate[date];

        const habits =
          habitsByDate[date];

        const value =
          metric?.waterL ??
          (
            Number(
              habits?.water ??
                0,
            ) * 0.25
          );

        return {
          day:
            DAY_LABELS[
              day.getDay()
            ],

          value: Number(
            value.toFixed(2),
          ),
        };
      });

    /*
     * ================================================================
     * SUEÑO
     * ================================================================
     */

    const sueno =
      days.map((date) => {
        const day =
          new Date(
            `${date}T00:00:00`,
          );

        const metric =
          metricsByDate[date];

        const habits =
          habitsByDate[date];

        const value =
          metric?.sleepHours ??
          Number(
            habits?.sleep ??
              0,
          );

        return {
          day:
            DAY_LABELS[
              day.getDay()
            ],

          value: Number(
            value.toFixed(1),
          ),
        };
      });

    /*
     * ================================================================
     * PESO
     * ================================================================
     */

    const peso =
      days.map((date) => {
        const day =
          new Date(
            `${date}T00:00:00`,
          );

        const metric =
          metricsByDate[date];

        let value = 0;

        if (
          metric?.weightKg !==
          null &&
          metric?.weightKg !==
            undefined
        ) {
          value =
            metric.weightKg;
        } else if (
          profile.weightKg !==
          null
        ) {
          value = Number(
            profile.weightKg,
          );
        }

        return {
          day:
            DAY_LABELS[
              day.getDay()
            ],

          value,
        };
      });

    /*
     * ================================================================
     * BIENESTAR
     * ================================================================
     */

    const bienestar =
      days.map((date) => {
        const day =
          new Date(
            `${date}T00:00:00`,
          );

        const metric =
          metricsByDate[date];

        /*
         * Si tenemos wellness_score real,
         * usarlo directamente.
         */

        if (
          metric?.wellnessScore !==
            null &&
          metric?.wellnessScore !==
            undefined
        ) {
          return {
            day:
              DAY_LABELS[
                day.getDay()
              ],

            value:
              metric.wellnessScore,
          };
        }

        /*
         * Fallback calculado con hábitos.
         */

        const habits =
          habitsByDate[date] ||
          {};

        const pcts =
          Object.keys(
            HABIT_GOALS,
          ).map((key) => {
            const value =
              Number(
                habits[key] ??
                  0,
              );

            const goal =
              HABIT_GOALS[key];

            if (goal <= 0) {
              return 0;
            }

            return Math.min(
              100,
              Math.round(
                (value / goal) *
                  100,
              ),
            );
          });

        const avg =
          pcts.length > 0
            ? Math.round(
                pcts.reduce(
                  (a, b) =>
                    a + b,
                  0,
                ) /
                  pcts.length,
              )
            : 0;

        return {
          day:
            DAY_LABELS[
              day.getDay()
            ],

          value: Math.round(
            avg * 0.5 +
              medsAdherence *
                0.5,
          ),
        };
      });

    return res.json({
      Actividad:
        actividad,

      Bienestar:
        bienestar,

      Sueño:
        sueno,

      Peso:
        peso,

      Agua:
        agua,
    });
  } catch (error) {
    console.error(
      "Metrics weekly error:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| INCREMENTAR PASOS
|--------------------------------------------------------------------------
|
| POST /api/metrics/steps/increment
|
| Por defecto suma 500 pasos.
|--------------------------------------------------------------------------
*/

export async function incrementSteps(
  req,
  res,
  next,
) {
  try {
    const pool =
      getMySqlPool();

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario.",
      });
    }

    const requestedStep =
      Number(
        req.body?.step,
      );

    const step =
      Number.isFinite(
        requestedStep,
      ) &&
      requestedStep > 0
        ? Math.round(
            requestedStep,
          )
        : 500;

    const today =
      todayDate();

    /*
     * Buscar registro de hoy.
     */

    const [rows] =
      await pool.query(
        `
          SELECT
            id,
            steps
          FROM health_metrics
          WHERE user_id = ?
            AND DATE(metric_date) = ?
          ORDER BY id DESC
          LIMIT 1
        `,
        [
          userId,
          today,
        ],
      );

    /*
     * Si no existe,
     * crearlo.
     */

    if (!rows.length) {
      const initialSteps =
        Math.min(
          step,
          STEPS_GOAL,
        );

      const [
        result,
      ] = await pool.query(
        `
          INSERT INTO health_metrics (
            user_id,
            metric_date,
            water_l,
            steps,
            sleep_hours,
            weight_kg,
            wellness_score
          )
          VALUES (
            ?,
            ?,
            0,
            ?,
            0,
            0,
            0
          )
        `,
        [
          userId,
          today,
          initialSteps,
        ],
      );

      return res.json({
        id: Number(
          result.insertId,
        ),

        steps:
          initialSteps,

        goal:
          STEPS_GOAL,

        percentage:
          Math.min(
            100,
            Math.round(
              (initialSteps /
                STEPS_GOAL) *
                100,
            ),
          ),
      });
    }

    const currentSteps =
      Number(
        rows[0].steps ?? 0,
      );

    const nextSteps =
      Math.min(
        currentSteps +
          step,
        STEPS_GOAL,
      );

    await pool.query(
      `
        UPDATE health_metrics
        SET steps = ?
        WHERE id = ?
          AND user_id = ?
      `,
      [
        nextSteps,
        rows[0].id,
        userId,
      ],
    );

    return res.json({
      id: Number(
        rows[0].id,
      ),

      steps:
        nextSteps,

      goal:
        STEPS_GOAL,

      percentage:
        Math.min(
          100,
          Math.round(
            (nextSteps /
              STEPS_GOAL) *
              100,
          ),
        ),
    });
  } catch (error) {
    console.error(
      "Error incrementando pasos:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| EDITAR PASOS MANUALMENTE
|--------------------------------------------------------------------------
|
| PATCH /api/metrics/steps
|
| Body:
| {
|   "steps": 9250
| }
|--------------------------------------------------------------------------
*/

export async function updateSteps(
  req,
  res,
  next,
) {
  try {
    const pool =
      getMySqlPool();

    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario.",
      });
    }

    const steps =
      Number(
        req.body?.steps,
      );

    if (
      !Number.isFinite(
        steps,
      ) ||
      steps < 0
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Los pasos deben ser un número mayor o igual a 0.",
      });
    }

    const safeSteps =
      Math.round(steps);

    const today =
      todayDate();

    /*
     * Buscar registro del día.
     */

    const [
      rows,
    ] = await pool.query(
      `
        SELECT
          id
        FROM health_metrics
        WHERE user_id = ?
          AND DATE(metric_date) = ?
        ORDER BY id DESC
        LIMIT 1
      `,
      [
        userId,
        today,
      ],
    );

    /*
     * Crear si no existe.
     */

    if (!rows.length) {
      const [
        result,
      ] = await pool.query(
        `
          INSERT INTO health_metrics (
            user_id,
            metric_date,
            water_l,
            steps,
            sleep_hours,
            weight_kg,
            wellness_score
          )
          VALUES (
            ?,
            ?,
            0,
            ?,
            0,
            0,
            0
          )
        `,
        [
          userId,
          today,
          safeSteps,
        ],
      );

      return res.json({
        id: Number(
          result.insertId,
        ),

        steps:
          safeSteps,

        goal:
          STEPS_GOAL,

        percentage:
          Math.min(
            100,
            Math.round(
              (safeSteps /
                STEPS_GOAL) *
                100,
            ),
          ),
      });
    }

    /*
     * Actualizar exactamente.
     */

    await pool.query(
      `
        UPDATE health_metrics
        SET steps = ?
        WHERE id = ?
          AND user_id = ?
      `,
      [
        safeSteps,
        rows[0].id,
        userId,
      ],
    );

    return res.json({
      id: Number(
        rows[0].id,
      ),

      steps:
        safeSteps,

      goal:
        STEPS_GOAL,

      percentage:
        Math.min(
          100,
          Math.round(
            (safeSteps /
              STEPS_GOAL) *
              100,
          ),
        ),
    });
  } catch (error) {
    console.error(
      "Error actualizando pasos:",
      error,
    );

    return next(error);
  }
}