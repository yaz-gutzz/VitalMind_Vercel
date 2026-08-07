import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";

import {
  createEmotionalLog,
  getTodayEmotionalLog,
  getEmotionalHistory
} from "../controllers/emotionalLogs.controller.js";


export const emotionalLogsRouter = Router();


// Crear registro emocional
emotionalLogsRouter.post(
  "/",
  authRequired,
  createEmotionalLog
);


// Obtener emoción registrada hoy
emotionalLogsRouter.get(
  "/today",
  authRequired,
  getTodayEmotionalLog
);


// Historial para gráficas y Machine Learning
emotionalLogsRouter.get(
  "/history",
  authRequired,
  getEmotionalHistory
);