// ============================================================
// LAUNCHPAD — Admin Dashboard Page
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { StatCard, Badge } from "../components/UI";
import { ADMIN_DATA } from "../data/mockData";
import "./OtherPages.css";

const TABS = [
    { id: "overview", icon: "📊", label: "Vue d'ensemble" },
    { id: "projects", icon: "📦", label: "Projets" },
    { id: "users", icon: "👥", label: "Utilisateurs" },
    { id: "reports", icon: "🚨", label: "Signalements" },
];

export default function Admin() {
    const { navigate, showToast } = useApp();
    const [tab, setTab] = useState("overview");

    function handleApprove(title) {
        showToast(`"${title}" a été approuvé avec succès., "success"`);
    }
    function handleReject(title) {
        showToast(` "${title}" a été refusé., "error" `);
    }

    return (
        <div className="animate-fadeUp">

            {/* ── Header ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Dashboard Administrateur</h1>
                    <p className="page-subtitle">
                        Supervision et modération de la plateforme Launchpad.
                    </p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate("home")}>
                        ← Quitter admin
                    </button>
                </div>
            </div>

            {/* ── Stats globales ── */}
            <div className="grid-4" style={{ marginBottom: 24 }}>
                <StatCard
                    icon="👥"
                    value={ADMIN_DATA.stats.users.toLocaleString()}
                    label="Utilisateurs inscrits"
                    color="#5B73F5"
                    bgColor="#EEF2FF"
                    delta="+48 cette semaine"
                />
                <StatCard
                    icon="📦"
                    value={ADMIN_DATA.stats.projects}
                    label="Projets publiés"
                    color="#22C55E"
                    bgColor="#F0FDF4"
                    delta="+12 ce mois"
                />
                <StatCard
                    icon="⏳"
                    value={ADMIN_DATA.stats.pending}
                    label="En attente de validation"
                    color="#F59E0B"
                    bgColor="#FFFBEB"
                />
                <StatCard
                    icon="🚨"
                    value={ADMIN_DATA.stats.reports}
                    label="Signalements actifs"
                    color="#EF4444"
                    bgColor="#FEF2F2"
                />
            </div>

            {/* ── Tabs ── */}
            <div className="admin-tabs">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        className={`admin - tab${tab === t.id ? " active" : ""} `}
                        onClick={() => setTab(t.id)}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── Vue d'ensemble ── */}
            {tab === "overview" && (
                <div className="two-col">
                    <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                        {/* File de modération */}
                        <div className="card" style={{ overflow: "hidden" }}>
                            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div className="section-title">File de modération</div>
                                <Badge color="yellow">{ADMIN_DATA.pendingProjects.length} en attente</Badge>
                            </div>
                            {ADMIN_DATA.pendingProjects.map(p => (
                                <div key={p.id} className="pending-row">
                                    <div className="pending-row-info">
                                        <div className="pending-row-title">{p.title}</div>
                                        <div className="pending-row-meta">{p.author} · {p.date}</div>
                                    </div>
                                    <Badge color={p.type === "Nouveau" ? "blue" : "yellow"}>
                                        {p.type}
                                    </Badge>
                                    <div className="pending-row-actions">
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleApprove(p.title)}
                                        >
                                            ✓ Approuver
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleReject(p.title)}
                                        >
                                            ✕ Rejeter
                                        </button>
                                        <button className="btn btn-ghost btn-sm">👁️</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Signalements */}
                        <div className="card" style={{ overflow: "hidden" }}>
                            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div className="section-title">Signalements récents</div>
                                <Badge color="red">
                                    {ADMIN_DATA.reports.filter(r => r.severity === "urgent").length} urgents
                                </Badge>
                            </div>
                            {ADMIN_DATA.reports.map(r => (
                                <div key={r.id} className="report-row">
                                    <div className="report-row-info">
                                        <div className="report-row-title">{r.reason}</div>
                                        <div className="report-row-target">{r.target}</div>
                                    </div>
                                    <span className={`report - severity ${r.severity} `}>
                                        {r.severity === "urgent" ? "🔴 Urgent" : r.severity === "medium" ? "🟡 Moyen" : "🟢 Faible"}
                                    </span>
                                    <button className="btn btn-secondary btn-sm">Examiner</button>
                                </div>
                            ))}
                        </div>

                        {/* Nouveaux utilisateurs */}
                        <div className="card" style={{ overflow: "hidden" }}>
                            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div className="section-title">Nouveaux utilisateurs</div>
                                <button className="btn btn-ghost btn-sm">Voir tout</button>
                            </div>
                            <div className="users-table-header">
                                {["Nom", "Rôle", "Inscription", "Statut"].map(h => (
                                    <span key={h}>{h}</span>
                                ))}
                            </div>
                            {ADMIN_DATA.recentUsers.map(u => (
                                <div key={u.id} className="users-table-row">
                                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                                    <span>
                                        <Badge color="gray">{u.role}</Badge>
                                    </span>
                                    <span style={{ color: "var(--text-secondary)" }}>{u.date}</span>
                                    <span>
                                        <Badge color={u.status === "active" ? "green" : u.status === "pending" ? "yellow" : "red"}>
                                            {u.status === "active" ? "Actif" : u.status === "pending" ? "En vérif." : "Banni"}
                                        </Badge>
                                    </span>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* ── Sidebar ── */}
                    <div className="two-col-side">

                        {/* Actions rapides */}
                        <div className="card" style={{ padding: 20 }}>
                            <div className="section-title" style={{ marginBottom: 14 }}>Actions rapides</div>
                            <div className="admin-quick-actions">
                                {[
                                    ["📢", "Envoyer une annonce"],
                                    ["🔒", "Suspendre un utilisateur"],
                                    ["📊", "Exporter les données"],
                                    ["⚙️", "Paramètres plateforme"],
                                ].map(([ico, label]) => (
                                    <button
                                        key={label}
                                        className="btn btn-secondary btn-sm btn-full"
                                        style={{ justifyContent: "flex-start", gap: 8 }}
                                    >
                                        {ico} {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Résumé stats */}
                        <div className="card" style={{ padding: 20 }}>
                            <div className="section-title" style={{ marginBottom: 14 }}>Résumé plateforme</div>
                            {[
                                ["📈", "Taux de validation", "94%"],
                                ["⏱️", "Délai moy. modération", "2.4h"],
                                ["🌟", "Satisfaction globale", "4.7/5"],
                                ["💰", "Volume financé total", "€2.4M"],
                            ].map(([ico, label, value]) => (
                                <div key={label} className="profile-info-row">
                                    <span>{ico}</span>
                                    <span className="profile-info-key">{label}</span>
                                    <span className="profile-info-value">{value}</span>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            )}

            {/* ── Autres tabs (placeholder) ── */}
            {tab !== "overview" && (
                <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                        Section « {TABS.find(t => t.id === tab)?.label} »
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 20 }}>
                        Cette section est en cours de développement.
                    </div>
                    <button className="btn btn-primary" onClick={() => setTab("overview")}>
                        Retour à la vue d'ensemble
                    </button>
                </div>
            )}

        </div>
    );
}