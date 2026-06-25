// ============================================================
// LAUNCHPAD — Project Detail Page (Données Temps Réel & Synchronisées)
// Fichier : src/pages/ProjectDetail.jsx
// ============================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Avatar, Badge, ProgressBar, AIBadge } from "../components/UI";
import SocialActions from "../components/SocialActions";
import CommentSection from "../components/CommentSection";
import "./Projects.css";

export default function ProjectDetail() {
    const { id: urlId } = useParams();
    const appCtx = useApp();
    
    const navigate = appCtx?.navigate;
    const currentUser = appCtx?.currentUser;
    const showToast = appCtx?.showToast;
    const globalProjects = appCtx?.projects || [];

    const token = typeof appCtx?.getAccessToken === "function" 
        ? appCtx.getAccessToken() 
        : (appCtx?.token || appCtx?.accessToken || "");

    const id = urlId || appCtx?.currentPageOptions?.id || appCtx?.pageOptions?.id;

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [similarProjects, setSimilarProjects] = useState([]);

    // ── 1. CHARGEMENT DEPUIS L'API + HARMONISATION DE L'ÉTAT DES LIKES ──
    const loadProjectDetail = useCallback(async () => {
        if (!id || id === "undefined") {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const envUrl = import.meta.env.VITE_API_URL || "";
            const cleanBaseUrl = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
            
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(`${cleanBaseUrl}/api/projects/${id}`, {
                method: "GET",
                headers: headers
            });

            if (!response.ok) throw new Error("Le projet n'existe pas ou a été archivé.");
            const resBody = await response.json();
            
            const cleanProject = resBody?.data ? resBody.data : resBody;
            
            // 🛡️ RE-MAPPING DES CLÉS : S'assurer que le modèle backend s'aligne sur les clés globales
            const normalizedProject = {
                ...cleanProject,
                id: cleanProject.id || cleanProject.project_id,
                likes: cleanProject.likes ?? cleanProject.likesCount ?? 0,
                likedByMe: cleanProject.likedByMe ?? cleanProject.isLiked ?? false,
                comments: cleanProject.comments || []
            };
            
            // Synchronisation avec les modifications effectuées à la volée sur l'explorer
            const matchedGlobalProject = globalProjects.find(p => String(p.id || p.project_id) === String(id));
            
            if (matchedGlobalProject) {
                setProject({
                    ...normalizedProject,
                    likes: matchedGlobalProject.likes,
                    likedByMe: matchedGlobalProject.likedByMe,
                    comments: matchedGlobalProject.comments || normalizedProject.comments,
                    commentsCount: matchedGlobalProject.commentsCount ?? matchedGlobalProject.comments_count ?? (matchedGlobalProject.comments?.length || 0),
                    comments_count: matchedGlobalProject.commentsCount ?? matchedGlobalProject.comments_count ?? (matchedGlobalProject.comments?.length || 0)
                });
            } else {
                setProject(normalizedProject);
            }

        } catch (error) {
            console.error("Erreur fetch detail:", error);
            if (typeof showToast === "function") {
                showToast("Erreur lors de la récupération des détails du projet", "error");
            }
        } finally {
            setLoading(false);
        }
    }, [id, token, showToast, globalProjects]);

    useEffect(() => {
        loadProjectDetail();
    }, [id]);

    // ── 2. CHARGEMENT DES PROJETS SIMILAIRES DEPUIS L'API ──
    const loadSimilarProjects = useCallback(async () => {
        if (!id || id === "undefined") return;
        
        try {
            const envUrl = import.meta.env.VITE_API_URL || "";
            const cleanBaseUrl = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
            
            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(`${cleanBaseUrl}/api/projects/${id}/similar`, {
                method: "GET",
                headers: headers
            });

            if (response.ok) {
                const data = await response.json();
                const projects = data.projects || data.data || [];
                setSimilarProjects(projects);
            }
        } catch (error) {
            console.error("Erreur chargement projets similaires:", error);
        }
    }, [id, token]);

    useEffect(() => {
        if (project) {
            loadSimilarProjects();
        }
    }, [project, loadSimilarProjects]);

    // Écouteur en temps réel du catalogue de projets
    useEffect(() => {
        if (!loading && project && globalProjects.length > 0) {
            const currentId = project.id || project.project_id;
            const matched = globalProjects.find(p => String(p.id || p.project_id) === String(currentId));
            if (matched && (
                project.likes !== matched.likes || 
                project.likedByMe !== matched.likedByMe || 
                project.comments?.length !== matched.comments?.length ||
                project.commentsCount !== matched.commentsCount ||
                project.comments_count !== matched.comments_count
            )) {
                setProject(prev => ({
                    ...prev,
                    likes: matched.likes,
                    likedByMe: matched.likedByMe,
                    comments: matched.comments || prev.comments,
                    commentsCount: matched.commentsCount ?? matched.comments_count ?? (matched.comments?.length || 0),
                    comments_count: matched.commentsCount ?? matched.comments_count ?? (matched.comments?.length || 0)
                }));
            }
        }
    }, [globalProjects, loading]);

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
                    {/* Cover Image Style Facebook */}
                    {project.coverImageUrl ? (
                        <div 
                            className="project-cover-container" 
                            style={{ 
                                marginBottom: 24, 
                                borderRadius: "var(--r-lg)", 
                                overflow: "hidden",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                                position: "relative"
                            }}
                        >
                            <img 
                                src={project.coverImageUrl} 
                                alt={project.title} 
                                style={{ 
                                    width: "100%", 
                                    height: "320px", 
                                    objectFit: "cover",
                                    display: "block"
                                }} 
                            />
                            <div style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                padding: "60px 20px 20px",
                                color: "white"
                            }}>
                                <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 4 }}>
                                    {project.category} • {project.stage?.toUpperCase()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div 
                            className="project-cover" 
                            style={{ 
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                                color: "white",
                                height: "320px",
                                borderRadius: "var(--r-lg)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 64,
                                marginBottom: 24,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
                            }}
                        >
                            📦
                        </div>
                    )}

                    {/* Author Info Bar Style Facebook */}
                    <div 
                        className="card" 
                        style={{ 
                            marginBottom: 20, 
                            padding: "16px 20px",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                        }}
                    >
                        <div 
                            onClick={() => navigate && navigate("profile-student", { id: project.authorId })}
                            style={{ cursor: "pointer" }}
                        >
                            <Avatar 
                                label={project.author?.firstName?.[0] || "U"} 
                                size="md" 
                                ring={true}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div 
                                style={{ fontWeight: 700, fontSize: 15, cursor: "pointer" }}
                                onClick={() => navigate && navigate("profile-student", { id: project.authorId })}
                            >
                                {project.author?.firstName} {project.author?.lastName}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                Porteur de projet • {project.author?.profile?.university || "Étudiant"}
                            </div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {new Date(project.createdAt || project.publishedAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            })}
                        </div>
                    </div>

                    {/* Tags and Status */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                        <Badge color={project.category}>{project.category}</Badge>
                        {project.tags?.map(t => <Badge key={t} color="gray">{t}</Badge>)}
                        <Badge color={project.status === "active" ? "green" : "yellow"}>
                            {project.status === "active" ? "🟢 En financement" : "🟡 En révision"}
                        </Badge>
                    </div>

                    {/* Title and Social Actions */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                        <h1 className="project-detail-title" style={{ marginBottom: 0, fontSize: 28, fontWeight: 800 }}>
                            {project.title}
                        </h1>
                        <SocialActions
                            project={project}
                            onCommentClick={() => {
                                document.getElementById("comment-section")?.scrollIntoView({ behavior: "smooth" });
                            }}
                        />
                    </div>

                    <p className="project-detail-lead" style={{ marginTop: 0, color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.6, marginBottom: 24 }}>
                        {project.tagline || "Aucune description courte disponible pour ce projet."}
                    </p>

                    {/* Description Card */}
                    <div className="card" style={{ marginBottom: 20, padding: 24 }}>
                        <h3 className="project-section-title" style={{ marginBottom: 12, fontSize: 18 }}>📝 Description du projet</h3>
                        <p className="project-section-text" style={{ lineHeight: 1.8, fontSize: 15 }}>{project.description}</p>
                    </div>

                    {project.problem && (
                        <div className="card" style={{ marginBottom: 20, padding: 24, background: "var(--bg-light)" }}>
                            <h3 className="project-section-title" style={{ marginBottom: 12, fontSize: 18 }}>🎯 Problème résolu</h3>
                            <p className="project-section-text" style={{ lineHeight: 1.8, fontSize: 15 }}>{project.problem}</p>
                        </div>
                    )}

                    {project.solution && (
                        <div className="card" style={{ marginBottom: 20, padding: 24 }}>
                            <h3 className="project-section-title" style={{ marginBottom: 12, fontSize: 18 }}>💡 Notre solution</h3>
                            <p className="project-section-text" style={{ lineHeight: 1.8, fontSize: 15 }}>{project.solution}</p>
                        </div>
                    )}

                    {project.businessModel && (
                        <div className="card" style={{ marginBottom: 20, padding: 24, background: "var(--bg-light)" }}>
                            <h3 className="project-section-title" style={{ marginBottom: 12, fontSize: 18 }}>💰 Modèle économique</h3>
                            <p className="project-section-text" style={{ lineHeight: 1.8, fontSize: 15 }}>{project.businessModel}</p>
                        </div>
                    )}

                    {/* Team Section */}
                    <div className="card" style={{ marginBottom: 20, padding: 24 }}>
                        <h3 className="project-section-title" style={{ marginBottom: 16, fontSize: 18 }}>👥 L'équipe</h3>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            <div 
                                className="team-member-chip" 
                                onClick={() => navigate && navigate("profile-student", { id: project.authorId })}
                                style={{ 
                                    cursor: "pointer",
                                    padding: 12,
                                    background: "var(--bg-light)",
                                    borderRadius: "var(--r-md)",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 12
                                }}
                            >
                                <Avatar label={project.author?.firstName?.[0] || "U"} size="md" ring={true} />
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                                        {project.author?.firstName} {project.author?.lastName}
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                        {project.author?.profile?.university || "Étudiant"}
                                    </div>
                                </div>
                            </div>
                            {project.teamSize > 1 && (
                                <div 
                                    className="team-member-chip" 
                                    style={{ 
                                        padding: "12px 20px",
                                        background: "var(--bg-light)",
                                        borderRadius: "var(--r-md)",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                >
                                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-secondary)" }}>
                                        +{project.teamSize - 1} membre{project.teamSize - 1 > 1 ? "s" : ""}
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
                            {similarProjects.length > 0 ? (
                                similarProjects.map(sp => (
                                    <div key={sp.id} className="similar-mini">
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontWeight: 700, fontSize: 14 }}>{sp.title}</span>
                                            <Badge color="green">{sp.similarityScore || 70}%</Badge>
                                        </div>
                                        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "8px 0" }}>{sp.tagline || sp.description?.substring(0, 80) + "..."}</p>
                                        <button
                                            className="btn btn-secondary btn-sm btn-full"
                                            onClick={() => navigate && navigate(`/projects/${sp.id}`)}
                                        >
                                            Voir le projet
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)", padding: 20 }}>
                                    Aucun projet similaire trouvé pour le moment.
                                </div>
                            )}
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