import { useCallback, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { adminApi } from "../utils/api";
import "./ForumAdminPanel.css";

const CATEGORIES = [
  ["general", "Général"],
  ["financement", "Financement"],
  ["juridique", "Juridique"],
  ["tech", "Tech"],
  ["marketing", "Marketing"],
  ["success-stories", "Success stories"],
  ["questions", "Questions"],
  ["annonces", "Annonces"],
];

const EMPTY_POST = { title: "", content: "", category: "annonces" };

export default function ForumAdminPanel() {
  const { showToast } = useApp();
  const [data, setData] = useState(null);
  const [form, setForm] = useState(EMPTY_POST);
  const [editingPost, setEditingPost] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.getForumControl({
        status,
        search: search || undefined,
        page,
        limit: 20,
      });
      const result = response?.data || response;
      if (!Array.isArray(result?.posts)) {
        throw new Error("Réponse invalide : la liste des publications est absente.");
      }
      setData(result);
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger les publications.");
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEditing(post) {
    setEditingPost(post);
    setForm({
      title: post.title || "",
      content: post.content || "",
      category: post.category?.name || "annonces",
    });
    document.getElementById("forum-admin-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    setEditingPost(null);
    setForm(EMPTY_POST);
  }

  async function savePost(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingPost) {
        await adminApi.updateForumPost(editingPost.id, form);
        showToast("Publication mise à jour.", "success");
      } else {
        await adminApi.createForumPost(form);
        showToast("Publication créée sous le nom adminlaunchpad.", "success");
      }
      resetForm();
      await loadPosts();
    } catch (saveError) {
      showToast(saveError.message || "Impossible d'enregistrer la publication.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(post) {
    try {
      await adminApi.toggleForumPin(post.id);
      showToast(post.isPinned ? "Publication désépinglée." : "Publication épinglée.", "success");
      await loadPosts();
    } catch (pinError) {
      showToast(pinError.message || "Impossible de modifier l'épinglage.", "error");
    }
  }

  async function removePost(post) {
    if (!window.confirm(`Masquer « ${post.title || "cette publication"} » aux membres ?`)) return;
    try {
      await adminApi.deleteForumPost(post.id);
      showToast("Publication masquée. Tu peux la restaurer depuis les éléments supprimés.", "success");
      if (editingPost?.id === post.id) resetForm();
      await loadPosts();
    } catch (deleteError) {
      showToast(deleteError.message || "Impossible de masquer la publication.", "error");
    }
  }

  async function restorePost(post) {
    try {
      await adminApi.restoreForumPost(post.id);
      showToast("Publication restaurée et de nouveau visible.", "success");
      await loadPosts();
    } catch (restoreError) {
      showToast(restoreError.message || "Impossible de restaurer la publication.", "error");
    }
  }

  function applySearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <section className="forum-admin">
      <header className="forum-admin__hero">
        <div>
          <span className="forum-admin__eyebrow">COMMUNAUTÉ LAUNCHPAD</span>
          <h2>Gestion du forum</h2>
          <p>Publie les annonces officielles, modère les sujets et restaure les publications masquées.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={loadPosts} disabled={loading}>
          {loading ? "Actualisation…" : "↻ Actualiser"}
        </button>
      </header>

      <div className="forum-admin__metrics">
        <article><span>Sujets visibles</span><strong>{data?.activeCount ?? 0}</strong></article>
        <article><span>Masqués</span><strong>{data?.deletedCount ?? 0}</strong></article>
        <article><span>Dans cette liste</span><strong>{data?.total ?? 0}</strong></article>
      </div>

      <div className="forum-admin__layout">
        <form id="forum-admin-editor" className="forum-admin__editor" onSubmit={savePost}>
          <div>
            <span className="forum-admin__eyebrow">{editingPost ? "MODÉRATION" : "COMMUNICATION OFFICIELLE"}</span>
            <h3>{editingPost ? "Modifier la publication" : "Créer une publication"}</h3>
            <p>La publication sera visible par les membres sous <strong>adminlaunchpad</strong>.</p>
          </div>
          <label>
            Catégorie
            <select value={form.category} onChange={(event) => updateField("category", event.target.value)}>
              {CATEGORIES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          <label>
            Titre
            <input required minLength={5} maxLength={200} value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Titre de l'annonce ou du sujet" />
          </label>
          <label>
            Message
            <textarea required minLength={20} maxLength={10000} rows={7} value={form.content} onChange={(event) => updateField("content", event.target.value)} placeholder="Rédige le message qui sera publié dans le forum…" />
          </label>
          <div className="forum-admin__editor-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : editingPost ? "Enregistrer" : "Publier comme adminlaunchpad"}
            </button>
            {editingPost && <button className="btn btn-secondary" type="button" onClick={resetForm} disabled={saving}>Annuler</button>}
          </div>
        </form>

        <section className="forum-admin__catalog">
          <form className="forum-admin__filters" onSubmit={applySearch}>
            <label>
              Afficher
              <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                <option value="active">Publications visibles</option>
                <option value="deleted">Publications masquées</option>
                <option value="all">Toutes</option>
              </select>
            </label>
            <label className="forum-admin__search">
              Recherche
              <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Titre ou texte…" />
            </label>
            <button className="btn btn-primary btn-sm" type="submit">Rechercher</button>
          </form>

          {loading ? (
            <div className="forum-admin__empty">Chargement des publications…</div>
          ) : error ? (
            <div className="forum-admin__empty forum-admin__error" role="alert">
              {error}<button className="btn btn-secondary btn-sm" type="button" onClick={loadPosts}>Réessayer</button>
            </div>
          ) : data.posts.length === 0 ? (
            <div className="forum-admin__empty"><span>💬</span><strong>Aucune publication</strong><small>Crée une annonce ou modifie les filtres.</small></div>
          ) : (
            <div className="forum-admin__list">
              {data.posts.map((post) => (
                <article className="forum-admin__post" key={post.id}>
                  <div className="forum-admin__post-head">
                    <div>
                      <div className="forum-admin__post-title">
                        <h4>{post.title || "Réponse sans titre"}</h4>
                        {post.isPinned && <span className="forum-admin__tag is-pinned">Épinglé</span>}
                        {post.isDeleted && <span className="forum-admin__tag is-deleted">Masqué</span>}
                      </div>
                      <p>{post.category?.name || "Forum"} · {post.author?.role === "admin" ? "adminlaunchpad" : `${post.author?.firstName || ""} ${post.author?.lastName || ""}`.trim()} · {new Date(post.createdAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div className="forum-admin__post-stats">
                      <span>♥ {post.likesCount || 0}</span>
                      <span>↩ {post.repliesCount || 0}</span>
                      <span>◉ {post.viewsCount || 0}</span>
                    </div>
                  </div>
                  <p className="forum-admin__excerpt">{post.content}</p>
                  <div className="forum-admin__post-actions">
                    {!post.isDeleted && <>
                      <button className="btn btn-secondary btn-sm" type="button" onClick={() => startEditing(post)}>Modifier</button>
                      <button className="btn btn-secondary btn-sm" type="button" onClick={() => togglePin(post)}>{post.isPinned ? "Désépingler" : "Épingler"}</button>
                      <button className="btn btn-danger btn-sm" type="button" onClick={() => removePost(post)}>Masquer</button>
                    </>}
                    {post.isDeleted && <button className="btn btn-success btn-sm" type="button" onClick={() => restorePost(post)}>Restaurer</button>}
                  </div>
                </article>
              ))}
            </div>
          )}

          <footer className="forum-admin__pagination">
            <span>Page {data?.page || page} sur {data?.totalPages || 1}</span>
            <div>
              <button className="btn btn-secondary btn-sm" type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>← Précédent</button>
              <button className="btn btn-secondary btn-sm" type="button" disabled={page >= (data?.totalPages || 1) || loading} onClick={() => setPage((current) => current + 1)}>Suivant →</button>
            </div>
          </footer>
        </section>
      </div>
    </section>
  );
}
