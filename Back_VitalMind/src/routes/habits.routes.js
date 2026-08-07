import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { getTodayHabits, getWeeklyHabits, incrementHabit } from "../controllers/habits.controller.js";

export const habitsRouter = Router();

habitsRouter.get("/today", authRequired, getTodayHabits);
habitsRouter.get("/weekly", authRequired, getWeeklyHabits);
habitsRouter.patch("/:key/increment", authRequired, incrementHabit);
