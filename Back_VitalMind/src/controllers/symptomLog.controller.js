import { getMySqlPool } from "../config/databases.js";

// Crear registro de síntomas
export async function createSymptomLog(req,res,next){
    try{

        const pool = getMySqlPool();


const userId = req.user?.sub || null;

        const {
            pain,
            temperature,
            systolic,
            diastolic,
            glucose,
            weight,
            heartRate,
            mood,
            notes

        } = req.body;



        const [result] = await pool.query(

        `
        INSERT INTO symptom_logs
        (
            user_id,
            pain,
            temperature,
            systolic,
            diastolic,
            glucose,
            weight,
            heart_rate,
            mood,
            notes
        )

        VALUES (?,?,?,?,?,?,?,?,?,?)

        `,


        [
            userId,
            pain ?? 0,
            temperature || null,
            systolic || null,
            diastolic || null,
            glucose || null,
            weight || null,
            heartRate || null,
            mood || null,
            notes || null
        ]

        );



        res.status(201).json({

            message:"Registro guardado correctamente",

            id:result.insertId

        });



    }catch(error){

        next(error);

    }

}



// Obtener registros del usuario



export async function getSymptomLogs(req,res,next){

    try{

        console.log("USUARIO PARA CONSULTAR:", req.user);

        const pool=getMySqlPool();

        const userId=req.user?.sub;

        console.log("ID BUSCADO:", userId);


        const [rows]=await pool.query(
        `
        SELECT *
        FROM symptom_logs
        WHERE user_id=?
        ORDER BY created_at DESC
        `,
        [userId]
        );


        console.log("RESULTADOS:", rows);


        res.json(rows);


    }catch(error){

        next(error);

    }

}

// Obtener un registro por id

export async function getSymptomLogById(req,res,next){
    try{

        const pool=getMySqlPool();


        const [rows]=await pool.query(

        `
        SELECT *
        FROM symptom_logs
        WHERE id=?

        `,

        [req.params.id]

        );



        if(!rows.length){

            return res.status(404).json({
                message:"Registro no encontrado"
            });

        }


        res.json(rows[0]);



    }catch(error){

        next(error);

    }
}

    export async function getSymptomChart(req,res,next){

    try{

        const pool = getMySqlPool();

        const userId = req.user?.sub || null;


        const [rows] = await pool.query(

        `
        SELECT
            DATE(created_at) AS date,
            pain,
            temperature,
            heart_rate,
            glucose,
            systolic,
            diastolic

        FROM symptom_logs

        WHERE user_id=?

        ORDER BY created_at ASC

        LIMIT 30

        `,

        [userId]

        );


        res.json(rows);


    }catch(error){

        next(error);

    }

    }


