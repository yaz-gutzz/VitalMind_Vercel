import { getMySqlPool } from "../config/databases.js";


export async function getAdminDashboard(req,res,next){

try{

const pool=getMySqlPool();

const period=req.query.period || "week";


let group="";
let format="";


if(period==="day"){

format="DATE_FORMAT(created_at,'%H:00')";
group="DATE_FORMAT(created_at,'%H:00')";

}


if(period==="week"){

format="DATE_FORMAT(created_at,'%a')";
group="DATE_FORMAT(created_at,'%a')";

}


if(period==="month"){

format="DATE_FORMAT(created_at,'%d %b')";
group="DATE_FORMAT(created_at,'%d %b')";

}


if(period==="months"){

format="DATE_FORMAT(created_at,'%b')";
group="DATE_FORMAT(created_at,'%b')";

}



const [signups]=await pool.query(`

SELECT 
${format} AS label,
COUNT(*) AS value

FROM users

GROUP BY ${group}

ORDER BY MIN(created_at)

`);




const [[users]]=await pool.query(`
SELECT COUNT(*) total
FROM users
`);


const [[activeUsers]]=await pool.query(`
SELECT COUNT(*) total
FROM users
WHERE DATE(last_active_at)=CURDATE()
`);


const [[notifications]]=await pool.query(`
SELECT COUNT(*) total
FROM notifications
`);



const [[aiQueries]]=await pool.query(`
SELECT COUNT(*) total
FROM audit_logs
WHERE action LIKE '%IA%'
`);




res.json({

kpis:{
users:users.total,
active:activeUsers.total,
notifications:notifications.total,
ai:aiQueries.total
},

signups,

activity:[]

});


}catch(error){

    console.error("ERROR DASHBOARD:", error);

    next(error);

}

}

export async function getAdminUsers(req,res,next){

try{

const pool=getMySqlPool();


const [users]=await pool.query(`

SELECT
id,
full_name AS name,
email,
age,
DATE_FORMAT(created_at,'%d %b %Y') AS joined,

CASE
WHEN last_active_at IS NULL THEN 'Sin actividad'
WHEN TIMESTAMPDIFF(MINUTE,last_active_at,NOW()) < 60
THEN CONCAT(TIMESTAMPDIFF(MINUTE,last_active_at,NOW()),' min')
WHEN TIMESTAMPDIFF(HOUR,last_active_at,NOW()) < 24
THEN CONCAT(TIMESTAMPDIFF(HOUR,last_active_at,NOW()),' h')
ELSE CONCAT(TIMESTAMPDIFF(DAY,last_active_at,NOW()),' días')
END AS lastActive,

status,
registros,
consultas,
color

FROM users

ORDER BY created_at DESC

`);


res.json(users);


}catch(error){

next(error);

}

}

export async function updateUserStatus(req,res,next){

try{

const pool=getMySqlPool();

const {id}=req.params;
const {status}=req.body;


if(!["active","inactive","pending"].includes(status)){

return res.status(400).json({
message:"Estado inválido"
});

}



await pool.query(
`
UPDATE users
SET status=?,
updated_at=CURRENT_TIMESTAMP
WHERE id=?
`,
[
status,
id
]
);



res.json({

message:"Estado actualizado correctamente"

});


}catch(error){

next(error);

}

}



export async function deleteUser(req,res,next){

try{

const pool=getMySqlPool();

const {id}=req.params;


const [result]=await pool.query(
`
DELETE FROM users
WHERE id=?
`,
[id]
);

if(result.affectedRows===0){

return res.status(404).json({
message:"Usuario no encontrado"
});

}


res.json({
message:"Usuario eliminado correctamente"
});


}catch(error){

console.error(
"ERROR DELETE USER:",
error
);

next(error);

}

}

