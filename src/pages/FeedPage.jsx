// ============================================================
// LAUNCHPAD — FeedPage.jsx  🆕 NOUVELLE PAGE
// Chemin : src/pages/FeedPage.jsx
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Avatar } from "../components/UI";
import { FEED_ITEMS } from "../data/mockData";
import "./Feed.css";

const FILTERS = [
  { id:"all",         label:"Tous"          },
  { id:"project",     label:"Projets"       },
  { id:"funded",      label:"Financements"  },
  { id:"collab",      label:"Collaborations"},
  { id:"badge",       label:"Badges"        },
  { id:"marketplace", label:"Marketplace"   },
  { id:"academy",     label:"Academy"       },
];

export default function FeedPage() {
  const { navigate } = useApp();
  const [filter, setFilter]   = useState("all");
  const [liked,  setLiked]    = useState({});

  const items = filter === "all"
    ? FEED_ITEMS
    : FEED_ITEMS.filter(f => f.type === filter);

  const toggleLike = (id) =>
    setLiked(l => ({ ...l, [id]: !l[id] }));

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📰 Feed d'actualités</h1>
          <p className="page-subtitle">Ce qui se passe dans l'écosystème startup camerounais</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`filter-tab${filter === f.id ? " active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed list */}
      <div className="feed-list">
        {items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <div className="empty-state__title">Aucun événement dans cette catégorie</div>
          </div>
        )}

        {items.map(item => (
          <div key={item.id} className="feed-item">
            {/* Header */}
            <div className="feed-item__header">
              <div className="feed-item__icon">{item.icon}</div>
              <div className="feed-item__meta">
                <div className="feed-item__text">
                  <strong>{item.actor}</strong>{" "}
                  {item.action}{" "}
                  {item.target && (
                    <span className="highlight">{item.target}</span>
                  )}
                </div>
                <div className="feed-item__time">
                  {item.time}
                  {item.category && (
                    <span className="badge badge-gray" style={{ marginLeft: 8 }}>
                      {item.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            {item.desc && (
              <div className="feed-item__body">{item.desc}</div>
            )}

            {/* Actions */}
            <div className="feed-item__actions">
              <button
                className={`feed-action-btn${liked[item.id] ? " liked" : ""}`}
                onClick={() => toggleLike(item.id)}
              >
                {liked[item.id] ? "❤️" : "🤍"}
                <span>{item.likes + (liked[item.id] ? 1 : 0)}</span>
              </button>

              <button className="feed-action-btn">
                💬 <span>{item.comments}</span>
              </button>

              <button className="feed-action-btn" style={{ marginLeft: "auto" }}>
                ↗️ Partager
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}