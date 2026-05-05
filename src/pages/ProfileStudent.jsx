// ============================================================
// LAUNCHPAD — Profile Student Page
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
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        {isOwn ? (
                            <button className="btn btn-secondary">✏️ Modifier le profil</button>
                        ) : (
                            <>
                                <button className="btn btn-secondary" onClick={() => navigate("messages")}>
                                    💬 Message
                                </button>
                                <button className="btn btn-primary" onClick={() => navigate("collaboration")}>
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

                    {/* Infos */}
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

                </div>
            </div>
        </div>
    );
}
