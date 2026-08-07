// ============================================================
// LAUNCHPAD — Notifications Page  ✅ BRANCHÉ SUR L'API RÉELLE
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { NotificationItem, Tag } from "../components/UI";
import { notificationsApi } from "../utils/api";
import "./OtherPages.css";

const FILTERS = [
    { id: "all",          label: "Toutes"         },
    { id: "unread",       label: "Non lues"       },
    { id: "investment",   label: "Investissements"},
    { id: "kyc",          label: "KYC"            },
    { id: "message",      label: "Messages"       },
    { id: "forum",        label: "Forum"          },
    { id: "appointment",  label: "Rendez-vous"    },
    { id: "badge",        label: "Badges"         },
    { id: "system",       label: "Système"        },
];

const NOTIFICATION_CONFIG = {
    system:      { icon: "🔔", label: "Système" },
    kyc:         { icon: "🛡️", label: "KYC" },
    investment:  { icon: "💰", label: "Investissement" },
    message:     { icon: "💬", label: "Message" },
    forum:       { icon: "🗣️", label: "Forum" },
    appointment: { icon: "📅", label: "Rendez-vous" },
    badge:       { icon: "🏅", label: "Badge" },
};

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const minutes = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function Notifications() {
    const { showToast } = useApp();
    const [filter, setFilter] = useState("all");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = useCallback(async (currentFilter) => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                limit: 50,
                ...(currentFilter === "unread" ? { unreadOnly: "true" } : {}),
            };
            const res = await notificationsApi.getAll(params);
            const data = res.data || res;
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount ?? 0);
        } catch (err) {
            showToast(err.message || "Erreur lors du chargement des notifications.", "error");
            setNotifications([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { loadNotifications(filter); }, [filter, loadNotifications]);

    async function handleMarkAllRead() {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        try {
            await notificationsApi.markAllRead();
            showToast("Toutes les notifications marquées comme lues.", "success");
        } catch (err) {
            showToast(err.message || "Erreur lors de la mise à jour.", "error");
            loadNotifications(filter); // resynchroniser
        }
    }

    async function handleNotifClick(notif) {
        // Marquer comme lue localement si pas déjà fait
        if (!notif.isRead) {
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
            setUnreadCount(c => Math.max(0, c - 1));
            notificationsApi.markOneRead(notif.id).catch(() => loadNotifications(filter));
        }
        // Naviguer si actionUrl présent (à adapter selon ton système de routes)
        if (notif.actionUrl) {
            window.location.href = notif.actionUrl;
        }
    }

    // Filtrage côté client pour les catégories non gérées par le backend en query directe
    const filtered = filter === "all" || filter === "unread"
        ? notifications
        : notifications.filter(n => n.type === filter);

    return (
        <div className="animate-fadeUp notif-page">

            {/* ── Header ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">
                        {unreadCount > 0
                            ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                            : "Tout est à jour ✓"}
                    </p>
                </div>
                <div className="page-header-actions">
                    {unreadCount > 0 && (
                        <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
                            ✓ Tout marquer comme lu
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="notif-filters">
                {FILTERS.map(f => (
                    <Tag
                        key={f.id}
                        active={filter === f.id}
                        onClick={() => setFilter(f.id)}
                    >
                        {f.label}
                    </Tag>
                ))}
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner" />
                    <div className="loading-state__title">Chargement…</div>
                </div>
            )}

            {/* ── Notifications list ── */}
            {!loading && (
                <div className="notif-list">
                    {filtered.length > 0 ? (
                        filtered.map(n => (
                            (() => {
                                const config = NOTIFICATION_CONFIG[n.type] || NOTIFICATION_CONFIG.system;
                                return (
                            <NotificationItem
                                key={n.id}
                                notif={{
                                    ...n,
                                    unread: !n.isRead,
                                    icon: config.icon,
                                    category: config.label,
                                    time: timeAgo(n.createdAt),
                                    desc: n.body,
                                }}
                                onClick={() => handleNotifClick(n)}
                            />
                                );
                            })()
                        ))
                    ) : (
                        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
                                Aucune notification
                            </div>
                            <div style={{ fontSize: 14 }}>Tout est calme par ici.</div>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}