import { Router } from "express";

import {
 createSymptomLog,
 getSymptomLogs,
 getSymptomLogById,
 getSymptomChart

} from "../controllers/symptomLog.controller.js";

import { authRequired } from "../middlewares/auth.js";


const router = Router();

router.post("/",authRequired,createSymptomLog);

router.get("/",authRequired,getSymptomLogs);

router.get("/chart",authRequired,getSymptomChart);

router.get("/:id",authRequired,getSymptomLogById);

export default router;