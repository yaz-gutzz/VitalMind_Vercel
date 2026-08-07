import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { createNotification, deleteNotification, listNotifications, markAllNotificationsRead, markNotificationRead } from "../controllers/notifications.controller.js";

export const notificationsRouter = Router();

notificationsRouter.get("/", authRequired, listNotifications);
notificationsRouter.post("/", authRequired, createNotification);
notificationsRouter.patch("/mark-all-read", authRequired, markAllNotificationsRead);
notificationsRouter.patch("/:id/read", authRequired, markNotificationRead);
notificationsRouter.delete("/:id", authRequired, deleteNotification);