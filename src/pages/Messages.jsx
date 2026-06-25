// ============================================================
// LAUNCHPAD — Messages Page
// ============================================================

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, ChatMessage } from "../components/UI";
import "./Messages.css";

export default function Messages() {
    const { conversations, activeConvId, setActiveConvId, sendMessage, teamContact, setTeamContact } = useApp();
    const [draft, setDraft] = useState("");
    const [chatOpen, setChatOpen] = useState(false);

    // Si un contact d'équipe est défini, afficher sa conversation
    const activeConv = teamContact || conversations.find(c => c.id === activeConvId);

    function handleSend() {
        if (!draft.trim()) return;
        if (teamContact) {
            // Contact d'équipe — envoyer le message
            setDraft("");
        } else {
            sendMessage(activeConvId, draft.trim());
            setDraft("");
        }
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    function handleSelectConv(id) {
        setTeamContact(null);
        setActiveConvId(id);
        setChatOpen(true);
    }

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
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            className={`conv-item${activeConvId === conv.id && !teamContact ? " active" : ""}`}
                            onClick={() => handleSelectConv(conv.id)}
                        >
                            {/* Avatar + online dot */}
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <Avatar label={conv.with.avatar} size="md" />
                                {conv.with.online && <div className="online-dot" />}
                            </div>

                            <div className="conv-item-info">
                                <div className="conv-item-header">
                                    <span className="conv-item-name">{conv.with.name}</span>
                                    <span className="conv-item-time">{conv.lastTime}</span>
                                </div>
                                <div className="conv-item-preview">
                                    {conv.messages[conv.messages.length - 1]?.text}
                                </div>
                            </div>

                            {conv.unread > 0 && (
                                <div className="notif-badge">{conv.unread}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Chat area ── */}
            {activeConv ? (
                <div className="chat-area">

                    {/* Chat header */}
                    <div className="chat-header">
                        {/* Back button (mobile) */}
                        <button
                            className="btn btn-ghost btn-icon"
                            style={{ display: "none" }}
                            onClick={() => setChatOpen(false)}
                        >
                            ←
                        </button>

                        <div style={{ position: "relative" }}>
                            <Avatar label={activeConv.avatar || activeConv.with?.avatar} size="md" />
                            {activeConv.with?.online && <div className="online-dot" />}
                        </div>

                        <div>
                            <div className="chat-header-name">{activeConv.name || activeConv.with?.name}</div>
                            <div className={`chat-header-status ${activeConv.with?.online ? "online" : "offline"}`}>
                                {activeConv.with?.online ? "● En ligne" : activeConv.avatar ? "📞 Équipe du projet" : "Hors ligne"}
                            </div>
                        </div>

                        <div className="chat-header-actions">
                            <button className="btn btn-secondary btn-sm">📎 Fichier</button>
                            <button className="btn btn-secondary btn-sm">📞 Appel</button>
                            <button className="btn btn-secondary btn-sm">ℹ️ Info</button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        <div className="chat-date-separator">Aujourd'hui</div>
                        {activeConv.messages ? (
                            activeConv.messages.map(msg => (
                                <ChatMessage
                                    key={msg.id}
                                    message={msg}
                                    senderLabel={activeConv.with?.avatar || activeConv.avatar}
                                />
                            ))
                        ) : (
                            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                                Début de la conversation avec {activeConv.name}
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="chat-input-area">
                        <button className="btn btn-ghost btn-icon" title="Emoji">😊</button>
                        <button className="btn btn-ghost btn-icon" title="Pièce jointe">📎</button>
                        <textarea
                            className="chat-input"
                            placeholder="Écrire un message…"
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        <button
                            className="btn btn-primary chat-send-btn"
                            onClick={handleSend}
                            disabled={!draft.trim()}
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
