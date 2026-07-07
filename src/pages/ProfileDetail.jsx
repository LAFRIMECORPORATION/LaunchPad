// ============================================================
// LAUNCHPAD — Profile Detail Page (Dynamic User Profile)
// Chemin : src/pages/ProfileDetail.jsx
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Avatar, Badge } from "../components/UI";
import { usersApi, messagesApi } from "../utils/api";
import {
  getSocket,
  joinConversation,
  leaveConversation,
} from "../utils/socket";
import "./OtherPages.css";

export default function ProfileDetail() {
  const { userId } = useParams();
  const { navigate, currentUser } = useApp();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Messages
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // ── Charger le profil de l'utilisateur ──────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await usersApi.getById(userId);
        const loadedUser = res.data?.user || res.data;
        setUser({
          ...loadedUser,
          profile: loadedUser?.profile || {},
          interests: Array.isArray(loadedUser?.interests)
            ? loadedUser.interests
            : Array.isArray(loadedUser?.profile?.interests)
              ? loadedUser.profile.interests
              : [],
        });
        setError(null);
      } catch (err) {
        console.error("Erreur chargement profil :", err);
        setError(err.message || "Impossible de charger le profil");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId]);

  // ── Créer ou récupérer la conversation ──────────────────
  const startConversation = async () => {
    try {
      const res = await messagesApi.createDirect(userId);
      const conv = res.data?.conversation || res.data;
      setConversation(conv);
      setChatOpen(true);

      // Rejoindre la conversation via socket avant chargement
      joinConversation(conv.id);

      // Charger les messages existants
      await loadMessages(conv.id);
    } catch (err) {
      console.error("Erreur création conversation :", err);
      alert("Erreur lors du démarrage de la conversation");
    }
  };

  // ── Charger les messages ────────────────────────────────
  const loadMessages = async (convId) => {
    try {
      const res = await messagesApi.getMessages(convId, { page: 1, limit: 50 });
      const loadedMessages = res.data?.data || res.data || [];
      setMessages(Array.isArray(loadedMessages) ? loadedMessages : []);

      // Marquer comme lu
      await messagesApi.markRead?.(convId).catch(() => {});

      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      console.error("Erreur chargement messages :", err);
    }
  };

  // ── Écouter les nouveaux messages via Socket.io ─────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !conversation?.id) return;

    const handleNewMessage = ({ message, conversationId }) => {
      if (conversationId === conversation.id) {
        setMessages((prev) => [...prev, message]);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [conversation?.id]);

  // ── Envoyer un message ──────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversation?.id || sendingMessage) return;

    try {
      setSendingMessage(true);
      const res = await messagesApi.sendMessage(conversation.id, input.trim());
      const sentMessage = res.data?.message || res.data;
      setMessages((prev) => [...prev, sentMessage]);
      setInput("");
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    } catch (err) {
      console.error("Erreur envoi message :", err);
      alert("Erreur lors de l'envoi du message");
    } finally {
      setSendingMessage(false);
    }
  };

  // ── Nettoyer la conversation à la déconnexion ──────────
  useEffect(() => {
    return () => {
      if (conversation?.id) {
        leaveConversation(conversation.id);
      }
    };
  }, [conversation?.id]);

  // ── Contenu du profil ──────────────────────────────────
  if (loading) {
    return (
      <div
        className="animate-fadeUp"
        style={{ textAlign: "center", padding: 40 }}
      >
        <p style={{ color: "var(--text-secondary)" }}>
          Chargement du profil...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="animate-fadeUp"
        style={{ textAlign: "center", padding: 40 }}
      >
        <p style={{ color: "var(--error)" }}>❌ {error}</p>
        <button
          className="btn btn-secondary"
          onClick={() => navigate("home")}
          style={{ marginTop: 20 }}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="animate-fadeUp"
        style={{ textAlign: "center", padding: 40 }}
      >
        <p style={{ color: "var(--text-secondary)" }}>Profil non trouvé</p>
      </div>
    );
  }

  const profile = user.profile || {};
  const interests = user.interests || profile.interests || [];
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="animate-fadeUp">
      {/* ─── En-tête du profil ─────────────────────────────── */}
      <div style={{ position: "relative", marginBottom: 60 }}>
        <div
          className="profile-cover"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,197,94,.12), rgba(91,115,245,.10))",
          }}
        />
        <div className="profile-avatar-wrap">
          <Avatar
            label={user.avatarUrl || user.avatar || user.firstName?.[0] || "U"}
            size="2xl"
            ring
            style={{ background: "linear-gradient(135deg, #22C55E, #5B73F5)" }}
          />
        </div>

        <div className="profile-header-bar" style={{ paddingLeft: 160 }}>
          <div>
            <div className="profile-name">
              {`${user.firstName || "Utilisateur"} ${user.lastName || ""}`.trim()}
            </div>
            <div className="profile-sub">
              {user.role === "investor" ? "Investisseur" : "Entrepreneur"} ·{" "}
              {profile.location || "Non spécifié"}
            </div>
            <div style={{ marginTop: 10 }}>
              {user.kycValidated ? (
                <span className="kyc-badge kyc-badge--verified">
                  ✅ Compte vérifié
                </span>
              ) : user.kycStatus === "submitted" ? (
                <span className="kyc-badge kyc-badge--submitted">
                  ⏳ Vérification en cours
                </span>
              ) : (
                <span className="kyc-badge kyc-badge--pending">
                  ⚠️ Compte non vérifié
                </span>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <button
              className="btn btn-primary"
              onClick={startConversation}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              💬 Écrire un message
            </button>
          )}
        </div>
      </div>

      {/* ─── Section principale ────────────────────────────── */}
      <div className="two-col">
        <div
          className="two-col-main"
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* À propos */}
          <div className="card" style={{ padding: 22 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>
              À propos
            </div>
            <p className="profile-about-text">
              {user.bio || profile.bio || "Aucune description disponible."}
            </p>
            {interests.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                {interests.map((interest) => (
                  <Badge key={interest} color="green">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* ─── Section messages ──────────────────────────── */}
          {chatOpen && conversation && (
            <div
              className="card"
              style={{
                padding: 20,
                minHeight: 300,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div className="section-title">
                  Conversation avec {user.firstName}
                </div>
                <button
                  className="btn btn-text"
                  onClick={() => setChatOpen(false)}
                  style={{ padding: "4px 8px", fontSize: "14px" }}
                >
                  ✕
                </button>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginBottom: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "var(--text-secondary)",
                      margin: "auto",
                    }}
                  >
                    Aucun message pour le moment. Démarrez la conversation !
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isOwn = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id || idx}
                        style={{
                          display: "flex",
                          justifyContent: isOwn ? "flex-end" : "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            padding: "10px 14px",
                            borderRadius: 12,
                            background: isOwn
                              ? "var(--primary)"
                              : "var(--bg-secondary)",
                            color: isOwn ? "white" : "var(--text)",
                            wordBreak: "break-word",
                            fontSize: "14px",
                            lineHeight: 1.4,
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulaire d'envoi */}
              <form
                onSubmit={handleSendMessage}
                style={{ display: "flex", gap: 8 }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Votre message..."
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    fontSize: "14px",
                  }}
                  disabled={sendingMessage}
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !input.trim()}
                  className="btn btn-primary"
                  style={{ padding: "10px 16px" }}
                >
                  {sendingMessage ? "..." : "Envoyer"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ─── Barre latérale ────────────────────────────── */}
        <div className="two-col-side">
          {/* Critères (investisseurs) */}
          {user.role === "investor" && (
            <div className="card" style={{ padding: 20 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>
                Critères d'investissement
              </div>
              {[
                [
                  "💰",
                  "Ticket minimum",
                  profile.minTicket || user.criteria?.minTicket,
                ],
                [
                  "📈",
                  "Ticket maximum",
                  profile.maxTicket || user.criteria?.maxTicket,
                ],
                ["📊", "Stade minimum", profile.stage || user.criteria?.stage],
                [
                  "🌍",
                  "Zone géographique",
                  profile.region || user.criteria?.region,
                ],
              ].map(([icon, label, value]) => (
                <div key={label} className="profile-info-row">
                  <span>{icon}</span>
                  <span className="profile-info-key">{label}</span>
                  <span className="profile-info-value">
                    {value || "Non spécifié"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Informations générales */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>
              Informations
            </div>
            {[
              [
                "📅",
                "Membre depuis",
                user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("fr-FR")
                  : "Non spécifié",
              ],
              [
                "🏢",
                "Société",
                profile.company || user.company || "Non spécifié",
              ],
              [
                "📍",
                "Localisation",
                profile.location || user.location || "Non spécifié",
              ],
            ].map(([icon, label, value]) => (
              <div key={label} className="profile-info-row">
                <span>{icon}</span>
                <span className="profile-info-key">{label}</span>
                <span className="profile-info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
