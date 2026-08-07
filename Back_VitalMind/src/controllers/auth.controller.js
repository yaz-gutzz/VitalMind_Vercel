import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  age: z.coerce.number().int().nonnegative().optional(),
  role: z.enum(["admin", "patient", "caregiver"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function buildToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role, name: user.full_name || user.name }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export async function register(req, res, next) {
  try {
    const body = registerSchema.parse(req.body);
    const pool = getMySqlPool();
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [body.email]);

    if (existing.length) {
      return res.status(409).json({ error: "Conflict", message: "Ya existe una cuenta con ese email" });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const [result] = await pool.query(
      `
      INSERT INTO users 
      (
      full_name,
      email,
      password_hash,
      age,
      joined_label,
      last_active_label,
      last_active_at,
      status,
      registros,
      consultas,
      color,
      role
      )
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?)
      `,
      [
      body.name,
      body.email,
      passwordHash,
      body.age || 0,
      new Date().toLocaleDateString("es-ES"),
      "Hace unos segundos",
      "active",
      0,
      0,
      "#0F766E",
      body.role || "patient"
      ]
      );

    const user = { id: Number(result.insertId), full_name: body.name, email: body.email, role: body.role || "patient" };
    await logAudit(null, "auth.register", "users", String(user.id), { email: user.email });

    return res.status(201).json({ token: buildToken(user), user });
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const body = loginSchema.parse(req.body);
    const pool = getMySqlPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ? LIMIT 1", [body.email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "Unauthorized", message: "Credenciales inválidas" });
    }

    const valid = await bcrypt.compare(body.password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Unauthorized", message: "Credenciales inválidas" });
    }

    await pool.query(`UPDATE users SET last_active_label = ?,last_active_at = NOW(),status = 'active'WHERE id = ?`,["Hace unos segundos",user.id]);
    await logAudit(user.id, "auth.login", "users", String(user.id), { email: user.email });

    return res.json({ token: buildToken(user), user: { id: Number(user.id), name: user.full_name, email: user.email, role: user.role } });
  } catch (error) {
    return next(error);
  }
}

export async function me(req, res, next) {
  try {
    const pool = getMySqlPool();
    const [rows] = await pool.query(
      `SELECT id, full_name AS name, email, age, joined_label AS joined, last_active_label AS lastActive,
              status, registros, consultas, color, role, blood_type AS bloodType, phone,
              weight_kg AS weightKg, height_cm AS heightCm
       FROM users WHERE id = ? LIMIT 1`,
      [req.user.sub]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Not Found", message: "Usuario no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
}

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  age: z.coerce.number().int().nonnegative().optional(),
  bloodType: z.string().max(5).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  weightKg: z.coerce.number().positive().optional().nullable(),
  heightCm: z.coerce.number().positive().optional().nullable(),
});

// Permite que el propio usuario edite su información personal (nombre, correo,
// edad, grupo sanguíneo, teléfono, peso y altura) y la guarda realmente en la
// base de datos, en lugar de solo cambiar el estado local del frontend.
export async function updateMe(req, res, next) {
  try {
    const body = updateMeSchema.parse(req.body);
    const pool = getMySqlPool();
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ? LIMIT 1", [req.user.sub]);

    if (!rows.length) {
      return res.status(404).json({ error: "Not Found", message: "Usuario no encontrado" });
    }

    if (body.email) {
      const [existing] = await pool.query("SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1", [body.email, req.user.sub]);
      if (existing.length) {
        return res.status(409).json({ error: "Conflict", message: "Ya existe una cuenta con ese email" });
      }
    }

    const current = rows[0];
    const next_ = {
      name: body.name ?? current.full_name,
      email: body.email ?? current.email,
      age: body.age ?? current.age,
      bloodType: body.bloodType !== undefined ? body.bloodType : current.blood_type,
      phone: body.phone !== undefined ? body.phone : current.phone,
      weightKg: body.weightKg !== undefined ? body.weightKg : current.weight_kg,
      heightCm: body.heightCm !== undefined ? body.heightCm : current.height_cm,
    };

    await pool.query(
      `UPDATE users SET full_name = ?, email = ?, age = ?, blood_type = ?, phone = ?, weight_kg = ?, height_cm = ? WHERE id = ?`,
      [next_.name, next_.email, next_.age, next_.bloodType, next_.phone, next_.weightKg, next_.heightCm, req.user.sub]
    );

    await logAudit(req.user.sub, "auth.updateMe", "users", String(req.user.sub), next_);
    return res.json({ id: Number(req.user.sub), ...next_ });
  } catch (error) {
    return next(error);
  }
}

// Estadísticas reales del perfil: días activo (días distintos con algún
// registro de hábito o medicamento tomado), registros totales y hábitos con
// al menos un progreso registrado.
export async function myStats(req, res, next) {
  try {
    const pool = getMySqlPool();
    const userId = req.user.sub;

    const [activeDaysRows] = await pool.query(
      "SELECT COUNT(DISTINCT log_date) AS total FROM habit_logs WHERE user_id = ?",
      [userId]
    );
    const [habitLogRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM habit_logs WHERE user_id = ?",
      [userId]
    );
    const [medRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM medications WHERE user_id = ?",
      [userId]
    );
    const [habitCountRows] = await pool.query(
      "SELECT COUNT(DISTINCT habit_key) AS total FROM habit_logs WHERE user_id = ? AND value > 0",
      [userId]
    );

    return res.json({
      diasActivo: Number(activeDaysRows[0].total),
      registros: Number(habitLogRows[0].total) + Number(medRows[0].total),
      habitos: Number(habitCountRows[0].total),
    });
  } catch (error) {
    return next(error);
  }
}