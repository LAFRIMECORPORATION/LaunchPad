import { useState } from "react";
import { useApp } from "../context/AppContext";
import { StepIndicator } from "../components/UI";
import { projectsApi } from "../utils/api";
import "./Projects.css";

const STEPS = ["Informations de base", "Description détaillée", "Médias", "Financement"];
const SECTORS = ["GreenTech", "FinTech", "HealthTech", "EdTech", "SaaS", "AgriTech", "Mobilité", "Cybersécurité", "Web3"];
const ALL_TAGS = ["IA", "Web3", "Mobile", "API", "B2B", "B2C", "SaaS", "Open Source", "Hardware", "Blockchain"];

export default function Publish() {
    const { navigate, currentUser, showToast } = useApp();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selTags, setSelTags] = useState([]);
    
    // Structure de l'état alignée avec les besoins de l'API et du formulaire
    const [formData, setFormData] = useState({
        title: "", tagline: "", sector: "GreenTech", description: "",
        problem: "", solution: "", businessModel: "", stage: "mvp", // 'mvp' en minuscule par défaut
        goalAmount: "", minTicket: "", equityPct: "", equityType: "equity", 
        deadline: "", githubUrl: "", teamSize: "1", coverImage: null
    });

    const upd = (k, v) => setFormData(f => ({ ...f, [k]: v }));
    
    const toggleTag = t => {
        const nextTags = selTags.includes(t) ? selTags.filter(x => x !== t) : [...selTags, t];
        setSelTags(nextTags);
    };

    // Logique de publication asynchrone branchée sur l'API
    const handlePublish = async () => {
        setLoading(true);
        try {
            // 1. Créer le projet en brouillon
            const createRes = await projectsApi.create({
                title:         formData.title,
                tagline:       formData.tagline,
                category:      formData.sector,
                description:   formData.description,
                problem:       formData.problem,
                solution:      formData.solution,
                businessModel: formData.businessModel,
                stage:         formData.stage,
                goalAmount:    parseFloat(formData.goalAmount) || 0,
                equityPct:     parseFloat(formData.equityPct) || undefined,
                equityType:    formData.equityType,
                deadline:      formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
                tags:          selTags,
                githubUrl:     formData.githubUrl  || undefined,
                teamSize:      parseInt(formData.teamSize) || 1,
            });

            // 🛡️ Extraction ultra-sécurisée de l'ID du projet selon le format de ton controlleur backend
            const projectId = createRes?.id || createRes?.data?.id || createRes?.project?.id || createRes?.data?.project?.id;

            if (!projectId) {
                throw new Error("Impossible de récupérer l'ID du projet créé. Vérifie la réponse du serveur.");
            }

            // 2. Uploader la cover image si présente
            if (formData.coverImage) {
                await projectsApi.uploadCover(projectId, formData.coverImage);
            }

            // 3. Publier (draft → pending)
            await projectsApi.publish(projectId);

            showToast("Projet soumis pour validation ! ✅", "success");
            navigate("dashboard-student");

        } catch (err) {
            showToast(err.message || "Erreur lors de la publication.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            upd("coverImage", e.target.files[0]);
            showToast("Image de couverture ajoutée !", "success");
        }
    };

    // 🛡️ KYC gate — bloquer la publication si non vérifié
    if (!currentUser?.kycValidated) {
        return (
            <div className="page-wrapper animate-fadeUp">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">➕ Publier un projet</h1>
                        <p className="page-subtitle">Partagez votre idée avec les investisseurs</p>
                    </div>
                </div>
                <div className="kyc-gate-full">
                    <div className="kyc-gate-full__icon">➕</div>
                    <h2 className="kyc-gate-full__title">Vérification requise</h2>
                    <p className="kyc-gate-full__desc">
                        Pour publier un projet sur Launchpad, vous devez confirmer votre
                        statut d'étudiant dans un établissement camerounais reconnu.
                        Cela protège les investisseurs et crédibilise votre démarche.
                    </p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => navigate("kyc-verification")}
                        >
                            🛡️ Vérifier mon compte →
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => navigate("dashboard-student")}
                        >
                            Retour au tableau de bord
                        </button>
                    </div>
                    <div className="kyc-gate-full__note">
                        ⏱️ La vérification prend 24 à 48h. Une fois validé, vous aurez
                        accès à toutes les fonctionnalités de la plateforme.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fadeUp">

            {/* ── HEADER ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginBottom: 8 }}
                        onClick={() => navigate("dashboard-student")}
                        disabled={loading}
                    >
                        ← Retour
                    </button>
                    <h1 className="page-title">Publier un projet</h1>
                    <p className="page-subtitle">Étape {step} sur {STEPS.length}</p>
                </div>
            </div>

            <div className="publish-wrap">
                <div className="publish-steps" style={{ marginBottom: 20 }}>
                    <StepIndicator steps={STEPS} currentStep={step} />
                </div>

                <div className="card" style={{ padding: 32 }}>

                    {/* ── STEP 1 : INFOS DE BASE ── */}
                    {step === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                                Informations de base
                            </h2>
                            <div className="form-group">
                                <label className="form-label">Nom du projet <span className="required">*</span></label>
                                <input className="form-input" placeholder="EcoDeliv" value={formData.title} onChange={e => upd("title", e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tagline <span className="required">*</span></label>
                                <input className="form-input" placeholder="En une phrase, décrivez votre projet" value={formData.tagline} onChange={e => upd("tagline", e.target.value)} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Secteur <span className="required">*</span></label>
                                    <select className="form-input form-select" value={formData.sector} onChange={e => upd("sector", e.target.value)}>
                                        {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Stade <span className="required">*</span></label>
                                    <select className="form-input form-select" value={formData.stage} onChange={e => upd("stage", e.target.value)}>
                                        <option value="idea">Idée</option>
                                        <option value="prototype">Prototype</option>
                                        <option value="mvp">MVP</option>
                                        <option value="beta">Beta</option>
                                        <option value="launched">Commercialisé</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description générale <span className="required">*</span></label>
                                <textarea
                                    className="form-input form-textarea"
                                    placeholder="Décrivez votre projet en détail…"
                                    value={formData.description}
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

                    {/* ── STEP 2 : DESCRIPTION DÉTAILLÉE ── */}
                    {step === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                                Description détaillée
                            </h2>
                            <div className="form-group">
                                <label className="form-label">Problème résolu <span className="required">*</span></label>
                                <textarea className="form-input form-textarea" placeholder="Quel problème concret résolvez-vous au Cameroun ?" value={formData.problem} onChange={e => upd("problem", e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Solution proposée <span className="required">*</span></label>
                                <textarea className="form-input form-textarea" placeholder="Comment votre projet résout ce problème ?" value={formData.solution} onChange={e => upd("solution", e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Modèle économique</label>
                                <textarea className="form-input form-textarea" placeholder="Comment générez-vous des revenus (abonnements, commissions Mobile Money, etc.) ?" value={formData.businessModel} onChange={e => upd("businessModel", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3 : MÉDIAS ── */}
                    {step === 3 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                                Médias & documents
                            </h2>
                            <div className="form-group">
                                <label className="form-label">Image de couverture</label>
                                <label className="form-upload" style={{ cursor: "pointer", display: "block" }}>
                                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>🖼️</div>
                                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                        {formData.coverImage ? <strong>{formData.coverImage.name}</strong> : <>Glissez une image ou <span style={{ color: "var(--accent)" }}>parcourez vos fichiers</span></>}
                                    </div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                        PNG, JPG — max 5MB
                                    </div>
                                </label>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Lien Code Source (ex: GitHub, optionnel)</label>
                                <input className="form-input" placeholder="https://github.com/…" value={formData.githubUrl} onChange={e => upd("githubUrl", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* ── STEP 4 : FINANCEMENT ── */}
                    {step === 4 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                                Objectif de financement
                            </h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Objectif total (XAF) <span className="required">*</span></label>
                                    <input className="form-input" type="number" placeholder="15000000" value={formData.goalAmount} onChange={e => upd("goalAmount", e.target.value)} />
                                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>Ex: 15 000 000 XAF</span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ticket minimum (XAF)</label>
                                    <input className="form-input" type="number" placeholder="250000" value={formData.minTicket} onChange={e => upd("minTicket", e.target.value)} />
                                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>Ex: 250 000 XAF</span>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Type de contrepartie</label>
                                    <select className="form-input form-select" value={formData.equityType} onChange={e => upd("equityType", e.target.value)}>
                                        <option value="equity">Equity (parts sociales)</option>
                                        <option value="revenue_share">Revenu partagé (Royalty)</option>
                                        <option value="loan">Prêt convertible</option>
                                        <option value="donation">Don sans contrepartie</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">% proposé</label>
                                    <input className="form-input" placeholder="8%" value={formData.equityPct} onChange={e => upd("equityPct", e.target.value)} />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Taille de l'équipe</label>
                                    <input className="form-input" type="number" placeholder="1" value={formData.teamSize} onChange={e => upd("teamSize", e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date limite de levée</label>
                                    <input className="form-input" type="date" value={formData.deadline} onChange={e => upd("deadline", e.target.value)} />
                                </div>
                            </div>
                            <div style={{ padding: 14, borderRadius: "var(--r-md)", background: "var(--accent-light)", border: "1px solid var(--accent-mid)", fontSize: 13, color: "var(--text-secondary)" }}>
                                🤖 <strong>Validation de projet :</strong> après soumission, l'équipe analysera votre dossier pour le rendre public et vous mettre en relation avec des investisseurs.
                            </div>
                        </div>
                    )}

                    {/* ── NAVIGATION BUTTONS ── */}
                    <div style={{ display: "flex", gap: 10, marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                        {step > 1 && (
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)} disabled={loading}>
                                ← Étape précédente
                            </button>
                        )}
                        {step < 4 ? (
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(s => s + 1)}>
                                Étape suivante →
                            </button>
                        ) : (
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePublish} disabled={loading}>
                                {loading ? "Publication en cours..." : "🚀 Publier le projet"}
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}