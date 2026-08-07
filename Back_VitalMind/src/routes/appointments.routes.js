import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { createAppointment, deleteAppointment, getAppointmentById, listAppointments, updateAppointment, updateAppointmentStatus } from "../controllers/appointments.controller.js";

export const appointmentsRouter = Router();

appointmentsRouter.get("/", authRequired, listAppointments);
appointmentsRouter.post("/", authRequired, createAppointment);
appointmentsRouter.get("/:id", authRequired, getAppointmentById);
appointmentsRouter.patch("/:id", authRequired, updateAppointment);
appointmentsRouter.patch("/:id/status", authRequired, updateAppointmentStatus);
appointmentsRouter.delete("/:id", authRequired, deleteAppointment);