import { Router } from "express";
import { authRequired } from "../middlewares/auth.js";

import {
  sendChatMessage,
  getChatConversation,
  getChatConversations,
  createChatConversation,
  deleteChatConversation,
} from "../controllers/chat.controller.js";

export const chatRouter = Router();

/*
|--------------------------------------------------------------------------
| Listar conversaciones del usuario
|--------------------------------------------------------------------------
*/

chatRouter.get(
  "/conversations",
  authRequired,
  getChatConversations
);

/*
|--------------------------------------------------------------------------
| Crear una nueva conversación
|--------------------------------------------------------------------------
*/

chatRouter.post(
  "/conversations",
  authRequired,
  createChatConversation
);

/*
|--------------------------------------------------------------------------
| Obtener una conversación específica
|--------------------------------------------------------------------------
*/

chatRouter.get(
  "/conversations/:conversationId",
  authRequired,
  getChatConversation
);

/*
|--------------------------------------------------------------------------
| Eliminar una conversación
|--------------------------------------------------------------------------
*/

chatRouter.delete(
  "/conversations/:conversationId",
  authRequired,
  deleteChatConversation
);

/*
|--------------------------------------------------------------------------
| Enviar mensaje
|--------------------------------------------------------------------------
*/

chatRouter.post(
  "/message",
  authRequired,
  sendChatMessage
);