// ============================================================
// LAUNCHPAD — Publish Page (wizard 4 étapes)
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { StepIndicator } from "../components/UI";
import "./Projects.css";

const STEPS = ["Informations de base", "Description détaillée", "Médias", "Financement"];
const SECTORS = ["GreenTech", "FinTech", "HealthTech", "EdTech", "SaaS", "AgriTech", "Mobilité", "Cybersécurité", "Web3"];
const STAGES = ["Idée", "Prototype", "MVP", "Beta", "Commercialisé"];
const ALL_TAGS = ["IA", "Web3", "Mobile", "API", "B2B", "B2C", "SaaS", "Open Source", "Hardware", "Blockchain"];

export default function Publish() {
    const { navigate, setCollabStep, showToast } = useApp();
    const [step, setStep] = useState(1);
    const [selTags, setSelTags] = useState([]);
    const [form, setForm] = useState({
        title: "", tagline: "", sector: "GreenTech", description: "",
        problem: "", solution: "", model: "", stage: "MVP",
        goal: "", minTicket: "", equityPct: "", equityType: "Equity", deadline: "",
    });

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const toggleTag = t => setSelTags(s => s.includes(t) ? s.filter(x => x !== t) : [...s, t]);

    function handlePublish() {
        showToast("Projet publié ! Analyse IA en cours…", "success");
        setCollabStep("detecting");
        setTimeout(() => {
            setCollabStep("found");
            navigate("collaboration");
        }, 1200);
    }

    return (
        <div className="animate-fadeUp">

            {/* ── Header ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginBottom: 8 }}
                        onClick={() => navigate("dashboard-student")}
                    >
                        ← Retour
                    </button>
                    <h1 className="page-title">Publier un projet</h1>
                    <p className="page-subtitle">Étape {step} sur {STEPS.length}</p>
                </div>
            </div>

            <div className="publish-wrap">
                <div className="publish-steps">
                    <StepIndicator steps={STEPS} currentStep={step} />
                </div>

                <div className="card" style={{ padding: 32 }}>

                    {/* ── STEP 1 : Infos de base ── */}
                    {step === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>
                                Informations de base
                            </h2>
                            <div className="form-group">
                                <label className="form-label">Nom du projet <span className="required">*</span></label>
                                <input className="form-input" placeholder="EcoDeliv" value={form.title} onChange={e => upd("title", e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tagline <span className="required">*</span></label>
                                <input className="form-input" placeholder="En une phrase, décrivez votre projet" value={form.tagline} onChange={e => upd("tagline", e.target.value)} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Secteur <span className="required">*</span></label>
                                    <select className="form-input form-select" value={form.sector} onChange={e => upd("sector", e.target.value)}>
                                        {SECTORS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stade <span className="required">*</span></label>
                                    <select className="form-input form-select" value={form.stage} onChange={e => upd("stage", e.target.value)}>
                                        {STAGES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description générale <span className="required">*</span></label>
                                <textarea
                                    className="form-input form-textarea"
                                    placeholder="Décrivez votre projet en détail…"
                                    value={form.description}
                                    onChange={e => upd("description", e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tags</label>
                                <div className="chip-row" style={{ marginTop: 4 }}>
                                    {ALL_TAGS.map(t => (
                                        <span
                                            key={t}
                                            className={`tag${selTags.includes(t) ? " active" : ""}`}
                                            onClick={() => toggleTag(t)}
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2 : Description détaillée ── */}
                    {step === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>
                                Description détaillée
                            </h2>
                            <div className="form-group">
                                <label className="form-label">Problème résolu <span className="required">*</span></label>
                                <textarea className="form-input form-textarea" placeholder="Quel problème concret résolvez-vous ?" value={form.problem} onChange={e => upd("problem", e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Solution proposée <span className="required">*</span></label>
                                <textarea className="form-input form-textarea" placeholder="Comment votre projet résout ce problème ?" value={form.solution} onChange={e => upd("solution", e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Modèle économique</label>
                                <textarea className="form-input form-textarea" placeholder="Comment générez-vous des revenus ?" value={form.model} onChange={e => upd("model", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3 : Médias ── */}
                    {step === 3 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>
                                Médias & documents
                            </h2>
                            <div className="form-group">
                                <label className="form-label">Image de couverture</label>
                                <div className="form-upload">
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                        Glissez une image ou{" "}
                                        <span style={{ color: "var(--accent)", cursor: "pointer" }}>parcourez vos fichiers</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                        PNG, JPG — max 5MB
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Lien vidéo de démo (optionnel)</label>
                                <input className="form-input" placeholder="https://youtube.com/…" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pitch deck (PDF)</label>
                                <div className="form-upload">
                                    <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                        Glissez ou{" "}
                                        <span style={{ color: "var(--accent)", cursor: "pointer" }}>choisir un fichier</span>
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                        PDF — max 20MB
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4 : Financement ── */}
                    {step === 4 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>
                                Objectif de financement
                            </h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Objectif total (€) <span className="required">*</span></label>
                                    <input className="form-input" type="number" placeholder="120 000" value={form.goal} onChange={e => upd("goal", e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ticket minimum (€)</label>
                                    <input className="form-input" type="number" placeholder="5 000" value={form.minTicket} onChange={e => upd("minTicket", e.target.value)} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Type de contrepartie</label>
                                    <select className="form-input form-select" value={form.equityType} onChange={e => upd("equityType", e.target.value)}>
                                        <option>Equity (parts sociales)</option>
                                        <option>Revenu partagé</option>
                                        <option>Prêt convertible</option>
                                        <option>Don sans contrepartie</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">% proposé</label>
                                    <input className="form-input" placeholder="8%" value={form.equityPct} onChange={e => upd("equityPct", e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date limite de levée</label>
                                <input className="form-input" type="date" value={form.deadline} onChange={e => upd("deadline", e.target.value)} />
                            </div>
                            <div style={{ padding: 14, borderRadius: "var(--r-md)", background: "var(--accent-light)", border: "1px solid var(--accent-mid)", fontSize: 13, color: "var(--text-secondary)" }}>
                                🤖 <strong>Détection IA automatique :</strong> après publication, notre algorithme détectera des projets similaires et proposera des collaborations pertinentes.
                            </div>
                        </div>
                    )}

                    {/* ── Navigation buttons ── */}
                    <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                        {step > 1 && (
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>
                                ← Étape précédente
                            </button>
                        )}
                        {step < 4 ? (
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(s => s + 1)}>
                                Étape suivante →
                            </button>
                        ) : (
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePublish}>
                                🚀 Publier le projet
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}