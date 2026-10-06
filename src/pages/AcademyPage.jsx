// ============================================================
// LAUNCHPAD — AcademyPage.jsx  ✅ GESTION MODERNE & APPRENTISSAGE
// Chemin : src/pages/AcademyPage.jsx
// ============================================================

import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { academyApi } from "../utils/api";
import "./Academy.css";

const FILTERS = [
  { id: "all",       label: "Tous" },
  { id: "free",      label: "Gratuit" },
  { id: "premium",   label: "Premium" },
  { id: "Cours",     label: "Cours" },
  { id: "Webinaire", label: "Webinaires" },
  { id: "Guide PDF", label: "Guides PDF" },
];

const LEVEL_COLOR = {
  "Débutant": "badge-success",
  "Intermédiaire": "badge-warning",
  "Avancé": "badge-danger",
};

function getCourseResourceUrl(contentUrl) {
  if (typeof contentUrl !== "string") return null;

  try {
    const url = new URL(contentUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/* ── Modal d'apprentissage interactif (Lecteur de cours) ────── */
function CoursePlayerModal({ course, progress, onUpdateProgress, onClose }) {
  const resourceUrl = getCourseResourceUrl(course.contentUrl);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 800, width: "95%" }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{course.icon} {course.title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Progression */}
          <div style={{ background: "var(--bg-light)", padding: 14, borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
              <span>Progression du cours</span>
              <span style={{ color: "var(--primary)" }}>{progress}% complété</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-bar__fill progress-bar--success" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="card" style={{ padding: 18, background: "var(--bg-card)" }}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 14 }}>
              {course.description}
            </p>
            {resourceUrl ? (
              <a className="btn btn-primary" href={resourceUrl} target="_blank" rel="noreferrer">
                Ouvrir la ressource du cours
              </a>
            ) : (
              <p>La ressource de ce cours n’est pas encore disponible.</p>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          <button
            className="btn btn-success"
            onClick={() => onUpdateProgress(course.id, 100)}
            disabled={progress >= 100}
          >
            {progress >= 100 ? "Formation terminée" : "Marquer la formation comme terminée"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal de détails du cours ──────────────────────────────── */
function CourseModal({ course, onClose, onEnroll }) {
  const resourceUrl = getCourseResourceUrl(course.contentUrl);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal academy-modal" onClick={e => e.stopPropagation()}>
        <div className="academy-modal__cover">{course.icon}</div>
        <div className="modal-body">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <span className="badge badge-gray">{course.courseType}</span>
            <span className={`badge ${LEVEL_COLOR[course.level] || "badge-gray"}`}>{course.level}</span>
            {course.isPremium && <span className="badge badge-warning">⭐ Premium</span>}
          </div>
          <h2 className="modal-title" style={{ marginBottom: 10 }}>{course.title}</h2>
          <div className="academy-modal__stats">
            <span>⏱️ {course.durationMin ? `${course.durationMin} min` : "Durée non précisée"}</span>
            <span>👥 {course.enrollCount} inscrits</span>
            <span>⭐ {Number(course.rating).toFixed(1)}/5</span>
          </div>
          <p className="academy-modal__desc">{course.description}</p>
          {resourceUrl && (
            <a href={resourceUrl} target="_blank" rel="noreferrer">
              Voir la ressource du cours
            </a>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          <button
            className={`btn ${course.isPremium ? "btn-warning" : "btn-primary"}`}
            onClick={() => onEnroll(course)}
          >
            {course.isPremium ? "⭐ Accès Premium" : "▶️ Dérouler la formation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AcademyPage() {
  const { showToast, currentUser, navigate } = useApp();

  const [filter, setFilter]           = useState("all");
  const [courses, setCourses]         = useState([]);
  const [enrolled, setEnrolled]       = useState({});
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState("");
  const [activeCourse, setActiveCourse] = useState(null);
  const [playerCourse, setPlayerCourse] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setLoading(true);
      setLoadError("");
      try {
        const response = await academyApi.listCourses();
        if (!Array.isArray(response?.courses)) {
          throw new Error("Réponse invalide lors du chargement des cours.");
        }
        if (!cancelled) setCourses(response.courses);
      } catch (error) {
        if (!cancelled) setLoadError(error.message || "Impossible de charger les cours.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCourses();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadEnrollments() {
      if (!currentUser?.id) {
        setEnrolled({});
        return;
      }

      try {
        const response = await academyApi.getMyCourses();
        if (!Array.isArray(response)) {
          throw new Error("Réponse invalide lors du chargement de vos cours.");
        }
        if (!cancelled) {
          setEnrolled(Object.fromEntries(
            response.map(({ courseId, progress }) => [courseId, progress]),
          ));
        }
      } catch (error) {
        if (!cancelled) {
          showToast(error.message || "Impossible de charger vos inscriptions.", "error");
        }
      }
    }

    loadEnrollments();
    return () => { cancelled = true; };
  }, [currentUser?.id, showToast]);

  const filtered = courses.filter(c => {
    if (filter === "all") return true;
    if (filter === "free") return !c.isPremium;
    if (filter === "premium") return c.isPremium;
    return c.courseType === filter;
  });

  async function handleEnroll(course) {
    if (!currentUser) {
      showToast("Connectez-vous pour vous inscrire à un cours.", "info");
      navigate("login");
      return;
    }
    if (course.isPremium) {
      showToast("Abonnement Premium bientôt disponible — restez connecté !", "info");
      setActiveCourse(null);
      return;
    }

    try {
      const enrollment = await academyApi.enroll(course.id);
      if (enrollment?.courseId !== course.id) {
        throw new Error("Réponse invalide lors de l’inscription au cours.");
      }
      setEnrolled(prev => ({ ...prev, [course.id]: enrollment.progress }));
      showToast(`Inscription à "${course.title}" confirmée !`, "success");
      setPlayerCourse(course);
    } catch (error) {
      showToast(error.message || "Impossible de vous inscrire à ce cours.", "error");
    }
    setActiveCourse(null);
  }

  async function handleUpdateProgress(courseId, newProg) {
    try {
      const enrollment = await academyApi.updateProgress(courseId, newProg);
      if (enrollment?.courseId !== courseId) {
        throw new Error("Réponse invalide lors de la mise à jour de la progression.");
      }
      setEnrolled(prev => ({ ...prev, [courseId]: enrollment.progress }));
      showToast("Formation terminée. Progression enregistrée.", "success");
      setPlayerCourse(null);
    } catch (error) {
      showToast(error.message || "Impossible d’enregistrer votre progression.", "error");
    }
  }

  const enrolledCourseIds = Object.keys(enrolled);
  const averageRating = courses.length
    ? (courses.reduce((sum, course) => sum + Number(course.rating || 0), 0) / courses.length).toFixed(1)
    : "—";

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Launchpad Academy</h1>
          <p className="page-subtitle">Formations interactives pour entrepreneurs et investisseurs camerounais</p>
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
              droit camerounais, paiements Mobile Money, levées de fonds CEMAC.
            </div>
          </div>
        </div>
        <div className="academy-hero__stats">
          {[[courses.length, "Cours"], [courses.reduce((sum, course) => sum + (course.enrollCount || 0), 0), "Inscriptions"], [`${averageRating}★`, "Note moy."]].map(([v, l]) => (
            <div key={l} className="academy-hero__stat">
              <div className="academy-hero__stat-val">{v}</div>
              <div className="academy-hero__stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mes cours en cours */}
      {enrolledCourseIds.length > 0 && (
        <div className="card academy-progress" style={{ marginBottom: 24, padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 14 }}>
            📖 Mes cours en cours ({enrolledCourseIds.length})
          </div>
          <div className="academy-progress__list" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {courses.filter(c => enrolledCourseIds.includes(c.id)).map(c => {
              const prog = enrolled[c.id] || 0;
              return (
                <div key={c.id} className="academy-progress__item" style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, border: "1px solid var(--border)", borderRadius: "var(--r-md)" }}>
                  <span style={{ fontSize: 28 }}>{c.icon}</span>
                  <div className="academy-progress__item-info" style={{ flex: 1 }}>
                    <div className="academy-progress__item-title" style={{ fontWeight: 700 }}>{c.title}</div>
                    <div className="progress-bar" style={{ marginTop: 6, height: 6 }}>
                      <div className="progress-bar__fill progress-bar--success" style={{ width: `${prog}%` }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{prog}%</span>
                  <button className="btn btn-primary btn-sm" onClick={() => setPlayerCourse(c)}>
                    Continuer ▶️
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
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
        {loading ? <p>Chargement des cours…</p> : loadError ? <p role="alert">{loadError}</p> : filtered.length === 0 ? <p>Aucun cours disponible pour ce filtre.</p> : filtered.map(course => {
          const isEnrolled = enrolledCourseIds.includes(course.id);
          const prog = enrolled[course.id] || 0;
          return (
            <div
              key={course.id}
              className="course-card"
              onClick={() => isEnrolled ? setPlayerCourse(course) : setActiveCourse(course)}
              role="button"
              tabIndex={0}
            >
              <div className="course-card__cover">{course.icon}</div>
              <div className="course-card__body">
                <div className="course-card__badges">
                  <span className="badge badge-gray">{course.courseType}</span>
                  <span className={`badge ${LEVEL_COLOR[course.level] || "badge-gray"}`}>
                    {course.level}
                  </span>
                  {course.isPremium && <span className="badge badge-warning">⭐ Premium</span>}
                  {isEnrolled && (
                    <span className="badge badge-success">✅ {prog}%</span>
                  )}
                </div>
                <div className="course-card__title">{course.title}</div>
                <div className="course-card__stats">
                  <span>⏱️ {course.durationMin ? `${course.durationMin} min` : "—"}</span>
                  <span>👥 {course.enrollCount}</span>
                  <span>⭐ {Number(course.rating).toFixed(1)}</span>
                </div>
                <button
                  className={`btn btn-full btn-sm ${course.isPremium ? "btn-secondary" : "btn-primary"}`}
                  onClick={e => {
                    e.stopPropagation();
                    if (isEnrolled) setPlayerCourse(course);
                    else setActiveCourse(course);
                  }}
                >
                  {isEnrolled ? "▶️ Continuer la leçon" : course.isPremium ? "🔒 Aperçu Premium" : "▶️ Commencer le cours"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Détails */}
      {activeCourse && (
        <CourseModal
          course={activeCourse}
          onClose={() => setActiveCourse(null)}
          onEnroll={handleEnroll}
        />
      )}

      {/* Modal Lecteur de cours */}
      {playerCourse && (
        <CoursePlayerModal
          course={playerCourse}
          progress={enrolled[playerCourse.id] || 0}
          onUpdateProgress={handleUpdateProgress}
          onClose={() => setPlayerCourse(null)}
        />
      )}
    </div>
  );
}