import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { dashboardSummary } from "../controllers/dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", authRequired, dashboardSummary);