// ============================================================
// LAUNCHPAD — AcademyPage.jsx  🆕 NOUVELLE PAGE
// Chemin : src/pages/AcademyPage.jsx
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { COURSES } from "../data/mockData";
import "./Academy.css";

const FILTERS = [
  { id: "all",       label: "Tous"        },
  { id: "free",      label: "Gratuit"     },
  { id: "premium",   label: "Premium"     },
  { id: "Cours",     label: "Cours"       },
  { id: "Webinaire", label: "Webinaires"  },
  { id: "Guide PDF", label: "Guides PDF"  },
];

const LEVEL_COLOR = {
  "Débutant":      "badge-success",
  "Intermédiaire": "badge-warning",
  "Avancé":        "badge-danger",
};

function CourseModal({ course, onClose, onEnroll }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal academy-modal" onClick={e => e.stopPropagation()}>
        <div className="academy-modal__cover">{course.icon}</div>
        <div className="modal-body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <span className="badge badge-gray">{course.type}</span>
            <span className={`badge ${LEVEL_COLOR[course.level] || "badge-gray"}`}>{course.level}</span>
            {course.premium && <span className="badge badge-warning">⭐ Premium</span>}
          </div>
          <h2 className="modal-title" style={{ marginBottom: 10 }}>{course.title}</h2>
          <div className="academy-modal__stats">
            <span>⏱️ {course.duration}</span>
            <span>👥 {course.enrolled} inscrits</span>
            <span>⭐ {course.rating}/5</span>
          </div>
          <p className="academy-modal__desc">
            Ce {course.type.toLowerCase()} couvre les aspects essentiels pour les entrepreneurs
            camerounais souhaitant développer leur startup. Conçu par des experts locaux avec
            des exemples concrets du marché africain.
          </p>
          <div className="academy-modal__includes">
            <div className="academy-modal__includes-title">Ce que vous apprendrez :</div>
            {[
              "Concepts fondamentaux appliqués au contexte africain",
              "Exemples concrets du marché camerounais",
              "Outils pratiques et templates téléchargeables",
              "Accès à vie (pour les cours premium)",
            ].map(item => (
              <div key={item} className="academy-modal__includes-item">
                <span>✅</span><span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          <button
            className={`btn ${course.premium ? "btn-warning" : "btn-primary"}`}
            onClick={() => onEnroll(course)}
            style={{ whiteSpace: "normal", wordBreak: "break-word" }}
          >
            {course.premium ? (
              <>⭐ Accès<br />Premium</>
            ) : (
              <>▶️ Commencer<br />gratuitement</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AcademyPage() {
  const { showToast } = useApp();

  const [filter,      setFilter]      = useState("all");
  const [enrolled,    setEnrolled]    = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);

  const filtered = COURSES.filter(c => {
    if (filter === "all")     return true;
    if (filter === "free")    return !c.premium;
    if (filter === "premium") return  c.premium;
    return c.type === filter;
  });

  function handleEnroll(course) {
    if (course.premium) {
      showToast("Abonnement Premium bientôt disponible — restez connecté !", "info");
    } else {
      setEnrolled(prev => [...new Set([...prev, course.id])]);
      showToast(`Inscription à "${course.title}" confirmée !`, "success");
    }
    setActiveCourse(null);
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Launchpad Academy</h1>
          <p className="page-subtitle">Formations pour entrepreneurs camerounais</p>
        </div>
      </div>

      {/* Hero banner */}
      <div className="academy-hero">
        <div className="academy-hero__left">
          <div className="academy-hero__icon">🎓</div>
          <div>
            <div className="academy-hero__title">Formez-vous avec des experts</div>
            <div className="academy-hero__desc">
              Des cours conçus <strong>spécialement pour l'écosystème africain</strong> —
              droit camerounais, paiements Mobile Money, réseau investisseurs locaux.
            </div>
          </div>
        </div>
        <div className="academy-hero__stats">
          {[["15+","Cours"],["3 000+","Apprenants"],["4.8★","Note moy."]].map(([v, l]) => (
            <div key={l} className="academy-hero__stat">
              <div className="academy-hero__stat-val">{v}</div>
              <div className="academy-hero__stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* My progress (if enrolled) */}
      {enrolled.length > 0 && (
        <div className="card academy-progress">
          <div className="section-title" style={{ marginBottom: 14 }}>
            📖 Mes cours en cours ({enrolled.length})
          </div>
          <div className="academy-progress__list">
            {COURSES.filter(c => enrolled.includes(c.id)).map(c => (
              <div key={c.id} className="academy-progress__item">
                <span style={{ fontSize: 24 }}>{c.icon}</span>
                <div className="academy-progress__item-info">
                  <div className="academy-progress__item-title">{c.title}</div>
                  <div className="progress-bar" style={{ marginTop: 6 }}>
                    <div className="progress-bar__fill progress-bar--success"
                      style={{ width: `${Math.floor(Math.random() * 60 + 10)}%` }}
                    />
                  </div>
                </div>
                <button className="btn btn-primary btn-sm">Continuer ▶️</button>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Course grid */}
      <div className="grid-auto">
        {filtered.map(course => (
          <div
            key={course.id}
            className="course-card"
            onClick={() => setActiveCourse(course)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && setActiveCourse(course)}
          >
            <div className="course-card__cover">{course.icon}</div>
            <div className="course-card__body">
              <div className="course-card__badges">
                <span className="badge badge-gray">{course.type}</span>
                <span className={`badge ${LEVEL_COLOR[course.level] || "badge-gray"}`}>
                  {course.level}
                </span>
                {course.premium && <span className="badge badge-warning">⭐ Premium</span>}
                {enrolled.includes(course.id) && (
                  <span className="badge badge-success">✅ Inscrit</span>
                )}
              </div>
              <div className="course-card__title">{course.title}</div>
              <div className="course-card__stats">
                <span>⏱️ {course.duration}</span>
                <span>👥 {course.enrolled}</span>
                <span>⭐ {course.rating}</span>
              </div>
              <button
                className={`btn btn-full btn-sm ${course.premium ? "btn-secondary" : "btn-primary"}`}
                onClick={e => { e.stopPropagation(); setActiveCourse(course); }}
              >
                {enrolled.includes(course.id)
                  ? "▶️ Continuer"
                  : course.premium
                    ? "🔒 Voir le cours"
                    : "▶️ Commencer gratuitement"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon */}
      <div className="academy-coming-soon card">
        <div className="academy-coming-soon__icon">🚀</div>
        <div>
          <div className="academy-coming-soon__title">Prochainement disponible</div>
          <div className="academy-coming-soon__desc">
            Live coding sessions · Mentoring 1-on-1 avec des entrepreneurs camerounais ·
            Certification officielle Launchpad
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeCourse && (
        <CourseModal
          course={activeCourse}
          onClose={() => setActiveCourse(null)}
          onEnroll={handleEnroll}
        />
      )}
    </div>
  );
}