import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi } from "../utils/api";
import { useApp } from "../context/AppContext";
import "./AcademyAdminPanel.css";

// This editor is isolated from the dashboard so every CRUD action refreshes one source of truth.
const EMPTY_COURSE = {
  title: "",
  description: "",
  courseType: "Cours",
  contentUrl: "",
  isPremium: false,
  durationMin: "",
  level: "Débutant",
  icon: "📚",
  published: false,
};

function courseToForm(course) {
  return {
    title: course.title || "",
    description: course.description || "",
    courseType: course.courseType || "Cours",
    contentUrl: course.contentUrl || "",
    isPremium: Boolean(course.isPremium),
    durationMin: course.durationMin ?? "",
    level: course.level || "Débutant",
    icon: course.icon || "📚",
    published: Boolean(course.published),
  };
}

export default function AcademyAdminPanel() {
  const { showToast } = useApp();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState(0);
  const [form, setForm] = useState(EMPTY_COURSE);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.getAcademyCourses();
      if (!Array.isArray(response?.courses)) {
        throw new Error("La réponse du serveur ne contient pas de liste de cours.");
      }
      setCourses(response.courses);
      setEnrollments(response.enrollments || 0);
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger le catalogue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialCatalog() {
      try {
        const response = await adminApi.getAcademyCourses();
        if (!Array.isArray(response?.courses)) {
          throw new Error("La réponse du serveur ne contient pas de liste de cours.");
        }
        if (!cancelled) {
          setCourses(response.courses);
          setEnrollments(response.enrollments || 0);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Impossible de charger le catalogue.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitialCatalog();
    return () => { cancelled = true; };
  }, []);

  const visibleCourses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    if (!query) return courses;
    return courses.filter((course) =>
      `${course.title} ${course.courseType} ${course.level}`
        .toLocaleLowerCase("fr")
        .includes(query),
    );
  }, [courses, search]);

  function resetForm() {
    setForm(EMPTY_COURSE);
    setEditingId(null);
  }

  function editCourse(course) {
    setForm(courseToForm(course));
    setEditingId(course.id);
    document.getElementById("academy-course-editor")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function saveCourse(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        contentUrl: form.contentUrl.trim() || null,
        durationMin: form.durationMin === "" ? null : Number(form.durationMin),
      };
      if (editingId) {
        await adminApi.updateAcademyCourse(editingId, payload);
        showToast("Cours mis à jour.", "success");
      } else {
        await adminApi.createAcademyCourse(payload);
        showToast(form.published ? "Cours publié." : "Brouillon enregistré.", "success");
      }
      resetForm();
      await loadCourses();
    } catch (saveError) {
      showToast(saveError.message || "Impossible d'enregistrer le cours.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublication(course) {
    try {
      await adminApi.updateAcademyCourse(course.id, { published: !course.published });
      showToast(course.published ? "Cours remis en brouillon." : "Cours publié.", "success");
      await loadCourses();
    } catch (publishError) {
      showToast(publishError.message || "Impossible de modifier la publication.", "error");
    }
  }

  async function deleteCourse(course) {
    if (!window.confirm(`Supprimer « ${course.title} » et ses inscriptions/commentaires ?`)) return;
    try {
      await adminApi.deleteAcademyCourse(course.id);
      if (editingId === course.id) resetForm();
      showToast("Cours supprimé.", "success");
      await loadCourses();
    } catch (deleteError) {
      showToast(deleteError.message || "Impossible de supprimer le cours.", "error");
    }
  }

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <section className="academy-admin">
      <header className="academy-admin__header">
        <div>
          <span className="academy-admin__eyebrow">ESPACE ADMINISTRATEUR</span>
          <h2>Gestion de l’Academy</h2>
          <p>Crée tes formations, prépare-les en brouillon et publie-les quand elles sont prêtes.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={loadCourses} disabled={loading}>
          {loading ? "Actualisation…" : "↻ Actualiser"}
        </button>
      </header>

      <div className="academy-admin__metrics">
        <article><span>Formations</span><strong>{courses.length}</strong></article>
        <article><span>Publiées</span><strong>{courses.filter((course) => course.published).length}</strong></article>
        <article><span>Inscriptions</span><strong>{enrollments}</strong></article>
        <article><span>Brouillons</span><strong>{courses.filter((course) => !course.published).length}</strong></article>
      </div>

      <div className="academy-admin__layout">
        <form id="academy-course-editor" className="academy-admin__editor" onSubmit={saveCourse}>
          <div className="academy-admin__editor-title">
            <div className="academy-admin__icon">✎</div>
            <div>
              <h3>{editingId ? "Modifier la formation" : "Créer une formation"}</h3>
              <p>Les nouveaux cours sont en brouillon par défaut.</p>
            </div>
          </div>

          <label>
            Titre
            <input required minLength={3} maxLength={180} value={form.title} onChange={(event) => setField("title", event.target.value)} placeholder="Ex. Préparer sa première levée de fonds" />
          </label>

          <label>
            Description
            <textarea required minLength={10} maxLength={10000} rows={5} value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="Présente les objectifs et le contenu de la formation…" />
          </label>

          <div className="academy-admin__form-grid">
            <label>
              Format
              <select value={form.courseType} onChange={(event) => setField("courseType", event.target.value)}>
                <option>Cours</option>
                <option>Webinaire</option>
                <option>Guide PDF</option>
              </select>
            </label>
            <label>
              Niveau
              <select value={form.level} onChange={(event) => setField("level", event.target.value)}>
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
              </select>
            </label>
            <label>
              Durée (minutes)
              <input type="number" min="1" max="100000" value={form.durationMin} onChange={(event) => setField("durationMin", event.target.value)} placeholder="45" />
            </label>
            <label>
              Icône (emoji)
              <input maxLength={12} value={form.icon} onChange={(event) => setField("icon", event.target.value)} />
            </label>
          </div>

          <label>
            Lien vidéo ou document (facultatif)
            <input type="url" value={form.contentUrl} onChange={(event) => setField("contentUrl", event.target.value)} placeholder="https://…" />
          </label>

          <div className="academy-admin__switches">
            <label className="academy-admin__check">
              <input type="checkbox" checked={form.isPremium} onChange={(event) => setField("isPremium", event.target.checked)} />
              <span>Formation Premium</span>
            </label>
            <label className="academy-admin__check academy-admin__publish">
              <input type="checkbox" checked={form.published} onChange={(event) => setField("published", event.target.checked)} />
              <span>Publier et rendre visible aux utilisateurs</span>
            </label>
          </div>

          <div className="academy-admin__form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : editingId ? "Enregistrer les modifications" : "Créer la formation"}
            </button>
            {editingId && <button className="btn btn-secondary" type="button" onClick={resetForm}>Annuler</button>}
          </div>
        </form>

        <div className="academy-admin__catalog">
          <div className="academy-admin__catalog-head">
            <div>
              <h3>Catalogue</h3>
              <p>{visibleCourses.length} formation(s)</p>
            </div>
            <input aria-label="Rechercher une formation" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher…" />
          </div>

          {loading ? (
            <div className="academy-admin__message">Chargement du catalogue…</div>
          ) : error ? (
            <div className="academy-admin__message academy-admin__message--error" role="alert">
              {error}<button type="button" className="btn btn-secondary btn-sm" onClick={loadCourses}>Réessayer</button>
            </div>
          ) : visibleCourses.length === 0 ? (
            <div className="academy-admin__empty">
              <span>📚</span><strong>Aucune formation trouvée</strong>
              <p>Crée ton premier cours ou modifie la recherche.</p>
            </div>
          ) : (
            <div className="academy-admin__course-list">
              {visibleCourses.map((course) => (
                <article className="academy-admin__course" key={course.id}>
                  <div className="academy-admin__course-icon">{course.icon}</div>
                  <div className="academy-admin__course-main">
                    <div className="academy-admin__course-title">
                      <h4>{course.title}</h4>
                      <span className={`academy-admin__status ${course.published ? "is-published" : ""}`}>
                        {course.published ? "Publié" : "Brouillon"}
                      </span>
                    </div>
                    <p>{course.courseType} · {course.level}{course.durationMin ? ` · ${course.durationMin} min` : ""}{course.isPremium ? " · Premium" : ""}</p>
                    <div className="academy-admin__course-stats">
                      <span>👥 {course._count?.enrollments || 0} inscrits</span>
                      <span>♥ {course._count?.likes || 0} likes</span>
                      <span>💬 {course._count?.comments || 0} commentaires</span>
                    </div>
                  </div>
                  <div className="academy-admin__course-actions">
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => editCourse(course)}>Modifier</button>
                    <button className={`btn btn-sm ${course.published ? "btn-secondary" : "btn-success"}`} type="button" onClick={() => togglePublication(course)}>
                      {course.published ? "Dépublier" : "Publier"}
                    </button>
                    <button className="btn btn-danger btn-sm" type="button" onClick={() => deleteCourse(course)}>Supprimer</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
