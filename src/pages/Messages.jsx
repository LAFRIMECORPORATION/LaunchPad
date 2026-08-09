// ============================================================
// LAUNCHPAD — Messages Page
// ============================================================

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { messagesApi } from "../utils/api";
import {
  getSocket,
  joinConversation,
  leaveConversation,
  emitTyping,
  emitStopTyping,
  emitConversationRead,
  requestPresence,
} from "../utils/socket";
import { Avatar, ChatMessage } from "../components/UI";
import "./Messages.css";

export default function Messages() {
  const {
    currentUser,
    pendingConversation,
    setPendingConversation,
    setUnreadMessagesCount,
    navigate,
  } = useApp();
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [otherUserLastSeen, setOtherUserLastSeen] = useState(null);
  const [showUserList, setShowUserList] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const typingTimer = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const activeOtherUserIdRef = useRef(null);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConvId),
    [conversations, activeConvId],
  );

  const loadConversations = useCallback(async () => {
    try {
      const res = await messagesApi.getConversations();
      const loadedConversations = res?.data?.conversations || res?.data || [];
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
      const msgs = Array.isArray(res?.data) ? res.data : [];

      if (pageNum === 1) {
        setMessages(msgs);
      } else {
        setMessages((prev) => [...msgs, ...prev]);
      }
    } catch (err) {
      console.error("Erreur chargement messages :", err);
    }
  }, []);

  // ── Ouvrir une conversation ────────────────────────────
  const openConversation = useCallback(
    async (convId) => {
      const previousUnread =
        conversations.find((c) => c.id === convId)?.unread || 0;

      if (activeConvId) leaveConversation(activeConvId);

      setActiveConvId(convId);
      setMessages([]);
      setChatOpen(true);
      setTyping(false);
      setShowInfoPanel(false);
      setIsOtherUserOnline(false);
      setOtherUserLastSeen(null);

      requestAnimationFrame(() => {
        const container = chatMessagesRef.current;
        if (container) {
          container.scrollTop = 0;
        }
      });

      joinConversation(convId);

      loadMessages(convId, 1).catch((err) => {
        console.error("Erreur ouverture conversation :", err);
      });

      if (previousUnread > 0) {
        messagesApi
          .markRead(convId)
          .then(() => {
            emitConversationRead(convId);
          })
          .catch(console.error);
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)),
      );
      if (previousUnread > 0) {
        setUnreadMessagesCount((count) => Math.max(0, count - previousUnread));
      }
    },
    [activeConvId, conversations, loadMessages, setUnreadMessagesCount],
  );

  // ── Socket.io — écouter les nouveaux messages ─────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = ({ message, conversationId }) => {
      const isMine = message?.senderId === currentUser.id;

      if (conversationId === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          const withoutMatchingOptimistic = prev.filter(
            (m) =>
              !(
                m._optimistic &&
                m.senderId === message.senderId &&
                m.content === message.content
              ),
          );
          return [...withoutMatchingOptimistic, message];
        });
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        });

        if (!isMine) {
          messagesApi
            .markRead(conversationId)
            .then(() => {
              emitConversationRead(conversationId);
              setUnreadMessagesCount((count) => Math.max(0, count - 1));
            })
            .catch(console.error);
        }
      } else if (!isMine) {
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
                  lastMessageAt: message.createdAt,
                  lastMessage: {
                    content: message.content,
                    isFromMe: isMine,
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
      if (userId !== currentUser.id) {
        setTyping(true);
        setIsOtherUserOnline(true);
      }
    };
    const handleStopTyping = ({ userId }) => {
      if (userId !== currentUser.id) setTyping(false);
    };
    const handleConnect = () => {
      if (activeOtherUserIdRef.current) {
        requestPresence(activeOtherUserIdRef.current);
      }
    };
    const handleDisconnect = () => {
      setIsOtherUserOnline(false);
    };
    const handlePresenceState = ({ userId, online, lastSeen }) => {
      if (userId === activeOtherUserIdRef.current) {
        setIsOtherUserOnline(Boolean(online));
        setOtherUserLastSeen(lastSeen || null);
      }
    };
    const handleUserOnline = ({ userId, online, lastSeen }) => {
      if (userId === activeOtherUserIdRef.current) {
        setIsOtherUserOnline(Boolean(online));
        setOtherUserLastSeen(lastSeen || null);
      }
    };
    const handleMessagesRead = ({ conversationId, userId }) => {
      if (conversationId !== activeConvId || userId === currentUser.id) return;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === currentUser.id ? { ...msg, isRead: true } : msg,
        ),
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("presence_state", handlePresenceState);
    socket.on("user_online", handleUserOnline);
    socket.on("messages_read", handleMessagesRead);
    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("presence_state", handlePresenceState);
      socket.off("user_online", handleUserOnline);
      socket.off("messages_read", handleMessagesRead);
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };
  }, [activeConv, activeConvId, currentUser.id, setUnreadMessagesCount]);

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
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });

    try {
      const res = await messagesApi.sendMessage(activeConvId, text);
      const sentMsg = res?.data?.message;

      if (!sentMsg?.id) {
        throw new Error("Réponse message invalide après envoi.");
      }

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

  // ── Charger la liste des utilisateurs (Admin) ───────────────
  const loadUsersList = useCallback(async () => {
    if (currentUser.role !== "admin") return;
    
    setLoadingUsers(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setUsersList(data.data?.data || data.data || []);
    } catch (err) {
      console.error("Erreur chargement utilisateurs :", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser.role]);

  // ── Ouvrir conversation avec un utilisateur depuis la liste ──
  const handleStartConversation = async (userId) => {
    setShowUserList(false);
    await openConvWithUser(userId);
  };

  // ── Indicateur de frappe ───────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    emitTyping(activeConvId);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitStopTyping(activeConvId), 1500);
  };

  const handleSelectFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
  };

  // ── Ouvrir une conversation avec un utilisateur ────────
  const openConvWithUser = useCallback(
    async (targetUserId) => {
      const res = await messagesApi.createDirect(targetUserId);
      const conv = res?.data?.conversation;

      if (!conv?.id) {
        throw new Error("Conversation invalide.");
      }
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
      return;
    }

    if (pendingConversation?.conversationId) {
      queueMicrotask(() => {
        openConversation(pendingConversation.conversationId);
        setPendingConversation(null);
      });
    }
  }, [
    pendingConversation,
    openConvWithUser,
    openConversation,
    setPendingConversation,
  ]);

  function formatLastSeen(value) {
    if (!value) return "Hors ligne";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Hors ligne";

    return `Vu le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString(
      "fr-FR",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    )}`;
  }

  function openOtherProfile() {
    if (!activeConv?.other?.id) return;
    navigate(`/profile/${activeConv.other.id}`, {
      state: { fromConversationId: activeConv.id },
    });
  }

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
    activeOtherUserIdRef.current = activeConv?.other?.id || null;

    if (activeConv?.other?.id) {
      requestPresence(activeConv.other.id);
    }
  }, [activeConv]);

  useEffect(() => {
    return () => {
      if (activeConvId) {
        leaveConversation(activeConvId);
      }
      clearTimeout(typingTimer.current);
    };
  }, [activeConvId]);

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
          {currentUser.role === "admin" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setShowUserList(true);
                loadUsersList();
              }}
              style={{ marginTop: 8, width: "100%" }}
            >
              � Voir tous les utilisateurs
            </button>
          )}
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
                    label={conv.other?.avatarUrl || `${conv.other?.firstName} ${conv.other?.lastName}`}
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
              className="btn btn-ghost btn-icon chat-back-btn"
              style={{ display: chatOpen ? "block" : "none" }}
              onClick={() => {
                if (activeConvId) {
                  leaveConversation(activeConvId);
                }
                setChatOpen(false);
                setActiveConvId(null);
                setTyping(false);
                setShowInfoPanel(false);
              }}
            >
              ←
            </button>

            <button
              type="button"
              className="chat-profile-link"
              onClick={openOtherProfile}
              title="Voir le profil"
            >
              <div style={{ position: "relative" }}>
                <Avatar
                  label={activeConv.other?.avatarUrl || `${activeConv.other?.firstName} ${activeConv.other?.lastName}`}
                  size="md"
                />
              </div>
            </button>

            <button
              type="button"
              className="chat-header-meta chat-profile-link chat-profile-link--meta"
              onClick={openOtherProfile}
              title="Voir le profil"
            >
              <div className="chat-header-name">
                {activeConv.other?.firstName} {activeConv.other?.lastName}
              </div>
              <div
                className={`chat-header-status ${isOtherUserOnline ? "online" : "offline"}`}
              >
                {typing
                  ? "En train d'écrire..."
                  : isOtherUserOnline
                    ? "En ligne"
                    : formatLastSeen(otherUserLastSeen)}
              </div>
            </button>

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
                onClick={() => setShowInfoPanel((prev) => !prev)}
              >
                <span aria-hidden="true">ℹ️</span>
                <span className="chat-header-action-label">Info</span>
              </button>
            </div>
          </div>

          {showInfoPanel && (
            <div className="chat-info-panel">
              <div className="chat-info-panel__title">Informations</div>
              <div className="chat-info-panel__row">
                <span>Contact</span>
                <strong>
                  {activeConv.other?.firstName} {activeConv.other?.lastName}
                </strong>
              </div>
              <div className="chat-info-panel__row">
                <span>Rôle</span>
                <strong>
                  {activeConv.other?.role === "investor"
                    ? "Investisseur"
                    : activeConv.other?.role === "student"
                      ? "Étudiant"
                      : "Utilisateur"}
                </strong>
              </div>
              <div className="chat-info-panel__row">
                <span>Messages non lus</span>
                <strong>{activeConv.unread || 0}</strong>
              </div>
              {activeConv.lastMessage?.createdAt && (
                <div className="chat-info-panel__row">
                  <span>Dernier message</span>
                  <strong>
                    {new Date(activeConv.lastMessage.createdAt).toLocaleString(
                      "fr-FR",
                    )}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div ref={chatMessagesRef} className="chat-messages">
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
                    isRead: Boolean(msg.isRead),
                    readLabel:
                      msg.senderId === currentUser.id
                        ? msg.isRead
                          ? "Vu"
                          : "Envoyé"
                        : null,
                  }}
                  senderLabel={msg.sender?.avatarUrl || activeConv.other?.avatarUrl || `${activeConv.other?.firstName} ${activeConv.other?.lastName}`}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={handleSelectFile}
            />
            <button
              className="btn btn-ghost btn-icon chat-attach-btn"
              title="Fichier"
              onClick={() => fileInputRef.current?.click()}
            >
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
            {selectedFileName ? (
              <div className="chat-selected-file" title={selectedFileName}>
                📎 {selectedFileName}
              </div>
            ) : null}
            <button
              className="btn btn-primary chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              title="Envoyer"
            >
              ➤
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
      
      {/* ── Modal Liste Utilisateurs (Admin) ── */}
      {showUserList && (
        <div className="modal-overlay" style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div className="card" style={{
            padding: 24,
            maxWidth: 600,
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                👥 Tous les utilisateurs
              </h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowUserList(false)}
              >
                ✕
              </button>
            </div>
            
            {loadingUsers ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                Chargement des utilisateurs...
              </div>
            ) : usersList.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>
                Aucun utilisateur trouvé
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {usersList.map((user) => (
                  <div
                    key={user.id}
                    className="card"
                    style={{
                      padding: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      transition: "var(--tr-fast)"
                    }}
                    onClick={() => handleStartConversation(user.id)}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <Avatar
                      label={user.avatarUrl || `${user.firstName} ${user.lastName}`}
                      size="md"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                        {user.email}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {user.role === "student" ? "🎓 Étudiant" : user.role === "investor" ? "💼 Investisseur" : "👤 Utilisateur"}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartConversation(user.id);
                      }}
                    >
                      💬 Écrire
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
