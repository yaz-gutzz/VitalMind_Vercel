import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { getMetricsSummary, getMetricsWeekly } from "../controllers/metrics.controller.js";

export const metricsRouter = Router();

metricsRouter.get("/summary", authRequired, getMetricsSummary);
metricsRouter.get("/weekly", authRequired, getMetricsWeekly);