export async function getAdminReports(req,res,next){

try{

const pool=getMySqlPool();


const period=req.query.period || "30";


let days=parseInt(period);



/*
Usuarios registrados por fecha
*/

const [userGrowth]=await pool.query(`

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
[days]);



/*
Síntomas frecuentes
*/

const [symptomsTop]=await pool.query(`

SELECT

CASE

WHEN pain >= 8 THEN 'Dolor intenso'

WHEN temperature >= 38 THEN 'Fiebre'

WHEN heart_rate >= 100 THEN 'Frecuencia cardíaca alta'

WHEN glucose >= 140 THEN 'Glucosa elevada'

ELSE 'Otros'

END AS name,

COUNT(*) count


FROM symptom_logs


GROUP BY name


ORDER BY count DESC

LIMIT 5

`);




/*
Distribución edad
*/

const [ageDistribution]=await pool.query(`

SELECT

CASE

WHEN age BETWEEN 18 AND 24 THEN '18-24'

WHEN age BETWEEN 25 AND 34 THEN '25-34'

WHEN age BETWEEN 35 AND 44 THEN '35-44'

WHEN age BETWEEN 45 AND 54 THEN '45-54'

ELSE '55+'

END AS name,

COUNT(*) value


FROM users

GROUP BY name


`);





/*
Uso IA por día
*/

const [aiUsage]=await pool.query(`

SELECT

DATE(created_at) day,
COUNT(*) value

FROM audit_logs

WHERE action LIKE '%IA%'

GROUP BY DATE(created_at)

ORDER BY day


`);





/*
Métricas generales
*/

const [[users]]=await pool.query(`
SELECT COUNT(*) total
FROM users
`);



const [[active]]=await pool.query(`
SELECT COUNT(*) total
FROM users
WHERE last_active_at >= DATE_SUB(
NOW(),
INTERVAL 30 DAY
)
`);




const [[symptoms]]=await pool.query(`
SELECT COUNT(*) total
FROM symptom_logs
`);




const [[ia]]=await pool.query(`
SELECT COUNT(*) total
FROM audit_logs
WHERE action LIKE '%IA%'
`);





res.json({

summaryMetrics:[

{
label:"Usuarios totales",
value:users.total,
change:"+12%",
icon:"Users",
color:"#0F766E"
},

{
label:"Activos / mes",
value:active.total,
change:"+8%",
icon:"Activity",
color:"#22C55E"
},

{
label:"Sesiones IA",
value:ia.total,
change:"+23%",
icon:"Brain",
color:"#8B5CF6"
},

{
label:"Registros síntomas",
value:symptoms.total,
change:"+9%",
icon:"Activity",
color:"#2563EB"
}

],


userGrowth,

symptomsTop,

ageDistribution,

aiUsage

});



}catch(error){

console.error(error);
next(error);

}


}


export async function createNotification(req,res,next){

try{

const pool=getMySqlPool();

const {
title,
body,
kind,
target
}=req.body;


if(!title || !body){

return res.status(400).json({
message:"Título y mensaje son obligatorios"
});

}


let users=[];


// TODOS
if(target==="all"){


const [rows]=await pool.query(`
SELECT id
FROM users
`);

users=rows;

}



// ACTIVOS
else if(target==="active"){


const [rows]=await pool.query(`

SELECT id
FROM users
WHERE last_active_at >= DATE_SUB(
NOW(),
INTERVAL 30 DAY
)

`);

users=rows;

}



// INACTIVOS
else if(target==="inactive"){


const [rows]=await pool.query(`

SELECT id
FROM users
WHERE 
last_active_at IS NULL
OR last_active_at < DATE_SUB(
NOW(),
INTERVAL 30 DAY
)

`);

users=rows;

}



// ESPECIFICO
else if(target==="specific"){


const {user_id}=req.body;


if(!user_id){

return res.status(400).json({
message:"Usuario requerido"
});

}


users=[
{
id:user_id
}
];


}



if(users.length===0){

return res.status(400).json({
message:"No hay usuarios disponibles"
});

}



const values=users.map(user=>[

user.id,
kind,
title,
body,
"Ahora"

]);



await pool.query(`

INSERT INTO notifications
(
user_id,
kind,
title,
body,
time_label
)

VALUES ?

`,
[
values
]
);



res.json({

message:"Notificación enviada correctamente",
sent:users.length

});


}catch(error){

console.error(
"ERROR CREATE NOTIFICATION:",
error
);

next(error);

}

}

export async function getNotificationsHistory(req,res,next){

try{

const pool=getMySqlPool();


const [history]=await pool.query(`

SELECT

n.id,
n.title,
n.body,
n.kind,
n.time_label,

CASE

WHEN COUNT(u.id)>1 THEN 'Usuarios'

ELSE COALESCE(MAX(u.full_name),'Usuario')

END AS target,

DATE_FORMAT(
n.created_at,
'%d %b %Y'
) AS sent


FROM notifications n

LEFT JOIN users u
ON n.user_id=u.id


GROUP BY n.id

ORDER BY n.created_at DESC

LIMIT 20


`);



res.json(history);



}catch(error){

next(error);

}

}

export async function getNotificationStats(req,res,next){

try{

const pool=getMySqlPool();


const [[all]]=await pool.query(`
SELECT COUNT(*) total
FROM users
WHERE role='patient'
`);



const [[active]]=await pool.query(`
SELECT COUNT(*) total
FROM users
WHERE last_active_at >= DATE_SUB(
NOW(),
INTERVAL 30 DAY
)
`);



const [[inactive]]=await pool.query(`
SELECT COUNT(*) total
FROM users
WHERE last_active_at < DATE_SUB(
NOW(),
INTERVAL 30 DAY
)
OR last_active_at IS NULL
`);



res.json({

all: all.total,
active: active.total,
inactive: inactive.total

});


}catch(error){

next(error);

}

}