import { z } from "zod";
import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";

const appointmentSchema = z.object({
  userId: z.coerce.number().int().positive().optional().nullable(),
  specialty: z.string().min(2),
  doctor: z.string().min(2),
  appointmentDate: z.string().min(4),
  appointmentTime: z.string().min(1),
  place: z.string().min(2),
  color: z.string().optional(),
  status: z.enum(["proxima", "completada", "cancelada"]).optional(),
});

export async function listAppointments(req, res, next) {
  try {
    const { search = "", status = "" } = req.query;
    const pool = getMySqlPool();
    const clauses = [];
    const params = [];

    if (search) {
      clauses.push("(specialty LIKE ? OR doctor LIKE ? OR place LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      clauses.push("status = ?");
      params.push(status);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `SELECT id, user_id AS userId, specialty, doctor, appointment_date AS fecha, appointment_time AS hora, place AS lugar, color, status FROM appointments ${where} ORDER BY appointment_date DESC, appointment_time DESC`,
      params
    );

    return res.json(rows.map((item) => ({ id: Number(item.id), userId: item.userId, especialidad: item.specialty, doctor: item.doctor, fecha: item.fecha, hora: item.hora, lugar: item.lugar, color: item.color, estado: item.status })));
  } catch (error) {
    return next(error);
  }
}

export async function getAppointmentById(req, res, next) {
  try {
    const pool = getMySqlPool();
    const [rows] = await pool.query(
      "SELECT id, user_id AS userId, specialty, doctor, appointment_date AS fecha, appointment_time AS hora, place AS lugar, color, status FROM appointments WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Not Found", message: "Cita no encontrada" });
    }

    const item = rows[0];
    return res.json({ id: Number(item.id), userId: item.userId, especialidad: item.specialty, doctor: item.doctor, fecha: item.fecha, hora: item.hora, lugar: item.lugar, color: item.color, estado: item.status });
  } catch (error) {
    return next(error);
  }
}

export async function createAppointment(req, res, next) {
  try {
    const body = appointmentSchema.parse(req.body);
    const pool = getMySqlPool();
    const [result] = await pool.query(
      `INSERT INTO appointments (user_id, specialty, doctor, appointment_date, appointment_time, place, color, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [body.userId || null, body.specialty, body.doctor, body.appointmentDate, body.appointmentTime, body.place, body.color || "#0F766E", body.status || "proxima"]
    );

    await logAudit(req.user?.sub || null, "appointments.create", "appointments", String(result.insertId), body);
    return res.status(201).json({ id: Number(result.insertId), ...body, fecha: body.appointmentDate, hora: body.appointmentTime, lugar: body.place, estado: body.status || "proxima", especialidad: body.specialty });
  } catch (error) {
    return next(error);
  }
}

export async function updateAppointment(req, res, next) {
  try {
    const body = appointmentSchema.partial().parse(req.body);
    const pool = getMySqlPool();
    const [rows] = await pool.query("SELECT * FROM appointments WHERE id = ? LIMIT 1", [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ error: "Not Found", message: "Cita no encontrada" });
    }

    const current = rows[0];
    const nextAppointment = {
      userId: body.userId ?? current.user_id,
      specialty: body.specialty || current.specialty,
      doctor: body.doctor || current.doctor,
      appointmentDate: body.appointmentDate || String(current.appointment_date).slice(0, 10),
      appointmentTime: body.appointmentTime || current.appointment_time,
      place: body.place || current.place,
      color: body.color || current.color,
      status: body.status || current.status,
    };

    await pool.query(
      `UPDATE appointments SET user_id = ?, specialty = ?, doctor = ?, appointment_date = ?, appointment_time = ?, place = ?, color = ?, status = ? WHERE id = ?`,
      [nextAppointment.userId, nextAppointment.specialty, nextAppointment.doctor, nextAppointment.appointmentDate, nextAppointment.appointmentTime, nextAppointment.place, nextAppointment.color, nextAppointment.status, req.params.id]
    );

    await logAudit(req.user?.sub || null, "appointments.update", "appointments", String(req.params.id), nextAppointment);
    return res.json({ id: Number(req.params.id), ...nextAppointment, fecha: nextAppointment.appointmentDate, hora: nextAppointment.appointmentTime, lugar: nextAppointment.place, estado: nextAppointment.status, especialidad: nextAppointment.specialty });
  } catch (error) {
    return next(error);
  }
}

export async function updateAppointmentStatus(req, res, next) {
  try {
    const pool = getMySqlPool();
    const status = z.enum(["proxima", "completada", "cancelada"]).parse(req.body.status);
    const [result] = await pool.query("UPDATE appointments SET status = ? WHERE id = ?", [status, req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Not Found", message: "Cita no encontrada" });
    }

    await logAudit(req.user?.sub || null, "appointments.status", "appointments", String(req.params.id), { status });
    return res.json({ id: Number(req.params.id), estado: status });
  } catch (error) {
    return next(error);
  }
}

export async function deleteAppointment(req, res, next) {
  try {
    const pool = getMySqlPool();
    const [result] = await pool.query("DELETE FROM appointments WHERE id = ?", [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Not Found", message: "Cita no encontrada" });
    }

    await logAudit(req.user?.sub || null, "appointments.delete", "appointments", String(req.params.id), {});
    return res.json({ deleted: true, id: Number(req.params.id) });
  } catch (error) {
    return next(error);
  }
}