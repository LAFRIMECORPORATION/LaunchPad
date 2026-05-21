// ============================================================
// LAUNCHPAD — Collaboration Page
// Parcours : détection IA → projets similaires →
//            demande → acceptation → espace équipe
// ============================================================

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, Badge, StatCard, AIBadge } from "../components/UI";
import { SIMILAR_PROJECTS, TEAM_SPACE } from "../data/mockData";
import "./Collaboration.css";

const AI_STEPS = [
    "Analyse du contenu du projet…",
    "Comparaison avec 382 projets existants…",
    "Calcul des scores de similarité…",
    "Génération des recommandations…",
];

const COLLAB_TYPES = [
    "Co-fondateur",
    "Partenariat technique",
    "Partage de ressources",
    "Fusion de projets",
    "Collaboration ponctuelle",
];

const SKILLS_LIST = [
    "Machine Learning", "Python", "Node.js",
    "Design UX", "Marketing", "Finance", "Juridique",
];

/* ── Sous-écran : Détection IA ── */
function DetectingScreen() {
    const [aiStep, setAiStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setAiStep(s => (s < AI_STEPS.length - 1 ? s + 1 : s));
        }, 600);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card">
            <div className="collab-detecting">
                <div className="collab-spinner-wrap">
                    <div className="collab-spinner" />
                    <span className="collab-spinner-emoji">🤖</span>
                </div>
                <div className="collab-detecting-title">Analyse IA en cours…</div>
                <div className="collab-detecting-sub">
                    Notre algorithme analyse votre projet et le compare avec tous
                    les projets de la plateforme pour détecter des similarités.
                </div>
                <div className="collab-ai-steps">
                    {AI_STEPS.map((s, i) => (
                        <div
                            key={i}
                            className={`collab-ai-step${i < aiStep ? " done" : i === aiStep ? " active" : ""}`}
                        >
                            <span>{i < aiStep ? "✓" : i === aiStep ? "⏳" : "○"}</span>
                            {s}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Sous-écran : Projets trouvés ── */
function FoundScreen({ onRequest, onSkip }) {
    return (
        <div>
            {/* Header */}
            <div className="collab-found-header">
                <span className="collab-found-icon">🎉</span>
                <div>
                    <div className="collab-found-title">
                        3 projets similaires détectés <AIBadge />
                    </div>
                    <div className="collab-found-sub">
                        Notre IA a trouvé des projets qui partagent des thématiques proches
                        du vôtre. Une collaboration pourrait accélérer les deux projets.
                    </div>
                </div>
            </div>

            {/* Similar projects */}
            {SIMILAR_PROJECTS.map(sp => (
                <div key={sp.id} className="collab-project-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, letterSpacing: "-.02em" }}>
                                {sp.title}
                            </div>
                            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                                {sp.category}
                            </div>
                        </div>
                        <span className="collab-sim-badge">🤖 {sp.similarity}% similaire</span>
                    </div>

                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.6 }}>
                        {sp.desc}
                    </p>

                    {/* Similarity bar */}
                    <div className="collab-sim-bar-wrap">
                        <div className="collab-sim-bar-meta">
                            <span>Score de similarité</span>
                            <span style={{ fontWeight: 700, color: "var(--success)" }}>{sp.similarity}%</span>
                        </div>
                        <div className="collab-sim-bar-track">
                            <div className="collab-sim-bar-fill" style={{ width: `${sp.similarity}%` }} />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
                        <button
                            className="btn btn-primary btn-full"
                            style={{ flex: "1 1 160px", minWidth: 140 }}
                            onClick={() => onRequest(sp)}
                        >
                            🤝 Demander une collaboration
                        </button>
                        <button className="btn btn-secondary btn-sm btn-full" style={{ flex: "1 1 120px", minWidth: 120 }}>
                            👁️ Voir
                        </button>
                    </div>
                </div>
            ))}

            {/* Options banner */}
            <div className="collab-options">
                <div className="collab-option">
                    <div className="collab-option-title">🤝 Option 1 : Collaborer</div>
                    <div className="collab-option-desc">
                        Rejoignez les forces avec un projet similaire. Mutualisation des
                        ressources, de l'expertise et du réseau.
                    </div>
                </div>
                <div className="collab-option-divider" />
                <div className="collab-option">
                    <div className="collab-option-title">🚀 Option 2 : Continuer seul</div>
                    <div className="collab-option-desc">
                        Poursuivez votre projet de manière indépendante. Vous restez maître
                        de votre vision et de vos décisions.
                    </div>
                    <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 10 }}
                        onClick={onSkip}
                    >
                        Continuer seul →
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Sous-écran : Formulaire de demande ── */
function RequestScreen({ target, onSend, onBack }) {
    const [sent, setSent] = useState(false);
    const [skills, setSkills] = useState([]);
    const [form, setForm] = useState({
        type: "Co-fondateur", message: "", availability: "Temps plein",
    });

    const toggleSkill = s =>
        setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

    if (sent) {
        return (
            <div className="card" style={{ overflow: "hidden" }}>
                <div className="collab-success">
                    <span className="collab-success-icon">🎉</span>
                    <div className="collab-success-title">Demande envoyée !</div>
                    <div className="collab-success-sub">
                        L'équipe <strong>{target?.title}</strong> a été notifiée.
                        Vous recevrez une réponse dans les 48 heures.
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
                        <button className="btn btn-secondary" onClick={onBack}>
                            ← Voir d'autres projets
                        </button>
                        <button className="btn btn-primary" onClick={onSend}>
                            💬 Ouvrir la messagerie
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="collab-form-wrap">
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={onBack}>
                ← Retour
            </button>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: "-.03em" }}>
                Demande de collaboration
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
                Proposez une collaboration avec l'équipe {target?.title}.
            </p>

            {/* Target preview */}
            <div className="collab-target-preview">
                <span className="collab-target-emoji">🌿</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{target?.title || "Projet"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {target?.category} · Équipe de 3 personnes
                    </div>
                </div>
                <span className="collab-sim-badge">{target?.similarity}% similaire</span>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    <div className="form-group">
                        <label className="form-label">Type de collaboration <span className="required">*</span></label>
                        <select
                            className="form-input form-select"
                            value={form.type}
                            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                        >
                            {COLLAB_TYPES.map(o => <option key={o}>{o}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Compétences que j'apporte</label>
                        <div className="chip-row" style={{ marginTop: 4 }}>
                            {SKILLS_LIST.map(s => (
                                <span
                                    key={s}
                                    className={`tag${skills.includes(s) ? " active" : ""}`}
                                    onClick={() => toggleSkill(s)}
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Message de présentation <span className="required">*</span></label>
                        <textarea
                            className="form-input form-textarea"
                            placeholder="Expliquez pourquoi cette collaboration serait bénéfique pour les deux projets…"
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            style={{ minHeight: 120 }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Disponibilité</label>
                        <select
                            className="form-input form-select"
                            value={form.availability}
                            onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
                        >
                            {["Temps plein", "Mi-temps", "Week-ends", "Quelques heures / semaine", "À définir"].map(o => (
                                <option key={o}>{o}</option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className="collab-form-actions">
                    <button className="btn btn-secondary" onClick={onBack}>
                        Annuler
                    </button>
                    <button className="btn btn-primary" onClick={() => setSent(true)}>
                        🚀 Envoyer la demande
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Sous-écran : Espace équipe ── */
function TeamSpaceScreen() {
    const { navigate } = useApp();
    const [newUpdate, setNewUpdate] = useState("");

    return (
        <div>
            {/* Header */}
            <div className="team-space-header">
                <span style={{ fontSize: 52 }}>🤝</span>
                <div style={{ flex: 1 }}>
                    <div className="team-space-title">{TEAM_SPACE.name}</div>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 14 }}>
                        Espace collaboratif partagé — créé automatiquement après acceptation.
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {TEAM_SPACE.members.map(m => (
                            <div key={m.name} className="team-member-pill">
                                <Avatar label={m.avatar} size="xs" />
                                <span>{m.name}</span>
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>· {m.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate("messages")}>
                    💬 Chat d'équipe
                </button>
            </div>

            <div className="two-col">
                <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Mises à jour */}
                    <div className="card" style={{ padding: 22 }}>
                        <div className="section-header">
                            <span className="section-title">📢 Mises à jour du projet</span>
                        </div>

                        {/* Post new update */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                            <Avatar label="AL" size="sm" />
                            <div style={{ flex: 1 }}>
                                <textarea
                                    className="form-input form-textarea"
                                    placeholder="Partagez une mise à jour avec l'équipe…"
                                    value={newUpdate}
                                    onChange={e => setNewUpdate(e.target.value)}
                                    style={{ minHeight: 72 }}
                                />
                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setNewUpdate("")}
                                    >
                                        Publier
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Updates list */}
                        {TEAM_SPACE.updates.map((u, i) => (
                            <div key={i} className="team-update">
                                <Avatar label={u.avatar} size="sm" />
                                <div>
                                    <div className="team-update-text">{u.text}</div>
                                    <div className="team-update-meta">{u.author} · {u.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid-3">
                        {[
                            { icon: "📊", value: "37%", label: "Financement EcoDeliv", color: "#5B73F5", bgColor: "#EEF2FF" },
                            { icon: "👁️", value: "543", label: "Vues combinées", color: "#22C55E", bgColor: "#F0FDF4" },
                            { icon: "💬", value: "8", label: "Messages échangés", color: "#8B5CF6", bgColor: "#F3EFFE" },
                        ].map(s => (
                            <StatCard key={s.label} {...s} />
                        ))}
                    </div>

                </div>

                {/* Sidebar */}
                <div className="two-col-side">

                    {/* Tasks */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-header">
                            <span className="section-title">✅ Tâches de l'équipe</span>
                            <Badge color="blue">
                                {TEAM_SPACE.tasks.filter(t => !t.done).length} restantes
                            </Badge>
                        </div>
                        {TEAM_SPACE.tasks.map((task, i) => (
                            <div key={i} className={`task-row${task.done ? " done" : ""}`}>
                                <div className={`task-check${task.done ? " done" : ""}`}>
                                    {task.done ? "✓" : ""}
                                </div>
                                <span style={{ flex: 1 }}>{task.title}</span>
                                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                    {task.assignee}
                                </span>
                            </div>
                        ))}
                        <button className="btn btn-secondary btn-sm btn-full" style={{ marginTop: 10 }}>
                            + Ajouter une tâche
                        </button>
                    </div>

                    {/* Members */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 14 }}>👥 Membres</div>
                        {TEAM_SPACE.members.map(m => (
                            <div key={m.name} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                                <Avatar label={m.avatar} size="sm" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</div>
                                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.role}</div>
                                </div>
                                <Badge color="gray">{m.project}</Badge>
                            </div>
                        ))}
                    </div>

                    <button className="btn btn-primary btn-full" onClick={() => navigate("messages")}>
                        💬 Ouvrir le chat d'équipe
                    </button>

                </div>
            </div>
        </div>
    );
}

/* ── COMPOSANT PRINCIPAL ── */
export default function Collaboration() {
    const { navigate, collabStep, setCollabStep, collabTarget, showToast } = useApp();

    const [localStep, setLocalStep] = useState(collabStep || "found");
    const [target, setTarget] = useState(collabTarget || null);

    /* Transition auto detecting → found */
    useEffect(() => {
        if (localStep === "detecting") {
            const timer = setTimeout(() => setLocalStep("found"), 3200);
            return () => clearTimeout(timer);
        }
    }, [localStep]);

    /* Sync avec context */
    useEffect(() => {
        if (collabStep) setCollabStep(collabStep);
    }, [collabStep]);

    function handleRequest(project) {
        setTarget(project);
        setLocalStep("request");
    }

    function handleSendRequest() {
        showToast("Demande de collaboration envoyée !", "success");
        navigate("messages");
    }

    function handleSkip() {
        showToast("Vous continuez votre projet en solo. Bonne chance !", "info");
        navigate("dashboard-student");
    }

    return (
        <div className="animate-fadeUp">

            {/* Header (masqué sur team space) */}
            {localStep !== "team" && (
                <div className="page-header">
                    <div className="page-header-left">
                        <h1 className="page-title">
                            Système de collaboration <AIBadge />
                        </h1>
                        <p className="page-subtitle">
                            {localStep === "detecting" && "Analyse en cours de votre projet…"}
                            {localStep === "found" && "Projets similaires trouvés — choisissez votre option."}
                            {localStep === "request" && "Envoyez votre demande de collaboration."}
                        </p>
                    </div>
                </div>
            )}

            {/* Screens */}
            {localStep === "detecting" && <DetectingScreen />}

            {localStep === "found" && (
                <>
                    <FoundScreen onRequest={handleRequest} onSkip={handleSkip} />
                    <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate("dashboard-student")}>
                            ← Retour
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setLocalStep("team")}>
                            🏠 Voir l'espace équipe (démo)
                        </button>
                    </div>
                </>
            )}

            {localStep === "request" && (
                <RequestScreen
                    target={target}
                    onSend={handleSendRequest}
                    onBack={() => setLocalStep("found")}
                />
            )}

            {localStep === "team" && <TeamSpaceScreen />}

        </div>
    );
}