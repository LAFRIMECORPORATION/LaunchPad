import { useApp } from "../context/AppContext";
import { StatCard, AIBadge } from "../components/UI";
import { PROJECTS, SIMILAR_PROJECTS } from "../data/mockData";
import SocialActions from "../components/SocialActions";
import "./Dashboard.css";

export default function DashboardStudent() {
    const { navigate, currentUser, setCollabStep, projects } = useApp();
    const myProjects = projects.filter(p => p.authorId === 1);

    return (
        <div className="animate-fadeUp">
            {/*-- header --*/}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">bonjour,{currentUser?.firstName} 👋 </h1>
                    <p className="page-subtitle">voici l activité de votre espace aujourdhui.</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => navigate("publish")}> ➕ Nouveau projet
                    </button>
                </div>
            </div>
            {/* stats*/}

            <div className="grid-4" style={{ marginBottom: 22 }}>

                <StatCard icon="📦" value="3" label="Projets publiés" color="#5B73F5" bgColor="#EEF2FF" delta="+1 ce mois" />
                <StatCard icon="👁️" value="127" label="Vues totales" color="#22C55E" bgColor="#F0FDF4" delta="+23 cette semaine" />
                <StatCard icon="💰" value="8" label="Intérêts investisseurs" color="#F59E0B" bgColor="#FFFBEB" />
                <StatCard icon="🤝" value="2" label="Demandes de collab." color="#8B5CF6" bgColor="#F3EFFE" />

            </div>

            {/* AI banner */}
            <div className="ai-banner">

                <span className=" ai-banner-icon">🤖</span>
                <div className="ai-banner-text">
                    <div className="ai-banner-title"> Projets similaire detectés <AIBadge />
                    </div>
                    <div className="ai-banner-sub"> Notre IA a trouvé 3 projets similaires a Ecoleliv. voulez-vous explorer des opportunités de collaboration?

                    </div>
                </div>

            </div>
            <button className="btn btn-primry btn-sm" onClick={() => { setCollabStep("found"); navigate("collaboration"); }}>  Explorer →

            </button>
            {/* ── Contenu principal ── */}
            <div className="two-col">
                <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Mes projets */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-header">
                            <span className="section-title">Mes projets</span>
                            <span className="section-link" onClick={() => navigate("explore")}>Voir tout</span>
                        </div>
                        {myProjects.map(p => {
                            const pct = Math.round((p.raised / p.goal) * 100);
                            return (
                                <div key={p.id}>
                                    <div
                                        className="project-row"
                                        onClick={() => navigate("project-detail", { project: p })}
                                    >
                                        <span className="project-row-emoji">{p.emoji}</span>
                                        <div className="project-row-info">
                                            <div className="project-row-title">{p.title}</div>
                                            <div className="project-row-sub">{p.category} · {p.stage}</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--success)" }}>{pct}%</div>
                                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>financé</div>
                                        </div>
                                        <span className="badge badge-green">En cours</span>
                                    </div>

                                    {/* Social actions sous chaque projet */}
                                    <div style={{
                                        padding: "8px 14px",
                                        background: "var(--bg-hover)",
                                        borderRadius: "0 0 var(--r-md) var(--r-md)",
                                        borderLeft: "1px solid var(--border)",
                                        borderRight: "1px solid var(--border)",
                                        borderBottom: "1px solid var(--border)",
                                        marginBottom: 10,
                                        marginTop: -10,
                                    }}>
                                        <SocialActions
                                            project={p}
                                            size="sm"
                                            onCommentClick={() => navigate("project-detail", { project: p })}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Projets similaires IA */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-header">
                            <span className="section-title">Projets similaires <AIBadge /></span>
                            <span className="section-link" onClick={() => navigate("collaboration")}>Voir tout</span>
                        </div>
                        <div className="grid-3">
                            {SIMILAR_PROJECTS.map(sp => (
                                <div key={sp.id} className="similarity-card">
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14 }}>{sp.title}</div>
                                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{sp.category}</div>
                                        </div>
                                        <div className="similarity-pct">{sp.similarity}%</div>
                                    </div>
                                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
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

                {/* ── Sidebar droite ── */}
                <div className="two-col-side">


                    {/* Activité récente */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-header">
                            <span className="section-title">Activité récente</span>
                        </div>
                        <div className="activity-feed">
                            {[
                                { ico: "💼", text: "Marc Leblanc a consulté EcoDeliv", time: "Il y a 2h" },
                                { ico: "🤝", text: "Demande de collaboration de Sophie T.", time: "Il y a 5h" },
                                { ico: "⭐", text: "EcoDeliv mis en vedette sur la plateforme", time: "Hier" },
                                { ico: "💬", text: "Nouveau message de BioFund Capital", time: "Hier 14:30" },
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

                    {/* Actions rapides */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 14 }}>
                            Opportunités
                        </div>

                        {/* Bannière attractive */}
                        <div style={{
                            background: "linear-gradient(135deg, rgba(91,115,245,.07), rgba(139,92,246,.07))",
                            border: "1px solid rgba(91,115,245,.15)",
                            borderRadius: "var(--r-md)",
                            padding: "14px 16px",
                            marginBottom: 12,
                            cursor: "pointer",
                        }}
                            onClick={() => navigate("investor-requests")}
                        >
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                                📋 Offres des investisseurs
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                3 nouvelles offres disponibles
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-full"
                            onClick={() => navigate("investor-requests")}
                        >
                            Voir toutes les offres →
                        </button>
                        <div className="section-title" style={{ marginBottom: 14 }}>Actions rapides</div>
                        <div className="quick-actions">
                            <button className="btn btn-primary btn-full" onClick={() => navigate("publish")}>
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

