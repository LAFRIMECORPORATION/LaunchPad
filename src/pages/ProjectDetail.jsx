// ============================================================
// LAUNCHPAD — Project Detail Page
// ============================================================

import { useApp } from "../context/AppContext";
import { Avatar, Badge, ProgressBar, AIBadge } from "../components/UI";
import { PROJECTS, SIMILAR_PROJECTS } from "../data/mockData";
import SocialActions from "../components/SocialActions";
import CommentSection from "../components/CommentSection";
import "./Projects.css";

export default function ProjectDetail() {
    const { navigate, selProject, currentUser, projects } = useApp();

    const pct = Math.round((project.raised / project.goal) * 100);
    const daysLeft = 14;

    {/* gestion de like et de commentaire*/ }

    const liveProject = projects.find(p => p.id === (selProject?.id)) || selProject || projects[0]
    const project = liveProject;

    return (
        <div className="animate-fadeUp">

            <button
                className="btn btn-ghost btn-sm"
                style={{ marginBottom: 16 }}
                onClick={() => navigate("explore")}
            >
                ← Retour aux projets
            </button>

            <div className="two-col" style={{ gap: 32 }}>

                {/* ── Main content ── */}
                <div className="two-col-main">

                    {/* Cover */}
                    <div className="project-cover" style={{ background: project.colorBg }}>
                        {project.emoji}
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                        <Badge color={project.category}>{project.category}</Badge>
                        {project.tags.map(t => <Badge key={t} color="gray">{t}</Badge>)}
                        <Badge color="green">En financement</Badge>
                    </div>

                    {/* Title + Social Actions */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 10, flexWrap: "wrap" }}>
                        <h1 className="project-detail-title" style={{ marginBottom: 0 }}>
                            {project.title}
                        </h1>
                        <SocialActions
                            project={project}
                            onCommentClick={() => {
                                document.getElementById("comment-section")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        />
                    </div>


                    {/* Title & Lead */}
                    <h1 className="project-detail-title">{project.title}</h1>
                    <p className="project-detail-lead">{project.desc}</p>

                    {/* Sections */}
                    {[
                        ["🎯 Problème résolu", project.problem],
                        ["💡 Notre solution", project.solution],
                        ["💰 Modèle économique", project.model],
                    ].map(([title, text]) => (
                        <div key={title} className="project-section">
                            <h3 className="project-section-title">{title}</h3>
                            <p className="project-section-text">{text}</p>
                        </div>
                    ))}

                    {/* Team */}
                    <div className="project-section">
                        <h3 className="project-section-title">👥 L'équipe</h3>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {[
                                ["AL", "Alice Martin", "CEO & Fondatrice"],
                                ["TC", "Thomas C.", "CTO"],
                                ["SB", "Sophie B.", "Growth & Marketing"],
                            ].map(([av, name, role]) => (
                                <div
                                    key={name}
                                    className="team-member-chip"
                                    onClick={() => navigate("profile-student")}
                                >
                                    <Avatar label={av} size="md" />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Similar projects */}
                    <div className="project-section">
                        <h3 className="project-section-title">
                            Projets similaires <AIBadge />
                        </h3>
                        <div className="grid-3">
                            {SIMILAR_PROJECTS.map(sp => (
                                <div key={sp.id} className="similar-mini">
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontWeight: 700, fontSize: 14 }}>{sp.title}</span>
                                        <Badge color="green">{sp.similarity}%</Badge>
                                    </div>
                                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{sp.desc}</p>
                                    <button
                                        className="btn btn-secondary btn-sm btn-full"
                                        onClick={() => navigate("collaboration")}
                                    >
                                        Collaborer
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/*gestion des likes et de commentaires*/}

                    <div id="comment-section" className="project-section">
                        <CommentSection project={project} />
                    </div>

                </div>

                {/* ── Funding sidebar ── */}
                <div className="two-col-side-lg">
                    <div className="funding-card">
                        <div className="funding-amount">
                            €{(project.raised / 1000).toFixed(0)}K
                        </div>
                        <div className="funding-of">
                            sur €{(project.goal / 1000).toFixed(0)}K levés
                        </div>

                        <ProgressBar value={project.raised} max={project.goal} size="thick" showMeta={false} />

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
                            <Badge color="green">{pct}% financé</Badge>
                            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                                {daysLeft} jours restants
                            </span>
                        </div>

                        <div className="divider" />

                        <div className="funding-meta">
                            {[
                                ["👥", `${project.investors} investisseurs`],
                                ["📅", `Clôture : ${project.deadline}`],
                                ["📈", `Equity : ${project.equity}`],
                                ["🏢", `Stade : ${project.stage}`],
                            ].map(([ico, text]) => (
                                <div key={text} className="funding-meta-row">
                                    <span>{ico}</span> {text}
                                </div>
                            ))}
                        </div>

                        <div className="divider" />

                        {currentUser?.role === "investor" ? (
                            <>
                                <button
                                    className="btn btn-primary btn-full btn-lg"
                                    style={{ marginBottom: 10 }}
                                >
                                    💰 Investir dans ce projet
                                </button>
                                <button
                                    className="btn btn-secondary btn-full"
                                    onClick={() => navigate("messages")}
                                >
                                    💬 Contacter l'équipe
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-secondary btn-full"
                                onClick={() => navigate("messages")}
                            >
                                💬 Envoyer un message
                            </button>
                        )}

                        <div style={{ marginTop: 14, padding: 12, background: "var(--bg-hover)", borderRadius: "var(--r-md)", fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
                            🔒 Paiement sécurisé · Fonds bloqués jusqu'à l'objectif
                        </div>
                    </div>

                    {/* Share */}
                    <div className="card" style={{ padding: 16 }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>Partager ce projet</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {["🔗 Copier", "🐦 Twitter", "💼 LinkedIn"].map(s => (
                                <button key={s} className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11 }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}