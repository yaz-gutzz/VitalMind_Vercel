import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";

/*
|--------------------------------------------------------------------------
| Definición de hábitos
|--------------------------------------------------------------------------
|
| La tabla habit_logs utiliza:
|
| user_id
| habit_key
| log_date
| value
| goal
|
| Cada hábito se almacena como una fila independiente.
|--------------------------------------------------------------------------
*/

export const HABIT_DEFS = {
  water: {
    goal: 2,
    unit: "L",
    label: "Agua",
  },

  exercise: {
    goal: 30,
    unit: "min",
    label: "Ejercicio",
  },

  sleep: {
    goal: 8,
    unit: "h",
    label: "Sueño",
  },

  nutrition: {
    goal: 3,
    unit: "comidas",
    label: "Alimentación",
  },

  meditation: {
    goal: 10,
    unit: "min",
    label: "Meditación",
  },
};

const HABIT_KEYS = Object.keys(
  HABIT_DEFS,
);

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
| Fechas
|--------------------------------------------------------------------------
*/

function formatDate(date) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function todayDate() {
  return formatDate(
    new Date(),
  );
}

function dateNDaysAgo(n) {
  const date =
    new Date();

  date.setHours(
    0,
    0,
    0,
    0,
  );

  date.setDate(
    date.getDate() - n,
  );

  return formatDate(
    date,
  );
}

/*
|--------------------------------------------------------------------------
| Normalizar fecha MySQL
|--------------------------------------------------------------------------
*/

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    return formatDate(
      value,
    );
  }

  return String(
    value,
  ).slice(0, 10);
}

/*
|--------------------------------------------------------------------------
| Validar hábito
|--------------------------------------------------------------------------
*/

function isValidHabitKey(key) {
  return HABIT_KEYS.includes(
    key,
  );
}

/*
|--------------------------------------------------------------------------
| OBTENER HÁBITOS DE HOY
|--------------------------------------------------------------------------
*/

