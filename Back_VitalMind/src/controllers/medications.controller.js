import { z } from "zod";
import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";

/*
|--------------------------------------------------------------------------
| Validación
|--------------------------------------------------------------------------
|
| Debe coincidir con la tabla real de MySQL:
|
| medications:
| - id
| - user_id
| - name
| - dose
| - frequency
| - time_label
| - color
| - taken
| - type
| - created_at
| - updated_at
|
*/

const medicationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre del medicamento debe tener al menos 2 caracteres")
    .max(120, "El nombre del medicamento es demasiado largo"),

  dose: z
    .string()
    .trim()
    .min(1, "La dosis es obligatoria")
    .max(80, "La dosis es demasiado larga"),

  frequency: z
    .string()
    .trim()
    .min(1, "La frecuencia es obligatoria")
    .max(80, "La frecuencia es demasiado larga"),

  time_label: z
    .string()
    .trim()
    .min(1, "La hora es obligatoria")
    .max(80, "La hora es demasiado larga"),

  color: z
    .string()
    .trim()
    .max(20)
    .optional(),

  taken: z
    .coerce
    .boolean()
    .optional(),

  type: z
    .enum([
      "pastilla",
      "capsula",
      "jarabe",
      "inyeccion",
    ])
    .optional(),
});

/*
|--------------------------------------------------------------------------
| Utilidad
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
| Listar medicamentos
|--------------------------------------------------------------------------
*/

