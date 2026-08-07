// ============================================================
// LAUNCHPAD — ForumPostDetail.jsx
// Page de détail d'un sujet du forum
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Avatar } from "../components/UI";
import { forumApi } from "../utils/api";
import "./Forum.css";

function authorName(author) {
  if (!author) return "Anonyme";
  return `${author.firstName || ""} ${author.lastName || ""}`.trim() || "Anonyme";
}

function authorInitials(author) {
  if (!author) return "??";
  const a = (author.firstName || "?")[0];
  const b = (author.lastName || "?")[0];
  return `${a}${b}`.toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `Il y a ${d}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default function ForumPostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [likingId, setLikingId] = useState(null);

  const loadPost = useCallback(async () => {
    setLoading(true);
    try {
      const res = await forumApi.getPost(postId);
      const data = res.data || res;
      setPost(data);
    } catch (err) {
      showToast(err.message || "Erreur lors du chargement du sujet.", "error");
      navigate("/forum");
    } finally {
      setLoading(false);
    }
  }, [postId, showToast, navigate]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  async function handleReply() {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const res = await forumApi.reply(postId, replyText.trim());
      const newReply = res.data || res;
      setPost(prev => ({
        ...prev,
        replies: [...(prev.replies || []), newReply],
        repliesCount: (prev.repliesCount || 0) + 1,
      }));
      setReplyText("");
      showToast("Réponse publiée avec succès !", "success");
    } catch (err) {
      showToast(err.message || "Erreur lors de la publication.", "error");
    } finally {
      setSubmittingReply(false);
    }
  }

  async function handleLike(targetId, isReply = false) {
    if (likingId === targetId) return;
    setLikingId(targetId);

    const apiCall = isReply ? forumApi.likeReply : forumApi.like;

    // Mise à jour optimiste
    if (isReply) {
      setPost(prev => ({
        ...prev,
        replies: prev.replies.map(r => {
          if (r.id !== targetId) return r;
          const alreadyLiked = !!(r.likes && r.likes.length > 0);
          return {
            ...r,
            likes: alreadyLiked ? [] : [{ userId: "me" }],
            likesCount: alreadyLiked ? Math.max(0, (r.likesCount || 0) - 1) : (r.likesCount || 0) + 1,
          };
        }),
      }));
    } else {
      setPost(prev => {
        const alreadyLiked = !!(prev.likes && prev.likes.length > 0);
        return {
          ...prev,
          likes: alreadyLiked ? [] : [{ userId: "me" }],
          likesCount: alreadyLiked ? Math.max(0, (prev.likesCount || 0) - 1) : (prev.likesCount || 0) + 1,
        };
      });
    }

    try {
      const res = await apiCall(targetId);
      const data = res.data || res;
      
      if (isReply) {
        setPost(prev => {
          return {
            ...prev,
            replies: prev.replies.map(r => {
              if (r.id !== targetId) return r;
              return {
                ...r,
                likesCount: data.likesCount,
                likes: data.liked ? [{ userId: "me" }] : [],
              };
            }),
          };
        });
      } else {
        setPost(prev => {
          return {
            ...prev,
            likesCount: data.likesCount,
            likes: data.liked ? [{ userId: "me" }] : [],
          };
        });
      }
    } catch (err) {
      showToast(err.message || "Erreur lors du like.", "error");
      loadPost();
    } finally {
      setLikingId(null);
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-state">
          <div className="spinner" />
          <div className="loading-state__title">Chargement du sujet…</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <div className="empty-state__icon">💬</div>
          <div className="empty-state__title">Sujet introuvable</div>
          <button className="btn btn-primary" onClick={() => navigate("/forum")}>
            Retour au forum
          </button>
        </div>
      </div>
    );
  }

  const isLiked = !!(post.likes && post.likes.length > 0);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <button className="btn btn-secondary" onClick={() => navigate("/forum")}>
          ← Retour
        </button>
        <div>
          <h1 className="page-title">{post.title}</h1>
          <p className="page-subtitle">
            {post.category?.name || post.category} · {timeAgo(post.createdAt)}
          </p>
        </div>
      </div>

      {/* Post */}
      <div className="forum-post-detail card">
        <div className="forum-post-detail__header">
          <Avatar label={authorInitials(post.author)} size="lg" />
          <div className="forum-post-detail__author">
            <div className="forum-post-detail__name">{authorName(post.author)}</div>
            <div className="forum-post-detail__meta">
              {post.isPinned && <span className="badge badge-primary">📌 Épinglé</span>}
              {post.isEdited && <span className="badge badge-gray">Modifié</span>}
              {timeAgo(post.createdAt)}
            </div>
          </div>
          <button
            className={`feed-action-btn${isLiked ? " liked" : ""}`}
            disabled={likingId === post.id}
            onClick={() => handleLike(post.id)}
          >
            {isLiked ? "❤️" : "🤍"} {post.likesCount ?? 0}
          </button>
        </div>
        <div className="forum-post-detail__content">
          {post.content}
        </div>
      </div>

      {/* Replies */}
      <div className="forum-replies">
        <h3 className="forum-replies__title">
          Réponses ({post.repliesCount ?? 0})
        </h3>

        {/* Reply Form */}
        <div className="forum-reply-form card">
          <Avatar label={authorInitials(post.author)} size="md" />
          <div className="forum-reply-form__input">
            <textarea
              placeholder="Écrivez votre réponse..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReply();
                }
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleReply}
              disabled={submittingReply || !replyText.trim()}
            >
              {submittingReply ? "Publication..." : "Répondre"}
            </button>
          </div>
        </div>

        {/* Replies List */}
        {post.replies && post.replies.length > 0 ? (
          post.replies.map(reply => {
            const isReplyLiked = !!(reply.likes && reply.likes.length > 0);
            return (
              <div key={reply.id} className="forum-reply card">
                <div className="forum-reply__header">
                  <Avatar label={authorInitials(reply.author)} size="md" />
                  <div className="forum-reply__author">
                    <div className="forum-reply__name">{authorName(reply.author)}</div>
                    <div className="forum-reply__meta">
                      {reply.isEdited && <span className="badge badge-gray">Modifié</span>}
                      {timeAgo(reply.createdAt)}
                    </div>
                  </div>
                  <button
                    className={`feed-action-btn${isReplyLiked ? " liked" : ""}`}
                    disabled={likingId === reply.id}
                    onClick={() => handleLike(reply.id, true)}
                  >
                    {isReplyLiked ? "❤️" : "🤍"} {reply.likesCount ?? 0}
                  </button>
                </div>
                <div className="forum-reply__content">
                  {reply.content}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">💬</div>
            <div className="empty-state__title">Aucune réponse pour le moment</div>
            <p className="empty-state__subtitle">Soyez le premier à répondre !</p>
          </div>
        )}
      </div>
    </div>
  );
}
