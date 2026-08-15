// ============================================================
// LAUNCHPAD — InvestorRequests.jsx  ✅ MARKETPLACE & CANDIDATURES
// Chemin : src/pages/InvestorRequests.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { investorRequestsApi, projectsApi } from "../utils/api";
import { Avatar, Badge } from "../components/UI";
import "./InvestorRequests.css";

const TYPE_LABELS = {
  equity:    { label: "💼 Equity",            color: "#5B73F5" },
  loan:      { label: "🏦 Prêt",              color: "#22C55E" },
  grant:     { label: "🎁 Subvention",        color: "#F59E0B" },
  mentoring: { label: "🧠 Mentorat",          color: "#8B5CF6" },
  job:       { label: "👔 Offre d'emploi",    color: "#EC4899" },
};

const FILTERS = [
  { id: "all",       label: "Tous"                },
  { id: "equity",    label: "💼 Equity"          },
  { id: "loan",      label: "🏦 Prêts"          },
  { id: "grant",     label: "🎁 Subventions"      },
  { id: "mentoring", label: "🧠 Mentorat"        },
  { id: "job",       label: "👔 Offres d'emploi"  },
];

const APP_STATUS_CONFIG = {
  pending:     { label: "⏳ En attente",      cls: "badge-warning" },
  shortlisted: { label: "⭐ Pré-sélectionné", cls: "badge-info"    },
  accepted:    { label: "✅ Accepté",         cls: "badge-success" },
  rejected:    { label: "❌ Refusé",          cls: "badge-danger"  },
};

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
          <h2 className="modal-title">📢 Publier une offre sur la Marketplace</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div className="form-group">
            <label className="form-label">Titre de l'offre <span className="req">*</span></label>
            <input className="form-input" placeholder="Ex : Cherche Développeur FullStack / Startup AgriTech" value={form.title} onChange={e => set("title", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Type d'opportunité</label>
            <select className="form-input form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description complète <span className="req">*</span></label>
            <textarea className="form-input" rows={4} placeholder="Décrivez votre offre, vos attentes et ce que vous apportez…" value={form.description} onChange={e => set("description", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">{form.type === "job" ? "Rémunération min (XAF)" : "Montant min (XAF)"}</label>
              <input className="form-input" type="number" placeholder="500 000" value={form.minAmount} onChange={e => set("minAmount", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{form.type === "job" ? "Rémunération max (XAF)" : "Montant max (XAF)"}</label>
              <input className="form-input" type="number" placeholder="2 000 000" value={form.maxAmount} onChange={e => set("maxAmount", e.target.value)} />
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
          </div>

          {["equity", "job"].includes(form.type) && (
            <div className="form-group">
              <label className="form-label">Equity / Part de capital proposée</label>
              <input className="form-input" placeholder="Ex : 5-15% equity" value={form.equityRange} onChange={e => set("equityRange", e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Profil / Critères requis</label>
            <textarea className="form-input" rows={2} placeholder="Ex: Développeur React/Node.js, autonomie, basé à Douala ou Remote…" value={form.requirements} onChange={e => set("requirements", e.target.value)} />
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
              placeholder="Présentez votre profil, votre motivation et expliquez pourquoi vous correspondez à cette offre…"
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
            {submitting ? "Envoi…" : "✉️ Envoyer ma candidature"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Card d'une offre ──────────────────────────────────────── */
function RequestCard({ request, currentUser, onApply, onDelete, onManageApps }) {
  const typeConfig = TYPE_LABELS[request.type] || { label: request.type, color: "#94A3B8" };
  const isOwner    = request.investor?.id === currentUser?.id;
  const isExpired  = request.deadline && new Date(request.deadline) < new Date();
  const appCount   = request.applications?.length || request._count?.applications || 0;

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
        <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => onManageApps(request)}>
            📋 Gérer les candidatures ({appCount})
          </button>
        </div>
      )}
    </article>
  );
}

/* ── MAIN PAGE ─────────────────────────────────────────────── */
export default function InvestorRequests() {
  const { currentUser, navigate, showToast } = useApp();
  const isInvestor = currentUser?.role === "investor";

  const [activeTab,    setActiveTab]   = useState("browse"); // "browse" | "applications"
  const [filter,       setFilter]      = useState("all");
  const [requests,     setRequests]    = useState([]);
  const [myOffers,     setMyOffers]    = useState([]);
  const [selectedOffer,setSelectedOffer]= useState(null);
  const [offerDetail,  setOfferDetail] = useState(null);
  const [loading,      setLoading]     = useState(true);
  const [showPublish,  setShowPublish] = useState(false);
  const [publishing,   setPublishing]  = useState(false);
  const [applyTarget,  setApplyTarget] = useState(null);
  const [applying,     setApplying]    = useState(false);
  const [myProjects,   setMyProjects]  = useState([]);
  const [search,       setSearch]      = useState("");
  const [updatingAppId,setUpdatingAppId]= useState(null);
  const [appFilter,    setAppFilter]   = useState("all");

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

  const loadMyOffers = useCallback(async () => {
    if (!isInvestor) return;
    try {
      const res = await investorRequestsApi.mine();
      const list = res.data || [];
      setMyOffers(list);
      if (list.length > 0 && !selectedOffer) {
        setSelectedOffer(list[0]);
      }
    } catch (err) {
      console.error("Erreur chargement mes offres:", err);
    }
  }, [isInvestor, selectedOffer]);

  useEffect(() => {
    if (activeTab === "browse") loadRequests(filter);
    else if (activeTab === "applications") loadMyOffers();
  }, [activeTab, filter, loadRequests, loadMyOffers]);

  // Charger détail de l'offre sélectionnée avec ses candidatures réelles
  useEffect(() => {
    if (activeTab === "applications" && selectedOffer?.id) {
      investorRequestsApi.getOne(selectedOffer.id)
        .then(res => {
          setOfferDetail(res.data || res);
        })
        .catch(console.error);
    }
  }, [activeTab, selectedOffer]);

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
      setMyOffers(prev => [newReq, ...prev]);
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
      setMyOffers(prev => prev.filter(r => r.id !== requestId));
      showToast("Offre supprimée.", "info");
    } catch (err) {
      showToast(err.message || "Erreur lors de la suppression.", "error");
    }
  }

  async function handleUpdateAppStatus(appId, newStatus) {
    if (!selectedOffer) return;
    setUpdatingAppId(appId);
    try {
      await investorRequestsApi.updateApplicationStatus(selectedOffer.id, appId, newStatus);
      showToast("Statut de candidature mis à jour avec succès !", "success");
      // Rafraîchir
      const updated = await investorRequestsApi.getOne(selectedOffer.id);
      setOfferDetail(updated.data || updated);
    } catch (err) {
      showToast(err.message || "Erreur lors de la mise à jour.", "error");
    } finally {
      setUpdatingAppId(null);
    }
  }

  const applicationsList = offerDetail?.applications || [];
  const filteredApps = applicationsList.filter(app => {
    if (appFilter === "all") return true;
    return app.status === appFilter;
  });

  return (
    <div className="marketplace-page">

      {/* Header */}
      <section className="marketplace-hero">
        <div className="marketplace-hero-copy">
          <span className="marketplace-eyebrow">LAUNCHPAD MARKETPLACE</span>
          <h1 className="marketplace-title">Des opportunités qui avancent.</h1>
          <p className="marketplace-subtitle">
            {isInvestor
              ? "Publiez votre thèse d’investissement, proposez des offres d'emploi et gérez les candidatures réelles des étudiants."
              : "Trouvez un investisseur, une offre d'emploi, un mentor ou un partenaire pour faire grandir votre projet."
            }
          </p>
        </div>
        {isInvestor && (
          <button className="btn btn-primary marketplace-hero-action" onClick={() => setShowPublish(true)}>
            ➕ Publier une offre
          </button>
        )}
      </section>

      {/* Navigation Onglets (Pour Investisseurs) */}
      {isInvestor && (
        <div className="filter-tabs" style={{ marginBottom: 20 }}>
          <button
            className={`filter-tab${activeTab === "browse" ? " active" : ""}`}
            onClick={() => setActiveTab("browse")}
          >
            🛒 Marketplace (Toutes les offres)
          </button>
          <button
            className={`filter-tab${activeTab === "applications" ? " active" : ""}`}
            onClick={() => setActiveTab("applications")}
          >
            📋 Gestion de mes candidatures ({myOffers.length})
          </button>
        </div>
      )}

      {activeTab === "browse" ? (
        <>
          <div className="marketplace-toolbar">
            <div className="marketplace-search">
              <span>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && loadRequests(filter)}
                placeholder="Rechercher une offre, un emploi, un secteur…"
              />
            </div>
            <div className="marketplace-role-note">
              {isInvestor ? "Votre espace investisseur" : "Votre espace étudiant"}
            </div>
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
                  <div className="marketplace-empty-title">Aucune offre disponible pour le moment</div>
                  {isInvestor && (
                    <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowPublish(true)}>
                      Publier une offre sur la Marketplace
                    </button>
                  )}
                </div>
              ) : (
                <div className="marketplace-list">
                  {requests.map(r => (
                    <RequestCard
                      key={r.id}
                      request={r}
                      currentUser={currentUser}
                      onApply={setApplyTarget}
                      onDelete={handleDelete}
                      onManageApps={(offer) => {
                        setSelectedOffer(offer);
                        setActiveTab("applications");
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Vue Espace Candidatures (Côté Investisseur) */
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
            📋 Candidatures reçues pour vos offres
          </h2>

          {myOffers.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
              Vous n'avez pas encore publié d'offres.
              <br />
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setShowPublish(true)}>
                Publier une offre
              </button>
            </div>
          ) : (
            <div>
              {/* Sélecteur d'offre */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Sélectionnez l'offre à examiner :</label>
                <select
                  className="form-input form-select"
                  value={selectedOffer?.id || ""}
                  onChange={e => {
                    const found = myOffers.find(o => o.id === e.target.value);
                    if (found) setSelectedOffer(found);
                  }}
                >
                  {myOffers.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.title} ({o.applications?.length || o._count?.applications || 0} candidatures)
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtres de statut de candidature */}
              <div className="filter-tabs" style={{ marginBottom: 16 }}>
                {[
                  ["all", "Toutes"],
                  ["pending", "⏳ En attente"],
                  ["shortlisted", "⭐ Pré-sélectionnés"],
                  ["accepted", "✅ Acceptés"],
                  ["rejected", "❌ Refusés"],
                ].map(([stId, stLabel]) => (
                  <button
                    key={stId}
                    className={`filter-tab${appFilter === stId ? " active" : ""}`}
                    onClick={() => setAppFilter(stId)}
                  >
                    {stLabel}
                  </button>
                ))}
              </div>

              {/* Liste des candidats */}
              {filteredApps.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "var(--text-muted)" }}>
                  Aucune candidature trouvée pour ce filtre.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {filteredApps.map(app => {
                    const candidate = app.applicant || {};
                    const st = APP_STATUS_CONFIG[app.status] || APP_STATUS_CONFIG.pending;
                    return (
                      <div key={app.id} className="card" style={{ padding: 18, border: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: 14 }}>
                          <Avatar
                            label={candidate.avatarUrl || candidate.firstName?.[0] || "U"}
                            size="lg"
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 10 }}>
                              {candidate.firstName} {candidate.lastName}
                              <span className={`badge ${st.cls}`}>{st.label}</span>
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                              {candidate.profile?.university || "Étudiant / Porteur de projet"} · Postulé le {new Date(app.createdAt).toLocaleDateString("fr-FR")}
                            </div>
                            <div style={{ fontSize: 14, background: "var(--bg-light)", padding: "10px 14px", borderRadius: "var(--r-md)", borderLeft: "3px solid var(--primary)" }}>
                              "{app.message || "Aucun message de motivation fourni."}"
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate("messages", { targetUserId: candidate.id })}
                          >
                            💬 Écrire
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate("appointments", { targetUserId: candidate.id })}
                          >
                            📅 Fixer RDV
                          </button>

                          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>Changer le statut :</span>
                            <button
                              className="btn btn-ghost btn-sm"
                              disabled={updatingAppId === app.id}
                              onClick={() => handleUpdateAppStatus(app.id, "shortlisted")}
                            >
                              ⭐ Pré-sélectionner
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              disabled={updatingAppId === app.id}
                              onClick={() => handleUpdateAppStatus(app.id, "accepted")}
                            >
                              ✅ Accepter
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={updatingAppId === app.id}
                              onClick={() => handleUpdateAppStatus(app.id, "rejected")}
                            >
                              ❌ Refuser
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
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