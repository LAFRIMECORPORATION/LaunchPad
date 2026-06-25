import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { StatCard, AIBadge, KycAlert } from "../components/UI";
import { SIMILAR_PROJECTS } from "../data/mockData";
import { projectsApi } from "../utils/api";
import SocialActions from "../components/SocialActions";
import "./Dashboard.css";

export default function DashboardStudent() {
    const { navigate, currentUser, setCollabStep } = useApp();
    const [myProjects, setMyProjects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Récupération dynamique des projets de l'étudiant connecté via l'API
    useEffect(() => {
        if (currentUser?.id) {
            setLoading(true);
            projectsApi.list({ authorId: currentUser.id })
                .then(res => {
                    const data = res.data?.data || res.data || res;
                    setMyProjects(Array.isArray(data) ? data : []);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [currentUser?.id]);

    const handlePublishClick = () => {
        if (currentUser?.kycValidated) {
            navigate("publish");
        } else {
            navigate("kyc-verification");
        }
    };

    return (
        <div className="animate-fadeUp">
            
            {/* ── HEADER DE LA PAGE ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Bonjour, {currentUser?.firstName || "Étudiant"} 👋</h1>
                    <p className="page-subtitle">Voici l'activité de votre espace aujourd'hui.</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={handlePublishClick}>
                        ➕ Nouveau projet
                    </button>
                </div>
            </div>

            {/* ── ALERTE KYC INTERACTIVE ── */}
            <KycAlert />

            {/* ── GRILLE DE STATISTIQUES ── */}
            <div className="grid-4" style={{ marginBottom: 24, marginTop: 20 }}>
                <StatCard icon="📦" value={myProjects.length.toString()} label="Projets publiés" color="#5B73F5" bgColor="#EEF2FF" delta="+1 ce mois" />
                <StatCard icon="👁️" value="127" label="Vues totales" color="#22C55E" bgColor="#F0FDF4" delta="+23 cette semaine" />
                <StatCard icon="💰" value="8" label="Intérêts investisseurs" color="#F59E0B" bgColor="#FFFBEB" />
                <StatCard icon="🤝" value="2" label="Demandes de collab." color="#8B5CF6" bgColor="#F3EFFE" />
            </div>

            {/* ── ACCÈS RAPIDE V2 ── */}
            <div className="section-title" style={{ marginBottom: 14 }}>
                Accès rapide
            </div>
            <div className="grid-4" style={{ marginBottom: 24 }}>
                {[
                    { icon: "📰", label: "Feed", id: "feed", desc: "Actualités de l'écosystème" },
                    { icon: "🏆", label: "Badges", id: "badges", desc: "Votre score de réputation" },
                    { icon: "📅", label: "Rendez-vous", id: "appointments", desc: "Gérez vos meetings" },
                    { icon: "📚", label: "Academy", id: "academy", desc: "Formez-vous gratuitement" },
                    { icon: "💬", label: "Forum", id: "forum", desc: "Communauté startup Cameroun" },
                    { icon: "🛡️", label: "Vérification", id: "kyc-verification", desc: currentUser?.kycValidated ? "Compte vérifié ✅" : "Vérifiez votre compte" },
                ].map(item => (
                    <div
                        key={item.id}
                        className="card card-hover quick-access-card"
                        onClick={() => navigate(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === "Enter" && navigate(item.id)}
                    >
                        <div className="quick-access-card__icon">{item.icon}</div>
                        <div className="quick-access-card__label">{item.label}</div>
                        <div className="quick-access-card__desc">{item.desc}</div>
                    </div>
                ))}
            </div>

            {/* ── BANNIÈRE IA ── */}
            <div className="ai-banner" style={{ marginBottom: 24 }}>
                <span className="ai-banner-icon">🤖</span>
                <div className="ai-banner-text">
                    <div className="ai-banner-title">
                        Projets similaires détectés <AIBadge />
                    </div>
                    <div className="ai-banner-sub">
                        Notre IA a identifié des opportunités de mutualisation ou de collaboration avec des projets proches du vôtre.
                    </div>
                </div>
                <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => { setCollabStep("found"); navigate("collaboration"); }}
                >
                    Explorer →
                </button>
            </div>

            {/* ── CONTENU DEUX COLONNES ── */}
            <div className="two-col">
                
                {/* 🏠 COLONNE PRINCIPALE (GAUCHE) */}
                <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                    {/* MES PROJETS */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-header">
                            <span className="section-title">Mes projets</span>
                            <span className="section-link" onClick={() => navigate("explore")}>Voir tout</span>
                        </div>
                        
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "20px 0", fontSize: 13, color: "var(--text-muted)" }}>Chargement de vos projets...</div>
                        ) : myProjects.length === 0 ? (
                            <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>
                                Vous n'avez pas encore publié de projet. Utilisez l'accès rapide ou le bouton en haut pour commencer.
                            </p>
                        ) : (
                            myProjects.map(p => {
                                const pct = p.goal ? Math.min(Math.round((p.raised / p.goal) * 100), 100) : 0;
                                return (
                                    <div key={p.id} style={{ marginBottom: 16 }}>
                                        <div
                                            className="project-row"
                                            onClick={() => navigate("project-detail", { project: p })}
                                        >
                                            <span className="project-row-emoji">{p.emoji || "💡"}</span>
                                            <div className="project-row-info">
                                                <div className="project-row-title">{p.title}</div>
                                                <div className="project-row-sub">{p.category} · {p.stage}</div>
                                            </div>
                                            <div style={{ textAlign: "right", marginRight: 12 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--success)" }}>{pct}%</div>
                                                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>financé</div>
                                            </div>
                                            <span className="kyc-badge kyc-badge--verified">{p.status || "En cours"}</span>
                                        </div>

                                        <div style={{
                                            padding: "8px 14px",
                                            background: "var(--bg-hover)",
                                            borderRadius: "0 0 var(--r-md) var(--r-md)",
                                            borderLeft: "1px solid var(--border)",
                                            borderRight: "1px solid var(--border)",
                                            borderBottom: "1px solid var(--border)",
                                            marginTop: -11
                                        }}>
                                            <SocialActions
                                                project={p}
                                                size="sm"
                                                onCommentClick={() => navigate("project-detail", { project: p })}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* SYNERGIES SUGGÉRÉES */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-header">
                            <span className="section-title">Synergies suggérées <AIBadge /></span>
                            <span className="section-link" onClick={() => navigate("collaboration")}>Voir tout</span>
                        </div>
                        <div className="grid-3">
                            {SIMILAR_PROJECTS.map(sp => (
                                <div key={sp.id} className="similarity-card">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>{sp.title}</div>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{sp.category}</div>
                                        </div>
                                        <div className="similarity-pct">{sp.similarity}%</div>
                                    </div>
                                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12, flex: 1 }}>
                                        {sp.desc}
                                    </p>
                                    <button
                                        className="btn btn-secondary btn-sm btn-full"
                                        onClick={() => navigate("collaboration", { target: sp })}
                                    >
                                        Demander collab.
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🗂️ SIDEBAR LATÉRALE (DROITE) */}
                <div className="two-col-side">

                    {/* OPPORTUNITÉS */}
                    <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                        <div className="section-title" style={{ marginBottom: 14 }}>
                            Opportunités
                        </div>
                        <div style={{
                            background: "linear-gradient(135deg, rgba(91,115,245,.05), rgba(139,92,246,.05))",
                            border: "1px solid rgba(91,115,245,.12)",
                            borderRadius: "var(--r-md)",
                            padding: "14px",
                            marginBottom: 14,
                            cursor: "pointer",
                        }}
                            onClick={() => navigate("investor-requests")}
                        >
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: "var(--text-primary)" }}>
                                📋 Offres des investisseurs
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                3 nouvelles offres de thèse/financement correspondent à votre secteur.
                            </div>
                        </div>
                        <button
                            className="btn btn-secondary btn-sm btn-full"
                            onClick={() => navigate("investor-requests")}
                        >
                            Voir toutes les offres →
                        </button>
                    </div>

                    {/* FIL D'ACTIVITÉ */}
                    <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                        <div className="section-header">
                            <span className="section-title">Activité récente</span>
                        </div>
                        <div className="activity-feed">
                            {[
                                { ico: "💼", text: "Marc Leblanc a consulté votre projet", time: "Il y a 2h" },
                                { ico: "🤝", text: "Demande de collaboration de Sophie T.", time: "Il y a 5h" },
                                { ico: "⭐", text: "Votre projet a été mis en vedette", time: "Hier" },
                                { ico: "💬", text: "Nouveau message de BioFund Capital", time: "Hier à 14:30" },
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

                    {/* ACTIONS SUBALTERNES */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 14 }}>Actions rapides</div>
                        <div className="quick-actions" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <button className="btn btn-primary btn-full" onClick={handlePublishClick}>
                                ➕ Publier un projet
                            </button>
                            <button className="btn btn-secondary btn-full" onClick={() => navigate("explore")}>
                                🔍 Explorer les projets
                            </button>
                            <button className="btn btn-ghost btn-full" onClick={() => navigate("messages")}>
                                💬 Mes messages
                            </button>
                            <button className="btn btn-ghost btn-full" onClick={() => navigate("profile-student")}>
                                👤 Mon profil
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}