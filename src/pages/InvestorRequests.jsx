// ============================================================
// LAUNCHPAD — Investor Requests / Marketplace
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, Badge, Tag } from "../components/UI";
import BackButton from "../components/BackButton";
import "./InvestorRequests.css";

const TYPE_LABELS = {
    job: { label: "Offre d'emploi", color: "blue", icon: "💼" },
    mission: { label: "Mission freelance", color: "purple", icon: "⚡" },
    collaboration: { label: "Collaboration", color: "green", icon: "🤝" },
};

const ALL_SKILLS = [
    "Python", "React", "Node.js", "IA", "Machine Learning",
    "Design UX", "Marketing", "Finance", "Agriculture",
    "IoT", "Mobile", "Blockchain", "Data Science", "DevOps",
];

export default function InvestorRequests() {
    const { currentUser, investorRequests, addInvestorRequest, applyToRequest, showToast } = useApp();
    const isInvestor = currentUser?.role === "investor";
    const [filter, setFilter] = useState("all");
    const [showForm, setShowForm] = useState(false);
    const [applied, setApplied] = useState([]);
    console.log("currentUser, role : ", currentUser?.role);
    console.log("isInvestor: ", isInvestor);


    const filtered = investorRequests.filter(r =>
        filter === "all" ? true : r.type === filter
    );

    function handleApply(requestId) {
        if (applied.includes(requestId)) return;
        applyToRequest(requestId);
        setApplied(prev => [...prev, requestId]);
        showToast("Candidature envoyée avec succès !", "success");
    }

    return (
        <div className="animate-fadeUp">
            <BackButton label="Dashboard" />

            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">📋 Marketplace</h1>
                    <p className="page-subtitle">
                        Offres et demandes publiées par les investisseurs
                    </p>
                </div>
                {isInvestor && (
                    <div className="page-header-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                console.log("bouton cliqué");
                                setShowForm(true)
                            }}
                        >
                            ➕ Publier une offre
                        </button>
                    </div>
                )}
            </div>

            {/* ── Filtres ── */}
            <div className="chip-row" style={{ marginBottom: 24 }}>
                {[
                    { id: "all", label: "Toutes" },
                    { id: "job", label: "💼 Emploi" },
                    { id: "mission", label: "⚡ Mission" },
                    { id: "collaboration", label: "🤝 Collaboration" },
                ].map(f => (
                    <Tag
                        key={f.id}
                        active={filter === f.id}
                        onClick={() => setFilter(f.id)}
                    >
                        {f.label}
                    </Tag>
                ))}
            </div>

            {/* ── Liste des requests ── */}
            <div className="ir-list">
                {filtered.map(r => (
                    <RequestCard
                        key={r.id}
                        request={r}
                        isInvestor={isInvestor}
                        hasApplied={applied.includes(r.id)}
                        onApply={() => handleApply(r.id)}
                    />
                ))}
                {filtered.length === 0 && (
                    <div className="saved-empty">
                        <span style={{ fontSize: 48 }}>📋</span>
                        <div className="saved-empty-title">Aucune offre disponible</div>
                        <div className="saved-empty-desc">Revenez bientôt !</div>
                    </div>
                )}
            </div>

            {/* ── Modal formulaire investisseur ── */}
            {showForm && (
                <PublishRequestModal
                    onClose={() => setShowForm(false)}
                    onSubmit={(data) => {
                        addInvestorRequest(data, currentUser);
                        setShowForm(false);
                        showToast("Offre publiée avec succès !", "success");
                    }}
                    showToast={showToast}
                />
            )}
        </div>
    );
}

