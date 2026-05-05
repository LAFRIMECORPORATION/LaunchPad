// ============================================================
// LAUNCHPAD — Dashboard Investisseur
// ============================================================

import { useApp } from "../context/AppContext";
import { StatCard, ProjectCard, AIBadge, Badge } from "../components/UI";
import { PROJECTS, USERS } from "../data/mockData";
import SocialActions from "../components/SocialActions";
import BackButton from "../components/BackButton";
import "./Dashboard.css";

export default function DashboardInvestor() {
    const { navigate } = useApp();
    const investor = USERS.investor;

    return (
        <div className="animate-fadeUp">

            {/* ── Header ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Tableau de bord investisseur</h1>
                    <p className="page-subtitle">Découvrez les opportunités du moment.</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary" onClick={() => navigate("explore")}>
                        🔍 Explorer les projets
                    </button>
                </div>
            </div>

            {/* ── Stats ── */}
            <div className="grid-4" style={{ marginBottom: 22 }}>
                <StatCard icon="⭐" value="12" label="Projets sauvegardés" color="#F59E0B" bgColor="#FFFBEB" />
                <StatCard icon="💬" value="5" label="En discussion" color="#5B73F5" bgColor="#EEF2FF" />
                <StatCard icon="💰" value="€340K" label="Investi total" color="#22C55E" bgColor="#F0FDF4" delta="+€50K ce mois" />
                <StatCard icon="🆕" value="23" label="Nouveaux projets" color="#8B5CF6" bgColor="#F3EFFE" />
            </div>

            <div className="two-col">
                <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Recommandations IA */}
                    <div className="grid-3">
                        {PROJECTS.slice(0, 3).map(p => (
                            <div key={p.id}>
                                <ProjectCard
                                    project={p}
                                    onClick={() => navigate("project-detail", { project: p })}
                                />
                                {/* Social actions */}
                                <div style={{
                                    padding: "10px 14px",
                                    background: "var(--bg-card)",
                                    borderLeft: "1px solid var(--border)",
                                    borderRight: "1px solid var(--border)",
                                    borderBottom: "1px solid var(--border)",
                                    borderRadius: "0 0 var(--r-lg) var(--r-lg)",
                                    marginTop: -1,
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

                      // social media //
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>
                            Accès rapides
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <button
                                className="btn btn-secondary btn-full"
                                onClick={() => navigate("saved-projects")}
                            >
                                ⭐ Projets sauvegardés
                            </button>
                            <button
                                className="btn btn-secondary btn-full"
                                onClick={() => navigate("investor-requests")}
                            >
                                📋 Marketplace
                            </button>
                        </div>
                    </div>
                    {/* Portfolio */}
                    <div className="card" style={{ overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                            <div className="section-title">Mon portfolio</div>
                        </div>
                        <div className="portfolio-header">
                            {["Projet", "Secteur", "Montant", "Rendement", "Statut"].map(h => (
                                <span key={h}>{h}</span>
                            ))}
                        </div>
                        {investor.portfolio.map((item, i) => {
                            const project = PROJECTS.find(p => p.title === item.name);
                            const isUp = item.return.startsWith("+");
                            return (
                                <div
                                    key={i}
                                    className="portfolio-row"
                                    onClick={() => project && navigate("project-detail", { project })}
                                >
                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                    <span>
                                        <Badge color={project?.category || "gray"}>
                                            {project?.category || "—"}
                                        </Badge>
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{item.amount}</span>
                                    <span style={{ fontWeight: 700, color: isUp ? "var(--success)" : "var(--danger)" }}>
                                        {isUp ? "↑" : "↓"} {item.return}
                                    </span>
                                    <Badge color="green">Actif</Badge>
                                </div>
                            );
                        })}
                    </div>

                </div>

                {/* ── Sidebar droite ── */}
                <div className="two-col-side">

                    {/* Critères */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 14 }}>
                            Mes critères d'investissement
                        </div>
                        {[
                            ["💰", "Ticket minimum", investor.criteria.minTicket],
                            ["📈", "Ticket maximum", investor.criteria.maxTicket],
                            ["📊", "Stade minimum", investor.criteria.stage],
                            ["🌍", "Zone géographique", investor.criteria.region],
                        ].map(([ico, l, v]) => (
                            <div key={l} style={{ display: "flex", gap: 8, padding: "9px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                                <span>{ico}</span>
                                <span style={{ color: "var(--text-secondary)", flex: 1 }}>{l}</span>
                                <span style={{ fontWeight: 700 }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Activité */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>Activité récente</div>
                        <div className="activity-feed">
                            {[
                                { ico: "📊", text: "EcoDeliv a atteint 37% de son objectif", time: "Il y a 2h" },
                                { ico: "🆕", text: "5 nouveaux projets GreenTech publiés", time: "Aujourd'hui" },
                                { ico: "💬", text: "Alice Martin a répondu à votre message", time: "Hier" },
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

                    <button className="btn btn-primary btn-full" onClick={() => navigate("explore")}>
                        🔍 Explorer de nouveaux projets
                    </button>

                </div>
            </div>
        </div>
    );
}