// ============================================================
// LAUNCHPAD FRONTEND — src/utils/socket.js
// Client Socket.io pour la messagerie temps réel
// ============================================================

import { io } from "socket.io-client";
import { getAccessToken } from "./api";

const SOCKET_URL =
  (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:5000");

let socket = null;

export function connectSocket() {
  const token = getAccessToken() || localStorage.getItem("launchpad_access_token") || localStorage.getItem("token");
  if (!token) return null;

  if (socket?.connected) return socket;
  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
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

  socket.on("socket_error", (error) => {
    console.error("Socket erreur :", error?.message || error);
  });

  // Événements de présence
  socket.on("user_online", ({ userId }) => {
    console.log("🟢 Utilisateur en ligne:", userId);
    window.dispatchEvent(new CustomEvent("user_online", { detail: { userId } }));
  });

  socket.on("user_offline", ({ userId, lastSeenAt }) => {
    console.log("🔴 Utilisateur hors ligne:", userId, lastSeenAt);
    window.dispatchEvent(new CustomEvent("user_offline", { detail: { userId, lastSeenAt } }));
  });

  socket.on("online_users_list", ({ userIds }) => {
    window.dispatchEvent(new CustomEvent("online_users_list", { detail: { userIds } }));
  });

  socket.on("presence_response", ({ userId, isOnline, lastSeenAt }) => {
    window.dispatchEvent(new CustomEvent("presence_response", { detail: { userId, isOnline, lastSeenAt } }));
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
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

export function requestPresence(userId) {
  socket?.emit("presence_check", { userId });
}
