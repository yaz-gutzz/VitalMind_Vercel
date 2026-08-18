import { z } from "zod";
import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";
import {
  emitNotification,
} from "../socket.js";

const notificationSchema = z.object({
  userId: z.coerce.number().int().positive().optional().nullable(),
  kind: z
    .enum(["tip", "reminder", "ai", "alert"])
    .optional(),
  title: z.string().min(2),
  body: z.string().min(2),
  time: z.string().optional(),
  read: z.coerce.boolean().optional(),
});

/*
|--------------------------------------------------------------------------
| Obtener ID del usuario autenticado
|--------------------------------------------------------------------------
*/

function getUserId(req) {
  const userId = Number(
    req.user?.sub ?? req.user?.id,
  );

  return Number.isInteger(userId) &&
    userId > 0
    ? userId
    : null;
}

/*
|--------------------------------------------------------------------------
| Serializar notificación
|--------------------------------------------------------------------------
*/

function serializeNotification(
  notification,
) {
  return {
    ...notification,
    id: String(
      notification.id,
    ),
    read: Boolean(
      notification.read,
    ),
  };
}

/*
|--------------------------------------------------------------------------
| LISTAR NOTIFICACIONES
|--------------------------------------------------------------------------
|
| El usuario solo puede ver:
|
| 1. Sus propias notificaciones.
| 2. Notificaciones globales (user_id = NULL).
|
| Nunca las notificaciones privadas de otro usuario.
|--------------------------------------------------------------------------
*/

export async function listNotifications(
  req,
  res,
  next,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const clauses = [
      "(user_id = ? OR user_id IS NULL)",
    ];

    const params = [
      userId,
    ];

    if (req.query.kind) {
      clauses.push(
        "kind = ?",
      );

      params.push(
        req.query.kind,
      );
    }

    if (
      req.query.read === "true" ||
      req.query.read === "false"
    ) {
      clauses.push(
        "is_read = ?",
      );

      params.push(
        req.query.read === "true"
          ? 1
          : 0,
      );
    }

    const where =
      `WHERE ${clauses.join(
        " AND ",
      )}`;

    const [rows] =
      await getMySqlPool().query(
        `
          SELECT
            id,
            user_id AS userId,
            kind,
            title,
            body,
            time_label AS time,
            is_read AS \`read\`,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM notifications
          ${where}
          ORDER BY
            created_at DESC,
            id DESC
        `,
        params,
      );

    return res.json(
      rows.map(
        serializeNotification,
      ),
    );
  } catch (error) {
    console.error(
      "ERROR LIST NOTIFICATIONS:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| CREAR UNA NOTIFICACIÓN DIRECTA
|--------------------------------------------------------------------------
|
| Guarda primero en MySQL.
| Después emite por Socket.IO.
|--------------------------------------------------------------------------
*/

export async function createNotification(
  req,
  res,
  next,
) {
  try {
    const body =
      notificationSchema.parse(
        req.body,
      );

    const userId =
      body.userId ?? null;

    const notification = {
      userId,

      kind:
        body.kind ||
        "tip",

      title:
        body.title,

      body:
        body.body,

      time:
        body.time ||
        "Ahora",

      read:
        body.read ??
        false,
    };

    /*
    |--------------------------------------------------------------------------
    | Guardar en MySQL
    |--------------------------------------------------------------------------
    */

    const [result] =
      await getMySqlPool().query(
        `
          INSERT INTO notifications (
            user_id,
            kind,
            title,
            body,
            time_label,
            is_read
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          notification.userId,
          notification.kind,
          notification.title,
          notification.body,
          notification.time,
          notification.read
            ? 1
            : 0,
        ],
      );

    notification.id =
      String(
        result.insertId,
      );

    /*
    |--------------------------------------------------------------------------
    | Emitir inmediatamente con Socket.IO
    |--------------------------------------------------------------------------
    |
    | Solo se emite cuando pertenece a un usuario específico.
    |
    | Ejemplo:
    |
    | userId 10
    |    ↓
    | room user:10
    |    ↓
    | Yazmin
    |--------------------------------------------------------------------------
    */

    if (
      notification.userId
    ) {
      emitNotification(
        notification.userId,
        {
          id:
            notification.id,

          userId:
            notification.userId,

          kind:
            notification.kind,

          title:
            notification.title,

          body:
            notification.body,

          time:
            notification.time,

          read:
            notification.read,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Auditoría
    |--------------------------------------------------------------------------
    */

    await logAudit(
      req.user?.sub || null,
      "notifications.create",
      "notifications",
      notification.id,
      {
        ...body,
        userId,
      },
    );

    return res.status(201).json(
      notification,
    );
  } catch (error) {
    console.error(
      "ERROR CREATE NOTIFICATION:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| MARCAR UNA NOTIFICACIÓN COMO LEÍDA
|--------------------------------------------------------------------------
|
| Solo puede modificar:
|
| - una propia
| - o una global
|--------------------------------------------------------------------------
*/

export async function markNotificationRead(
  req,
  res,
  next,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const [result] =
      await getMySqlPool().query(
        `
          UPDATE notifications
          SET is_read = 1
          WHERE id = ?
            AND (
              user_id = ?
              OR user_id IS NULL
            )
        `,
        [
          req.params.id,
          userId,
        ],
      );

    if (
      !result.affectedRows
    ) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "Notificación no encontrada.",
      });
    }

    await logAudit(
      userId,
      "notifications.read",
      "notifications",
      String(
        req.params.id,
      ),
      {
        read: true,
      },
    );

    return res.json({
      id: String(
        req.params.id,
      ),
      read: true,
    });
  } catch (error) {
    console.error(
      "ERROR MARK NOTIFICATION READ:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| MARCAR TODAS COMO LEÍDAS
|--------------------------------------------------------------------------
|
| Solo afecta:
| - notificaciones propias
| - notificaciones globales
|--------------------------------------------------------------------------
*/

export async function markAllNotificationsRead(
  req,
  res,
  next,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const [result] =
      await getMySqlPool().query(
        `
          UPDATE notifications
          SET is_read = 1
          WHERE is_read = 0
            AND (
              user_id = ?
              OR user_id IS NULL
            )
        `,
        [
          userId,
        ],
      );

    await logAudit(
      userId,
      "notifications.mark_all_read",
      "notifications",
      null,
      {
        modified:
          result.changedRows,
      },
    );

    return res.json({
      updated: true,
      matched:
        result.affectedRows,
      modified:
        result.changedRows,
    });
  } catch (error) {
    console.error(
      "ERROR MARK ALL NOTIFICATIONS READ:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| ELIMINAR NOTIFICACIÓN
|--------------------------------------------------------------------------
|
| Solo elimina:
| - propias
| - globales
|--------------------------------------------------------------------------
*/

export async function deleteNotification(
  req,
  res,
  next,
) {
  try {
    const userId =
      getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const [result] =
      await getMySqlPool().query(
        `
          DELETE FROM notifications
          WHERE id = ?
            AND (
              user_id = ?
              OR user_id IS NULL
            )
        `,
        [
          req.params.id,
          userId,
        ],
      );

    if (
      !result.affectedRows
    ) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "Notificación no encontrada.",
      });
    }

    await logAudit(
      userId,
      "notifications.delete",
      "notifications",
      String(
        req.params.id,
      ),
      {},
    );

    return res.json({
      deleted: true,
      id: String(
        req.params.id,
      ),
    });
  } catch (error) {
    console.error(
      "ERROR DELETE NOTIFICATION:",
      error,
    );

    return next(error);
  }
}