// ============================================================
// LAUNCHPAD — ForumPage.jsx  ✅ BRANCHÉ SUR L'API RÉELLE
// Chemin : src/pages/ForumPage.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Avatar } from "../components/UI";
import { forumApi } from "../utils/api";
import "./Forum.css";

const CATEGORIES = [
  { id: "all",            label: "Tous"          },
  { id: "general",        label: "Général"       },
  { id: "financement",    label: "Financement"   },
  { id: "juridique",      label: "Juridique"     },
  { id: "tech",           label: "Tech"          },
  { id: "marketing",      label: "Marketing"     },
  { id: "success-stories",label: "Success Stories"},
  { id: "questions",      label: "Questions"     },
  { id: "annonces",       label: "Annonces"      },
];

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
  if (min < 1)   return "À l'instant";
  if (min < 60)  return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24)    return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7)     return `Il y a ${d}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

/* ── Modal : nouveau post ──────────────────────────────────── */
function NewPostModal({ onClose, onSubmit, submitting }) {
  const [title, setTitle] = useState("");
  const [body,  setBody]  = useState("");
  const [cat,   setCat]   = useState("general");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">💬 Nouveau sujet</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Catégorie</label>
            <select className="form-input form-select" value={cat} onChange={e => setCat(e.target.value)}>
              {CATEGORIES.filter(c => c.id !== "all").map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Titre <span className="req">*</span></label>
            <input
              className="form-input"
              placeholder="Ex : Comment structurer son cap table pour un premier tour ?"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Message <span className="req">*</span></label>
            <textarea
              className="form-input forum-textarea"
              placeholder="Partagez votre question, expérience ou ressource…"
              rows={5}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Annuler</button>
          <button
            className="btn btn-primary"
            disabled={!title.trim() || !body.trim() || submitting}
            onClick={() => onSubmit({ title: title.trim(), content: body.trim(), category: cat })}
          >
            {submitting ? "Publication…" : "Publier le sujet"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForumPage() {
  const { showToast, navigate } = useApp();

  const [cat,        setCat]        = useState("all");
  const [posts,       setPosts]      = useState([]);
  const [total,       setTotal]      = useState(0);
  const [loading,     setLoading]    = useState(true);
  const [showModal,   setShowModal]  = useState(false);
  const [submitting,  setSubmitting] = useState(false);
  const [likingId,    setLikingId]   = useState(null);

  const loadPosts = useCallback(async (category) => {
    setLoading(true);
    try {
      const res = await forumApi.getPosts({
        category: category === "all" ? undefined : category,
        sort: "recent",
        page: 1,
        limit: 30,
      });
      const data = res.data || res;
      setPosts(data.posts || []);
      setTotal(data.total ?? (data.posts || []).length);
    } catch (err) {
      showToast(err.message || "Erreur lors du chargement du forum.", "error");
      setPosts([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadPosts(cat); }, [cat, loadPosts]);

  async function handleNewPost({ title, content, category }) {
    setSubmitting(true);
    try {
      const res = await forumApi.createPost({ title, content, category });
      const newPost = res.data || res;
      setPosts(prev => [newPost, ...prev]);
      setTotal(t => t + 1);
      setShowModal(false);
      showToast("Sujet publié avec succès !", "success");
    } catch (err) {
      showToast(err.message || "Erreur lors de la publication.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(postId) {
    if (likingId === postId) return;
    setLikingId(postId);

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const alreadyLiked = !!(p.likes && p.likes.length > 0);
      return {
        ...p,
        likes: alreadyLiked ? [] : [{ userId: "me" }],
        likesCount: alreadyLiked ? Math.max(0, (p.likesCount || 0) - 1) : (p.likesCount || 0) + 1,
      };
    }));

    try {
      const res = await forumApi.like(postId);
      const data = res.data || res;
      setPosts(prev => prev.map(p => p.id !== postId ? p : {
        ...p,
        likesCount: data.likesCount,
        likes: data.liked ? [{ userId: "me" }] : [],
      }));
    } catch (err) {
      showToast(err.message || "Erreur lors du like.", "error");
      loadPosts(cat);
    } finally {
      setLikingId(null);
    }
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">💬 Forum Communauté</h1>
          <p className="page-subtitle">Échanges et ressources pour l'écosystème startup camerounais</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Nouveau sujet
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="forum-stats">
        {[
          ["💬", total, "Sujets actifs"],
          ["📂", CATEGORIES.length - 1, "Catégories"],
        ].map(([ico, val, lbl]) => (
          <div key={lbl} className="forum-stat">
            <span className="forum-stat__icon">{ico}</span>
            <span className="forum-stat__val">{val}</span>
            <span className="forum-stat__lbl">{lbl}</span>
          </div>
        ))}
      </div>

      {/* Category filters */}
      <div className="filter-tabs">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`filter-tab${cat === c.id ? " active" : ""}`}
            onClick={() => setCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <div className="loading-state__title">Chargement des sujets…</div>
        </div>
      )}

      {/* Posts */}
      {!loading && (
        <div className="forum-posts-list">
          {posts.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">💬</div>
              <div className="empty-state__title">Aucun sujet dans cette catégorie</div>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Soyez le premier à publier
              </button>
            </div>
          )}

          {posts.map(post => {
            const isLiked = !!(post.likes && post.likes.length > 0);
            return (
              <div
                key={post.id}
                className={`forum-post card${post.isPinned ? " pinned" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => navigate("forum-post", { postId: post.id })}
              >
                <div className="forum-post__header">
                  <Avatar label={authorInitials(post.author)} size="md" />
                  <div className="forum-post__body">
                    <div className="forum-post__badges">
                      {post.isPinned && <span className="badge badge-primary">📌 Épinglé</span>}
                      <span className="badge badge-gray">
                        {CATEGORIES.find(c => c.id === post.category)?.label || post.category}
                      </span>
                    </div>
                    <div className="forum-post__title">{post.title}</div>
                    <div className="forum-post__meta">
                      {authorName(post.author)} · {timeAgo(post.createdAt)}
                    </div>
                  </div>
                  <div className="forum-post__stats">
                    <span>💬 {post.repliesCount ?? 0}</span>
                    <button
                      className={`feed-action-btn${isLiked ? " liked" : ""}`}
                      disabled={likingId === post.id}
                      onClick={e => { e.stopPropagation(); handleLike(post.id); }}
                    >
                      {isLiked ? "❤️" : "🤍"} {post.likesCount ?? 0}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <NewPostModal
          onClose={() => !submitting && setShowModal(false)}
          onSubmit={handleNewPost}
          submitting={submitting}
        />
      )}
    </div>
  );
}