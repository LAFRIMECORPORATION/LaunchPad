// ============================================================
// LAUNCHPAD — Profile Student Page
// Chemin : src/pages/ProfileStudent.jsx
// ============================================================

import { useApp } from "../context/AppContext";
import { Avatar, Badge, ProjectCard } from "../components/UI";
import { PROJECTS, USERS } from "../data/mockData";
import "./OtherPages.css";

export default function ProfileStudent() {
    const { navigate, currentUser } = useApp();
    const user = USERS.student;
    const myProjects = PROJECTS.filter(p => p.authorId === 1);
    const isOwn = currentUser?.role === "student";

    return (
        <div className="animate-fadeUp">

            {/* ── Cover + Avatar ── */}
            <div style={{ position: "relative", marginBottom: 60 }}>
                <div
                    className="profile-cover"
                    style={{
                        background: "linear-gradient(135deg, rgba(91,115,245,.15), rgba(139,92,246,.12))",
                    }}
                />
                <div className="profile-avatar-wrap">
                    <Avatar label={user.avatar} size="2xl" ring />
                </div>

                <div className="profile-header-bar" style={{ paddingLeft: 160 }}>
                    <div>
                        <div className="profile-name">{user.name}</div>
                        <div className="profile-sub">{user.university} · {user.location}</div>
                        
                        {/* KYC Status Badge */}
                        <div style={{ marginTop: 10 }}>
                            {currentUser?.kycValidated ? (
                                <span className="kyc-badge kyc-badge--verified">
                                    ✅ Compte vérifié
                                </span>
                            ) : currentUser?.kycStatus === "submitted" ? (
                                <span className="kyc-badge kyc-badge--submitted">
                                    ⏳ Vérification en cours
                                </span>
                            ) : (
                                <button
                                    className="kyc-badge kyc-badge--pending"
                                    onClick={() => navigate("kyc-verification")}
                                    style={{ cursor: "pointer", border: "none", fontFamily: "inherit" }}
                                >
                                    ⚠️ Vérifier mon compte →
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {isOwn ? (
                            <button className="btn btn-secondary" style={{ minWidth: 0 }}>✏️ Modifier</button>
                        ) : (
                            <>
                                <button className="btn btn-secondary" onClick={() => navigate("messages", { targetUserId: profileUser.id })}>
                                    💬 Message
                                </button>
                                <button className="btn btn-primary" onClick={() => navigate("collaboration")} style={{ whiteSpace: "nowrap" }}>
                                    🤝 Collaborer
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="card" style={{ marginBottom: 24, overflow: "hidden" }}>
                <div className="profile-stats-strip">
                    {[
                        ["👁️", user.stats.views, "Vues du profil"],
                        ["💰", user.stats.raised, "Financements levés"],
                        ["🤝", user.stats.collabs, "Collaborations"],
                        ["⭐", user.stats.score, "Score crédibilité"],
                    ].map(([ico, v, l]) => (
                        <div key={l} className="profile-stat">
                            <div className="profile-stat-icon">{ico}</div>
                            <div className="profile-stat-value">{v}</div>
                            <div className="profile-stat-label">{l}</div>
                        </div>
                    ))}
                    
                    {/* Stat Additionnelle : Score Réputation */}
                    <div className="profile-stat">
                        <div className="profile-stat-icon">🛡️</div>
                        <div className="profile-stat-value">{currentUser?.kycValidated ? "40" : "0"}</div>
                        <div className="profile-stat-label">Score réputation</div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="two-col">
                <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* À propos */}
                    <div className="card" style={{ padding: 22 }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>À propos</div>
                        <p className="profile-about-text">{user.bio}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {user.skills.map(s => (
                                <Badge key={s} color="blue">{s}</Badge>
                            ))}
                        </div>
                    </div>

                    {/* Projets publiés */}
                    <div>
                        <div className="section-header">
                            <span className="section-title">Projets publiés</span>
                            <Badge color="gray">{myProjects.length}</Badge>
                        </div>
                        <div className="grid-2">
                            {myProjects.map(p => (
                                <ProjectCard
                                    key={p.id}
                                    project={p}
                                    onClick={() => navigate("project-detail", { project: p })}
                                />
                            ))}
                        </div>
                    </div>

                </div>

                {/* ── Sidebar ── */}
                <div className="two-col-side">

                    {/* Liens */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>Liens</div>
                        {[
                            ["🔗", "LinkedIn", user.links.linkedin],
                            ["💻", "GitHub", user.links.github],
                            ["🌐", "Portfolio", user.links.portfolio],
                        ].map(([ico, label, href]) => (
                            <a key={label} href={href} className="profile-link">
                                {ico} {label}
                            </a>
                        ))}
                    </div>

                    {/* Infos de base */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>Informations</div>
                        {[
                            ["📅", "Membre depuis", user.joinedAt],
                            ["🎓", "Université", user.university],
                            ["📍", "Localisation", user.location],
                        ].map(([ico, label, value]) => (
                            <div key={label} className="profile-info-row">
                                <span>{ico}</span>
                                <span className="profile-info-key">{label}</span>
                                <span className="profile-info-value">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Badges obtenus */}
                    <div className="card" style={{ padding: 20, marginTop: 16 }}>
                        <div className="section-title" style={{ marginBottom: 14 }}>
                            🏆 Badges obtenus
                        </div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                            {[
                                { icon: "🌱", label: "Premier projet", earned: true  },
                                { icon: "🔥", label: "Trending",       earned: true  },
                                { icon: "🤝", label: "Collaborateur",  earned: false },
                                { icon: "💰", label: "Financement",    earned: false },
                            ].map(b => (
                                <div
                                    key={b.label}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: 4,
                                        padding: "10px 14px",
                                        borderRadius: "var(--r-md)",
                                        border: "1px solid var(--border)",
                                        background: b.earned ? "var(--accent-light)" : "var(--bg-card)",
                                        opacity: b.earned ? 1 : 0.5,
                                        flex: "1 1 calc(50% - 5px)",
                                        minWidth: 75,
                                    }}
                                >
                                    <span style={{ fontSize: 24, filter: b.earned ? "none" : "grayscale(1)" }}>{b.icon}</span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textAlign: "center" }}>
                                        {b.label}
                                    </span>
                                </div>
                            ))}
                            <button
                                className="btn btn-secondary btn-sm btn-full"
                                onClick={() => navigate("badges")}
                                style={{ marginTop: 6 }}
                            >
                                Voir tous →
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}