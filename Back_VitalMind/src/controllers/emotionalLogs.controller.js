import { getMySqlPool } from "../config/databases.js";


// ================================
// Crear registro emocional
// ================================

export async function createEmotionalLog(req,res,next){

try{

const pool=getMySqlPool();

const userId=req.user.sub;

const [existing] = await pool.query(
`
SELECT id
FROM emotional_logs
WHERE user_id=?
AND log_date=CURDATE()
LIMIT 1
`,
[userId]
);


if(existing.length){

return res.status(409).json({
message:"Ya registraste tu estado emocional de hoy"
});

}

const {
mood,
stress_level,
energy_level,
sleep_quality,
notes
}=req.body;



if(
!mood ||
stress_level === undefined ||
energy_level === undefined ||
sleep_quality === undefined
){

return res.status(400).json({
message:"Datos emocionales incompletos"
});

}



await pool.query(
`
INSERT INTO emotional_logs
(
user_id,
mood,
stress_level,
energy_level,
sleep_quality,
notes,
log_date
)
VALUES
(?,?,?,?,?,?,CURDATE())

`,
[
userId,
mood,
Number(stress_level),
Number(energy_level),
Number(sleep_quality),
notes || null
]

);



res.status(201).json({

message:"Estado emocional guardado correctamente"

});


}catch(error){

console.error("ERROR GUARDANDO EMOCION:", error);

return res.status(500).json({
    message: error.message
});

}


}




// ================================
// Obtener emoción del día
// ================================

export async function getTodayEmotionalLog(req,res,next){

try{


const pool=getMySqlPool();


const [rows]=await pool.query(
`
SELECT
id,
mood,
stress_level,
energy_level,
sleep_quality,
notes,
log_date
FROM emotional_logs
WHERE user_id=?
AND log_date=CURDATE()
LIMIT 1

`,
[
req.user.sub
]

);


res.json(rows[0] || null);



}catch(error){

next(error);

}

}




// ================================
// Historial emocional ML
// ================================


export async function getEmotionalHistory(req,res,next){

try{

const pool=getMySqlPool();


const [rows]=await pool.query(

`
SELECT

id,
mood,
stress_level,
energy_level,
sleep_quality,
log_date,
created_at

FROM emotional_logs

WHERE user_id=?

ORDER BY log_date ASC

`,
[
req.user.sub
]

);


res.json(rows);



}catch(error){

next(error);

}

}