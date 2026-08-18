import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import {
  getRecommendations,
} from "../controllers/recommendations.controller.js";

export const recommendationsRouter = Router();

recommendationsRouter.get(
  "/",
  authRequired,
  getRecommendations,
);