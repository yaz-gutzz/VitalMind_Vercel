import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";

// Definición de hábitos y metas por defecto
// Debe coincidir con el frontend:
// components/screens/HabitosScreen.tsx
export const HABIT_DEFS = {
  water: { goal: 8 },
  exercise: { goal: 30 },
  sleep: { goal: 8 },
  nutrition: { goal: 3 },
  meditation: { goal: 10 },
};

const HABIT_KEYS = Object.keys(HABIT_DEFS);


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



// Obtener hábitos del día actual
export async function getTodayHabits(req, res, next) {

  try {

    const pool = getMySqlPool();
    const today = todayDate();


    const [rows] = await pool.query(
      `
      SELECT *
      FROM habit_logs
      WHERE user_id = ?
      AND log_date = ?
      LIMIT 1
      `,
      [
        req.user.sub,
        today
      ]
    );


    const data = rows[0] || {};


    const result = HABIT_KEYS.map((key) => ({

      key,

      value: Number(data[key] || 0),

      goal: HABIT_DEFS[key].goal

    }));


    return res.json(result);


  } catch (error) {

    return next(error);

  }

}





// Incrementar hábito
export async function incrementHabit(req, res, next) {


  try {


    const { key } = req.params;


    if (!HABIT_KEYS.includes(key)) {

      return res.status(400).json({
        error: "Bad Request",
        message: "Hábito no válido"
      });

    }



    const step = Number(req.body?.step) || 1;

    const goal = HABIT_DEFS[key].goal;

    const pool = getMySqlPool();

    const today = todayDate();



    // Buscar registro del día

    const [rows] = await pool.query(
      `
      SELECT *
      FROM habit_logs
      WHERE user_id = ?
      AND log_date = ?
      LIMIT 1
      `,
      [
        req.user.sub,
        today
      ]
    );




    // Si no existe crea el registro vacío

    if (!rows.length) {


      await pool.query(
        `
        INSERT INTO habit_logs
        (
          user_id,
          log_date
        )
        VALUES (?,?)
        `,
        [
          req.user.sub,
          today
        ]
      );


    }



    // Obtener valor actual

    const currentValue = rows.length
      ? Number(rows[0][key] || 0)
      : 0;



    // Calcular nuevo valor

    const nextValue = Math.min(
      currentValue + step,
      goal
    );




    // Actualizar solamente la columna del hábito

    await pool.query(
      `
      UPDATE habit_logs
      SET ${key} = ?
      WHERE user_id = ?
      AND log_date = ?
      `,
      [
        nextValue,
        req.user.sub,
        today
      ]
    );





    await logAudit(
      req.user.sub,
      "habits.increment",
      "habit_logs",
      key,
      {
        date: today,
        value: nextValue
      }
    );



    return res.json({

      key,

      value: nextValue,

      goal

    });



  } catch(error) {


    return next(error);


  }

}







// Obtener seguimiento semanal
export async function getWeeklyHabits(req, res, next) {


  try {


    const pool = getMySqlPool();

    const startDate = dateNDaysAgo(6);



    const [rows] = await pool.query(
      `
      SELECT *
      FROM habit_logs
      WHERE user_id = ?
      AND log_date >= ?
      ORDER BY log_date ASC
      `,
      [
        req.user.sub,
        startDate
      ]
    );




    // Últimos 7 días

    const days = [];

    for (let i = 6; i >= 0; i--) {

      days.push(dateNDaysAgo(i));

    }




    const result = {};



    for (const key of HABIT_KEYS) {


      result[key] = days.map((day)=>{
        const row = rows.find((r)=>{
          const date = r.log_date instanceof Date
          ? `${r.log_date.getFullYear()}-${String(r.log_date.getMonth()+1).padStart(2,"0")}-${String(r.log_date.getDate()).padStart(2,"0")}`
          : String(r.log_date);
          return date === day;
        });



        if (!row) {

          return false;

        }



        return Number(row[key]) >= HABIT_DEFS[key].goal;



      });



    }



    return res.json({

      days,

      tracking: result

    });



  } catch(error) {


    return next(error);


  }

}