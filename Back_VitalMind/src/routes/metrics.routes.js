import { Router } from "express";

import { authRequired } from "../middlewares/auth.js";

import {
  getMetricsSummary,
  getMetricsWeekly,
  incrementSteps,
  updateSteps,
} from "../controllers/metrics.controller.js";

export const metricsRouter = Router();

/*
|--------------------------------------------------------------------------
| Métricas actuales
|--------------------------------------------------------------------------
*/

metricsRouter.get(
  "/summary",
  authRequired,
  getMetricsSummary,
);

/*
|--------------------------------------------------------------------------
| Métricas semanales
|--------------------------------------------------------------------------
*/

metricsRouter.get(
  "/weekly",
  authRequired,
  getMetricsWeekly,
);

/*
|--------------------------------------------------------------------------
| Registrar pasos
|--------------------------------------------------------------------------
|
| POST /api/metrics/steps/increment
|
| Agrega 500 pasos por defecto.
|--------------------------------------------------------------------------
*/

metricsRouter.post(
  "/steps/increment",
  authRequired,
  incrementSteps,
);

/*
|--------------------------------------------------------------------------
| Editar pasos
|--------------------------------------------------------------------------
|
| PATCH /api/metrics/steps
|
| Body:
| {
|   "steps": 8250
| }
|--------------------------------------------------------------------------
*/

metricsRouter.patch(
  "/steps",
  authRequired,
  updateSteps,
);