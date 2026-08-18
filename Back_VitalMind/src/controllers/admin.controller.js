import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";
import {
  emitNotification,
} from "../socket.js";

/*
|--------------------------------------------------------------------------
| DASHBOARD ADMINISTRADOR
|--------------------------------------------------------------------------
*/

export async function getAdminDashboard(req, res, next) {
  try {
    const pool = getMySqlPool();

    const period = req.query.period || "week";

    let group = "";
    let format = "";

    if (period === "day") {
      format = "DATE_FORMAT(created_at,'%H:00')";
      group = "DATE_FORMAT(created_at,'%H:00')";
    }

    if (period === "week") {
      format = "DATE_FORMAT(created_at,'%a')";
      group = "DATE_FORMAT(created_at,'%a')";
    }

    if (period === "month") {
      format = "DATE_FORMAT(created_at,'%d %b')";
      group = "DATE_FORMAT(created_at,'%d %b')";
    }

    if (period === "months") {
      format = "DATE_FORMAT(created_at,'%b')";
      group = "DATE_FORMAT(created_at,'%b')";
    }

    if (!group || !format) {
      format = "DATE_FORMAT(created_at,'%a')";
      group = "DATE_FORMAT(created_at,'%a')";
    }

    const [signups] = await pool.query(`
      SELECT
        ${format} AS label,
        COUNT(*) AS value
      FROM users
      GROUP BY ${group}
      ORDER BY MIN(created_at)
    `);

    const [[users]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
    `);

    const [[activeUsers]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE DATE(last_active_at) = CURDATE()
    `);

    const [[notifications]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM notifications
    `);

    const [[aiQueries]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM audit_logs
      WHERE action LIKE '%IA%'
    `);

    return res.json({
      kpis: {
        users: users.total,
        active: activeUsers.total,
        notifications: notifications.total,
        ai: aiQueries.total,
      },

      signups,

      activity: [],
    });
  } catch (error) {
    console.error(
      "ERROR DASHBOARD:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| USUARIOS
|--------------------------------------------------------------------------
*/

export async function getAdminUsers(req, res, next) {
  try {
    const pool = getMySqlPool();

    const [users] = await pool.query(`
      SELECT
        id,
        full_name AS name,
        email,
        age,
        DATE_FORMAT(created_at,'%d %b %Y') AS joined,

        CASE
          WHEN last_active_at IS NULL
            THEN 'Sin actividad'

          WHEN TIMESTAMPDIFF(
            MINUTE,
            last_active_at,
            NOW()
          ) < 60
            THEN CONCAT(
              TIMESTAMPDIFF(
                MINUTE,
                last_active_at,
                NOW()
              ),
              ' min'
            )

          WHEN TIMESTAMPDIFF(
            HOUR,
            last_active_at,
            NOW()
          ) < 24
            THEN CONCAT(
              TIMESTAMPDIFF(
                HOUR,
                last_active_at,
                NOW()
              ),
              ' h'
            )

          ELSE CONCAT(
            TIMESTAMPDIFF(
              DAY,
              last_active_at,
              NOW()
            ),
            ' días'
          )
        END AS lastActive,

        status,
        registros,
        consultas,
        color

      FROM users

      ORDER BY created_at DESC
    `);

    return res.json(users);
  } catch (error) {
    console.error(
      "ERROR ADMIN USERS:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| ACTUALIZAR ESTADO DE USUARIO
|--------------------------------------------------------------------------
*/

export async function updateUserStatus(req, res, next) {
  try {
    const pool = getMySqlPool();

    const { id } = req.params;
    const { status } = req.body;

    if (
      ![
        "active",
        "inactive",
        "pending",
      ].includes(status)
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Estado inválido",
      });
    }

    await pool.query(
      `
        UPDATE users
        SET
          status = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [
        status,
        id,
      ],
    );

    return res.json({
      message:
        "Estado actualizado correctamente",
    });
  } catch (error) {
    console.error(
      "ERROR UPDATE USER STATUS:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| ELIMINAR USUARIO
|--------------------------------------------------------------------------
*/

export async function deleteUser(req, res, next) {
  try {
    const pool = getMySqlPool();

    const { id } = req.params;

    const [result] = await pool.query(
      `
        DELETE FROM users
        WHERE id = ?
      `,
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      message:
        "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error(
      "ERROR DELETE USER:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| REPORTES ADMIN
|--------------------------------------------------------------------------
*/

export async function getAdminReports(req, res, next) {
  try {
    const pool = getMySqlPool();

    const period = req.query.period || "30";
    const days = Number.parseInt(
      period,
      10,
    );

    /*
    |--------------------------------------------------------------------------
    | Usuarios registrados
    |--------------------------------------------------------------------------
    */

    const [userGrowth] = await pool.query(
      `
        SELECT
          DATE(created_at) AS day,
          COUNT(*) AS value

        FROM users

        WHERE created_at >= DATE_SUB(
          CURDATE(),
          INTERVAL ? DAY
        )

        GROUP BY DATE(created_at)

        ORDER BY day
      `,
      [days],
    );

    /*
    |--------------------------------------------------------------------------
    | Síntomas frecuentes
    |--------------------------------------------------------------------------
    */

    const [symptomsTop] = await pool.query(`
      SELECT

        CASE
          WHEN pain >= 8
            THEN 'Dolor intenso'

          WHEN temperature >= 38
            THEN 'Fiebre'

          WHEN heart_rate >= 100
            THEN 'Frecuencia cardíaca alta'

          WHEN glucose >= 140
            THEN 'Glucosa elevada'

          ELSE 'Otros'
        END AS name,

        COUNT(*) AS count

      FROM symptom_logs

      GROUP BY name

      ORDER BY count DESC

      LIMIT 5
    `);

    /*
    |--------------------------------------------------------------------------
    | Distribución de edad
    |--------------------------------------------------------------------------
    */

    const [ageDistribution] = await pool.query(`
      SELECT

        CASE
          WHEN age BETWEEN 18 AND 24
            THEN '18-24'

          WHEN age BETWEEN 25 AND 34
            THEN '25-34'

          WHEN age BETWEEN 35 AND 44
            THEN '35-44'

          WHEN age BETWEEN 45 AND 54
            THEN '45-54'

          ELSE '55+'
        END AS name,

        COUNT(*) AS value

      FROM users

      GROUP BY name
    `);

    /*
    |--------------------------------------------------------------------------
    | Uso de IA
    |--------------------------------------------------------------------------
    */

    const [aiUsage] = await pool.query(`
      SELECT
        DATE(created_at) AS day,
        COUNT(*) AS value

      FROM audit_logs

      WHERE action LIKE '%IA%'

      GROUP BY DATE(created_at)

      ORDER BY day
    `);

    /*
    |--------------------------------------------------------------------------
    | Métricas generales
    |--------------------------------------------------------------------------
    */

    const [[users]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
    `);

    const [[active]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE last_active_at >= DATE_SUB(
        NOW(),
        INTERVAL 30 DAY
      )
    `);

    const [[symptoms]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM symptom_logs
    `);

    const [[ia]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM audit_logs
      WHERE action LIKE '%IA%'
    `);

    return res.json({
      summaryMetrics: [
        {
          label: "Usuarios totales",
          value: users.total,
          change: "+12%",
          icon: "Users",
          color: "#0F766E",
        },

        {
          label: "Activos / mes",
          value: active.total,
          change: "+8%",
          icon: "Activity",
          color: "#22C55E",
        },

        {
          label: "Sesiones IA",
          value: ia.total,
          change: "+23%",
          icon: "Brain",
          color: "#8B5CF6",
        },

        {
          label: "Registros síntomas",
          value: symptoms.total,
          change: "+9%",
          icon: "Activity",
          color: "#2563EB",
        },
      ],

      userGrowth,
      symptomsTop,
      ageDistribution,
      aiUsage,
    });
  } catch (error) {
    console.error(
      "ERROR ADMIN REPORTS:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| CREAR / ENVIAR NOTIFICACIÓN
|--------------------------------------------------------------------------
|
| target:
|
| all      -> todos los pacientes
| active   -> pacientes activos
| inactive -> pacientes inactivos
| specific -> paciente específico
|
| Se crea una fila por destinatario.
|--------------------------------------------------------------------------
*/

export async function createNotification(req, res, next) {
  try {
    const pool = getMySqlPool();

    const {
      title,
      body,
      kind,
      target,
      user_id,
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Título y mensaje son obligatorios",
      });
    }

    const notificationKind =
      kind || "tip";

    let users = [];

    /*
    |--------------------------------------------------------------------------
    | TODOS LOS PACIENTES
    |--------------------------------------------------------------------------
    */

    if (target === "all") {
      const [rows] = await pool.query(`
        SELECT id
        FROM users
        WHERE role = 'patient'
      `);

      users = rows;
    }

    /*
    |--------------------------------------------------------------------------
    | PACIENTES ACTIVOS
    |--------------------------------------------------------------------------
    */

    else if (target === "active") {
      const [rows] = await pool.query(`
        SELECT id
        FROM users
        WHERE role = 'patient'
          AND last_active_at >= DATE_SUB(
            NOW(),
            INTERVAL 30 DAY
          )
      `);

      users = rows;
    }

    /*
    |--------------------------------------------------------------------------
    | PACIENTES INACTIVOS
    |--------------------------------------------------------------------------
    */

    else if (target === "inactive") {
      const [rows] = await pool.query(`
        SELECT id
        FROM users
        WHERE role = 'patient'
          AND (
            last_active_at IS NULL
            OR last_active_at < DATE_SUB(
              NOW(),
              INTERVAL 30 DAY
            )
          )
      `);

      users = rows;
    }

    /*
    |--------------------------------------------------------------------------
    | PACIENTE ESPECÍFICO
    |--------------------------------------------------------------------------
    */

    else if (target === "specific") {
      if (!user_id) {
        return res.status(400).json({
          error: "Bad Request",
          message:
            "Usuario requerido",
        });
      }

      const [rows] = await pool.query(
        `
          SELECT id
          FROM users
          WHERE id = ?
            AND role = 'patient'
          LIMIT 1
        `,
        [user_id],
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message:
            "Usuario paciente no encontrado",
        });
      }

      users = rows;
    }

    /*
    |--------------------------------------------------------------------------
    | DESTINO INVÁLIDO
    |--------------------------------------------------------------------------
    */

    else {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Destino de notificación inválido",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SIN DESTINATARIOS
    |--------------------------------------------------------------------------
    */

    if (users.length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "No hay usuarios disponibles para enviar la notificación",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | QUITAR DESTINATARIOS DUPLICADOS
    |--------------------------------------------------------------------------
    */

    const uniqueUserIds =
      Array.from(
        new Set(
          users.map(
            (user) =>
              Number(user.id),
          ),
        ),
      );

    /*
    |--------------------------------------------------------------------------
    | CREAR UNA NOTIFICACIÓN POR USUARIO
    |--------------------------------------------------------------------------
    */

    const values =
      uniqueUserIds.map(
        (userId) => [
          userId,
          notificationKind,
          String(title),
          String(body),
          "Ahora",
        ],
      );

    await pool.query(
      `
        INSERT INTO notifications (
          user_id,
          kind,
          title,
          body,
          time_label
        )
        VALUES ?
      `,
      [values],
    );

    /*
    |--------------------------------------------------------------------------
    | SOCKET.IO
    |--------------------------------------------------------------------------
    |
    | La notificación se emite individualmente a cada usuario.
    | Esto mantiene aislados los destinatarios:
    |
    | user:2  -> María
    | user:7  -> otro usuario
    | user:10 -> Yazmin
    |
    | El registro ya quedó guardado en MySQL; Socket.IO
    | solamente entrega el evento en tiempo real.
    |--------------------------------------------------------------------------
    */

    for (const userId of uniqueUserIds) {
      emitNotification(
        userId,
        {
          userId,
          kind: notificationKind,
          title: String(title),
          body: String(body),
          time: "Ahora",
          read: false,
        },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | AUDITORÍA
    |--------------------------------------------------------------------------
    |
    | IMPORTANTE:
    | No hacemos INSERT directo a audit_logs porque esa tabla
    | no tiene la columna user_id en tu BD.
    |--------------------------------------------------------------------------
    */

    await logAudit(
      req.user?.sub || null,
      "notifications.broadcast",
      "notifications",
      null,
      {
        target,
        recipients:
          uniqueUserIds.length,
        title,
      },
    );

    return res.json({
      success: true,

      message:
        "Notificación enviada correctamente",

      sent:
        uniqueUserIds.length,
    });
  } catch (error) {
    console.error(
      "ERROR CREATE ADMIN NOTIFICATION:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| HISTORIAL DE NOTIFICACIONES ENVIADAS DESDE ADMIN
|--------------------------------------------------------------------------
*/

export async function getNotificationsHistory(
  req,
  res,
  next,
) {
  try {
    const pool = getMySqlPool();

    const [history] =
      await pool.query(`
        SELECT

          MIN(n.id) AS id,

          n.title,

          n.body,

          n.kind,

          n.time_label,

          CASE

            WHEN COUNT(
              DISTINCT n.user_id
            ) > 1

              THEN CONCAT(
                'Usuarios (',
                COUNT(
                  DISTINCT n.user_id
                ),
                ')'
              )

            ELSE COALESCE(
              MAX(
                u.full_name
              ),
              'Usuario'
            )

          END AS target,

          COUNT(
            DISTINCT n.user_id
          ) AS recipientCount,

          DATE_FORMAT(
            MAX(n.created_at),
            '%d %b %Y %H:%i'
          ) AS sent

        FROM notifications n

        LEFT JOIN users u
          ON n.user_id = u.id

        GROUP BY
          n.title,
          n.body,
          n.kind,
          n.time_label,
          DATE_FORMAT(
            n.created_at,
            '%Y-%m-%d %H:%i'
          )

        ORDER BY
          MAX(n.created_at) DESC

        LIMIT 20
      `);

    return res.json(history);
  } catch (error) {
    console.error(
      "ERROR NOTIFICATIONS HISTORY:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| ESTADÍSTICAS DE NOTIFICACIONES
|--------------------------------------------------------------------------
*/

export async function getNotificationStats(
  req,
  res,
  next,
) {
  try {
    const pool = getMySqlPool();

    const [[all]] =
      await pool.query(`
        SELECT COUNT(*) AS total
        FROM users
        WHERE role = 'patient'
      `);

    const [[active]] =
      await pool.query(`
        SELECT COUNT(*) AS total
        FROM users
        WHERE role = 'patient'
          AND last_active_at >= DATE_SUB(
            NOW(),
            INTERVAL 30 DAY
          )
      `);

    const [[inactive]] =
      await pool.query(`
        SELECT COUNT(*) AS total
        FROM users
        WHERE role = 'patient'
          AND (
            last_active_at < DATE_SUB(
              NOW(),
              INTERVAL 30 DAY
            )
            OR last_active_at IS NULL
          )
      `);

    return res.json({
      all: all.total,
      active: active.total,
      inactive: inactive.total,
    });
  } catch (error) {
    console.error(
      "ERROR NOTIFICATION STATS:",
      error,
    );

    return next(error);
  }
}