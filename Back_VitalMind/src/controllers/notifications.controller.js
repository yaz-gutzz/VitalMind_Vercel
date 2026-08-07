import { z } from "zod";
import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";

const notificationSchema = z.object({
  userId: z.coerce.number().int().positive().optional().nullable(),
  kind: z.enum(["tip", "reminder", "ai", "alert"]).optional(),
  title: z.string().min(2),
  body: z.string().min(2),
  time: z.string().optional(),
  read: z.coerce.boolean().optional(),
});

function serializeNotification(notification) {
  return { ...notification, id: String(notification.id), read: Boolean(notification.read) };
}

export async function listNotifications(req, res, next) {
  try {
    const clauses = [];
    const params = [];
    if (req.query.kind) {
      clauses.push("kind = ?");
      params.push(req.query.kind);
    }
    if (req.query.read === "true" || req.query.read === "false") {
      clauses.push("is_read = ?");
      params.push(req.query.read === "true" ? 1 : 0);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await getMySqlPool().query(
      `SELECT id, kind, title, body, time_label AS time, is_read AS \`read\`, created_at AS createdAt, updated_at AS updatedAt FROM notifications ${where} ORDER BY created_at DESC, id DESC`,
      params
    );
    return res.json(rows.map(serializeNotification));
  } catch (error) {
    return next(error);
  }
}

export async function createNotification(req, res, next) {
  try {
    const body = notificationSchema.parse(req.body);
    const notification = {
      userId: body.userId || null,
      kind: body.kind || "tip",
      title: body.title,
      body: body.body,
      time: body.time || "Ahora",
      read: body.read ?? false,
    };
    const [result] = await getMySqlPool().query(
      "INSERT INTO notifications (user_id, kind, title, body, time_label, is_read) VALUES (?, ?, ?, ?, ?, ?)",
      [notification.userId, notification.kind, notification.title, notification.body, notification.time, notification.read ? 1 : 0]
    );
    notification.id = String(result.insertId);
    await logAudit(req.user?.sub || null, "notifications.create", "notifications", notification.id, body);
    return res.status(201).json(notification);
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const [result] = await getMySqlPool().query("UPDATE notifications SET is_read = 1 WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Not Found", message: "Notificacion no encontrada" });
    }
    await logAudit(req.user?.sub || null, "notifications.read", "notifications", String(req.params.id), { read: true });
    return res.json({ id: String(req.params.id), read: true });
  } catch (error) {
    return next(error);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    const [result] = await getMySqlPool().query("UPDATE notifications SET is_read = 1 WHERE is_read = 0");
    await logAudit(req.user?.sub || null, "notifications.mark_all_read", "notifications", null, { modified: result.changedRows });
    return res.json({ updated: true, matched: result.affectedRows, modified: result.changedRows });
  } catch (error) {
    return next(error);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const [result] = await getMySqlPool().query("DELETE FROM notifications WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Not Found", message: "Notificacion no encontrada" });
    }
    await logAudit(req.user?.sub || null, "notifications.delete", "notifications", String(req.params.id), {});
    return res.json({ deleted: true, id: String(req.params.id) });
  } catch (error) {
    return next(error);
  }
}
