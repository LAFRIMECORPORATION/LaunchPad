<<<<<<< HEAD
import { useState, useRef, useEffect } from "react";
=======
// ============================================================
// LAUNCHPAD — SocialActions Component
// Like + Comment + Share réutilisable
// ============================================================

import { useState, useRef } from "react";
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
import { useApp } from "../context/AppContext";
import ShareMenu from "./ShareMenu";
import "./SocialActions.css";

export default function SocialActions({
    project,
    showCommentCount = true,
    onCommentClick = null,
    size = "normal",   // "normal" | "sm"
    className = "",
}) {
<<<<<<< HEAD
    const appCtx = useApp();
    const toggleLike = appCtx?.toggleLike;
    const setGlobalProjects = appCtx?.setProjects; 

    const [shareOpen, setShareOpen] = useState(false);
    const shareRef = useRef(null);

    // ── SÉCURISATION MAXIMALE DE L'ID (Résout le bug 'undefined') ──────────────────
    // On fouille à la racine, mais aussi à l'intérieur d'un sous-objet 'project' si imbriqué
    const targetProjectId = 
        project?.id || 
        project?.project_id || 
        project?.project?.id || 
        project?.project?.project_id ||
        project?.data?.id;

    // Harmonisation des clés de données selon la provenance (Mock ou Base de données)
    const innerProject = project?.project || project;
    const initialLikes = innerProject?.likes ?? innerProject?.likesCount ?? innerProject?.likes_count ?? 0;
    const initialLiked = innerProject?.likedByMe ?? innerProject?.isLiked ?? false;

    const [likesCount, setLikesCount] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialLiked);

    // Synchronise le state local si le composant parent ou le catalogue global change
    useEffect(() => {
        setLikesCount(initialLikes);
        setIsLiked(initialLiked);
    }, [initialLikes, initialLiked]);

    const btnClass = size === "sm" ? "social-btn social-btn-sm" : "social-btn";

    async function handleLike(e) {
        e.stopPropagation(); 
        e.preventDefault();

        if (!targetProjectId || targetProjectId === "undefined") {
            console.error("❌ Impossible de liker : L'identifiant du projet est introuvable. Structure reçue :", project);
            return;
        }

        // Étape 1 : Mise à jour visuelle immédiate (Optimistic UI)
        const previousLikes = likesCount;
        const previousLiked = isLiked;

        const nextLiked = !isLiked;
        const nextLikesCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

        setLikesCount(nextLikesCount);
        setIsLiked(nextLiked);

        // Étape 2 : Envoi de la requête asynchrone & synchronisation globale
        if (typeof toggleLike === "function") {
            try {
                await toggleLike(targetProjectId);
                
                if (typeof setGlobalProjects === "function") {
                    setGlobalProjects(prevProjects => 
                        prevProjects.map(p => {
                            const pId = p.id || p.project_id;
                            return String(pId) === String(targetProjectId)
                                ? { ...p, likes: nextLikesCount, likedByMe: nextLiked }
                                : p;
                        })
                    );
                }
            } catch (err) {
                console.error("Erreur lors du toggleLike:", err);
                // Rollback en cas d'échec
                setLikesCount(previousLikes);
                setIsLiked(previousLiked);
            }
        }
=======
    const { toggleLike } = useApp();
    const [shareOpen, setShareOpen] = useState(false);
    const shareRef = useRef(null);

    const btnClass = size === "sm" ? "social-btn social-btn-sm" : "social-btn";

    function handleLike(e) {
        e.stopPropagation();
        toggleLike(project.id);
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
    }

    function handleShare(e) {
        e.stopPropagation();
<<<<<<< HEAD
        e.preventDefault();
=======
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
        setShareOpen(prev => !prev);
    }

    function handleComment(e) {
        e.stopPropagation();
<<<<<<< HEAD
        e.preventDefault();
        if (onCommentClick) {
            onCommentClick(e);
        }
    }

    // Récupération dynamique du compteur de commentaires
    const commentsList = innerProject?.comments || [];
    const commentsCount = innerProject?.commentsCount || innerProject?.comments_count || commentsList.length || 0;

    return (
        <div className={`social-actions ${className}`}>
            {/* ── Like ── */}
            <button
                type="button"
                className={`${btnClass}${isLiked ? " liked" : ""}`}
                onClick={handleLike}
                title={isLiked ? "Retirer le like" : "Liker ce projet"}
            >
                <span className="social-btn-icon">
                    {isLiked ? "❤️" : "🤍"}
                </span>
                <span className="social-btn-count">{likesCount}</span>
=======
        if (onCommentClick) onCommentClick();
    }

    return (
        <div className={`social-actions ${className}`}>

            {/* ── Like ── */}
            <button
                type="button"
                className={`${btnClass}${project.likedByMe ? " liked" : ""}`}
                onClick={handleLike}
                title={project.likedByMe ? "Retirer le like" : "Liker ce projet"}
            >
                <span className="social-btn-icon">
                    {project.likedByMe ? "❤️" : "🤍"}
                </span>
                <span className="social-btn-count">{project.likes}</span>
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
            </button>

            {/* ── Comment ── */}
            {showCommentCount && (
                <button
                    type="button"
                    className={btnClass}
                    onClick={handleComment}
                    title="Voir les commentaires"
                >
                    <span className="social-btn-icon">💬</span>
<<<<<<< HEAD
                    <span className="social-btn-count">{commentsCount}</span>
=======
                    <span className="social-btn-count">
                        {project.comments?.length || 0}
                    </span>
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
                </button>
            )}

            {/* ── Share ── */}
            <div className="social-share-wrap" ref={shareRef}>
                <button
                    type="button"
                    className={`${btnClass}${shareOpen ? " active" : ""}`}
                    onClick={handleShare}
                    title="Partager ce projet"
                >
                    <span className="social-btn-icon">↗</span>
<<<<<<< HEAD
                    <span className="social-btn-count">{innerProject?.shareCount || 0}</span>
=======
                    <span className="social-btn-count">{project.shareCount}</span>
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
                </button>

                {shareOpen && (
                    <ShareMenu
<<<<<<< HEAD
                        project={innerProject}
=======
                        project={project}
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
                        onClose={() => setShareOpen(false)}
                    />
                )}
            </div>
<<<<<<< HEAD
=======

>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
        </div>
    );
}