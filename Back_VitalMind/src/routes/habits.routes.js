import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";

import {
  getTodayHabits,
  getWeeklyHabits,
  incrementHabit,
  setHabitValue,
  getHabitHistory,
} from "../controllers/habits.controller.js";

export const habitsRouter = Router();

/*
|--------------------------------------------------------------------------
| Hábitos del día
|--------------------------------------------------------------------------
*/

habitsRouter.get(
  "/today",
  authRequired,
  getTodayHabits,
);

/*
|--------------------------------------------------------------------------
| Seguimiento semanal
|--------------------------------------------------------------------------
*/

habitsRouter.get(
  "/weekly",
  authRequired,
  getWeeklyHabits,
);

/*
|--------------------------------------------------------------------------
| Incrementar hábito
|--------------------------------------------------------------------------
|
| Frontend:
| POST /api/habits/water/increment
|
*/

habitsRouter.post(
  "/:key/increment",
  authRequired,
  incrementHabit,
);

/*
|--------------------------------------------------------------------------
| Establecer valor manualmente
|--------------------------------------------------------------------------
|
| Ejemplo:
| POST /api/habits/water
| body: { value: 1.5 }
|
*/

habitsRouter.post(
  "/:key",
  authRequired,
  setHabitValue,
);

/*
|--------------------------------------------------------------------------
| Historial de un hábito
|--------------------------------------------------------------------------
|
| Ejemplo:
| GET /api/habits/water/history
|
*/

habitsRouter.get(
  "/:key/history",
  authRequired,
  getHabitHistory,
);