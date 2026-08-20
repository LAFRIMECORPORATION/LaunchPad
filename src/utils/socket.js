// ============================================================
// LAUNCHPAD FRONTEND — src/utils/socket.js
// Client Socket.io pour la messagerie temps réel
// ============================================================

import { io } from "socket.io-client";
import { getAccessToken } from "./api";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000";

let socket = null;
let heartbeatInterval = null;

export function connectSocket() {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token: getAccessToken() },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("⚡ Socket connecté");
    // Démarrer le heartbeat toutes les 30 secondes
    startHeartbeat();
  });

  socket.on("disconnect", () => {
    console.log("⚡ Socket déconnecté");
    stopHeartbeat();
  });

  socket.on("connect_error", (err) => {
    console.error("Socket erreur :", err.message);
  });

  // Événements de présence
  socket.on("user_online", ({ userId }) => {
    console.log("🟢 Utilisateur en ligne:", userId);
    // Émettre un événement personnalisé pour le composant Messages
    window.dispatchEvent(new CustomEvent("user_online", { detail: { userId } }));
  });

  socket.on("user_offline", ({ userId, lastSeenAt }) => {
    console.log("🔴 Utilisateur hors ligne:", userId, lastSeenAt);
    window.dispatchEvent(new CustomEvent("user_offline", { detail: { userId, lastSeenAt } }));
  });

  // Réponse au ping de synchronisation
  socket.on("pong_client", (data) => {
    console.log("⚡ Pong reçu du serveur :", data?.message);
  });

  return socket;
}

function startHeartbeat() {
  if (heartbeatInterval) clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    socket?.emit("heartbeat");
  }, 30000); // Heartbeat toutes les 30 secondes
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

export function disconnectSocket() {
  stopHeartbeat();
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

export function emitConversationRead(conversationId) {
  socket?.emit("conversation_read", { conversationId });
}

export function requestPresence(userId) {
  socket?.emit("presence_check", { userId });
}
