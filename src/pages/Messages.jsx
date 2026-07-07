// ============================================================
// LAUNCHPAD — Messages Page
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { messagesApi } from "../utils/api";
import {
  getSocket,
  joinConversation,
  leaveConversation,
  emitTyping,
  emitStopTyping,
} from "../utils/socket";
import { Avatar, ChatMessage } from "../components/UI";
import "./Messages.css";

export default function Messages() {
  const {
    currentUser,
    pendingConversation,
    setPendingConversation,
    setUnreadMessagesCount,
  } = useApp();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const typingTimer = useRef(null);
  const messagesEndRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const res = await messagesApi.getConversations();
      const loadedConversations = res.data?.conversations || res.data || [];
      setConversations(
        Array.isArray(loadedConversations) ? loadedConversations : [],
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Charger les messages (paginés) ────────────────────
  const loadMessages = useCallback(async (convId, pageNum = 1) => {
    try {
      const res = await messagesApi.getMessages(convId, {
        page: pageNum,
        limit: 30,
      });
      const msgs = Array.isArray(res.data?.data) ? res.data.data : [];

      if (pageNum === 1) {
        setMessages(msgs);
      } else {
        setMessages((prev) => [...msgs, ...prev]);
      }
      if (pageNum === 1) {
        setTimeout(() => messagesEndRef.current?.scrollIntoView(), 50);
      }
    } catch (err) {
      console.error("Erreur chargement messages :", err);
    }
  }, []);

  // ── Ouvrir une conversation ────────────────────────────
  const openConversation = useCallback(
    async (convId) => {
      if (activeConvId) leaveConversation(activeConvId);

      setActiveConvId(convId);
      setMessages([]);

      setChatOpen(true);

      joinConversation(convId);

      await loadMessages(convId, 1);

      await messagesApi.markRead(convId);

      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)),
      );
      setUnreadMessagesCount((count) => {
        const unreadInConversation =
          conversations.find((c) => c.id === convId)?.unread || 0;
        return Math.max(0, count - unreadInConversation);
      });
    },
    [activeConvId, loadMessages],
  );

  // ── Socket.io — écouter les nouveaux messages ─────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = ({ message, conversationId }) => {
      if (conversationId === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        messagesApi
          .markRead(conversationId)
          .then(() => setUnreadMessagesCount((count) => Math.max(0, count - 1)))
          .catch(console.error);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, unread: (c.unread || 0) + 1 } : c,
          ),
        );
      }
      setConversations((prev) =>
        prev
          .map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessage: {
                    content: message.content,
                    isFromMe: false,
                    createdAt: message.createdAt,
                  },
                }
              : c,
          )
          .sort(
            (a, b) =>
              new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0),
          ),
      );
    };

    const handleTyping = ({ userId }) => {
      if (userId !== currentUser.id) setTyping(true);
    };
    const handleStopTyping = ({ userId }) => {
      if (userId !== currentUser.id) setTyping(false);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };
  }, [activeConvId, currentUser.id]);

  // ── Envoyer un message ─────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !activeConvId) return;
    const text = input.trim();
    setInput("");

    const optimisticMsg = {
      id: `temp_${Date.now()}`,
      content: text,
      messageType: "text",
      senderId: currentUser.id,
      sender: {
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
      },
      isRead: false,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    try {
      const res = await messagesApi.sendMessage(activeConvId, text);
      const sentMsg = res.data.message;

      setMessages((prev) => {
        const replaced = prev.map((m) =>
          m._optimistic && m.content === text ? sentMsg : m,
        );
        const unique = [];
        const seen = new Set();
        for (const msg of replaced) {
          if (!msg?.id || !seen.has(msg.id)) {
            if (msg?.id) seen.add(msg.id);
            unique.push(msg);
          }
        }
        return unique;
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                lastMessage: {
                  content: text,
                  isFromMe: true,
                  createdAt: sentMsg.createdAt,
                },
              }
            : c,
        ),
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => !m._optimistic));
      console.error("Erreur envoi message :", err);
    }
  };

  // ── Indicateur de frappe ───────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping(activeConvId);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitStopTyping(activeConvId), 1500);
  };

  // ── Ouvrir une conversation avec un utilisateur ────────
  const openConvWithUser = useCallback(
    async (targetUserId) => {
      const res = await messagesApi.createDirect(targetUserId);
      const conv = res.data.conversation;
      setConversations((prev) =>
        prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev],
      );
      await openConversation(conv.id);
    },
    [openConversation],
  );

  // ── Charger les conversations au montage ───────────────
  useEffect(() => {
    queueMicrotask(() => {
      loadConversations();
    });
  }, [loadConversations]);

  // ── Ouvrir une conversation depuis pendingConversation ──
  useEffect(() => {
    if (pendingConversation?.targetUserId) {
      queueMicrotask(() => {
        openConvWithUser(pendingConversation.targetUserId);
        setPendingConversation(null);
      });
    }
  }, [pendingConversation, openConvWithUser, setPendingConversation]);

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSelectConv(id) {
    openConversation(id);
  }

  useEffect(() => {
    return () => {
      if (activeConvId) {
        leaveConversation(activeConvId);
      }
      clearTimeout(typingTimer.current);
    };
  }, [activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className={`messages-layout${chatOpen ? " chat-open" : ""}`}>
      {/* ── Conversations list ── */}
      <div className="conv-list">
        <div className="conv-list-header">
          <div className="conv-list-title">Messages</div>
          <input
            className="form-input"
            placeholder="🔍 Rechercher…"
            style={{ fontSize: 13, padding: "8px 12px" }}
          />
        </div>

        <div className="conv-list-body">
          {loading ? (
            <div style={{ textAlign: "center", padding: 20 }}>
              Chargement...
            </div>
          ) : conversations.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 20,
                color: "var(--text-muted)",
              }}
            >
              Aucune conversation
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conv-item${activeConvId === conv.id ? " active" : ""}`}
                onClick={() => handleSelectConv(conv.id)}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Avatar
                    label={`${conv.other?.firstName} ${conv.other?.lastName}`}
                    size="md"
                  />
                </div>

                <div className="conv-item-info">
                  <div className="conv-item-header">
                    <span className="conv-item-name">
                      {conv.other?.firstName} {conv.other?.lastName}
                    </span>
                    <span className="conv-item-time">
                      {conv.lastMessage?.createdAt
                        ? new Date(
                            conv.lastMessage.createdAt,
                          ).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <div className="conv-item-preview">
                    {conv.lastMessage?.content || "Nouveau message"}
                  </div>
                </div>

                {conv.unread > 0 && (
                  <div className="notif-badge">{conv.unread}</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Chat area ── */}
      {activeConv ? (
        <div className="chat-area">
          {/* Chat header */}
          <div className="chat-header">
            <button
              className="btn btn-ghost btn-icon"
              style={{ display: chatOpen ? "block" : "none" }}
              onClick={() => setChatOpen(false)}
            >
              ←
            </button>

            <div style={{ position: "relative" }}>
              <Avatar
                label={`${activeConv.other?.firstName} ${activeConv.other?.lastName}`}
                size="md"
              />
            </div>

            <div className="chat-header-meta">
              <div className="chat-header-name">
                {activeConv.other?.firstName} {activeConv.other?.lastName}
              </div>
              <div className="chat-header-status">
                {typing ? "En train d'écrire..." : "Hors ligne"}
              </div>
            </div>

            <div className="chat-header-actions">
              <button
                className="btn btn-secondary btn-sm chat-header-action-btn"
                title="Envoyer un fichier"
              >
                <span aria-hidden="true">📎</span>
                <span className="chat-header-action-label">Fichier</span>
              </button>
              <button
                className="btn btn-secondary btn-sm chat-header-action-btn"
                title="Voir les informations"
              >
                <span aria-hidden="true">ℹ️</span>
                <span className="chat-header-action-label">Info</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            <div className="chat-date-separator">Aujourd'hui</div>
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: 13,
                }}
              >
                Début de la conversation
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={{
                    ...msg,
                    from: msg.senderId === currentUser.id ? "me" : "other",
                    text: msg.content,
                    time: new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    me: msg.senderId === currentUser.id,
                  }}
                  senderLabel={`${activeConv.other?.firstName} ${activeConv.other?.lastName}`}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <button className="btn btn-ghost btn-icon" title="Emoji">
              😊
            </button>
            <button className="btn btn-ghost btn-icon" title="Pièce jointe">
              📎
            </button>
            <textarea
              className="chat-input"
              placeholder="Écrire un message…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="btn btn-primary chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              Envoyer →
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-empty">
          <span className="chat-empty-icon">💬</span>
          <div className="chat-empty-title">Sélectionnez une conversation</div>
          <div className="chat-empty-sub">
            Choisissez une conversation dans la liste pour commencer à échanger.
          </div>
        </div>
      )}
    </div>
  );
}
