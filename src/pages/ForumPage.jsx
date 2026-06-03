// ============================================================
// LAUNCHPAD — ForumPage.jsx  🆕 NOUVELLE PAGE
// Chemin : src/pages/ForumPage.jsx
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Avatar } from "../components/UI";
import { FORUM_POSTS } from "../data/mockData";
import "./Forum.css";

const CATEGORIES = [
  { id:"all",         label:"Tous"         },
  { id:"FinTech",     label:"FinTech"      },
  { id:"AgriTech",    label:"AgriTech"     },
  { id:"GreenTech",   label:"GreenTech"    },
  { id:"IA & ML",     label:"IA & ML"      },
  { id:"Conseils",    label:"Conseils"     },
  { id:"Annonces",    label:"Annonces"     },
  { id:"Événements",  label:"Événements"   },
];

function NewPostModal({ onClose, onSubmit }) {
  const [title, setTitle]   = useState("");
  const [body, setBody]     = useState("");
  const [cat, setCat]       = useState("Conseils");

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
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button
            className="btn btn-primary"
            disabled={!title.trim() || !body.trim()}
            onClick={() => onSubmit({ title, body, cat })}
          >
            Publier le sujet
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ForumPage() {
  const { showToast } = useApp();

  const [cat,      setCat]      = useState("all");
  const [liked,    setLiked]    = useState({});
  const [posts,    setPosts]    = useState(FORUM_POSTS);
  const [showModal, setShowModal] = useState(false);

  const filtered = cat === "all" ? posts : posts.filter(p => p.cat === cat);

  function handleNewPost({ title, body, cat: c }) {
    const newPost = {
      id: Date.now(),
      cat: c,
      title,
      author: "Moi",
      avatar: "AL",
      date: "À l'instant",
      replies: 0,
      likes: 0,
      pinned: false,
    };
    setPosts(prev => [newPost, ...prev]);
    setShowModal(false);
    showToast("Sujet publié avec succès !", "success");
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
          ["💬", posts.length, "Sujets actifs"],
          ["👥", "2 418",       "Membres"],
          ["📝", "486",         "Réponses ce mois"],
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

      {/* Posts */}
      <div className="forum-posts-list">
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">💬</div>
            <div className="empty-state__title">Aucun sujet dans cette catégorie</div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Soyez le premier à publier
            </button>
          </div>
        )}

        {filtered.map(post => (
          <div key={post.id} className={`forum-post card${post.pinned ? " pinned" : ""}`}>
            <div className="forum-post__header">
              <Avatar label={post.avatar} size="md" />
              <div className="forum-post__body">
                <div className="forum-post__badges">
                  {post.pinned && <span className="badge badge-primary">📌 Épinglé</span>}
                  <span className="badge badge-gray">{post.cat}</span>
                </div>
                <div className="forum-post__title">{post.title}</div>
                <div className="forum-post__meta">{post.author} · {post.date}</div>
              </div>
              <div className="forum-post__stats">
                <span>💬 {post.replies}</span>
                <button
                  className={`feed-action-btn${liked[post.id] ? " liked" : ""}`}
                  onClick={e => { e.stopPropagation(); setLiked(l => ({ ...l, [post.id]: !l[post.id] })); }}
                >
                  {liked[post.id] ? "❤️" : "🤍"} {post.likes + (liked[post.id] ? 1 : 0)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <NewPostModal onClose={() => setShowModal(false)} onSubmit={handleNewPost} />
      )}
    </div>
  );
}