/* ── Carte d'une request ── */
function RequestCard({ request, isInvestor, hasApplied, onApply }) {
    const type = TYPE_LABELS[request.type] || TYPE_LABELS.job;
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="ir-card card">
            {/* Header */}
            <div className="ir-card-header">
                <div className="ir-card-header-left">
                    <Avatar label={request.authorAvatar} size="md" />
                    <div>
                        <div className="ir-card-author">{request.authorName}</div>
                        <div className="ir-card-company">{request.authorCompany}</div>
                    </div>
                </div>
                <div className="ir-card-header-right">
                    <Badge color={type.color}>{type.icon} {type.label}</Badge>
                    <span className="ir-card-time">{request.createdAt}</span>
                </div>
            </div>

            {/* Content */}
            <div className="ir-card-body">
                <h3 className="ir-card-title">{request.title}</h3>
                <p className="ir-card-desc">
                    {expanded
                        ? request.description
                        : request.description.slice(0, 120) + "..."}
                    <button
                        className="ir-read-more"
                        onClick={() => setExpanded(e => !e)}
                    >
                        {expanded ? " Voir moins" : " Lire plus"}
                    </button>
                </p>

                {/* Skills */}
                <div className="ir-skills">
                    {request.skills.map(s => (
                        <span key={s} className="ir-skill-tag">{s}</span>
                    ))}
                </div>

                {/* Meta */}
                <div className="ir-meta">
                    {request.budget && (
                        <div className="ir-meta-item">
                            <span>💰</span>
                            <span>{request.budget}</span>
                        </div>
                    )}
                    <div className="ir-meta-item">
                        <span>⏱️</span>
                        <span>{request.duration}</span>
                    </div>
                    <div className="ir-meta-item">
                        <span>{request.remote ? "🌍" : "📍"}</span>
                        <span>{request.remote ? "Remote" : "Sur site"}</span>
                    </div>
                    <div className="ir-meta-item">
                        <span>👥</span>
                        <span>{request.applicants} candidat{request.applicants > 1 ? "s" : ""}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {!isInvestor && (
                <div className="ir-card-footer">
                    <button
                        className={`btn ${hasApplied ? "btn-secondary" : "btn-primary"} btn-full`}
                        onClick={onApply}
                        disabled={hasApplied}
                    >
                        {hasApplied ? "✓ Candidature envoyée" : "Postuler / Répondre"}
                    </button>
                </div>
            )}
        </div>
    );
}

/* ── Modal publication d'offre ── */
function PublishRequestModal({ onClose, onSubmit, showToast }) {
    const [form, setForm] = useState({
        type: "job",
        title: "",
        description: "",
        skills: [],
        budget: "",
        duration: "",
        remote: true,
    });

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const toggleSkill = s =>
        setForm(f => ({
            ...f,
            skills: f.skills.includes(s)
                ? f.skills.filter(x => x !== s)
                : [...f.skills, s],
        }));

    const isSubmitDisabled = !form.title.trim() || !form.description.trim();

    function handleSubmit() {
        if (isSubmitDisabled) {
            showToast("Veuillez renseigner le titre et la description.", "error");
            return;
        }
        onSubmit(form);
    }

    return (
        <div className="overlay" onClick={onClose}>
            <div className="modal ir-modal" onClick={e => e.stopPropagation()}>

                <div className="modal-header">
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20 }}>
                        Publier une offre
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}
                    >
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Type */}
                        <div className="form-group">
                            <label className="form-label">Type d'offre</label>
                            <div className="ir-type-toggle">
                                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                                    <button
                                        key={k}
                                        className={`ir-type-btn${form.type === k ? " active" : ""}`}
                                        onClick={() => upd("type", k)}
                                    >
                                        {v.icon} {v.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Titre */}
                        <div className="form-group">
                            <label className="form-label">
                                Titre <span className="required">*</span>
                            </label>
                            <input
                                className="form-input"
                                placeholder="Ex: Recherche développeur Python pour startup IA"
                                value={form.title}
                                onChange={e => upd("title", e.target.value)}
                            />
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">
                                Description <span className="required">*</span>
                            </label>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Décrivez votre besoin en détail..."
                                value={form.description}
                                onChange={e => upd("description", e.target.value)}
                            />
                        </div>

                        {/* Skills */}
                        <div className="form-group">
                            <label className="form-label">Compétences recherchées</label>
                            <div className="chip-row" style={{ marginTop: 4 }}>
                                {ALL_SKILLS.map(s => (
                                    <span
                                        key={s}
                                        className={`tag${form.skills.includes(s) ? " active" : ""}`}
                                        onClick={() => toggleSkill(s)}
                                    >
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Budget + Durée */}
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Budget (optionnel)</label>
                                <input
                                    className="form-input"
                                    placeholder="Ex: €2 000 / mois"
                                    value={form.budget}
                                    onChange={e => upd("budget", e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Durée</label>
                                <input
                                    className="form-input"
                                    placeholder="Ex: 3 mois"
                                    value={form.duration}
                                    onChange={e => upd("duration", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Remote */}
                        <div className="form-group">
                            <label className="form-label">Mode de travail</label>
                            <div className="ir-type-toggle">
                                <button
                                    className={`ir-type-btn${form.remote ? " active" : ""}`}
                                    onClick={() => upd("remote", true)}
                                >
                                    🌍 Remote
                                </button>
                                <button
                                    className={`ir-type-btn${!form.remote ? " active" : ""}`}
                                    onClick={() => upd("remote", false)}
                                >
                                    📍 Sur site
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitDisabled}>
                        🚀 Publier l'offre
                    </button>
                </div>

            </div>
        </div>
    );
}