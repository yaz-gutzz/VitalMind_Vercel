import { z } from "zod";
import bcrypt from "bcryptjs";
import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";

const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  age: z.coerce.number().int().nonnegative().optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
  registros: z.coerce.number().int().nonnegative().optional(),
  consultas: z.coerce.number().int().nonnegative().optional(),
  color: z.string().optional(),
  role: z.enum(["admin", "patient", "caregiver"]).optional(),
});

export async function listUsers(req, res, next) {
  try {
    const { search = "", status = "", role = "" } = req.query;
    const pool = getMySqlPool();
    const clauses = [];
    const params = [];

    if (search) {
      clauses.push("(full_name LIKE ? OR email LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      clauses.push("status = ?");
      params.push(status);
    }
    if (role) {
      clauses.push("role = ?");
      params.push(role);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `SELECT id, full_name AS name, email, age, joined_label AS joined, last_active_label AS lastActive, status, registros, consultas, color, role FROM users ${where} ORDER BY id DESC`,
      params
    );

    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function getUserById(req, res, next) {
  try {
    const pool = getMySqlPool();
    const [rows] = await pool.query(
      "SELECT id, full_name AS name, email, age, joined_label AS joined, last_active_label AS lastActive, status, registros, consultas, color, role FROM users WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Not Found", message: "Usuario no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const body = userSchema.parse(req.body);
    const password = body.password || `Temp-${Math.random().toString(36).slice(2, 10)}!`;
    const passwordHash = await bcrypt.hash(password, 10);
    const pool = getMySqlPool();
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, age, joined_label, last_active_label, status, registros, consultas, color, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [body.name, body.email, passwordHash, body.age || 0, new Date().toLocaleDateString("es-ES"), "Hace unos segundos", body.status || "pending", body.registros || 0, body.consultas || 0, body.color || "#0F766E", body.role || "patient"]
    );

    await logAudit(req.user?.sub || null, "users.create", "users", String(result.insertId), body);
    return res.status(201).json({ id: Number(result.insertId), name: body.name, email: body.email, temporaryPassword: password, age: body.age || 0, status: body.status || "pending", registros: body.registros || 0, consultas: body.consultas || 0, color: body.color || "#0F766E", role: body.role || "patient" });
  } catch (error) {
    return next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const body = userSchema.partial().parse(req.body);
    const pool = getMySqlPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ error: "Not Found", message: "Usuario no encontrado" });
    }

    const current = rows[0];
    const nextUser = {
      name: body.name || current.full_name,
      email: body.email || current.email,
      age: body.age ?? current.age,
      status: body.status || current.status,
      registros: body.registros ?? current.registros,
      consultas: body.consultas ?? current.consultas,
      color: body.color || current.color,
      role: body.role || current.role,
    };

    await pool.query(
      `UPDATE users SET full_name = ?, email = ?, age = ?, status = ?, registros = ?, consultas = ?, color = ?, role = ? WHERE id = ?`,
      [nextUser.name, nextUser.email, nextUser.age, nextUser.status, nextUser.registros, nextUser.consultas, nextUser.color, nextUser.role, req.params.id]
    );

    await logAudit(req.user?.sub || null, "users.update", "users", String(req.params.id), nextUser);
    return res.json({ id: Number(req.params.id), ...nextUser });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const pool = getMySqlPool();
    const status = z.enum(["active", "inactive", "pending"]).parse(req.body.status);
    const [result] = await pool.query("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Not Found", message: "Usuario no encontrado" });
    }

    await logAudit(req.user?.sub || null, "users.status", "users", String(req.params.id), { status });
    return res.json({ id: Number(req.params.id), status });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const pool = getMySqlPool();
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Not Found", message: "Usuario no encontrado" });
    }

    await logAudit(req.user?.sub || null, "users.delete", "users", String(req.params.id), {});
    return res.json({ deleted: true, id: Number(req.params.id) });
  } catch (error) {
    return next(error);
  }
}