import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authRequired(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    const error = new Error("Token requerido");
    error.status = 401;
    next(error);
    return;
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    const error = new Error("Token inválido o expirado");
    error.status = 401;
    next(error);
  }
}