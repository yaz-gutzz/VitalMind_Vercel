import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";

import {
  createNotification,
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../controllers/notifications.controller.js";

export const notificationsRouter = Router();

/*
|--------------------------------------------------------------------------
| Obtener notificaciones del usuario autenticado
|--------------------------------------------------------------------------
|
| GET /api/notifications
|
| El controller se encarga de devolver únicamente:
| - notificaciones del usuario
| - notificaciones globales
|--------------------------------------------------------------------------
*/

notificationsRouter.get(
  "/",
  authRequired,
  listNotifications,
);

/*
|--------------------------------------------------------------------------
| Crear notificación
|--------------------------------------------------------------------------
|
| POST /api/notifications
|--------------------------------------------------------------------------
*/

notificationsRouter.post(
  "/",
  authRequired,
  createNotification,
);

/*
|--------------------------------------------------------------------------
| Marcar todas como leídas
|--------------------------------------------------------------------------
|
| PATCH /api/notifications/mark-all-read
|--------------------------------------------------------------------------
*/

notificationsRouter.patch(
  "/mark-all-read",
  authRequired,
  markAllNotificationsRead,
);

/*
|--------------------------------------------------------------------------
| Marcar una notificación como leída
|--------------------------------------------------------------------------
|
| PATCH /api/notifications/:id/read
|--------------------------------------------------------------------------
*/

notificationsRouter.patch(
  "/:id/read",
  authRequired,
  markNotificationRead,
);

/*
|--------------------------------------------------------------------------
| Eliminar una notificación
|--------------------------------------------------------------------------
|
| DELETE /api/notifications/:id
|--------------------------------------------------------------------------
*/

notificationsRouter.delete(
  "/:id",
  authRequired,
  deleteNotification,
);