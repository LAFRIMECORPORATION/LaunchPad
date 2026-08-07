// ============================================================
// LAUNCHPAD — FeedPage.jsx  ✅ BRANCHÉ SUR L'API RÉELLE
// Chemin : src/pages/FeedPage.jsx
// ============================================================

import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "../context/AppContext";
import { Avatar } from "../components/UI";
import { feedApi } from "../utils/api";
import "./Feed.css";

const FILTERS = [
  { id: "all",            label: "Tout"           },
  { id: "projects",       label: "🚀 Projets"     },
  { id: "investments",    label: "💰 Investissements"},
  { id: "forum",          label: "💬 Forum"        },
  { id: "collaborations", label: "🤝 Collaborations"},
  { id: "badges",         label: "🏅 Badges"       },
];

// Mapping type d'événement → emoji + label lisible
const EVENT_CONFIG = {
  project_published:           { icon: "🚀", label: "a publié un projet" },
  project_approved:            { icon: "✅", label: "a approuvé le projet" },
  project_rejected:            { icon: "⚠️", label: "a rejeté le projet" },
  project_removed:             { icon: "🗑️", label: "a retiré le projet" },
  project_funded:              { icon: "🏆", label: "a financé un projet" },
  investment_made:             { icon: "💰", label: "a investi dans" },
  forum_post:                  { icon: "💬", label: "a posté dans le forum" },
  collaboration_requested:     { icon: "🤝", label: "a demandé une collaboration" },
  collaboration_accepted:      { icon: "✅", label: "a accepté une collaboration" },
  badge_awarded:               { icon: "🏅", label: "a obtenu un badge" },
  investor_request_published:  { icon: "📢", label: "a publié une offre d'investissement" },
};

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

function actorInitials(actor) {
  if (!actor) return "??";
  return `${(actor.firstName || "?")[0]}${(actor.lastName || "?")[0]}`.toUpperCase();
}

function actorName(actor) {
  if (!actor) return "Quelqu'un";
  return `${actor.firstName || ""} ${actor.lastName || ""}`.trim();
}

function EventCard({ event, navigate, currentUser }) {
  const cfg = EVENT_CONFIG[event.eventType] || { icon: "📌", label: event.eventType };
  const meta = event.metadata || {};
  const isOwnPublication = event.eventType === "project_published" && event.actor?.id === currentUser?.id;
  const label = isOwnPublication ? "avez publié un projet" : cfg.label;
  const isModerationEvent = ["project_approved", "project_rejected", "project_removed"].includes(event.eventType);

  return (
    <div className="feed-event-card card">
      <div className="feed-event-card__header">
        <Avatar label={actorInitials(event.actor)} size="md" />
        <div className="feed-event-card__info">
          <div className="feed-event-card__title">
            <strong>{actorName(event.actor)}</strong>{" "}
            <span style={{ color: "var(--text-secondary)" }}>{label}</span>{" "}
            {event.project && (
              <strong
                style={{ color: "var(--accent)", cursor: "pointer" }}
                onClick={() => navigate("project-detail", { project: event.project })}
              >
                {event.project.title}
              </strong>
            )}
            {meta.title && !event.project && (
              <strong>"{meta.title}"</strong>
            )}
          </div>
          <div className="feed-event-card__meta">
            {cfg.icon} · {timeAgo(event.createdAt)}
          </div>
        </div>
      </div>

      {/* Détails selon le type */}
      {event.eventType === "investment_made" && meta.amount && (
        <div className="feed-event-card__detail">
          💰 {Number(meta.amount).toLocaleString("fr-FR")} XAF investis
          {meta.provider && <span style={{ color: "var(--text-muted)" }}> via {meta.provider.toUpperCase()}</span>}
        </div>
      )}

      {event.eventType === "badge_awarded" && meta.label && (
        <div className="feed-event-card__detail">
          🏅 Badge obtenu : <strong>{meta.label}</strong>
          {meta.points && <span style={{ color: "var(--text-muted)" }}> (+{meta.points} pts)</span>}
        </div>
      )}

      {event.project && !isModerationEvent && (
        <div className="feed-event-card__project">
          <span className="badge badge-gray">{event.project.category}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("project-detail", { project: event.project })}
          >
            Voir le projet →
          </button>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { navigate, currentUser } = useApp();

  const [filter,   setFilter]   = useState("all");
  const [events,   setEvents]   = useState([]);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,    setError]    = useState(null);

  const LIMIT = 20;
  const hasMore = events.length < total;

  const loadFeed = useCallback(async (currentFilter, currentPage, append = false) => {
    if (append) setLoadingMore(true);
    else        setLoading(true);
    setError(null);

    try {
      const res  = await feedApi.get({ filter: currentFilter, page: currentPage, limit: LIMIT });
      const data = res.data || res;
      const newEvents = data.events || [];

      setEvents(prev => append ? [...prev, ...newEvents] : newEvents);
      setTotal(data.total ?? newEvents.length);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement du fil d'actualités.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset et rechargement quand le filtre change
  useEffect(() => {
    setPage(1);
    setEvents([]);
    loadFeed(filter, 1, false);
  }, [filter, loadFeed]);

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    loadFeed(filter, nextPage, true);
  }

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📰 Fil d'actualités</h1>
          <p className="page-subtitle">Les dernières activités de la communauté Launchpad</p>
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

      {/* Loading initial */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <div className="loading-state__title">Chargement du fil…</div>
        </div>
      )}

      {/* Erreur */}
      {error && !loading && (
        <div className="empty-state">
          <div className="empty-state__icon">❌</div>
          <div className="empty-state__title">{error}</div>
          <button className="btn btn-primary" onClick={() => loadFeed(filter, 1, false)}>
            Réessayer
          </button>
        </div>
      )}

      {/* Events */}
      {!loading && !error && (
        <>
          {events.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">📰</div>
              <div className="empty-state__title">Aucune activité dans cette catégorie</div>
              <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 0 16px" }}>
                Revenez plus tard ou explorez d'autres sections de la plateforme.
              </p>
              <button className="btn btn-primary" onClick={() => navigate("explore")}>
                Explorer les projets
              </button>
            </div>
          ) : (
            <div className="feed-list">
              {events.map(event => (
                <EventCard key={event.id} event={event} navigate={navigate} currentUser={currentUser} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <button
                className="btn btn-secondary"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Chargement…" : "Charger plus"}
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}