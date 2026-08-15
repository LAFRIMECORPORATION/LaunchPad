// ============================================================
// LAUNCHPAD — AcademyPage.jsx  ✅ GESTION MODERNE & APPRENTISSAGE
// Chemin : src/pages/AcademyPage.jsx
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { COURSES } from "../data/courses";
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

/* ── Modal d'apprentissage interactif (Lecteur de cours) ────── */
function CoursePlayerModal({ course, progress, onUpdateProgress, onClose }) {
  const [currentModule, setCurrentModule] = useState(0);

  const modules = [
    { title: "Module 1 : Introduction & Fondations", duration: "15 min", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", desc: "Comprendre les spécificités du marché africain et poser les bases solides de votre projet." },
    { title: "Module 2 : Stratégie & Modèle Économique", duration: "25 min", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", desc: "Définir votre stratégie de monétisation, adapter vos prix en XAF et valider votre traction." },
    { title: "Module 3 : Aspect Légal & Levée de Fonds", duration: "30 min", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", desc: "Structure juridique OHADA, pacte d'actionnaires et préparation des pitch decks pour investisseurs." },
  ];

  const currentMod = modules[currentModule];
  const isLast = currentModule === modules.length - 1;

  function handleCompleteModule() {
    const nextProg = Math.min(100, Math.round(((currentModule + 1) / modules.length) * 100));
    onUpdateProgress(course.id, nextProg);
    if (!isLast) {
      setCurrentModule(prev => prev + 1);
    }
  }

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

          {/* Sommaire des modules */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {modules.map((m, idx) => (
              <button
                key={m.title}
                className={`btn btn-sm ${currentModule === idx ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setCurrentModule(idx)}
                style={{ whiteSpace: "nowrap" }}
              >
                {idx + 1}. {m.title.split(":")[0]}
              </button>
            ))}
          </div>

          {/* Module actif */}
          <div className="card" style={{ padding: 18, background: "var(--bg-card)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{currentMod.title}</h3>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 14 }}>{currentMod.desc}</p>
            <div style={{ aspectRatio: "16/9", background: "#000", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18 }}>
              📺 [Vidéo du cours - {currentMod.title}]
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: "space-between" }}>
          <button className="btn btn-secondary" onClick={onClose}>Fermer</button>
          <button className="btn btn-success" onClick={handleCompleteModule}>
            {isLast ? "🏆 Terminer la formation" : "✅ Valider et passer au module suivant →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal de détails du cours ──────────────────────────────── */
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
              "Accès aux sessions de mentoring en direct",
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
          >
            {course.premium ? "⭐ Accès Premium" : "▶️ Dérouler la formation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AcademyPage() {
  const { showToast } = useApp();

  const [filter, setFilter]           = useState("all");
  const [enrolled, setEnrolled]       = useState({}); // { courseId: progressPct }
  const [activeCourse, setActiveCourse] = useState(null);
  const [playerCourse, setPlayerCourse] = useState(null);

  const filtered = COURSES.filter(c => {
    if (filter === "all") return true;
    if (filter === "free") return !c.premium;
    if (filter === "premium") return c.premium;
    return c.type === filter;
  });

  function handleEnroll(course) {
    if (course.premium) {
      showToast("Abonnement Premium bientôt disponible — restez connecté !", "info");
    } else {
      setEnrolled(prev => ({ ...prev, [course.id]: prev[course.id] || 10 }));
      showToast(`Inscription à "${course.title}" confirmée !`, "success");
      setPlayerCourse(course);
    }
    setActiveCourse(null);
  }

  function handleUpdateProgress(courseId, newProg) {
    setEnrolled(prev => ({ ...prev, [courseId]: newProg }));
    if (newProg >= 100) {
      showToast("🎉 Félicitations ! Formation terminée. +50 points de réputation attribués !", "success");
    } else {
      showToast(`Progression mise à jour : ${newProg}%`, "info");
    }
  }

  const enrolledCourseIds = Object.keys(enrolled);

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
          {[["15+", "Cours"], ["3 000+", "Apprenants"], ["4.8★", "Note moy."]].map(([v, l]) => (
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
            {COURSES.filter(c => enrolledCourseIds.includes(c.id)).map(c => {
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
        {filtered.map(course => {
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
                  <span className="badge badge-gray">{course.type}</span>
                  <span className={`badge ${LEVEL_COLOR[course.level] || "badge-gray"}`}>
                    {course.level}
                  </span>
                  {course.premium && <span className="badge badge-warning">⭐ Premium</span>}
                  {isEnrolled && (
                    <span className="badge badge-success">✅ {prog}%</span>
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
                  onClick={e => {
                    e.stopPropagation();
                    if (isEnrolled) setPlayerCourse(course);
                    else setActiveCourse(course);
                  }}
                >
                  {isEnrolled ? "▶️ Continuer la leçon" : course.premium ? "🔒 Aperçu Premium" : "▶️ Commencer le cours"}
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
          progress={enrolled[playerCourse.id] || 10}
          onUpdateProgress={handleUpdateProgress}
          onClose={() => setPlayerCourse(null)}
        />
      )}
    </div>
  );
}