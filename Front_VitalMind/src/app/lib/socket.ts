import { io } from "socket.io-client";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

export const socket = io(API_URL, {
  autoConnect: false,

  transports: [
    "websocket",
    "polling",
  ],
});

export function connectSocket() {
  const token =
    sessionStorage.getItem(
      "authToken",
    );

  if (!token) {
    console.warn(
      "No hay authToken en sessionStorage para Socket.IO.",
    );

    return;
  }

  socket.auth = {
    token,
  };

  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}