import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import {createMedication, deleteMedication, getMedicationById, listMedications, updateMedication, getMedicationHistory, registerMedicationTaken} from "../controllers/medications.controller.js";

export const medicationsRouter = Router();

medicationsRouter.get("/", authRequired, listMedications);
medicationsRouter.post("/", authRequired, createMedication);
medicationsRouter.get("/:id", authRequired, getMedicationById);
medicationsRouter.patch("/:id", authRequired, updateMedication);
medicationsRouter.delete("/:id", authRequired, deleteMedication);
medicationsRouter.get("/:id/history", authRequired, getMedicationHistory);
medicationsRouter.post("/:id/taken", authRequired, registerMedicationTaken);