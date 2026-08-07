// ============================================================
// LAUNCHPAD — InvestorRequests.jsx  ✅ BRANCHÉ SUR L'API RÉELLE
// Chemin : src/pages/InvestorRequests.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { investorRequestsApi, projectsApi } from "../utils/api";
import "./InvestorRequests.css";

const TYPE_LABELS = {
  equity:    { label: "💼 Equity",     color: "#5B73F5" },
  loan:      { label: "🏦 Prêt",       color: "#22C55E" },
  grant:     { label: "🎁 Subvention", color: "#F59E0B" },
  mentoring: { label: "🧠 Mentorat",   color: "#8B5CF6" },
};

const FILTERS = [
  { id: "all",      label: "Tous"        },
  { id: "equity",   label: "💼 Equity"   },
  { id: "loan",     label: "🏦 Prêts"   },
  { id: "grant",    label: "🎁 Subventions"},
  { id: "mentoring",label: "🧠 Mentorat" },
];

const MARKETPLACE_SECTORS = [
  "AgriTech", "FinTech", "HealthTech", "EdTech", "GreenTech",
  "SaaS", "Mobilité", "Cybersécurité", "Web3", "Commerce",
];

function fmt(n) {
  return Number(n || 0).toLocaleString("fr-FR");
}

/* ── Modal : publier une offre ─────────────────────────────── */
function PublishModal({ onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({
    title:       "",
    description: "",
    type:        "equity",
    sectors:     [],
    minAmount:   "",
    maxAmount:   "",
    equityRange: "",
    requirements:"",
    deadline:    "",
  });

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function toggleSector(sector) {
    setForm(current => ({
      ...current,
      sectors: current.sectors.includes(sector)
        ? current.sectors.filter(item => item !== sector)
        : [...current.sectors, sector],
    }));
  }

  const canSubmit = form.title.trim() && form.description.trim();

  function handleSubmit() {
    if (!canSubmit || submitting) return;
    onSubmit({
      title:        form.title.trim(),
      description:  form.description.trim(),
      type:         form.type,
      sectors:      form.sectors,
      minAmount:    form.minAmount ? parseInt(form.minAmount) : undefined,
      maxAmount:    form.maxAmount ? parseInt(form.maxAmount) : undefined,
      equityRange:  form.equityRange.trim() || undefined,
      requirements: form.requirements.trim() || undefined,
      deadline:     form.deadline || undefined,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📢 Publier une offre</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div className="form-group">
            <label className="form-label">Titre <span className="req">*</span></label>
            <input className="form-input" placeholder="Ex : Cherche startup AgriTech Cameroun" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Type d'offre</label>
            <select className="form-input form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description <span className="req">*</span></label>
            <textarea className="form-input" rows={4} placeholder="Décrivez votre offre, vos critères et ce que vous apportez…" value={form.description} onChange={e => set("description", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Montant min (XAF)</label>
              <input className="form-input" type="number" placeholder="5 000 000" value={form.minAmount} onChange={e => set("minAmount", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Montant max (XAF)</label>
              <input className="form-input" type="number" placeholder="50 000 000" value={form.maxAmount} onChange={e => set("maxAmount", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Secteurs ciblés</label>
            <div className="marketplace-sector-checkboxes">
              {MARKETPLACE_SECTORS.map(sector => (
                <label className={`marketplace-sector-option${form.sectors.includes(sector) ? " selected" : ""}`} key={sector}>
                  <input
                    type="checkbox"
                    checked={form.sectors.includes(sector)}
                    onChange={() => toggleSector(sector)}
                  />
                  <span>{sector}</span>
                </label>
              ))}
            </div>
            <span className="marketplace-field-hint">
              {form.sectors.length > 0 ? `${form.sectors.length} secteur(s) sélectionné(s)` : "Sélectionnez un ou plusieurs secteurs"}
            </span>
          </div>

          {form.type === "equity" && (
            <div className="form-group">
              <label className="form-label">Fourchette d'equity attendue</label>
              <input className="form-input" placeholder="Ex : 10-25%" value={form.equityRange} onChange={e => set("equityRange", e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Critères requis</label>
            <textarea className="form-input" rows={2} placeholder="MVP fonctionnel, équipe technique, marché local validé…" value={form.requirements} onChange={e => set("requirements", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Date limite de candidature</label>
            <input className="form-input" type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} min={new Date().toISOString().split("T")[0]} />
          </div>

        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Annuler</button>
          <button className="btn btn-primary" disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? "Publication…" : "🚀 Publier l'offre"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Modal : postuler à une offre ─────────────────────────── */
function ApplyModal({ request, onClose, onSubmit, submitting, myProjects }) {
  const [message,   setMessage]   = useState("");
  const [projectId, setProjectId] = useState("");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✉️ Postuler à l'offre</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="card" style={{ padding: 14, marginBottom: 14, background: "var(--bg-light)" }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{request.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {request.investor?.firstName} {request.investor?.lastName}
              {request.investor?.profile?.company ? ` · ${request.investor.profile.company}` : ""}
            </div>
          </div>

          {myProjects.length > 0 && (
            <div className="form-group">
              <label className="form-label">Projet à présenter</label>
              <select className="form-input form-select" value={projectId} onChange={e => setProjectId(e.target.value)}>
                <option value="">— Sélectionner un projet (optionnel) —</option>
                {myProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Message de motivation <span className="req">*</span></label>
            <textarea
              className="form-input"
              rows={5}
              placeholder="Présentez votre projet et expliquez pourquoi vous correspondez à cette offre…"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Annuler</button>
          <button
            className="btn btn-primary"
            disabled={!message.trim() || submitting}
            onClick={() => onSubmit({ message: message.trim(), projectId: projectId || undefined })}
          >
            {submitting ? "Envoi…" : "✉️ Envoyer la candidature"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Card d'une offre ──────────────────────────────────────── */
function RequestCard({ request, currentUser, onApply, onDelete }) {
  const typeConfig = TYPE_LABELS[request.type] || { label: request.type, color: "#94A3B8" };
  const isOwner    = request.investor?.id === currentUser?.id;

  const isExpired = request.deadline && new Date(request.deadline) < new Date();

  return (
    <article className="marketplace-card">
      <div className="marketplace-card-top">
        <div className="marketplace-card-heading">
          <div className="marketplace-card-badges">
            <span
              className="marketplace-type-badge"
              style={{ background: `${typeConfig.color}20`, color: typeConfig.color, border: `1px solid ${typeConfig.color}40` }}
            >
              {typeConfig.label}
            </span>
            {isExpired && <span className="badge badge-gray">⏰ Expiré</span>}
          </div>
          <h2 className="marketplace-card-title">{request.title}</h2>
          <div className="marketplace-card-author">
            Par {request.investor?.firstName} {request.investor?.lastName}
            {request.investor?.profile?.company ? ` · ${request.investor.profile.company}` : ""}
          </div>
        </div>
        {isOwner && (
          <button className="marketplace-delete" onClick={() => onDelete(request.id)}>Supprimer</button>
        )}
      </div>

      <p className="marketplace-card-description">{request.description}</p>

      {/* Détails */}
      <div className="marketplace-card-meta">
        {(request.minAmount || request.maxAmount) && (
          <div className="marketplace-meta-item">
            💰 {request.minAmount ? `${fmt(request.minAmount)} XAF` : "—"}
            {request.maxAmount ? ` → ${fmt(request.maxAmount)} XAF` : ""}
          </div>
        )}
        {request.equityRange && (
          <div className="marketplace-meta-item">📊 Equity : {request.equityRange}</div>
        )}
        {request.deadline && (
          <div className="marketplace-meta-item">
            📅 Limite : {new Date(request.deadline).toLocaleDateString("fr-FR")}
          </div>
        )}
      </div>

      {/* Secteurs */}
      {request.sectors?.length > 0 && (
        <div className="marketplace-tags">
          {request.sectors.map(s => (
            <span key={s} className="badge badge-gray">{s}</span>
          ))}
        </div>
      )}

      {/* Requirements */}
      {request.requirements && (
        <div className="marketplace-requirements">
          📋 <strong>Critères :</strong> {request.requirements}
        </div>
      )}

      {/* Action */}
      {!isOwner && !isExpired && (
        <button className="btn btn-primary marketplace-card-action" onClick={() => onApply(request)}>
          ✉️ Postuler / Répondre
        </button>
      )}
      {isOwner && (
        <div className="marketplace-owner-note">
          👤 Votre offre — gérez les candidatures via votre profil
        </div>
      )}
    </article>
  );
}

/* ── MAIN PAGE ─────────────────────────────────────────────── */
export default function InvestorRequests() {
  const { currentUser, showToast } = useApp();
  const isInvestor = currentUser?.role === "investor";

  const [filter,      setFilter]      = useState("all");
  const [requests,    setRequests]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showPublish, setShowPublish] = useState(false);
  const [publishing,  setPublishing]  = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [applying,    setApplying]    = useState(false);
  const [myProjects,  setMyProjects]  = useState([]);
  const [search,      setSearch]      = useState("");

  const loadRequests = useCallback(async (type) => {
    setLoading(true);
    try {
      const res  = await investorRequestsApi.list({ type: type === "all" ? undefined : type, search: search.trim() || undefined, limit: 30 });
      const data = res.data?.requests || res.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || "Erreur lors du chargement des offres.", "error");
      setRequests([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => { loadRequests(filter); }, [filter, loadRequests]);

  // Charger les projets de l'utilisateur connecté (si étudiant) pour postuler
  useEffect(() => {
    if (currentUser?.role !== "student") return;
    projectsApi.list({ authorId: currentUser.id, limit: 10 })
      .then(res => setMyProjects(res.data?.projects || res.data || []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  async function handlePublish(data) {
    setPublishing(true);
    try {
      const res = await investorRequestsApi.create(data);
      const newReq = res.data || res;
      setRequests(prev => [newReq, ...prev]);
      setShowPublish(false);
      showToast("Offre publiée avec succès !", "success");
    } catch (err) {
      showToast(err.message || "Erreur lors de la publication.", "error");
    } finally {
      setPublishing(false);
    }
  }

  async function handleApply(requestId, { message, projectId }) {
    setApplying(true);
    try {
      await investorRequestsApi.apply(requestId, { message, projectId });
      setApplyTarget(null);
      showToast("Candidature envoyée à l'investisseur !", "success");
    } catch (err) {
      showToast(err.message || "Erreur lors de l'envoi de la candidature.", "error");
    } finally {
      setApplying(false);
    }
  }

  async function handleDelete(requestId) {
    if (!window.confirm("Supprimer cette offre ?")) return;
    try {
      await investorRequestsApi.remove(requestId);
      setRequests(prev => prev.filter(r => r.id !== requestId));
      showToast("Offre supprimée.", "info");
    } catch (err) {
      showToast(err.message || "Erreur lors de la suppression.", "error");
    }
  }

  return (
    <div className="marketplace-page">

      {/* Header */}
      <section className="marketplace-hero">
        <div className="marketplace-hero-copy">
          <span className="marketplace-eyebrow">LAUNCHPAD MARKETPLACE</span>
          <h1 className="marketplace-title">Des opportunités qui avancent.</h1>
          <p className="marketplace-subtitle">
            {isInvestor
              ? "Publiez votre thèse d’investissement et découvrez les projets qui correspondent à votre vision."
              : "Trouvez un investisseur, un mentor ou un partenaire pour faire grandir votre projet."
            }
          </p>
        </div>
        {isInvestor && (
            <button className="btn btn-primary marketplace-hero-action" onClick={() => setShowPublish(true)}>
              ➕ Publier une offre
            </button>
        )}
      </section>

      <div className="marketplace-toolbar">
        <div className="marketplace-search">
          <span>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && loadRequests(filter)} placeholder="Rechercher une offre, un secteur…" />
        </div>
        <div className="marketplace-role-note">{isInvestor ? "Votre espace investisseur" : "Votre espace étudiant"}</div>
      </div>

      {/* Filters */}
      <div className="marketplace-filters">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`marketplace-filter${filter === f.id ? " active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
            <div className="marketplace-loading">
          <div className="spinner" />
          <div className="loading-state__title">Chargement des offres…</div>
        </div>
      )}

      {/* Liste */}
      {!loading && (
        <>
          {requests.length === 0 ? (
            <div className="marketplace-empty">
              <div className="marketplace-empty-icon">⌁</div>
              <div className="marketplace-empty-title">Aucune offre disponible</div>
              {isInvestor && (
                <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowPublish(true)}>
                  Publier la première offre
                </button>
              )}
            </div>
          ) : (
            <div className="marketplace-list">{requests.map(r => (
              <RequestCard
                key={r.id}
                request={r}
                currentUser={currentUser}
                onApply={setApplyTarget}
                onDelete={handleDelete}
              />
            ))}</div>
          )}
        </>
      )}

      {/* Modal Publier */}
      {showPublish && (
        <PublishModal
          onClose={() => !publishing && setShowPublish(false)}
          onSubmit={handlePublish}
          submitting={publishing}
        />
      )}

      {/* Modal Postuler */}
      {applyTarget && (
        <ApplyModal
          request={applyTarget}
          onClose={() => !applying && setApplyTarget(null)}
          onSubmit={(data) => handleApply(applyTarget.id, data)}
          submitting={applying}
          myProjects={myProjects}
        />
      )}

    </div>
  );
}