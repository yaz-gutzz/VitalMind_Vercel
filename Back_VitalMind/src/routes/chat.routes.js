import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";
import { sendChatMessage } from "../controllers/chat.controller.js";

export const chatRouter = Router();

chatRouter.post("/message", authRequired, sendChatMessage);
