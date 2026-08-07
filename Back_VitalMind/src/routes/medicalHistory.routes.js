import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { createMedicalHistoryItem, deleteMedicalHistoryItem, listMedicalHistory } from "../controllers/medicalHistory.controller.js";

export const medicalHistoryRouter = Router();

medicalHistoryRouter.get("/", authRequired, listMedicalHistory);
medicalHistoryRouter.post("/", authRequired, createMedicalHistoryItem);
medicalHistoryRouter.delete("/:id", authRequired, deleteMedicalHistoryItem);
