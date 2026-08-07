import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { login, me, myStats, register, updateMe } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", authRequired, me);
authRouter.patch("/me", authRequired, updateMe);
authRouter.get("/me/stats", authRequired, myStats);