export async function listMedications(req, res, next) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const {
      search = "",
      taken = "",
    } = req.query;

    const pool = getMySqlPool();

    const clauses = [
      "user_id = ?",
    ];

    const params = [
      userId,
    ];

    if (
      typeof search === "string" &&
      search.trim()
    ) {
      clauses.push(
        "(name LIKE ? OR dose LIKE ? OR frequency LIKE ?)",
      );

      const term = `%${search.trim()}%`;

      params.push(
        term,
        term,
        term,
      );
    }

    if (
      taken === "true" ||
      taken === "false"
    ) {
      clauses.push(
        "taken = ?",
      );

      params.push(
        taken === "true"
          ? 1
          : 0,
      );
    }

    const where = `WHERE ${clauses.join(
      " AND ",
    )}`;

    const [rows] =
      await pool.query(
        `
          SELECT
            id,
            user_id AS userId,
            name,
            dose,
            frequency,
            time_label AS time,
            color,
            taken,
            type,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM medications
          ${where}
          ORDER BY id DESC
        `,
        params,
      );

    return res.json(
      rows.map((item) => ({
        ...item,

        id: Number(item.id),

        userId: Number(
          item.userId,
        ),

        taken: Boolean(
          item.taken,
        ),

        tomado: Boolean(
          item.taken,
        ),
      })),
    );
  } catch (error) {
    console.error(
      "Error listando medicamentos:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Obtener medicamento por ID
|--------------------------------------------------------------------------
*/

export async function getMedicationById(
  req,
  res,
  next,
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const pool = getMySqlPool();

    const [rows] =
      await pool.query(
        `
          SELECT
            id,
            user_id AS userId,
            name,
            dose,
            frequency,
            time_label AS time,
            color,
            taken,
            type,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM medications
          WHERE id = ?
            AND user_id = ?
          LIMIT 1
        `,
        [
          req.params.id,
          userId,
        ],
      );

    if (!rows.length) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "Medicamento no encontrado",
      });
    }

    const medication =
      rows[0];

    return res.json({
      ...medication,

      id: Number(
        medication.id,
      ),

      userId: Number(
        medication.userId,
      ),

      taken: Boolean(
        medication.taken,
      ),

      tomado: Boolean(
        medication.taken,
      ),
    });
  } catch (error) {
    console.error(
      "Error obteniendo medicamento:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Crear medicamento
|--------------------------------------------------------------------------
*/

export async function createMedication(
  req,
  res,
  next,
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const body =
      medicationSchema.parse(
        req.body,
      );

    const pool = getMySqlPool();

    /*
     * El usuario autenticado es siempre
     * el propietario del medicamento.
     */
    const ownerId = userId;

    const [result] =
      await pool.query(
        `
          INSERT INTO medications (
            user_id,
            name,
            dose,
            frequency,
            time_label,
            color,
            taken,
            type
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          ownerId,
          body.name,
          body.dose,
          body.frequency,
          body.time_label,
          body.color ||
            "#0F766E",
          body.taken ? 1 : 0,
          body.type ||
            "pastilla",
        ],
      );

    const medication = {
      id: Number(
        result.insertId,
      ),

      userId: ownerId,

      name: body.name,

      dose: body.dose,

      frequency:
        body.frequency,

      time: body.time_label,

      color:
        body.color ||
        "#0F766E",

      taken: Boolean(
        body.taken,
      ),

      tomado: Boolean(
        body.taken,
      ),

      type:
        body.type ||
        "pastilla",
    };

    await logAudit(
      userId,
      "medications.create",
      "medications",
      String(
        result.insertId,
      ),
      medication,
    );

    return res
      .status(201)
      .json(medication);
  } catch (error) {
    console.error(
      "Error creando medicamento:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Actualizar medicamento
|--------------------------------------------------------------------------
*/

export async function updateMedication(
  req,
  res,
  next,
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const body =
      medicationSchema
        .partial()
        .parse(req.body);

    const pool = getMySqlPool();

    const [rows] =
      await pool.query(
        `
          SELECT *
          FROM medications
          WHERE id = ?
            AND user_id = ?
          LIMIT 1
        `,
        [
          req.params.id,
          userId,
        ],
      );

    if (!rows.length) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "Medicamento no encontrado",
      });
    }

    const current =
      rows[0];

    const nextMedication = {
      name:
        body.name ??
        current.name,

      dose:
        body.dose ??
        current.dose,

      frequency:
        body.frequency ??
        current.frequency,

      time_label:
        body.time_label ??
        current.time_label,

      color:
        body.color ??
        current.color,

      taken:
        typeof body.taken ===
        "boolean"
          ? body.taken
          : Boolean(
              current.taken,
            ),

      type:
        body.type ??
        current.type,
    };

    await pool.query(
      `
        UPDATE medications
        SET
          name = ?,
          dose = ?,
          frequency = ?,
          time_label = ?,
          color = ?,
          taken = ?,
          type = ?
        WHERE id = ?
          AND user_id = ?
      `,
      [
        nextMedication.name,
        nextMedication.dose,
        nextMedication.frequency,
        nextMedication.time_label,
        nextMedication.color,
        nextMedication.taken
          ? 1
          : 0,
        nextMedication.type,
        req.params.id,
        userId,
      ],
    );

    const response = {
      id: Number(
        req.params.id,
      ),

      userId,

      name:
        nextMedication.name,

      dose:
        nextMedication.dose,

      frequency:
        nextMedication.frequency,

      time:
        nextMedication.time_label,

      time_label:
        nextMedication.time_label,

      color:
        nextMedication.color,

      taken:
        Boolean(
          nextMedication.taken,
        ),

      tomado:
        Boolean(
          nextMedication.taken,
        ),

      type:
        nextMedication.type,
    };

    await logAudit(
      userId,
      "medications.update",
      "medications",
      String(
        req.params.id,
      ),
      response,
    );

    return res.json(
      response,
    );
  } catch (error) {
    console.error(
      "Error actualizando medicamento:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Registrar medicamento tomado
|--------------------------------------------------------------------------
*/

export async function registerMedicationTaken(
  req,
  res,
  next,
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const pool = getMySqlPool();

    /*
     * Verificar propietario.
     */
    const [medRows] =
      await pool.query(
        `
          SELECT *
          FROM medications
          WHERE id = ?
            AND user_id = ?
          LIMIT 1
        `,
        [
          req.params.id,
          userId,
        ],
      );

    if (!medRows.length) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "Medicamento no encontrado",
      });
    }

    const medication =
      medRows[0];

    const frequency =
      String(
        medication.frequency ??
          "",
      )
        .trim()
        .toUpperCase();

    /*
     * PRN = según necesidad.
     *
     * No tiene una cantidad diaria
     * obligatoria fija.
     */
    if (frequency === "PRN") {
      const now = new Date();

      await pool.query(
        `
          INSERT INTO medication_logs (
            medication_id,
            user_id,
            taken_date,
            taken_time,
            taken
          )
          VALUES (?, ?, CURDATE(), ?, 1)
        `,
        [
          medication.id,
          userId,
          now
            .toTimeString()
            .slice(
              0,
              8,
            ),
        ],
      );

      /*
       * PRN no se marca automáticamente
       * con una meta diaria fija.
       */
      return res.json({
        message:
          "Toma registrada correctamente",
        taken: true,
      });
    }

    /*
     * Número de tomas requeridas al día.
     */
    const required =
      getDailyFrequency(
        medication.frequency,
      );

    /*
     * Contar tomas reales de HOY.
     *
     * IMPORTANTE:
     * medication_logs usa taken_date,
     * no taken_at.
     */
    const [
      todayLogs,
    ] = await pool.query(
      `
        SELECT
          COUNT(*) AS total
        FROM medication_logs
        WHERE medication_id = ?
          AND user_id = ?
          AND taken_date = CURDATE()
          AND taken = 1
      `,
      [
        medication.id,
        userId,
      ],
    );

    const totalToday =
      Number(
        todayLogs?.[0]?.total ??
          0,
      );

    if (
      totalToday >=
      required
    ) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "Ya completaste las tomas de hoy",
      });
    }

    /*
     * Registrar nueva toma.
     */
    const now = new Date();

    await pool.query(
      `
        INSERT INTO medication_logs (
          medication_id,
          user_id,
          taken_date,
          taken_time,
          taken
        )
        VALUES (?, ?, CURDATE(), ?, 1)
      `,
      [
        medication.id,
        userId,
        now
          .toTimeString()
          .slice(
            0,
            8,
          ),
      ],
    );

    /*
     * Actualizar estado global del medicamento.
     */
    await updateMedicationStatus(
      medication.id,
      userId,
    );

    return res.json({
      message:
        "Toma registrada correctamente",

      taken: true,

      totalToday:
        totalToday + 1,

      required,
    });
  } catch (error) {
    console.error(
      "Error registrando toma:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Eliminar medicamento
|--------------------------------------------------------------------------
*/

export async function deleteMedication(
  req,
  res,
  next,
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const pool = getMySqlPool();

    const [
      existingRows,
    ] = await pool.query(
      `
        SELECT id
        FROM medications
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
      `,
      [
        req.params.id,
        userId,
      ],
    );

    if (!existingRows.length) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "Medicamento no encontrado",
      });
    }

    /*
     * Eliminamos los logs primero.
     *
     * Esto evita problemas de FK
     * si la tabla no tiene CASCADE.
     */
    await pool.query(
      `
        DELETE FROM medication_logs
        WHERE medication_id = ?
          AND user_id = ?
      `,
      [
        req.params.id,
        userId,
      ],
    );

    const [
      result,
    ] = await pool.query(
      `
        DELETE FROM medications
        WHERE id = ?
          AND user_id = ?
      `,
      [
        req.params.id,
        userId,
      ],
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "Medicamento no encontrado",
      });
    }

    await logAudit(
      userId,
      "medications.delete",
      "medications",
      String(
        req.params.id,
      ),
      {},
    );

    return res.json({
      deleted: true,
      id: Number(
        req.params.id,
      ),
    });
  } catch (error) {
    console.error(
      "Error eliminando medicamento:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Historial de medicamento
|--------------------------------------------------------------------------
*/

export async function getMedicationHistory(
  req,
  res,
  next,
) {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message:
          "No se pudo identificar al usuario autenticado.",
      });
    }

    const pool = getMySqlPool();

    /*
     * Verificar propietario.
     */
    const [
      medicationRows,
    ] = await pool.query(
      `
        SELECT id
        FROM medications
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
      `,
      [
        req.params.id,
        userId,
      ],
    );

    if (!medicationRows.length) {
      return res.status(404).json({
        error: "Not Found",
        message:
          "Medicamento no encontrado",
      });
    }

    /*
     * Últimos 7 días.
     *
     * Usamos taken_date porque esa es la
     * columna existente en medication_logs.
     */
    const [
      rows,
    ] = await pool.query(
      `
        SELECT
          DATE_FORMAT(
            days.day,
            '%Y-%m-%d'
          ) AS date,

          COALESCE(
            SUM(
              CASE
                WHEN ml.taken = 1
                THEN 1
                ELSE 0
              END
            ),
            0
          ) AS taken,

          COALESCE(
            SUM(
              CASE
                WHEN ml.taken = 0
                THEN 1
                ELSE 0
              END
            ),
            0
          ) AS missed

        FROM (
          SELECT CURDATE() AS day

          UNION ALL

          SELECT DATE_SUB(
            CURDATE(),
            INTERVAL 1 DAY
          )

          UNION ALL

          SELECT DATE_SUB(
            CURDATE(),
            INTERVAL 2 DAY
          )

          UNION ALL

          SELECT DATE_SUB(
            CURDATE(),
            INTERVAL 3 DAY
          )

          UNION ALL

          SELECT DATE_SUB(
            CURDATE(),
            INTERVAL 4 DAY
          )

          UNION ALL

          SELECT DATE_SUB(
            CURDATE(),
            INTERVAL 5 DAY
          )

          UNION ALL

          SELECT DATE_SUB(
            CURDATE(),
            INTERVAL 6 DAY
          )
        ) days

        LEFT JOIN medication_logs ml
          ON ml.taken_date = days.day
          AND ml.medication_id = ?
          AND ml.user_id = ?

        GROUP BY days.day
        ORDER BY days.day ASC
      `,
      [
        req.params.id,
        userId,
      ],
    );

    return res.json(
      rows.map((row) => ({
        date: row.date,
        taken: Number(
          row.taken ?? 0,
        ),
        missed: Number(
          row.missed ?? 0,
        ),
      })),
    );
  } catch (error) {
    console.error(
      "Error obteniendo historial de medicamento:",
      error,
    );

    return next(error);
  }
}

/*
|--------------------------------------------------------------------------
| Frecuencia diaria
|--------------------------------------------------------------------------
*/

function getDailyFrequency(
  frequency,
) {
  const value = String(
    frequency ?? "",
  )
    .trim()
    .toLowerCase();

  switch (value) {
    case "diario":
    case "cada 24 horas":
      return 1;

    case "cada 12 horas":
      return 2;

    case "cada 8 horas":
      return 3;

    case "cada 6 horas":
      return 4;

    default:
      return 1;
  }
}

/*
|--------------------------------------------------------------------------
| Actualizar estado del medicamento
|--------------------------------------------------------------------------
*/

async function updateMedicationStatus(
  id,
  userId,
) {
  const pool = getMySqlPool();

  const [
    medRows,
  ] = await pool.query(
    `
      SELECT frequency
      FROM medications
      WHERE id = ?
        AND user_id = ?
      LIMIT 1
    `,
    [
      id,
      userId,
    ],
  );

  if (!medRows.length) {
    return;
  }

  const frequency =
    String(
      medRows[0].frequency ??
        "",
    )
      .trim()
      .toUpperCase();

  /*
   * PRN no tiene objetivo diario fijo.
   */
  if (
    frequency === "PRN"
  ) {
    return;
  }

  const required =
    getDailyFrequency(
      medRows[0].frequency,
    );

  /*
   * Contar tomas de hoy.
   *
   * Se usa taken_date, no taken_at.
   */
  const [
    logs,
  ] = await pool.query(
    `
      SELECT
        COUNT(*) AS total
      FROM medication_logs
      WHERE medication_id = ?
        AND user_id = ?
        AND taken_date = CURDATE()
        AND taken = 1
    `,
    [
      id,
      userId,
    ],
  );

  const total =
    Number(
      logs?.[0]?.total ??
        0,
    );

  await pool.query(
    `
      UPDATE medications
      SET taken = ?
      WHERE id = ?
        AND user_id = ?
    `,
    [
      total >= required
        ? 1
        : 0,
      id,
      userId,
    ],
  );
}