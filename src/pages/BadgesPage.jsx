// ============================================================
// LAUNCHPAD — BadgesPage.jsx  ✅ BRANCHÉ SUR L'API RÉELLE
// Chemin : src/pages/BadgesPage.jsx
// ============================================================

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { badgesApi } from "../utils/api";
import "./Badges.css";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (d === 0) return "Aujourd'hui";
  if (d === 1) return "Hier";
  if (d < 30)  return `Il y a ${d}j`;
  const m = Math.floor(d / 30);
  return `Il y a ${m} mois`;
}

function getRankLabel(score) {
  if (score >= 200) return { label: "🏆 Légende",    color: "#FFD700" };
  if (score >= 100) return { label: "💎 Expert",     color: "#5B73F5" };
  if (score >= 50)  return { label: "🔥 Actif",      color: "#FF6600" };
  if (score >= 20)  return { label: "⭐ Membre",     color: "#22C55E" };
  return               { label: "🌱 Débutant",  color: "#94A3B8" };
}

export default function BadgesPage() {
  const { currentUser, navigate } = useApp();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState("all"); // all | earned | locked

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await badgesApi.getMine();
        if (!cancelled) setData(res.data || res);
      } catch (err) {
        if (!cancelled) setError(err.message || "Erreur lors du chargement des badges.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-state">
          <div className="spinner" />
          <div className="loading-state__title">Chargement de vos badges…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <div className="empty-state__icon">❌</div>
          <div className="empty-state__title">{error}</div>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  const earned  = (data?.badges || []).map(b => ({
    badgeKey: b.badgeType,
    id: b.id,
    label: b.badgeLabel,
    icon: b.badgeIcon,
    points: b.pointsAwarded,
    awardedAt: b.awardedAt,
    locked: false,
  }));

  const locked  = (data?.lockedBadges || []).map(b => ({
    badgeKey: b.badgeType,
    id: `locked-${b.badgeType}`,
    label: b.badgeLabel,
    icon: b.badgeIcon,
    points: b.points,
    awardedAt: null,
    locked: true,
  }));

  const score   = data?.reputationScore || 0;
  const rank    = getRankLabel(score);

  const displayed =
    filter === "earned" ? earned :
    filter === "locked" ? locked :
    [...earned, ...locked];

  return (
    <div className="page-wrapper">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏅 Badges & Réputation</h1>
          <p className="page-subtitle">Vos accomplissements sur la plateforme Launchpad</p>
        </div>
      </div>

      {/* Score card */}
      <div className="badge-score-card card">
        <div className="badge-score-card__left">
          <div className="badge-score-card__score" style={{ color: rank.color }}>
            {score}
          </div>
          <div className="badge-score-card__label">points de réputation</div>
        </div>
        <div className="badge-score-card__center">
          <div className="badge-score-card__rank" style={{ color: rank.color }}>
            {rank.label}
          </div>
          <div className="badge-score-card__progress-wrap">
            <div
              className="badge-score-card__progress-bar"
              style={{
                width: `${Math.min(100, (score % 100))}%`,
                background: rank.color,
              }}
            />
          </div>
          <div className="badge-score-card__hint">
            {earned.length} badge{earned.length > 1 ? "s" : ""} obtenus · {locked.length} à débloquer
          </div>
        </div>
        <div className="badge-score-card__right">
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>Nom</div>
          <div style={{ fontWeight: 700 }}>{currentUser?.firstName} {currentUser?.lastName}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, textTransform: "capitalize" }}>
            {currentUser?.role}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {[
          ["all",    `Tous (${earned.length + locked.length})`],
          ["earned", `Obtenus (${earned.length})`],
          ["locked", `À débloquer (${locked.length})`],
        ].map(([id, label]) => (
          <button
            key={id}
            className={`filter-tab${filter === id ? " active" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      {displayed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🏅</div>
          <div className="empty-state__title">
            {filter === "earned" ? "Aucun badge obtenu pour l'instant" : "Tous les badges sont débloqués !"}
          </div>
          {filter === "earned" && (
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "8px 0 16px" }}>
              Commencez à utiliser la plateforme pour gagner vos premiers badges.
            </p>
          )}
          <button className="btn btn-primary" onClick={() => navigate("explore")}>
            Explorer les projets
          </button>
        </div>
      ) : (
        <div className="badges-grid">
          {displayed.map((badge) => {
            const isLocked = !!badge.locked;
            return (
              <div
                key={badge.badgeKey || badge.id}
                className={`badge-card card${isLocked ? " locked" : " earned"}`}
              >
                <div className="badge-card__icon">
                  {isLocked ? "🔒" : badge.icon}
                </div>
                <div className="badge-card__name">
                  {isLocked ? <span style={{ filter: "blur(3px)" }}>{badge.label}</span> : badge.label}
                </div>
                <div className="badge-card__points">
                  +{badge.points} pts
                </div>
                {!isLocked && badge.awardedAt && (
                  <div className="badge-card__date">
                    {timeAgo(badge.awardedAt)}
                  </div>
                )}
                {isLocked && (
                  <div className="badge-card__locked-hint">
                    Continuez à utiliser Launchpad pour débloquer ce badge
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}