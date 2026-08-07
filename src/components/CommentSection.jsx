// ============================================================
// LAUNCHPAD — CommentSection Component
// Section commentaires pour ProjectDetail
// ============================================================

import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Avatar } from "./UI";
import "./CommentSection.css";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function CommentSection({ project }) {
    const { addComment, currentUser, projects, setProjects } = useApp();
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

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
    const liveProject = useMemo(() => 
        projects?.find(p => String(p.id || p.project_id) === String(targetProjectId)) || project,
        [projects, targetProjectId, project]
    );

    if (!project) {
        return <div className="comment-empty">Chargement des commentaires...</div>;
    }
    
    const innerProject = liveProject?.project || liveProject?.data || liveProject;
    const comments = project?.comments || liveProject?.comments || innerProject?.comments || [];

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
    }

    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    // ── FONCTION POUR RÉPONDRE À UN COMMENTAIRE (AVEC PARENTID) ─────────────
    async function handleReply(parentId, replyText) {
        if (!targetProjectId || targetProjectId === "undefined") {
            console.error("❌ Impossible de répondre : L'identifiant du projet est introuvable.");
            return;
        }

        if (!UUID_REGEX.test(parentId)) {
            console.warn("ID parent invalide (pas UUID):", parentId);
            throw new Error("Impossible de répondre à un commentaire local sans UUID.");
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
            const dbComment = jsonRes.data?.comment || jsonRes.comment || jsonRes.data || jsonRes;

            if (!dbComment?.id) {
                throw new Error("ID de commentaire manquant dans la réponse du serveur");
            }

            // Normalisation de la réponse
            const backendUser = dbComment.user || dbComment.author;
            const firstName = backendUser?.first_name || backendUser?.firstName || currentUser?.firstName || "";
            const lastName = backendUser?.last_name || backendUser?.lastName || currentUser?.lastName || "";
            const computedAuthor = `${firstName} ${lastName}`.trim() || currentUser?.name || "Anonyme";
            const computedAvatar = backendUser?.avatar_url || backendUser?.avatar || currentUser?.avatar || "U";

            const processedReply = {
                id: dbComment.id,
                author: computedAuthor,
                avatar: computedAvatar,
                content: dbComment.content || replyText, 
                text: dbComment.content || replyText,
                createdAt: dbComment.createdAt || new Date().toISOString(),
                likes: 0,
                likedByMe: false,
                parentId: parentId
            };

            // Mise à jour locale optimiste du state global
            if (setProjects && typeof setProjects === "function") {
                setProjects(prevProjects => 
                    prevProjects.map(p => {
                        if (String(p.id || p.project_id) !== String(targetProjectId)) return p;
                        
                        const innerP = p.project || p.data || p;
                        const updatedComments = (innerP.comments || []).map(c => {
                            if (String(c.id) !== String(parentId)) return c;
                            return {
                                ...c,
                                replies: [...(c.replies || []), processedReply]
                            };
                        });
                        
                        return {
                            ...p,
                            ...(p.project ? { project: { ...p.project, comments: updatedComments } } : {}),
                            ...(p.data ? { data: { ...p.data, comments: updatedComments } } : {}),
                            comments: updatedComments
                        };
                    })
                );
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
                <span className="comment-section-count">
                    {comments.length} commentaire{comments.length > 1 ? "s" : ""}
                </span>
            </div>

            {currentUser ? (
                <div className="comment-form">
                    <Avatar label={currentUser.avatar || currentUser.firstName?.[0] || "U"} size="sm" />
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
                                <button className="btn-comment-cancel" onClick={() => setText("")}>
                                    Annuler
                                </button>
                                <button className="btn-comment-submit" onClick={handleSubmit} disabled={sending}>
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

            <div className="comment-list">
                {comments.length === 0 ? (
                    <div className="comment-empty">
                        <span style={{ fontSize: 32, marginBottom: 8, display: "block" }}>💭</span>
                        Soyez le premier à commenter ce projet !
                    </div>
                ) : (
                    comments.map(c => (
                        <CommentItem 
                            key={c.id || c._id || `comment-${comments.indexOf(c)}`} 
                            comment={c} 
                            projectId={targetProjectId}
                            onReply={handleReply}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function CommentItem({ comment, projectId, onReply }) {
    const [liked, setLiked] = useState(comment?.likedByMe || false);
    const [likeCount, setLikeCount] = useState(comment?.likes || comment?.likesCount || 0);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [sendingReply, setSendingReply] = useState(false);

    async function handleLike() {
        if (!projectId || !comment.id) {
            console.warn("handleLike: projectId ou comment.id manquant", { projectId, commentId: comment.id });
            return;
        }

        // Vérifier si l'ID est un UUID valide (pas un timestamp)
        if (!UUID_REGEX.test(comment.id)) {
            console.warn("ID de commentaire invalide (pas UUID):", comment.id);
            return;
        }

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

            const jsonRes = await response.json();
            const data = jsonRes.data || jsonRes;
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
                        Répondre
                    </button>
                </div>

                {replying && (
                    <div className="comment-reply-wrap">
                        <textarea
                            className="comment-input comment-input-sm"
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
                            </button>
                        </div>
                    </div>
                )}

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
            </div>
        </div>
    );
}