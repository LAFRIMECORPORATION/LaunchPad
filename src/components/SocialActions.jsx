import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import ShareMenu from "./ShareMenu";
import "./SocialActions.css";

export default function SocialActions({
    project,
    showCommentCount = true,
    onCommentClick = null,
    size = "normal",
    className = "",
}) {
    const { toggleLike, setProjects: setGlobalProjects } = useApp() || {};
    const [shareOpen, setShareOpen] = useState(false);
    const shareRef = useRef(null);

    // ── Harmonisation des données ──
    const targetProjectId = project?.id || project?.project_id || project?.project?.id;
    const innerProject = project?.project || project;
    
    const initialLikes = innerProject?.likes ?? innerProject?.likesCount ?? 0;
    const initialLiked = innerProject?.likedByMe ?? innerProject?.isLiked ?? false;

    const [likesCount, setLikesCount] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialLiked);

    useEffect(() => {
        setLikesCount(initialLikes);
        setIsLiked(initialLiked);
    }, [initialLikes, initialLiked]);

    const btnClass = size === "sm" ? "social-btn social-btn-sm" : "social-btn";

    async function handleLike(e) {
        e.stopPropagation();
        e.preventDefault();

        if (!targetProjectId) return;

        // UI Optimiste
        const prevLikes = likesCount;
        const prevLiked = isLiked;
        const nextLiked = !isLiked;
        const nextLikes = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

        setLikesCount(nextLikes);
        setIsLiked(nextLiked);

        if (typeof toggleLike === "function") {
            try {
                await toggleLike(targetProjectId);
                if (typeof setGlobalProjects === "function") {
                    setGlobalProjects(prev => prev.map(p => 
                        (p.id === targetProjectId) ? { ...p, likes: nextLikes, likedByMe: nextLiked } : p
                    ));
                }
            } catch (err) {
                setLikesCount(prevLikes);
                setIsLiked(prevLiked);
            }
        }
    }

    function handleShare(e) {
        e.stopPropagation();
        e.preventDefault();
        setShareOpen(prev => !prev);
    }

    function handleComment(e) {
        e.stopPropagation();
        e.preventDefault();
        if (onCommentClick) onCommentClick(e);
    }

    return (
        <div className={`social-actions ${className}`}>
            {/* ── Like ── */}
            <button
                type="button"
                className={`${btnClass}${isLiked ? " liked" : ""}`}
                onClick={handleLike}
                title={isLiked ? "Retirer le like" : "Liker ce projet"}
            >
                <span className="social-btn-icon">{isLiked ? "❤️" : "🤍"}</span>
                <span className="social-btn-count">{likesCount}</span>
            </button>

            {/* ── Comment ── */}
            {showCommentCount && (
                <button type="button" className={btnClass} onClick={handleComment} title="Voir les commentaires">
                    <span className="social-btn-icon">💬</span>
                    <span className="social-btn-count">{innerProject?.comments?.length || 0}</span>
                </button>
            )}

            {/* ── Share ── */}
            <div className="social-share-wrap" ref={shareRef}>
                <button type="button" className={`${btnClass}${shareOpen ? " active" : ""}`} onClick={handleShare} title="Partager ce projet">
                    <span className="social-btn-icon">↗</span>
                    <span className="social-btn-count">{innerProject?.shareCount || 0}</span>
                </button>

                {shareOpen && (
                    <ShareMenu project={innerProject} onClose={() => setShareOpen(false)} />
                )}
            </div>
        </div>
    );
}