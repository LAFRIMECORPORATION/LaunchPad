// ============================================================
// LAUNCHPAD FRONTEND — src/utils/socket.js
// Client Socket.io pour la messagerie temps réel
// ============================================================

import { io } from "socket.io-client";
import { getAccessToken } from "./api";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth:       { token: getAccessToken() },
    transports: ["websocket","polling"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("⚡ Socket connecté");
  });

  socket.on("disconnect", () => {
    console.log("⚡ Socket déconnecté");
  });

  socket.on("connect_error", (err) => {
    console.error("Socket erreur :", err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

export function getSocket() {
  return socket;
}

export function joinConversation(conversationId) {
  socket?.emit("join_conversation", { conversationId });
}

export function leaveConversation(conversationId) {
  socket?.emit("leave_conversation", { conversationId });
}

export function emitTyping(conversationId) {
  socket?.emit("typing", { conversationId });
}

export function emitStopTyping(conversationId) {
  socket?.emit("stop_typing", { conversationId });
}
