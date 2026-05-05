// ============================================================
// LAUNCHPAD — SocialActions Component
// Like + Comment + Share réutilisable
// ============================================================

import { useState, useRef } from "react";
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
    const { toggleLike, currentUser } = useApp();
    const [shareOpen, setShareOpen] = useState(false);
    const shareRef = useRef(null);

    const btnClass = size === "sm" ? "social-btn social-btn-sm" : "social-btn";

    function handleLike(e) {
        e.stopPropagation();
        toggleLike(project.id);
    }

    function handleShare(e) {
        e.stopPropagation();
        setShareOpen(prev => !prev);
    }

    function handleComment(e) {
        e.stopPropagation();
        if (onCommentClick) onCommentClick();
    }

    return (
        <div className={`social-actions ${className}`}>

            {/* ── Like ── */}
            <button
                className={`${btnClass}${project.likedByMe ? " liked" : ""}`}
                onClick={handleLike}
                title={project.likedByMe ? "Retirer le like" : "Liker ce projet"}
            >
                <span className="social-btn-icon">
                    {project.likedByMe ? "❤️" : "🤍"}
                </span>
                <span className="social-btn-count">{project.likes}</span>
            </button>

            {/* ── Comment ── */}
            {showCommentCount && (
                <button
                    className={btnClass}
                    onClick={handleComment}
                    title="Voir les commentaires"
                >
                    <span className="social-btn-icon">💬</span>
                    <span className="social-btn-count">
                        {project.comments?.length || 0}
                    </span>
                </button>
            )}

            {/* ── Share ── */}
            <div className="social-share-wrap" ref={shareRef}>
                <button
                    className={`${btnClass}${shareOpen ? " active" : ""}`}
                    onClick={handleShare}
                    title="Partager ce projet"
                >
                    <span className="social-btn-icon">↗</span>
                    <span className="social-btn-count">{project.shareCount}</span>
                </button>

                {shareOpen && (
                    <ShareMenu
                        project={project}
                        onClose={() => setShareOpen(false)}
                    />
                )}
            </div>

        </div>
    );
}