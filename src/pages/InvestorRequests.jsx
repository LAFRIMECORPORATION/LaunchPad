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
      <div className="modal modal-modern" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span style={{ fontSize: 22 }}>📢</span> Publier une offre sur la Marketplace
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Titre */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Titre de l'opportunité <span className="req" style={{ color: "var(--error)" }}>*</span>
            </label>
            <input
              className="form-input"
              placeholder="Ex : Recherche Co-fondateur CTO / Partenariat AgriTech"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              style={{ borderRadius: "var(--r-md)", padding: "10px 14px" }}
            />
          </div>

          {/* Type d'opportunité - Visual pills */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
              Type d'opportunité
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => {
                const isSelected = form.type === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => set("type", k)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "var(--r-md)",
                      border: isSelected ? `2px solid ${v.color}` : "1.5px solid var(--border)",
                      background: isSelected ? `${v.color}15` : "var(--bg-card)",
                      color: isSelected ? v.color : "var(--text-primary)",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 13,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{v.icon}</span>
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Description détaillée <span className="req" style={{ color: "var(--error)" }}>*</span>
            </label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Exposez clairement l'objectif de votre offre, les compétences recherchées et la valeur ajoutée pour les candidats…"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              style={{ borderRadius: "var(--r-md)", padding: "12px 14px", lineHeight: 1.5 }}
            />
          </div>

          {/* Montants / Budget */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                {form.type === "job" ? "Rémunération min (XAF)" : "Montant min (XAF)"}
              </label>
              <input
                className="form-input"
                type="number"
                placeholder="Ex : 500 000"
                value={form.minAmount}
                onChange={e => set("minAmount", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                {form.type === "job" ? "Rémunération max (XAF)" : "Montant max (XAF)"}
              </label>
              <input
                className="form-input"
                type="number"
                placeholder="Ex : 2 000 000"
                value={form.maxAmount}
                onChange={e => set("maxAmount", e.target.value)}
              />
            </div>
          </div>

          {/* Secteurs ciblés */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>
              Secteurs ciblés
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {MARKETPLACE_SECTORS.map(sector => {
                const isSelected = form.sectors.includes(sector);
                return (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => toggleSector(sector)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "20px",
                      border: isSelected ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                      background: isSelected ? "var(--accent)" : "var(--bg-hover)",
                      color: isSelected ? "#fff" : "var(--text-secondary)",
                      fontSize: 12,
                      fontWeight: isSelected ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSelected ? "✓ " : "+ "}{sector}
                  </button>
                );
              })}
            </div>
          </div>

          {["equity", "job"].includes(form.type) && (
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                Part de capital proposée (Equity)
              </label>
              <input
                className="form-input"
                placeholder="Ex : 5% - 15% equity"
                value={form.equityRange}
                onChange={e => set("equityRange", e.target.value)}
              />
            </div>
          )}

          {/* Profil / Critères requis */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Critères & Profil recherché
            </label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Ex : Expérience React / Node.js, autonomie, basé à Douala ou 100% Remote…"
              value={form.requirements}
              onChange={e => set("requirements", e.target.value)}
            />
          </div>

          {/* Date limite */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Date limite de candidature (Optionnelle)
            </label>
            <input
              className="form-input"
              type="date"
              value={form.deadline}
              onChange={e => set("deadline", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </button>
          <button
            className="btn btn-primary"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            style={{ minWidth: 160, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
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

  const typeConfig = TYPE_LABELS[request.type] || { label: request.type, color: "#5B73F5", icon: "📌" };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-modern" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span style={{ fontSize: 22 }}>✉️</span> Postuler à l'opportunité
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Carte récapitulative élégante de l'offre */}
          <div
            style={{
              padding: 16,
              borderRadius: "var(--r-lg)",
              background: "linear-gradient(135deg, rgba(91, 115, 245, 0.08), rgba(34, 197, 94, 0.05))",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span
                className="marketplace-type-badge"
                style={{
                  background: `${typeConfig.color}20`,
                  color: typeConfig.color,
                  border: `1px solid ${typeConfig.color}40`,
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {typeConfig.icon} {typeConfig.label}
              </span>
              {(request.minAmount || request.maxAmount) && (
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--success)" }}>
                  💰 {request.minAmount ? `${fmt(request.minAmount)} XAF` : ""}
                  {request.maxAmount ? ` - ${fmt(request.maxAmount)} XAF` : ""}
                </span>
              )}
            </div>

            <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text-primary)" }}>
              {request.title}
            </div>

            <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>👤 Proposé par <strong>{request.investor?.firstName} {request.investor?.lastName}</strong></span>
              {request.investor?.profile?.company ? (
                <span>· 🏢 {request.investor.profile.company}</span>
              ) : null}
            </div>
          </div>

          {/* Sélection du projet */}
          {myProjects && myProjects.length > 0 && (
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                Associer un de vos projets (Optionnel)
              </label>
              <select
                className="form-input form-select"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                style={{ borderRadius: "var(--r-md)", padding: "10px 14px" }}
              >
                <option value="">— Aucun projet particulier (candidature profil) —</option>
                {myProjects.map(p => (
                  <option key={p.id} value={p.id}>🚀 {p.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Message de motivation */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Message de motivation & Présentation <span className="req" style={{ color: "var(--error)" }}>*</span>
            </label>
            <textarea
              className="form-input"
              rows={5}
              placeholder="Présentez votre profil, vos réalisations clés, et expliquez concrètement ce que vous pouvez apporter à cette opportunité…"
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ borderRadius: "var(--r-md)", padding: "12px 14px", lineHeight: 1.5 }}
            />
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              💡 Conseil : Soyez précis sur vos disponibilités, vos compétences techniques et vos expériences passées.
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </button>
          <button
            className="btn btn-primary"
            disabled={!message.trim() || submitting}
            onClick={() => onSubmit({ message: message.trim(), projectId: projectId || undefined })}
            style={{ minWidth: 180, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {submitting ? "Envoi en cours…" : "✉️ Envoyer ma candidature"}
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
                    const candidateId = candidate.id || app.applicantId || app.applicant?.id;
                    const st = APP_STATUS_CONFIG[app.status] || APP_STATUS_CONFIG.pending;
                    return (
                      <div key={app.id} className="card marketplace-candidate-card" style={{ padding: 18, border: "1px solid var(--border)", display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: 14, flex: 1, minWidth: 240 }}>
                          <Avatar
                            label={candidate.avatarUrl || candidate.firstName?.[0] || "U"}
                            size="lg"
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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

                        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160, width: "100%", maxWidth: 200 }}>
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={!candidateId}
                            onClick={() => navigate("messages", { targetUserId: candidateId })}
                          >
                            💬 Écrire
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={!candidateId}
                            onClick={() => navigate("appointments", { targetUserId: candidateId })}
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