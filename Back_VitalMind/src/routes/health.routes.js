import { Router } from "express";
import { getDatabaseStatus } from "../config/databases.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({ ok: true, service: "vitalmind-api", status: getDatabaseStatus(), timestamp: new Date().toISOString() });
});