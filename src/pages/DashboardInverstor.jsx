import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { StatCard, ProjectCard, AIBadge, Badge, KycAlert } from "../components/UI";
import { PROJECTS, USERS } from "../data/mockData";
import SocialActions from "../components/SocialActions";
import { paymentsApi } from "../utils/api";
import "./Dashboard.css";

function fmt(n) {
    return Math.round(Number(n || 0)).toLocaleString("fr-FR");
}

export default function DashboardInvestor() {
    const { navigate, currentUser } = useApp();
    
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        paymentsApi.list()
            .then(res => {
                setInvestments(res.data?.investments || []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur de chargement des investissements :", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="animate-fadeUp">

            {/* ── HEADER DE LA PAGE ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Tableau de bord investisseur</h1>
                    <p className="page-subtitle">Découvrez et pilotez vos opportunités du moment.</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => navigate("explore")}>
                        🔍 Explorer les projets
                    </button>
                </div>
            </div>

            {/* ── ALERTE KYC INTERACTIVE ── */}
            <KycAlert />

            {/* ── GRILLE DE STATISTIQUES (XAF Localized) ── */}
            <div className="grid-4" style={{ marginBottom: 24, marginTop: 20 }}>
                <StatCard icon="⭐" value="12" label="Projets sauvegardés" color="#F59E0B" bgColor="#FFFBEB" />
                <StatCard icon="💬" value="5" label="En discussion" color="#5B73F5" bgColor="#EEF2FF" />
                <StatCard icon="💰" value="69M XAF" label="Investi total" color="#22C55E" bgColor="#F0FDF4" delta="+5M XAF ce mois" />
                <StatCard icon="🆕" value="23" label="Nouveaux projets" color="#8B5CF6" bgColor="#F3EFFE" />
            </div>

            {/* ── ACCÈS RAPIDE V2 AVEC CONTRÔLE KYC 🔐 ── */}
            <div className="section-title" style={{ marginBottom: 14 }}>
                Accès rapide
            </div>
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { icon: "💰", label: "Investir",         id: "payment",          desc: "MTN · Orange · Stripe",        locked: !currentUser?.kycValidated },
                    { icon: "🤖", label: "Due Diligence IA",  id: "due-diligence",    desc: "Analysez les projets",          locked: !currentUser?.kycValidated },
                    { icon: "📅", label: "Rendez-vous",       id: "appointments",     desc: "Planifiez vos meetings",        locked: !currentUser?.kycValidated },
                    { icon: "📰", label: "Feed",              id: "feed",             desc: "Actualités investisseur",       locked: false },
                    { icon: "🏆", label: "Badges",            id: "badges",           desc: "Votre réputation",              locked: false },
                    { icon: "💬", label: "Forum",             id: "forum",            desc: "Communauté startup Cameroun",    locked: false },
                ].map(item => (
                    <div
                        key={item.id}
                        className={`card card-hover quick-access-card${item.locked ? " locked" : ""}`}
                        onClick={() => item.locked ? navigate("kyc-verification") : navigate(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === "Enter" && (item.locked ? navigate("kyc-verification") : navigate(item.id))}
                    >
                        <div className="quick-access-card__icon">
                            {item.icon}
                            {item.locked && <span className="quick-access-card__lock">🔐</span>}
                        </div>
                        <div className="quick-access-card__label">{item.label}</div>
                        <div className="quick-access-card__desc">
                            {item.locked ? "KYC requis" : item.desc}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── DESIGN EN DEUX COLONNES ── */}
            <div className="two-col">

                {/* 🏠 COLONNE PRINCIPALE (GAUCHE) */}
                <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* RECOMMANDATIONS IA */}
                    <div>
                        <div className="section-header" style={{ marginBottom: 14 }}>
                            <span className="section-title">Sélection personnalisée par IA <AIBadge /></span>
                            <span className="section-link" onClick={() => navigate("explore")}>Voir tout</span>
                        </div>
                        <div className="grid-3">
                            {PROJECTS.slice(0, 3).map(p => (
                                <div key={p.id} style={{ display: "flex", flexDirection: "column" }}>
                                    <ProjectCard
                                        project={p}
                                        onClick={() => navigate("project-detail", { project: p })}
                                    />
                                    <div style={{
                                        padding: "10px 14px",
                                        background: "var(--bg-card)",
                                        borderLeft: "1px solid var(--border)",
                                        borderRight: "1px solid var(--border)",
                                        borderBottom: "1px solid var(--border)",
                                        borderRadius: "0 0 var(--r-md) var(--r-md)",
                                        marginTop: -1
                                    }}>
                                        <SocialActions
                                            project={p}
                                            size="sm"
                                            onCommentClick={() => navigate("project-detail", { project: p })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MON PORTFOLIO V2 */}
                    <div className="card" style={{ overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                            <div className="section-title">Mes investissements (Cameroun)</div>
                        </div>
                        {loading ? (
                            <div style={{ padding: 30, textAlign: "center", color: "var(--text-secondary)" }}>
                                Chargement de vos investissements...
                            </div>
                        ) : investments.length === 0 ? (
                            <div style={{ padding: 30, textAlign: "center", color: "var(--text-secondary)" }}>
                                <p style={{ marginBottom: 12 }}>Vous n'avez pas encore d'investissements.</p>
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate("explore")}>
                                    Découvrir les startups
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="portfolio-header">
                                    {["Projet", "Méthode", "Montant", "Date", "Statut"].map(h => (
                                        <span key={h}>{h}</span>
                                    ))}
                                </div>
                                {investments.map((inv) => {
                                    const projTitle = inv.project?.title || "Projet inconnu";
                                    const dateStr = new Date(inv.createdAt).toLocaleDateString("fr-FR");
                                    const formattedAmount = `${fmt(inv.amount)} XAF`;

                                    // Mapping du badge de statut
                                    let statusColor = "gray";
                                    let statusText = inv.status;
                                    if (inv.status === "pending") {
                                        statusColor = "yellow";
                                        statusText = "Attente";
                                    } else if (inv.status === "in_escrow") {
                                        statusColor = "blue";
                                        statusText = "En Escrow";
                                    } else if (inv.status === "released") {
                                        statusColor = "green";
                                        statusText = "Libéré";
                                    } else if (inv.status === "refunded") {
                                        statusColor = "teal";
                                        statusText = "Remboursé";
                                    } else if (inv.status === "failed") {
                                        statusColor = "red";
                                        statusText = "Échoué";
                                    }

                                    return (
                                        <div
                                            key={inv.id}
                                            className="portfolio-row"
                                            onClick={() => inv.project && navigate("project-detail", { project: inv.project })}
                                        >
                                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{projTitle}</span>
                                            <span>
                                                <Badge color="purple">
                                                    {inv.paymentMethod?.toUpperCase()}
                                                </Badge>
                                            </span>
                                            <span style={{ fontWeight: 600 }}>{formattedAmount}</span>
                                            <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                                                {dateStr}
                                            </span>
                                            <Badge color={statusColor}>{statusText}</Badge>
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>

                </div>

                {/* 🗂️ SIDEBAR LATÉRALE (DROITE) */}
                <div className="two-col-side" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* CRITÈRES DE FILTRAGE */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 14 }}>
                            Critères d'investissement
                        </div>
                        {[
                            ["💰", "Ticket minimum", "5M XAF"],
                            ["📈", "Ticket maximum", "75M XAF"],
                            ["📊", "Stade minimum", "MVP / Seed"],
                            ["🌍", "Zone géographique", "Cameroun (CEMAC)"],
                        ].map(([ico, label, val]) => (
                            <div key={label} style={{ display: "flex", gap: 8, padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                                <span>{ico}</span>
                                <span style={{ color: "var(--text-secondary)", flex: 1 }}>{label}</span>
                                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{val}</span>
                            </div>
                        ))}
                    </div>

                    {/* ACTIVITÉ RÉCENTE */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 14 }}>Activité récente</div>
                        <div className="activity-feed">
                            {[
                                { ico: "📊", text: "EcoDeliv a atteint 37% de son objectif", time: "Il y a 2h" },
                                { ico: "🆕", text: "5 nouveaux projets FinTech publiés", time: "Aujourd'hui" },
                                { ico: "💬", text: "Un porteur de projet a répondu à votre message", time: "Hier" },
                            ].map((a, i) => (
                                <div key={i} className="activity-item">
                                    <span className="activity-icon">{a.ico}</span>
                                    <div>
                                        <div className="activity-text">{a.text}</div>
                                        <div className="activity-time">{a.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}