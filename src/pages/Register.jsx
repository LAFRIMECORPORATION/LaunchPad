// ============================================================
// LAUNCHPAD — Register Page (3 étapes)
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { StepIndicator } from "../components/UI";
import "./Auth.css";

const STEPS = ["Votre rôle", "Informations", "Centres d'intérêt"];
const ALL_TAGS = ["IA & ML", "FinTech", "HealthTech", "GreenTech", "EdTech", "Cybersécurité", "Robotique", "Web3", "SaaS", "Marketplace", "AgriTech", "Mobilité"];

export default function Register() {
    const { navigate, login } = useApp();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState("student");
    const [form, setForm] = useState({
        firstName: "", lastName: "", email: "",
        university: "", company: "", password: "",
    });
    const [tags, setTags] = useState([]);

    const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const toggleTag = tag => setTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);

    return (
        <div className="auth-layout">

            {/* ── Panneau décoratif ── */}
            <div className="auth-deco">
                <div className="auth-deco-title">Lancez votre aventure startup</div>
                <div className="auth-deco-sub">
                    Créez votre compte en 3 étapes et rejoignez la communauté des innovateurs.
                </div>
                {[
                    ["✍️", "3 min", "Pour créer votre compte"],
                    ["🤖", "IA", "Détection de projets similaires"],
                    ["💬", "Direct", "Messagerie avec investisseurs"],
                ].map(([ico, val, lbl]) => (
                    <div key={lbl} className="auth-deco-stat">
                        <span className="auth-deco-stat-icon">{ico}</span>
                        <div>
                            <div className="auth-deco-stat-val">{val}</div>
                            <div className="auth-deco-stat-label">{lbl}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Formulaire ── */}
            <div className="auth-panel">
                <div className="auth-card animate-fadeUp">
                    <div className="auth-logo" onClick={() => navigate("home")}>Launchpad</div>
                    <h1 className="auth-title">Créer mon compte</h1>
                    <p className="auth-sub">Étape {step} / {STEPS.length}</p>

                    <div style={{ marginBottom: 22 }}>
                        <StepIndicator steps={STEPS} currentStep={step} />
                    </div>

                    <div className="auth-form">

                        {/* ── STEP 1 : Rôle ── */}
                        {step === 1 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
                                    Je suis…
                                </p>
                                {[
                                    ["student", "🎓", "Étudiant", "Je publie mes projets et cherche des financements"],
                                    ["investor", "💼", "Investisseur", "Je découvre et finance des projets innovants"],
                                ].map(([r, ico, lbl, desc]) => (
                                    <div
                                        key={r}
                                        className={`auth-role-card${role === r ? " active" : ""}`}
                                        onClick={() => setRole(r)}
                                    >
                                        <span className="auth-role-icon">{ico}</span>
                                        <div>
                                            <div className="auth-role-title">{lbl}</div>
                                            <div className="auth-role-desc">{desc}</div>
                                        </div>
                                        {role === r && (
                                            <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: 20 }}>✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── STEP 2 : Infos ── */}
                        {step === 2 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
                                    Informations personnelles
                                </p>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Prénom <span className="required">*</span></label>
                                        <input className="form-input" placeholder="Alice" value={form.firstName} onChange={e => upd("firstName", e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Nom <span className="required">*</span></label>
                                        <input className="form-input" placeholder="Martin" value={form.lastName} onChange={e => upd("lastName", e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email <span className="required">*</span></label>
                                    <input className="form-input" type="email" placeholder="alice@email.com" value={form.email} onChange={e => upd("email", e.target.value)} />
                                </div>
                                {role === "student" && (
                                    <div className="form-group">
                                        <label className="form-label">Université</label>
                                        <input className="form-input" placeholder="Université Paris-Saclay" value={form.university} onChange={e => upd("university", e.target.value)} />
                                    </div>
                                )}
                                {role === "investor" && (
                                    <div className="form-group">
                                        <label className="form-label">Entreprise / Fonds</label>
                                        <input className="form-input" placeholder="Horizon Ventures" value={form.company} onChange={e => upd("company", e.target.value)} />
                                    </div>
                                )}
                                <div className="form-group">
                                    <label className="form-label">Mot de passe <span className="required">*</span></label>
                                    <input className="form-input" type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={e => upd("password", e.target.value)} />
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3 : Intérêts ── */}
                        {step === 3 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
                                    Domaines d'intérêt
                                </p>
                                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                                    Personnalisez vos recommandations et la détection IA.
                                </p>
                                <div className="chip-row">
                                    {ALL_TAGS.map(t => (
                                        <span
                                            key={t}
                                            className={`tag${tags.includes(t) ? " active" : ""}`}
                                            onClick={() => toggleTag(t)}
                                        >
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <div style={{ padding: 12, borderRadius: "var(--r-md)", background: "var(--accent-light)", border: "1px solid var(--accent-mid)", fontSize: 13, color: "var(--text-secondary)" }}>
                                    ✅ En créant un compte, vous acceptez les{" "}
                                    <span className="auth-link">CGU</span> et la{" "}
                                    <span className="auth-link">politique de confidentialité</span>.
                                </div>
                            </div>
                        )}

                        {/* ── Navigation ── */}
                        <div style={{ display: "flex", gap: 10 }}>
                            {step > 1 && (
                                <button className="btn btn-secondary" style={{ flex: 1, padding: 11 }} onClick={() => setStep(s => s - 1)}>
                                    ← Retour
                                </button>
                            )}
                            {step < 3 ? (
                                <button className="btn btn-primary" style={{ flex: 1, padding: 11 }} onClick={() => setStep(s => s + 1)}>
                                    Continuer →
                                </button>
                            ) : (
                                <button className="btn btn-primary" style={{ flex: 1, padding: 11 }} onClick={() => login(role)}>
                                    🚀 Créer mon compte
                                </button>
                            )}
                        </div>

                    </div>

                    <p className="auth-footer-text">
                        Déjà un compte ?{" "}
                        <span className="auth-link" onClick={() => navigate("login")}>Se connecter</span>
                    </p>
                </div>
            </div>

        </div>
    );
}