import { getMySqlPool } from "../config/databases.js";

export async function reportsSummary(_req, res, next) {
  try {
    const pool = getMySqlPool();
    const [usersRows] = await pool.query("SELECT COUNT(*) AS total FROM users");
    const [recentUsers] = await pool.query("SELECT id, full_name AS name, email, status, role FROM users ORDER BY id DESC LIMIT 5");
    const [recentNotifications] = await pool.query(
      "SELECT id, kind, title, is_read AS `read`, created_at AS createdAt FROM notifications ORDER BY created_at DESC, id DESC LIMIT 5"
    );

    return res.json({
      generatedAt: new Date().toISOString(),
      users: { total: Number(usersRows[0].total), recent: recentUsers },
      notifications: recentNotifications.map((item) => ({ ...item, id: String(item.id), read: Boolean(item.read) })),
    });
  } catch (error) {
    return next(error);
  }
}
