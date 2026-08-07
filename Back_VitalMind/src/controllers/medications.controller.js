import { z } from "zod";
import { getMySqlPool } from "../config/databases.js";
import { logAudit } from "../services/audit.service.js";

const medicationSchema = z.object({
  userId: z.coerce.number().int().positive().optional().nullable(),
  name: z.string().min(2),
  dose: z.string().min(1),
  frequency: z.string().min(1),
  time_label: z.string().min(1),
  color: z.string().optional(),
  taken: z.coerce.boolean().optional(),
  days_duration:z.coerce.number().int().positive().optional(),
  type: z.enum(["pastilla","capsula","jarabe","inyeccion","tableta","gota","crema","parche",]).optional(),
});

export async function listMedications(req, res, next) {
  try {
    const { search = "", taken = "" } = req.query;
    const pool = getMySqlPool();
    const clauses = [];
    const params = [];

    // Cada usuario solo debe ver SUS propios medicamentos, nunca los de otros
    // usuarios de la base de datos (antes se devolvían todos los registros).
    if (req.user?.role !== "admin") {
      clauses.push("user_id = ?");
      params.push(req.user.sub);
    }

    if (search) {
      clauses.push("(name LIKE ? OR dose LIKE ? OR frequency LIKE ?)");
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (taken === "true" || taken === "false") {
      clauses.push("taken = ?");
      params.push(taken === "true" ? 1 : 0);
    }

    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `SELECT id, user_id AS userId, name, dose, frequency, time_label AS time, color, taken, days_duration, type FROM medications ${where} ORDER BY id DESC`,
      params
    );

    return res.json(rows.map((item) => ({ ...item, tomado: Boolean(item.taken) })));
  } catch (error) {
    return next(error);
  }
}

export async function getMedicationById(req, res, next) {
  try {
    const pool = getMySqlPool();
    const [rows] = await pool.query(
      "SELECT id, user_id AS userId, name, dose, frequency, time_label AS time, color, taken, days_duration, type FROM medications WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    if (!rows.length || (req.user?.role !== "admin" && Number(rows[0].userId) !== Number(req.user.sub))) {
      return res.status(404).json({ error: "Not Found", message: "Medicamento no encontrado" });
    }

    return res.json({ ...rows[0], tomado: Boolean(rows[0].taken) });
  } catch (error) {
    return next(error);
  }
}

