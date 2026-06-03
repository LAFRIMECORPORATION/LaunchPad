// ============================================================
// LAUNCHPAD — BadgesPage.jsx  🆕 NOUVELLE PAGE
// Chemin : src/pages/BadgesPage.jsx
// ============================================================

import { useApp } from "../context/AppContext";
import { BADGES_DATA } from "../data/mockData";
import "./Badges.css";

function getLevel(score) {
  if (score >= 1000) return { label:"Élite",    icon:"🏆", color:"var(--warning)", next:null,  nextPts:null  };
  if (score >= 500)  return { label:"Expert",   icon:"⭐", color:"var(--purple)",  next:"Élite",  nextPts:1000 };
  if (score >= 100)  return { label:"Actif",    icon:"🔥", color:"var(--accent)",  next:"Expert", nextPts:500  };
  return               { label:"Débutant",  icon:"🌱", color:"var(--success)", next:"Actif",  nextPts:100  };
}

export default function BadgesPage() {
  const { currentUser } = useApp();

  const myBadges = BADGES_DATA[currentUser?.role] || BADGES_DATA.student;
  const earned   = myBadges.filter(b => b.earned);
  const score    = earned.reduce((a, b) => a + b.pts, 0);
  const level    = getLevel(score);
  const progress = level.nextPts
    ? Math.min(100, Math.round((score / level.nextPts) * 100))
    : 100;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 Badges & Réputation</h1>
          <p className="page-subtitle">Vos récompenses et votre score de réputation</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="badges-stats">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background:"var(--warning-bg)", color:"var(--warning)" }}>⭐</div>
          <div>
            <div className="stat-card__value">{score}</div>
            <div className="stat-card__label">Score total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background:"var(--accent-light)", color:"var(--accent)" }}>🏆</div>
          <div>
            <div className="stat-card__value">{earned.length}</div>
            <div className="stat-card__label">Badges obtenus</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background:"var(--purple-light)", color:"var(--purple)" }}>🔓</div>
          <div>
            <div className="stat-card__value">{myBadges.length - earned.length}</div>
            <div className="stat-card__label">À débloquer</div>
          </div>
        </div>
      </div>

      {/* Level card */}
      <div className="badges-level-card card">
        <div className="badges-level-card__left">
          <div className="badges-level-card__icon">{level.icon}</div>
          <div>
            <div className="badges-level-card__name" style={{ color: level.color }}>
              Niveau {level.label}
            </div>
            <div className="badges-level-card__score">
              {score} pts · {earned.length} badges obtenus
            </div>
          </div>
        </div>
        {level.nextPts && (
          <div className="badges-level-card__right">
            <div className="badges-level-card__next">
              Prochain niveau : {level.next}
            </div>
            <div className="progress-bar" style={{ width: 160 }}>
              <div className="progress-bar__fill" style={{ width:`${progress}%` }} />
            </div>
            <div className="badges-level-card__pts">
              {score} / {level.nextPts} pts
            </div>
          </div>
        )}
      </div>

      {/* Badge grid */}
      <div className="grid-auto">
        {myBadges.map(badge => (
          <div key={badge.id} className={`badge-card${badge.earned ? " earned" : ""}`}>
            <div className="badge-card__icon">{badge.icon}</div>
            <div className="badge-card__label">{badge.label}</div>
            <div className="badge-card__desc">{badge.desc}</div>
            <div className="badge-card__footer">
              <span className={`badge ${badge.earned ? "badge-primary" : "badge-gray"}`}>
                {badge.earned ? "✅ Obtenu" : "🔒 Verrouillé"}
              </span>
              <span className="badge-card__pts">+{badge.pts} pts</span>
            </div>
            {badge.earned && badge.date && (
              <div className="badge-card__date">📅 {badge.date}</div>
            )}
          </div>
        ))}
      </div>

      {/* Score guide */}
      <div className="card badges-guide">
        <div className="section-title" style={{ marginBottom: 16 }}>
          Comment gagner des points ?
        </div>
        <div className="badges-guide__grid">
          {[
            ["➕","Projet publié",         "+10 pts"],
            ["❤️","Like reçu",             "+1 pt" ],
            ["💬","Commentaire reçu",      "+2 pts" ],
            ["🔁","Partage reçu",          "+3 pts" ],
            ["🤝","Collaboration formée",  "+15 pts"],
            ["💰","Investissement réalisé","+50 pts"],
            ["🏆","Badge obtenu",          "+20 pts"],
            ["💬","Post forum actif",      "+5 pts" ],
          ].map(([ico, lbl, pts]) => (
            <div key={lbl} className="badges-guide__item">
              <span className="badges-guide__item-icon">{ico}</span>
              <span className="badges-guide__item-label">{lbl}</span>
              <span className="badges-guide__item-pts">{pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}