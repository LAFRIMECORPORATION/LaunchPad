// ============================================================
// LAUNCHPAD — CommentSection Component
// Section commentaires pour ProjectDetail
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Avatar } from "./UI";
import "./CommentSection.css";

export default function CommentSection({ project }) {
    const { addComment, currentUser } = useApp();
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    const comments = project.comments || [];

    function handleSubmit() {
        if (!text.trim()) return;
        setSending(true);
        setTimeout(() => {
            addComment(project.id, text.trim(), currentUser);
            setText("");
            setSending(false);
        }, 300);
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <div className="comment-section">

            {/* ── Header ── */}
            <div className="comment-section-header">
                <h3 className="comment-section-title">
                    💬 Commentaires
                </h3>
                <span className="comment-section-count">
                    {comments.length} commentaire{comments.length > 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Formulaire nouveau commentaire ── */}
            {currentUser ? (
                <div className="comment-form">
                    <Avatar label={currentUser.avatar} size="sm" />
                    <div className="comment-form-right">
                        <textarea
                            className="comment-input"
                            placeholder="Ajouter un commentaire…"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                        />
                        {text.trim() && (
                            <div className="comment-form-actions">
                                <button
                                    className="btn-comment-cancel"
                                    onClick={() => setText("")}
                                >
                                    Annuler
                                </button>
                                <button
                                    className="btn-comment-submit"
                                    onClick={handleSubmit}
                                    disabled={sending}
                                >
                                    {sending ? "Envoi…" : "Publier"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="comment-login-prompt">
                    🔐 Connectez-vous pour laisser un commentaire.
                </div>
            )}

            {/* ── Liste des commentaires ── */}
            <div className="comment-list">
                {comments.length === 0 ? (
                    <div className="comment-empty">
                        <span style={{ fontSize: 32, marginBottom: 8, display: "block" }}>💭</span>
                        Soyez le premier à commenter ce projet !
                    </div>
                ) : (
                    comments.map(c => (
                        <CommentItem key={c.id} comment={c} />
                    ))
                )}
            </div>

        </div>
    );
}

/* ── Sous-composant : un commentaire ── */
function CommentItem({ comment }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likes);
    const [replying, setReplying] = useState(false);

    function handleLike() {
        setLiked(prev => {
            setLikeCount(c => prev ? c - 1 : c + 1);
            return !prev;
        });
    }

    return (
        <div className="comment-item">
            <Avatar label={comment.avatar} size="sm" />
            <div className="comment-item-body">

                {/* Header */}
                <div className="comment-item-header">
                    <span className="comment-item-author">{comment.author}</span>
                    <span className="comment-item-time">{comment.time}</span>
                </div>

                {/* Text */}
                <p className="comment-item-text">{comment.text}</p>

                {/* Actions */}
                <div className="comment-item-actions">
                    <button
                        className={`comment-action-btn${liked ? " liked" : ""}`}
                        onClick={handleLike}
                    >
                        {liked ? "❤️" : "🤍"} {likeCount}
                    </button>
                    <button
                        className="comment-action-btn"
                        onClick={() => setReplying(r => !r)}
                    >
                        Répondre
                    </button>
                </div>

                {/* Reply input */}
                {replying && (
                    <div className="comment-reply-wrap">
                        <textarea
                            className="comment-input comment-input-sm"
                            placeholder={`Répondre à ${comment.author}…`}
                            rows={1}
                        />
                        <div className="comment-form-actions">
                            <button
                                className="btn-comment-cancel"
                                onClick={() => setReplying(false)}
                            >
                                Annuler
                            </button>
                            <button
                                className="btn-comment-submit"
                                onClick={() => setReplying(false)}
                            >
                                Répondre
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}