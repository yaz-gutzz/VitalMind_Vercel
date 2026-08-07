import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { reportsSummary } from "../controllers/reports.controller.js";

export const reportsRouter = Router();

reportsRouter.get("/summary", authRequired, reportsSummary);