export async function createMedication(req, res, next) {
  try {
    const body = medicationSchema.parse(req.body);
    const pool = getMySqlPool();
    const ownerId = body.userId || req.user?.sub || null;
    const [result] = await pool.query(
  `INSERT INTO medications 
  (user_id, name, dose, frequency, time_label, color, taken, days_duration, type)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [ownerId, body.name, body.dose, body.frequency, body.time_label, body.color || "#0F766E", body.taken ? 1 : 0, body.days_duration || 0, body.type || "pastilla"]);

    await logAudit(req.user?.sub || null, "medications.create", "medications", String(result.insertId), body);
    return res.status(201).json({ id: Number(result.insertId), ...body, tomado: Boolean(body.taken) });
  } catch (error) {
    return next(error);
  }
}

export async function updateMedication(req, res, next) {
  try {
    const body = medicationSchema.partial().parse(req.body);
    const pool = getMySqlPool();
    const [rows] = await pool.query("SELECT * FROM medications WHERE id = ? LIMIT 1", [req.params.id]);

    if (!rows.length || (req.user?.role !== "admin" && Number(rows[0].user_id) !== Number(req.user.sub))) {
      return res.status(404).json({ error: "Not Found", message: "Medicamento no encontrado" });
    }

    const current = rows[0];
    const nextMedication = {
      userId: body.userId ?? current.user_id,
      name: body.name || current.name,
      dose: body.dose || current.dose,
      frequency: body.frequency || current.frequency,
      time_label: body.time_label || current.time_label,
      color: body.color || current.color,
      taken: typeof body.taken === "boolean" ? body.taken : Boolean(current.taken),
      days_duration: body.days_duration ?? current.days_duration,
      type: body.type || current.type,
    };

    await pool.query(
      `UPDATE medications SET user_id = ?, name = ?, dose = ?, frequency = ?, time_label = ?, color = ?, taken = ?, days_duration = ?, type = ? WHERE id = ?`,
      [nextMedication.userId, nextMedication.name, nextMedication.dose, nextMedication.frequency, nextMedication.time_label, nextMedication.color, nextMedication.taken ? 1 : 0, nextMedication.days_duration, nextMedication.type, req.params.id]
    );

    await logAudit(req.user?.sub || null, "medications.update", "medications", String(req.params.id), nextMedication);
    return res.json({ id: Number(req.params.id), ...nextMedication, tomado: Boolean(nextMedication.taken) });
  } catch (error) {
    return next(error);
  }
}

export async function registerMedicationTaken(req,res,next){

try{

const pool = getMySqlPool();


const [medRows] = await pool.query(
`
SELECT *
FROM medications
WHERE id=?
`,
[
req.params.id
]
);


if(!medRows.length){

return res.status(404).json({
message:"Medicamento no encontrado"
});

}


const medication = medRows[0];


// Fecha y hora actual
const now = new Date();


// calcular cuántas tomas necesita al día

const required = getDailyFrequency(
medication.frequency
);



// revisar cuántas tomas tiene hoy

const [todayLogs] = await pool.query(
`
SELECT COUNT(*) total
FROM medication_logs
WHERE medication_id=?
AND DATE(taken_at)=CURDATE()
AND taken=1
`,
[
medication.id
]
);



if(todayLogs[0].total >= required){

return res.status(400).json({
message:"Ya completaste las tomas de hoy"
});

}



// registrar nueva toma

await pool.query(
`
INSERT INTO medication_logs
(
 medication_id,
 user_id,
 taken
)
VALUES(?,?,?)
`,
[
 medication.id,
 medication.user_id,
 1
]
);



// actualizar estado del medicamento

await updateMedicationStatus(
medication.id
);



return res.json({
message:"Toma registrada correctamente"
});


}catch(error){

next(error);

}

}

export async function deleteMedication(req, res, next) {
  try {
    const pool = getMySqlPool();
    const [existingRows] = await pool.query("SELECT user_id FROM medications WHERE id = ? LIMIT 1", [req.params.id]);
    if (!existingRows.length || (req.user?.role !== "admin" && Number(existingRows[0].user_id) !== Number(req.user.sub))) {
      return res.status(404).json({ error: "Not Found", message: "Medicamento no encontrado" });
    }

    const [result] = await pool.query("DELETE FROM medications WHERE id = ?", [req.params.id]);

    if (!result.affectedRows) {
      return res.status(404).json({ error: "Not Found", message: "Medicamento no encontrado" });
    }

    await logAudit(req.user?.sub || null, "medications.delete", "medications", String(req.params.id), {});
    return res.json({ deleted: true, id: Number(req.params.id) });
  } catch (error) {
    return next(error);
  }
}

export async function getMedicationHistory(req,res,next){

try{

const pool=getMySqlPool();


const [rows]=await pool.query(`

SELECT

DATE_FORMAT(days.day,'%d') AS date,


COALESCE(
SUM(
CASE
WHEN ml.taken=1 THEN 1
ELSE 0
END
),0
) AS taken,


COALESCE(
SUM(
CASE
WHEN ml.taken=0 THEN 1
ELSE 0
END
),0
) AS missed


FROM
(

SELECT CURDATE() day
UNION ALL SELECT DATE_SUB(CURDATE(),INTERVAL 1 DAY)
UNION ALL SELECT DATE_SUB(CURDATE(),INTERVAL 2 DAY)
UNION ALL SELECT DATE_SUB(CURDATE(),INTERVAL 3 DAY)
UNION ALL SELECT DATE_SUB(CURDATE(),INTERVAL 4 DAY)
UNION ALL SELECT DATE_SUB(CURDATE(),INTERVAL 5 DAY)
UNION ALL SELECT DATE_SUB(CURDATE(),INTERVAL 6 DAY)

) days


LEFT JOIN medication_logs ml

ON DATE(ml.taken_at)=days.day
AND ml.medication_id = ?


GROUP BY days.day

ORDER BY days.day ASC


`,
[
req.params.id
]
);


return res.json(rows);


}catch(error){

next(error);

}

}

function getDailyFrequency(frequency){

switch(frequency){

case "Diario":
case "Cada 24 horas":
return 1;


case "Cada 12 horas":
return 2;


case "Cada 8 horas":
return 3;


case "Cada 6 horas":
return 4;


default:
return 1;

}

}

async function updateMedicationStatus(id){

const pool=getMySqlPool();


const [med]=await pool.query(
`
SELECT frequency
FROM medications
WHERE id=?
`,
[id]
);


if(!med.length)
return;



const required=getDailyFrequency(
med[0].frequency
);



const [logs]=await pool.query(
`
SELECT COUNT(*) total
FROM medication_logs
WHERE medication_id=?
AND DATE(taken_at)=CURDATE()
AND taken=1
`,
[id]
);



await pool.query(
`
UPDATE medications
SET taken=?
WHERE id=?
`,
[
logs[0].total >= required ? 1 : 0,
id
]
);


}