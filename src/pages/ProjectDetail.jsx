// ============================================================
// LAUNCHPAD — Project Detail Page (Données Temps Réel)
// Fichier : src/pages/ProjectDetail.jsx
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Avatar, Badge, ProgressBar, AIBadge } from "../components/UI";
import { SIMILAR_PROJECTS } from "../data/mockData"; 
import SocialActions from "../components/SocialActions";
import CommentSection from "../components/CommentSection";
import "./Projects.css";

export default function ProjectDetail() {
    const { id: urlId } = useParams();
    const appCtx = useApp();
    
    const navigate = appCtx?.navigate;
    const currentUser = appCtx?.currentUser;
    const showToast = appCtx?.showToast;

    // Récupération sécurisée du token
    const token = typeof appCtx?.getAccessToken === "function" 
        ? appCtx.getAccessToken() 
        : (appCtx?.token || appCtx?.accessToken || "");

    // ÉTAPE CLÉ : Si l'ID n'est pas dans l'URL, on le pioche dans les options passées à ton composant/contexte
    const id = urlId || appCtx?.currentPageOptions?.id || appCtx?.pageOptions?.id;

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── 1. CHARGEMENT INDIVIDUEL DEPUIS L'API NATIVE ──
    const loadProjectDetail = useCallback(async () => {
        if (!id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Nettoyage de l'URL de l'API pour parer au problème de /api/api
            const envUrl = import.meta.env.VITE_API_URL || "";
            const cleanBaseUrl = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
            
            const headers = {
                "Content-Type": "application/json"
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(`${cleanBaseUrl}/api/projects/${id}`, {
                method: "GET",
                headers: headers
            });

            if (!response.ok) throw new Error("Le projet n'existe pas ou a été archivé.");
            const data = await response.json();
            setProject(data);
        } catch (error) {
            console.error("Erreur fetch detail:", error);
            if (typeof showToast === "function") {
                showToast("Erreur lors de la récupération des détails du projet", "error");
            }
        } finally {
            setLoading(false);
        }
    }, [id, token, showToast]);

    useEffect(() => {
        loadProjectDetail();
    }, [loadProjectDetail]);

    // ── 2. LOGIQUE DE CALCULS ET DÉVIATIONS ──
    const raised = project?.raisedAmount ? parseFloat(project.raisedAmount) : 0;
    const goal = project?.goalAmount ? parseFloat(project.goalAmount) : 0;
    const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0;
    
    const getDaysLeft = () => {
        if (!project?.deadline) return 14;
        const diff = new Date(project.deadline) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "100px 20px" }}>
                <div className="spinner" style={{ display: "inline-block", marginBottom: 16 }} />
                <p style={{ color: "var(--text-muted)" }}>Chargement de la fiche projet depuis Neon...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="animate-fadeUp" style={{ padding: 32, color: "var(--text-muted)", textAlign: "center" }}>
                <h2>Projet introuvable ou non approuvé</h2>
                <p>Identifiant cible détecté : <code style={{background: 'var(--bg-light)', padding: '2px 6px'}}>{id || "Aucun ID reçu"}</code></p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate && navigate("explore")}>
                    Retour au catalogue de projets
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fadeUp">
            <button
                className="btn btn-ghost btn-sm"
                style={{ marginBottom: 16 }}
                onClick={() => navigate && navigate("explore")}
            >
                ← Retour aux projets
            </button>

            <div className="two-col" style={{ gap: 32 }}>
                {/* ── Main content ── */}
                <div className="two-col-main">
                    {project.coverImageUrl ? (
                        <div className="project-cover-container" style={{ marginBottom: 20, borderRadius: "var(--r-lg)", overflow: "hidden" }}>
                            <img src={project.coverImageUrl} alt={project.title} style={{ width: "100%", height: "240px", objectFit: "cover" }} />
                        </div>
                    ) : (
                        <div className="project-cover" style={{ background: "linear-gradient(135deg, #5B73F5 0%, #3B53C5 100%)", color: "white" }}>
                            📦
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                        <Badge color={project.category}>{project.category}</Badge>
                        {project.tags?.map(t => <Badge key={t} color="gray">{t}</Badge>)}
                        <Badge color={project.status === "active" ? "green" : "yellow"}>
                            {project.status === "active" ? "En financement" : "En cours de révision"}
                        </Badge>
                    </div>

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

                    <p className="project-detail-lead" style={{ marginTop: 10, color: "var(--text-secondary)", fontSize: 16 }}>
                        {project.tagline || "Aucune description courte disponible pour ce projet."}
                    </p>

                    <div className="project-section">
                        <h3 className="project-section-title">📝 Description du projet</h3>
                        <p className="project-section-text">{project.description}</p>
                    </div>

                    {project.problem && (
                        <div className="project-section">
                            <h3 className="project-section-title">🎯 Problème résolu</h3>
                            <p className="project-section-text">{project.problem}</p>
                        </div>
                    )}

                    {project.solution && (
                        <div className="project-section">
                            <h3 className="project-section-title">💡 Notre solution</h3>
                            <p className="project-section-text">{project.solution}</p>
                        </div>
                    )}

                    {project.businessModel && (
                        <div className="project-section">
                            <h3 className="project-section-title">💰 Modèle économique</h3>
                            <p className="project-section-text">{project.businessModel}</p>
                        </div>
                    )}

                    <div className="project-section">
                        <h3 className="project-section-title">👥 L'équipe</h3>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <div className="team-member-chip" onClick={() => navigate && navigate("profile-student", { id: project.authorId })}>
                                <Avatar label={project.author?.firstName?.[0] || "U"} size="md" />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                                        {project.author?.firstName} {project.author?.lastName}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Porteur de projet (Étudiant)</div>
                                </div>
                            </div>
                            {project.teamSize > 1 && (
                                <div className="team-member-chip" style={{ cursor: "default" }}>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-secondary)", padding: "0 8px" }}>
                                        +{project.teamSize - 1} collaborateurs co-auteurs
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

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
                                    <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "8px 0" }}>{sp.desc}</p>
                                    <button
                                        className="btn btn-secondary btn-sm btn-full"
                                        onClick={() => navigate && navigate("collaboration", { targetProjectId: project.id })}
                                    >
                                        Collaborer
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div id="comment-section" className="project-section">
                        <CommentSection project={project} />
                    </div>
                </div>

                {/* ── Sidebar de financement ── */}
                <div className="two-col-side-lg">
                    <div className="funding-card">
                        <div className="funding-amount" style={{ fontSize: 26, fontWeight: 800, color: "var(--text-main)" }}>
                            {raised.toLocaleString("fr-FR")} XAF
                        </div>
                        <div className="funding-of" style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 12 }}>
                            sur un objectif de {goal.toLocaleString("fr-FR")} XAF
                        </div>

                        <ProgressBar value={raised} max={goal} size="thick" showMeta={false} />

                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 10 }}>
                            <Badge color="green">{pct}% financé</Badge>
                            <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 500 }}>
                                📅 {getDaysLeft()} jours restants
                            </span>
                        </div>

                        <div className="divider" style={{ margin: "16px 0" }} />

                        <div className="funding-meta">
                            <div className="funding-meta-row">
                                <span>👥</span> {project.investorsCount || 0} investisseur{(project.investorsCount || 0) > 1 ? "s" : ""} actif{(project.investorsCount || 0) > 1 ? "s" : ""}
                            </div>
                            <div className="funding-meta-row">
                                <span>📈</span> Parts offertes : {project.equityPct ? `${project.equityPct}%` : "Non spécifié"}
                            </div>
                            <div className="funding-meta-row">
                                <span>🛡️</span> Type : {project.equityType ? project.equityType.toUpperCase() : "EQUITY"}
                            </div>
                            <div className="funding-meta-row">
                                <span>🏢</span> Stade actuel : {project.stage ? project.stage.toUpperCase() : "INDÉFINI"}
                            </div>
                            <div className="funding-meta-row">
                                <span>👁️</span> {project.viewsCount || 0} vue{(project.viewsCount || 0) > 1 ? "s" : ""} uniques
                            </div>
                        </div>

                        <div className="divider" style={{ margin: "16px 0" }} />

                        {currentUser?.role === "investor" ? (
                            <>
                                <button
                                    className="btn btn-primary btn-lg btn-full"
                                    style={{ marginBottom: 10, justifyContent: "center" }}
                                    onClick={() => navigate && navigate("payment", { project })}
                                >
                                    💰 Investir via Mobile Money
                                </button>
                                <button
                                    className="btn btn-secondary btn-full"
                                    style={{ justifyContent: "center" }}
                                    onClick={() => navigate && navigate("messages", { teamContact: { name: `${project.title} Intégration`, id: project.authorId } })}
                                >
                                    Horaires & Salon de Discussion
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn btn-secondary btn-full"
                                style={{ justifyContent: "center" }}
                                onClick={() => navigate && navigate("messages", { teamContact: { name: `${project.title} Intégration`, id: project.authorId } })}
                            >
                                💬 Ouvrir le canal de communication
                            </button>
                        )}

                        <div style={{ marginTop: 14, padding: 12, background: "var(--bg-light)", borderRadius: "var(--r-md)", fontSize: 11, color: "var(--text-muted)", textAlign: "center", lineHeight: "1.4" }}>
                            🔒 **Régulation COSUMAF & Escrow Bancaire** · Les fonds restent séquestrés en toute sécurité jusqu'au succès du palier de l'objectif.
                        </div>
                    </div>

                    <div className="card" style={{ padding: 16 }}>
                        <div className="section-title" style={{ marginBottom: 12, fontSize: 14, fontWeight: 700 }}>Partager l'opportunité</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {["🔗 Lien", "🐦 Twitter", "💼 LinkedIn"].map(s => (
                                <button key={s} className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11, justifyContent: "center" }} onClick={() => {
                                    if(s.includes("Lien")) {
                                        navigator.clipboard.writeText(window.location.href);
                                        if (typeof showToast === "function") showToast("Lien du projet copié !", "success");
                                    }
                                }}>
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