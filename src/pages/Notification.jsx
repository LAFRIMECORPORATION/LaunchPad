// ============================================================
// LAUNCHPAD — Notifications Page
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { NotificationItem, Tag } from "../components/UI";
import "./OtherPages.css";

const FILTERS = [
    { id: "all", label: "Toutes" },
    { id: "unread", label: "Non lues" },
    { id: "investor", label: "Investisseurs" },
    { id: "collaboration", label: "Collaborations" },
    { id: "system", label: "Système" },
    { id: "ai", label: "IA" },
];

export default function Notifications() {
    const { notifications, markAllRead } = useApp();
    const [filter, setFilter] = useState("all");

    const filtered = notifications.filter(n => {
        if (filter === "all") return true;
        if (filter === "unread") return n.unread;
        return n.type === filter;
    });

    const unreadCount = notifications.filter(n => n.unread).length;

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
                        <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
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

            {/* ── Notifications list ── */}
            <div className="notif-list">
                {filtered.length > 0 ? (
                    filtered.map(n => (
                        <NotificationItem
                            key={n.id}
                            notif={n}
                            onClick={() => { }}
                        />
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

        </div>
    );
}