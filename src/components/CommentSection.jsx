<<<<<<< HEAD
=======
// ============================================================
// LAUNCHPAD — CommentSection Component
// Section commentaires pour ProjectDetail
// ============================================================

>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Avatar } from "./UI";
import "./CommentSection.css";

export default function CommentSection({ project }) {
<<<<<<< HEAD
    const { addComment, currentUser, projects } = useApp();
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    if (!project) {
        return <div className="comment-empty">Chargement des commentaires...</div>;
    }

    // ── SÉCURISATION DE L'ID (Aligné sur la robustesse de SocialActions) ───────
    const targetProjectId = 
        project?.id || 
        project?.project_id || 
        project?.project?.id || 
        project?.project?.project_id ||
        project?.data?.id;

    // ── LIEN DIRECT AVEC L'ÉTAT DU CONTEXTE GLOBAL ───────────────────────────
    // On va chercher la version "live" du projet dans le state global de l'app 
    // pour que l'ajout d'un commentaire s'affiche instantanément à l'écran.
    const liveProject = projects?.find(p => String(p.id || p.project_id) === String(targetProjectId)) || project;
    
    const innerProject = liveProject?.project || liveProject?.data || liveProject;
    const comments = innerProject?.comments || [];

    async function handleSubmit() {
        if (!text.trim()) return;

        if (!targetProjectId || targetProjectId === "undefined") {
            console.error("❌ Impossible de publier le commentaire : L'identifiant du projet est introuvable.", project);
            return;
        }

        setSending(true);
        try {
            if (typeof addComment === "function") {
                // currentUser est passé pour normaliser immédiatement l'auteur côté front
                await addComment(targetProjectId, text.trim(), currentUser);
            }
            setText("");
        } catch (err) {
            console.error("❌ Échec de l'envoi du commentaire :", err);
        } finally {
            setSending(false);
        }
=======
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
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

<<<<<<< HEAD
    // ── FONCTION POUR RÉPONDRE À UN COMMENTAIRE (AVEC PARENTID) ─────────────
    async function handleReply(parentId, replyText) {
        if (!targetProjectId || targetProjectId === "undefined") {
            console.error("❌ Impossible de répondre : L'identifiant du projet est introuvable.");
            return;
        }

        try {
            const envUrl = import.meta.env.VITE_API_URL || "";
            const cleanBaseUrl = envUrl.replace(/\/api\/?$/, ""); 
            const token = typeof projects?.getAccessToken === "function" 
                ? projects.getAccessToken() 
                : localStorage.getItem("launchpad_access_token") || "";

            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(`${cleanBaseUrl}/api/projects/${targetProjectId}/comments`, {
                method: "POST",
                headers,
                body: JSON.stringify({ content: replyText, parentId }) 
            });

            if (!response.ok) {
                throw new Error("Le serveur a refusé la réponse.");
            }
            
            const jsonRes = await response.json();
            const dbComment = jsonRes.data || jsonRes.comment || jsonRes;

            // Normalisation de la réponse
            const backendUser = dbComment.user || dbComment.author;
            const firstName = backendUser?.first_name || backendUser?.firstName || currentUser?.firstName || "";
            const lastName = backendUser?.last_name || backendUser?.lastName || currentUser?.lastName || "";
            const computedAuthor = `${firstName} ${lastName}`.trim() || currentUser?.name || "Anonyme";
            const computedAvatar = backendUser?.avatar_url || backendUser?.avatar || currentUser?.avatar || "U";

            const processedReply = {
                id: dbComment.id || Date.now(),
                author: computedAuthor,
                avatar: computedAvatar,
                content: dbComment.content || replyText, 
                text: dbComment.content || replyText,
                createdAt: dbComment.createdAt || new Date().toISOString(),
                likes: 0,
                parentId: parentId
            };

            // Mise à jour locale optimiste
            // Note: pour une implémentation complète, il faudrait mettre à jour le state global
            // Ici on recharge simplement le projet pour afficher la nouvelle réponse
            if (typeof addComment === "function") {
                // On simule un rechargement en appelant addComment avec un flag spécial
                // ou on pourrait directement mettre à jour le state
            }
        } catch (error) {
            console.error("Erreur lors de la réponse:", error);
            throw error;
        }
    }

    return (
        <div className="comment-section">
            <div className="comment-section-header">
                <h3 className="comment-section-title">💬 Commentaires</h3>
=======
    return (
        <div className="comment-section">

            {/* ── Header ── */}
            <div className="comment-section-header">
                <h3 className="comment-section-title">
                    💬 Commentaires
                </h3>
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
                <span className="comment-section-count">
                    {comments.length} commentaire{comments.length > 1 ? "s" : ""}
                </span>
            </div>

<<<<<<< HEAD
            {currentUser ? (
                <div className="comment-form">
                    <Avatar label={currentUser.avatar || currentUser.firstName?.[0] || "U"} size="sm" />
=======
            {/* ── Formulaire nouveau commentaire ── */}
            {currentUser ? (
                <div className="comment-form">
                    <Avatar label={currentUser.avatar} size="sm" />
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
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
<<<<<<< HEAD
                                <button className="btn-comment-cancel" onClick={() => setText("")}>
                                    Annuler
                                </button>
                                <button className="btn-comment-submit" onClick={handleSubmit} disabled={sending}>
=======
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
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
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

<<<<<<< HEAD
=======
            {/* ── Liste des commentaires ── */}
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
            <div className="comment-list">
                {comments.length === 0 ? (
                    <div className="comment-empty">
                        <span style={{ fontSize: 32, marginBottom: 8, display: "block" }}>💭</span>
                        Soyez le premier à commenter ce projet !
                    </div>
                ) : (
                    comments.map(c => (
<<<<<<< HEAD
                        <CommentItem 
                            key={c.id || c._id || Math.random()} 
                            comment={c} 
                            projectId={targetProjectId}
                            onReply={handleReply}
                        />
                    ))
                )}
            </div>
=======
                        <CommentItem key={c.id} comment={c} />
                    ))
                )}
            </div>

>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
        </div>
    );
}

<<<<<<< HEAD
function CommentItem({ comment, projectId, onReply }) {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment?.likes || comment?.likesCount || 0);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    async function handleLike() {
        if (!projectId || !comment.id) return;

        const previousLiked = liked;
        const previousCount = likeCount;

        // Mise à jour optimiste
        setLiked(prev => !prev);
        setLikeCount(c => liked ? c - 1 : c + 1);

        try {
            const envUrl = import.meta.env.VITE_API_URL || "";
            const cleanBaseUrl = envUrl.replace(/\/api\/?$/, ""); 
            const token = localStorage.getItem("launchpad_access_token") || "";

            const headers = { "Content-Type": "application/json" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            const response = await fetch(`${cleanBaseUrl}/api/projects/${projectId}/comments/${comment.id}/like`, {
                method: "POST",
                headers
            });

            if (!response.ok) throw new Error("Échec du like");

            const data = await response.json();
            setLikeCount(data.likesCount ?? data.likes ?? 0);
            setLiked(data.likedByMe ?? true);
        } catch (error) {
            console.error("Erreur like commentaire:", error);
            // Rollback en cas d'erreur
            setLiked(previousLiked);
            setLikeCount(previousCount);
        }
    }

    async function handleReplySubmit() {
        if (!replyText.trim() || !onReply) return;
        
        setSendingReply(true);
        try {
            await onReply(comment.id, replyText.trim());
            setReplyText("");
            setReplying(false);
        } catch (error) {
            console.error("Erreur lors de la réponse:", error);
        } finally {
            setSendingReply(false);
        }
    }

    // Extraction propre de l'auteur selon les structures mockées ou renvoyées par Sequelize/Prisma
    const authorName = typeof comment?.author === "string"
        ? comment.author
        : comment?.author 
            ? `${comment.author.firstName || ""} ${comment.author.lastName || ""}`.trim() 
            : (comment?.user ? `${comment.user.firstName || comment.user.first_name || ""} ${comment.user.lastName || comment.user.last_name || ""}`.trim() : null) || "Utilisateur";

    const authorAvatar = comment?.avatar || comment?.author?.avatarUrl || (typeof authorName === "string" ? authorName[0] : "U");

    return (
        <div className="comment-item">
            <Avatar label={authorAvatar} size="sm" />
            <div className="comment-item-body">
                <div className="comment-item-header">
                    <span className="comment-item-author">{authorName}</span>
                    <span className="comment-item-time">
                        {comment?.time || (comment?.createdAt ? new Date(comment.createdAt).toLocaleDateString("fr-FR") : "À l'instant")}
                    </span>
                </div>

                <p className="comment-item-text">{comment?.content || comment?.text}</p>

                <div className="comment-item-actions">
                    <button className={`comment-action-btn${liked ? " liked" : ""}`} onClick={handleLike}>
                        {liked ? "❤️" : "🤍"} {likeCount}
                    </button>
                    <button className="comment-action-btn" onClick={() => setReplying(r => !r)}>
=======
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
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
                        Répondre
                    </button>
                </div>

<<<<<<< HEAD
=======
                {/* Reply input */}
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
                {replying && (
                    <div className="comment-reply-wrap">
                        <textarea
                            className="comment-input comment-input-sm"
<<<<<<< HEAD
                            placeholder={`Répondre à ${authorName}…`}
                            rows={2}
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                        />
                        <div className="comment-form-actions">
                            <button className="btn-comment-cancel" onClick={() => { setReplying(false); setReplyText(""); }}>
                                Annuler
                            </button>
                            <button 
                                className="btn-comment-submit" 
                                onClick={handleReplySubmit}
                                disabled={!replyText.trim() || sendingReply}
                            >
                                {sendingReply ? "Envoi..." : "Répondre"}
=======
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
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
                            </button>
                        </div>
                    </div>
                )}

<<<<<<< HEAD
                {/* Affichage des réplies existantes */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-replies">
                        {comment.replies.map(reply => (
                            <CommentItem 
                                key={reply.id} 
                                comment={reply} 
                                projectId={projectId}
                                onReply={onReply}
                            />
                        ))}
                    </div>
                )}
=======
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
            </div>
        </div>
    );
}