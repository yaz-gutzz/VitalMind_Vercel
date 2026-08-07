import { z } from "zod";
import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";

const CATEGORIES = ["diseases", "allergies", "medications", "surgeries", "consultations", "vaccines", "results"];

const itemSchema = z.object({
  userId: z.coerce.number().int().positive().optional().nullable(),
  category: z.enum(CATEGORIES),
  description: z.string().min(2).max(255),
});

export async function listMedicalHistory(req, res, next) {
  try {
    const { category = "", userId = "" } = req.query;
    const pool = getMySqlPool();
    const clauses = [];
    const params = [];

    if (category) {
      clauses.push("category = ?");
      params.push(category);
    }
    if (userId) {
      clauses.push("user_id = ?");
      params.push(userId);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `SELECT id, user_id AS userId, category, description, created_at AS createdAt
       FROM medical_history_items ${where} ORDER BY id DESC`,
      params
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function createMedicalHistoryItem(req, res, next) {
  try {
    const body = itemSchema.parse(req.body);
    const pool = getMySqlPool();
    const [result] = await pool.query(
      `INSERT INTO medical_history_items (user_id, category, description) VALUES (?, ?, ?)`,
      [body.userId || req.user?.sub || null, body.category, body.description]
    );

    const created = { id: Number(result.insertId), userId: body.userId || req.user?.sub || null, category: body.category, description: body.description };
    await logAudit(req.user?.sub || null, "medical_history.create", "medical_history_items", String(result.insertId), created);
    return res.status(201).json(created);
  } catch (error) {
    return next(error);
  }
}

export async function deleteMedicalHistoryItem(req, res, next) {
  try {
    const pool = getMySqlPool();
    const [result] = await pool.query("DELETE FROM medical_history_items WHERE id = ?", [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Not Found", message: "Registro no encontrado" });
    }

    await logAudit(req.user?.sub || null, "medical_history.delete", "medical_history_items", String(req.params.id), {});
    return res.json({ deleted: true, id: Number(req.params.id) });
  } catch (error) {
    return next(error);
  }
}
