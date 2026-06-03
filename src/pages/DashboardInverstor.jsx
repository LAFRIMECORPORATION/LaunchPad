import { useApp } from "../context/AppContext";
import { StatCard, ProjectCard, AIBadge, Badge, KycAlert } from "../components/UI";
import { PROJECTS, USERS } from "../data/mockData";
import SocialActions from "../components/SocialActions";
import "./Dashboard.css";

export default function DashboardInvestor() {
    const { navigate, currentUser } = useApp();
    
    // Définition des données locales et adaptées du portfolio
    const localPortfolio = [
        { name: "EcoDeliv",  amount: "18M XAF",  return: "+12%" },
        { name: "DataMesh",  amount: "30M XAF",  return: "+8%"  },
        { name: "NutriAI",   amount: "12M XAF",  return: "-2%"  },
        { name: "LearnCam",  amount: "9M XAF",   return: "+22%" }
    ];

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
                        <div className="portfolio-header">
                            {["Projet", "Secteur", "Montant", "Rendement", "Statut"].map(h => (
                                <span key={h}>{h}</span>
                            ))}
                        </div>
                        {localPortfolio.map((item, i) => {
                            const project = PROJECTS.find(p => p.title === item.name);
                            const isUp = item.return.startsWith("+");
                            return (
                                <div
                                    key={i}
                                    className="portfolio-row"
                                    onClick={() => project && navigate("project-detail", { project })}
                                >
                                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.name}</span>
                                    <span>
                                        <Badge color={project?.category || "gray"}>
                                            {project?.category || "Startup"}
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