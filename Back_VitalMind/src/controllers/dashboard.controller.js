import { getMySqlPool } from "../config/databases.js";

export async function dashboardSummary(_req, res, next) {
  try {
    const pool = getMySqlPool();
    const [usersRows] = await pool.query("SELECT COUNT(*) AS total FROM users");
    const [activeRows] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE status = 'active'");
    const [inactiveRows] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE status = 'inactive'");
    const [pendingRows] = await pool.query("SELECT COUNT(*) AS total FROM users WHERE status = 'pending'");
    const [medicationRows] = await pool.query("SELECT COUNT(*) AS total, COALESCE(SUM(taken), 0) AS taken FROM medications");
    const [appointmentRows] = await pool.query("SELECT COUNT(*) AS total FROM appointments");
    const [upcomingRows] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE status = 'proxima'");
    const [completedRows] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE status = 'completada'");
    const [canceledRows] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE status = 'cancelada'");
    const [notificationRows] = await pool.query("SELECT COUNT(*) AS total FROM notifications WHERE is_read = 0");

    const totalMedications = Number(medicationRows[0].total);
    const takenMedications = Number(medicationRows[0].taken);

    return res.json({
      users: { total: Number(usersRows[0].total), active: Number(activeRows[0].total), inactive: Number(inactiveRows[0].total), pending: Number(pendingRows[0].total) },
      medications: { total: totalMedications, taken: takenMedications, pending: totalMedications - takenMedications, adherence: totalMedications ? Math.round((takenMedications / totalMedications) * 100) : 0 },
      appointments: { total: Number(appointmentRows[0].total), upcoming: Number(upcomingRows[0].total), completed: Number(completedRows[0].total), canceled: Number(canceledRows[0].total) },
      notifications: { unread: Number(notificationRows[0].total) },
      wellnessScore: 78,
    });
  } catch (error) {
    return next(error);
  }
}