export async function getTodayHabits(
  req,
  res,
  next,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const pool =
      getMySqlPool();

    const today =
      todayDate();

    const [
      rows,
    ] = await pool.query(
      `
        SELECT
          id,
          user_id,
          habit_key,
          log_date,
          value,
          goal
        FROM habit_logs
        WHERE user_id = ?
          AND log_date = ?
        ORDER BY habit_key ASC
      `,
      [
        userId,
        today,
      ],
    );

    const byKey =
      new Map();

    for (const row of rows) {
      byKey.set(
        row.habit_key,
        row,
      );
    }

    const result =
      HABIT_KEYS.map(
        (key) => {
          const row =
            byKey.get(
              key,
            );

          const value =
            row
              ? Number(
                  row.value,
                )
              : 0;

          const goal =
            row
              ? Number(
                  row.goal,
                )
              : HABIT_DEFS[key]
                  .goal;

          return {
            id: row
              ? Number(
                  row.id,
                )
              : null,

            key,

            label:
              HABIT_DEFS[key]
                .label,

            value,

            goal,

            unit:
              HABIT_DEFS[key]
                .unit,

            completed:
              value >= goal,
          };
        },
      );

    return res.json(
      result,
    );
  } catch (error) {
    console.error(
      "Error obteniendo hábitos de hoy:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| INCREMENTAR HÁBITO
|--------------------------------------------------------------------------
*/

export async function incrementHabit(
  req,
  res,
  next,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const {
      key,
    } = req.params;

    if (
      !isValidHabitKey(
        key,
      )
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Hábito no válido",
      });
    }

    /*
     * Si el frontend envía step,
     * se respeta.
     *
     * Si no lo envía, usamos la meta
     * definida por defecto.
     */
    const parsedStep =
      Number(
        req.body?.step,
      );

    const step =
      Number.isFinite(
        parsedStep,
      ) &&
      parsedStep > 0
        ? parsedStep
        : getDefaultStep(
            key,
          );

    const defaultGoal =
      HABIT_DEFS[key]
        .goal;

    const pool =
      getMySqlPool();

    const today =
      todayDate();

    /*
     * Buscar el registro específico
     * del hábito del día.
     */
    const [
      rows,
    ] = await pool.query(
      `
        SELECT
          id,
          value,
          goal
        FROM habit_logs
        WHERE user_id = ?
          AND habit_key = ?
          AND log_date = ?
        LIMIT 1
      `,
      [
        userId,
        key,
        today,
      ],
    );

    /*
     * Si no existe, crearlo.
     */
    if (!rows.length) {
      const initialValue =
        Math.min(
          step,
          defaultGoal,
        );

      const [
        insertResult,
      ] = await pool.query(
        `
          INSERT INTO habit_logs (
            user_id,
            habit_key,
            log_date,
            value,
            goal
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          userId,
          key,
          today,
          initialValue,
          defaultGoal,
        ],
      );

      await logAudit(
        userId,
        "habits.increment",
        "habit_logs",
        String(
          insertResult.insertId,
        ),
        {
          key,
          date: today,
          value:
            initialValue,
          goal:
            defaultGoal,
        },
      );

      return res.json({
        id: Number(
          insertResult.insertId,
        ),

        key,

        value:
          initialValue,

        goal:
          defaultGoal,

        completed:
          initialValue >=
          defaultGoal,
      });
    }

    /*
     * Registro existente.
     */
    const current =
      rows[0];

    const currentValue =
      Number(
        current.value ?? 0,
      );

    const goal =
      Number(
        current.goal ??
          defaultGoal,
      );

    /*
     * No superar la meta.
     */
    const nextValue =
      Math.min(
        currentValue +
          step,
        goal,
      );

    /*
     * Actualizamos value.
     */
    await pool.query(
      `
        UPDATE habit_logs
        SET
          value = ?
        WHERE user_id = ?
          AND habit_key = ?
          AND log_date = ?
      `,
      [
        nextValue,
        userId,
        key,
        today,
      ],
    );

    await logAudit(
      userId,
      "habits.increment",
      "habit_logs",
      String(
        current.id,
      ),
      {
        key,
        date: today,
        previousValue:
          currentValue,
        value:
          nextValue,
        goal,
      },
    );

    return res.json({
      id: Number(
        current.id,
      ),

      key,

      value:
        nextValue,

      goal,

      completed:
        nextValue >=
        goal,
    });
  } catch (error) {
    console.error(
      "Error incrementando hábito:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| ESTABLECER VALOR
|--------------------------------------------------------------------------
*/

export async function setHabitValue(
  req,
  res,
  next,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const {
      key,
    } = req.params;

    if (
      !isValidHabitKey(
        key,
      )
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Hábito no válido",
      });
    }

    const value =
      Number(
        req.body?.value,
      );

    if (
      !Number.isFinite(
        value,
      ) ||
      value < 0
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "El valor del hábito debe ser un número mayor o igual a 0.",
      });
    }

    const pool =
      getMySqlPool();

    const today =
      todayDate();

    const goal =
      HABIT_DEFS[key]
        .goal;

    const safeValue =
      Math.min(
        value,
        goal,
      );

    const [
      rows,
    ] = await pool.query(
      `
        SELECT
          id
        FROM habit_logs
        WHERE user_id = ?
          AND habit_key = ?
          AND log_date = ?
        LIMIT 1
      `,
      [
        userId,
        key,
        today,
      ],
    );

    if (rows.length) {
      await pool.query(
        `
          UPDATE habit_logs
          SET
            value = ?,
            goal = ?
          WHERE user_id = ?
            AND habit_key = ?
            AND log_date = ?
        `,
        [
          safeValue,
          goal,
          userId,
          key,
          today,
        ],
      );
    } else {
      await pool.query(
        `
          INSERT INTO habit_logs (
            user_id,
            habit_key,
            log_date,
            value,
            goal
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          userId,
          key,
          today,
          safeValue,
          goal,
        ],
      );
    }

    await logAudit(
      userId,
      "habits.set",
      "habit_logs",
      key,
      {
        date:
          today,
        value:
          safeValue,
        goal,
      },
    );

    return res.json({
      key,

      value:
        safeValue,

      goal,

      completed:
        safeValue >=
        goal,
    });
  } catch (error) {
    console.error(
      "Error estableciendo hábito:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| SEGUIMIENTO SEMANAL
|--------------------------------------------------------------------------
*/

export async function getWeeklyHabits(
  req,
  res,
  next,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const pool =
      getMySqlPool();

    const startDate =
      dateNDaysAgo(
        6,
      );

    const [
      rows,
    ] = await pool.query(
      `
        SELECT
          id,
          habit_key,
          log_date,
          value,
          goal
        FROM habit_logs
        WHERE user_id = ?
          AND log_date >= ?
        ORDER BY
          log_date ASC,
          habit_key ASC
      `,
      [
        userId,
        startDate,
      ],
    );

    const days = [];

    for (
      let i = 6;
      i >= 0;
      i--
    ) {
      days.push(
        dateNDaysAgo(
          i,
        ),
      );
    }

    const tracking = {};

    for (
      const key of HABIT_KEYS
    ) {
      tracking[key] =
        days.map(
          (day) => {
            const row =
              rows.find(
                (item) =>
                  item.habit_key ===
                    key &&
                  normalizeDate(
                    item.log_date,
                  ) ===
                    day,
              );

            if (!row) {
              return {
                date:
                  day,

                value:
                  0,

                goal:
                  HABIT_DEFS[
                    key
                  ].goal,

                completed:
                  false,
              };
            }

            const value =
              Number(
                row.value ??
                  0,
              );

            const goal =
              Number(
                row.goal ??
                  HABIT_DEFS[
                    key
                  ].goal,
              );

            return {
              date:
                day,

              value,

              goal,

              completed:
                value >=
                goal,
            };
          },
        );
    }

    return res.json({
      days,

      tracking,
    });
  } catch (error) {
    console.error(
      "Error obteniendo seguimiento semanal:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| HISTORIAL DE UN HÁBITO
|--------------------------------------------------------------------------
*/

export async function getHabitHistory(
  req,
  res,
  next,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const {
      key,
    } = req.params;

    if (
      !isValidHabitKey(
        key,
      )
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Hábito no válido",
      });
    }

    const pool =
      getMySqlPool();

    const [
      rows,
    ] = await pool.query(
      `
        SELECT
          id,
          habit_key,
          log_date,
          value,
          goal,
          created_at,
          updated_at
        FROM habit_logs
        WHERE user_id = ?
          AND habit_key = ?
        ORDER BY
          log_date DESC
        LIMIT 30
      `,
      [
        userId,
        key,
      ],
    );

    return res.json(
      rows.map(
        (row) => {
          const value =
            Number(
              row.value,
            );

          const goal =
            Number(
              row.goal ??
                HABIT_DEFS[
                  key
                ].goal,
            );

          return {
            id: Number(
              row.id,
            ),

            key:
              row.habit_key,

            date:
              normalizeDate(
                row.log_date,
              ),

            value,

            goal,

            completed:
              value >=
              goal,
          };
        },
      ),
    );
  } catch (error) {
    console.error(
      "Error obteniendo historial del hábito:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| PASO POR DEFECTO
|--------------------------------------------------------------------------
|
| IMPORTANTE:
|
| Agua:
| 0.25 L por clic
| 4 clics = 1 L
| 8 clics = 2 L
|
| Así el frontend puede mostrar:
| 1 vaso = 250 ml.
|--------------------------------------------------------------------------
*/

function getDefaultStep(key) {
  switch (key) {
    case "water":
      return 0.25;

    case "exercise":
      return 5;

    case "sleep":
      return 1;

    case "nutrition":
      return 1;

    case "meditation":
      return 5;

    default:
      return 1;
  }
}