import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/errorHandler.js";

import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { usersRouter } from "./routes/users.routes.js";
import { medicationsRouter } from "./routes/medications.routes.js";
import { medicalHistoryRouter } from "./routes/medicalHistory.routes.js";
import { appointmentsRouter } from "./routes/appointments.routes.js";
import { notificationsRouter } from "./routes/notifications.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { reportsRouter } from "./routes/reports.routes.js";
import { habitsRouter } from "./routes/habits.routes.js";
import { metricsRouter } from "./routes/metrics.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import symptomLogRoutes from "./routes/symptomLog.routes.js";
import { emotionalLogsRouter } from "./routes/emotionalLogs.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { recommendationsRouter } from "./routes/recommendations.routes.js";

export const app = express();

/*
|--------------------------------------------------------------------------
| Seguridad y configuración
|--------------------------------------------------------------------------
*/

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin:
      env.CORS_ORIGIN === "*"
        ? true
        : env.CORS_ORIGIN
            .split(",")
            .map((value) => value.trim()),
  }),
);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(
  morgan(
    env.NODE_ENV === "production"
      ? "combined"
      : "dev",
  ),
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 200,
  }),
);

/*
|--------------------------------------------------------------------------
| Ruta raíz
|--------------------------------------------------------------------------
*/

app.get("/", (_req, res) => {
  res.json({
    name: "VitalMind API",
    version: "2.0.0",
    status: "ok",
    docs: "/api",
  });
});

/*
|--------------------------------------------------------------------------
| Rutas API
|--------------------------------------------------------------------------
*/

app.use("/api/health", healthRouter);

app.use("/api/auth", authRouter);

app.use("/api/users", usersRouter);

app.use("/api/medications", medicationsRouter);

app.use(
  "/api/medical-history",
  medicalHistoryRouter,
);

app.use(
  "/api/appointments",
  appointmentsRouter,
);

app.use(
  "/api/notifications",
  notificationsRouter,
);

app.use(
  "/api/dashboard",
  dashboardRouter,
);

app.use(
  "/api/reports",
  reportsRouter,
);

app.use(
  "/api/habits",
  habitsRouter,
);

app.use(
  "/api/metrics",
  metricsRouter,
);

app.use(
  "/api/chat",
  chatRouter,
);

app.use(
  "/api/symptom-logs",
  symptomLogRoutes,
);

app.use(
  "/api/emotional-logs",
  emotionalLogsRouter,
);

/*
|--------------------------------------------------------------------------
| Recomendaciones personalizadas
|--------------------------------------------------------------------------
|
| GET /api/recommendations
|
| Requiere autenticación.
|
*/

app.use(
  "/api/recommendations",
  recommendationsRouter,
);

/*
|--------------------------------------------------------------------------
| Administración
|--------------------------------------------------------------------------
*/

app.use(
  "/api/admin",
  adminRouter,
);

/*
|--------------------------------------------------------------------------
| Manejo de rutas inexistentes
|--------------------------------------------------------------------------
*/

app.use(notFoundHandler);

/*
|--------------------------------------------------------------------------
| Manejo global de errores
|--------------------------------------------------------------------------
*/

app.use(errorHandler);