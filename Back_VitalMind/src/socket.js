import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./config/env.js";

let io = null;

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin:
        env.CORS_ORIGIN === "*"
          ? true
          : env.CORS_ORIGIN
              .split(",")
              .map((value) => value.trim()),

      credentials: true,
    },

    transports: [
      "websocket",
      "polling",
    ],
  });

  /*
  |--------------------------------------------------------------------------
  | Autenticación del Socket
  |--------------------------------------------------------------------------
  */

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error(
            "No autorizado",
          ),
        );
      }

      const decoded =
        jwt.verify(
          token,
          env.JWT_SECRET,
        );

      socket.user = decoded;

      next();
    } catch (error) {
      console.error(
        "Socket auth error:",
        error,
      );

      next(
        new Error(
          "Token inválido",
        ),
      );
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Conexión
  |--------------------------------------------------------------------------
  */

  io.on(
    "connection",
    (socket) => {
      const userId = Number(
        socket.user?.sub ??
          socket.user?.id,
      );

      if (
        !Number.isInteger(
          userId,
        ) ||
        userId <= 0
      ) {
        socket.disconnect();
        return;
      }

      /*
       * Cada usuario entra a su propia sala.
       *
       * María  → user:2
       * Yazmin → user:10
       */

      socket.join(
        `user:${userId}`,
      );

      console.log(
        `Socket conectado: usuario ${userId}`,
      );

      socket.on(
        "disconnect",
        (reason) => {
          console.log(
            `Socket desconectado: usuario ${userId} (${reason})`,
          );
        },
      );
    },
  );

  return io;
}

/*
|--------------------------------------------------------------------------
| Obtener instancia
|--------------------------------------------------------------------------
*/

export function getIO() {
  if (!io) {
    throw new Error(
      "Socket.IO no ha sido inicializado.",
    );
  }

  return io;
}

/*
|--------------------------------------------------------------------------
| Emitir notificación
|--------------------------------------------------------------------------
*/

export function emitNotification(
  userId,
  notification,
) {
  if (!io) {
    console.warn(
      "Socket.IO no está inicializado.",
    );

    return;
  }

  io.to(
    `user:${Number(userId)}`,
  ).emit(
    "notification:new",
    notification,
  );
}