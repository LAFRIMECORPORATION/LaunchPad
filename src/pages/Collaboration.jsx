// ============================================================
// LAUNCHPAD — Collaboration Page  ✅ BRANCHÉ SUR L'API RÉELLE
// Parcours : détection IA → projets similaires →
//            demande → inbox (accept/decline)
// ============================================================

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, Badge, AIBadge } from "../components/UI";
import { projectsApi, collaborationsApi } from "../utils/api";
import "./Collaboration.css";

const AI_STEPS = [
    "Analyse du contenu du projet…",
    "Comparaison avec les projets existants…",
    "Calcul des scores de similarité…",
    "Génération des recommandations…",
];

/* ── Sous-écran : Détection IA (réel appel API en parallèle) ── */
function DetectingScreen({ onLoaded }) {
    const { selectedProject, showToast } = useApp();
    const [aiStep, setAiStep] = useState(0);

    useEffect(() => {
        const stepInterval = setInterval(() => {
            setAiStep(s => (s < AI_STEPS.length - 1 ? s + 1 : s));
        }, 600);

        async function fetchSimilar() {
            try {
                if (!selectedProject?.id) {
                    onLoaded([]);
                    return;
                }
                const res = await projectsApi.similar(selectedProject.id);
                const data = res.data || res;
                onLoaded(Array.isArray(data) ? data : (data.projects || []));
            } catch (err) {
                showToast(err.message || "Erreur lors de la recherche de projets similaires.", "error");
                onLoaded([]);
            }
        }

        const minDelay = new Promise(r => setTimeout(r, 2400));
        Promise.all([fetchSimilar(), minDelay]);

        return () => clearInterval(stepInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

/* ── Sous-écran : Projets trouvés (réels) ── */
function FoundScreen({ similarProjects, onRequest, onSkip, navigate }) {
    if (similarProjects.length === 0) {
        return (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, marginBottom: 8 }}>
                    Aucun projet similaire détecté
                </div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
                    Votre projet est unique sur la plateforme pour le moment. Vous pouvez
                    continuer seul ou explorer la communauté.
                </p>
                <button className="btn btn-primary" onClick={onSkip}>
                    Continuer seul →
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="collab-found-header">
                <span className="collab-found-icon">🎉</span>
                <div>
                    <div className="collab-found-title">
                        {similarProjects.length} projet{similarProjects.length > 1 ? "s" : ""} similaire{similarProjects.length > 1 ? "s" : ""} détecté{similarProjects.length > 1 ? "s" : ""} <AIBadge />
                    </div>
                    <div className="collab-found-sub">
                        Notre IA a trouvé des projets qui partagent des thématiques proches
                        du vôtre. Une collaboration pourrait accélérer les deux projets.
                    </div>
                </div>
            </div>

            {similarProjects.map(sp => {
                const similarity = sp.similarityScore ?? 0;
                return (
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
                            <span className="collab-sim-badge">🤖 {similarity}% similaire</span>
                        </div>

                        {sp.author && (
                            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
                                Par {sp.author.firstName} {sp.author.lastName}
                            </p>
                        )}

                        <div className="collab-sim-bar-wrap">
                            <div className="collab-sim-bar-meta">
                                <span>Score de similarité</span>
                                <span style={{ fontWeight: 700, color: "var(--success)" }}>{similarity}%</span>
                            </div>
                            <div className="collab-sim-bar-track">
                                <div className="collab-sim-bar-fill" style={{ width: `${similarity}%` }} />
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
                            <button
                                className="btn btn-secondary btn-sm btn-full"
                                style={{ flex: "1 1 120px", minWidth: 120 }}
                                onClick={() => navigate("project-detail", { project: sp })}
                            >
                                👁️ Voir
                            </button>
                        </div>
                    </div>
                );
            })}

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

/* ── Sous-écran : Formulaire de demande (réel envoi API) ── */
function RequestScreen({ target, onBack, navigate, showToast }) {
    const [sent, setSent]       = useState(false);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSend() {
        if (!message.trim() || sending) return;
        setSending(true);
        try {
            await collaborationsApi.send({
                projectId: target.id,
                message:   message.trim(),
            });
            setSent(true);
        } catch (err) {
            showToast(err.message || "Erreur lors de l'envoi de la demande.", "error");
        } finally {
            setSending(false);
        }
    }

    if (sent) {
        return (
            <div className="card" style={{ overflow: "hidden" }}>
                <div className="collab-success">
                    <span className="collab-success-icon">🎉</span>
                    <div className="collab-success-title">Demande envoyée !</div>
                    <div className="collab-success-sub">
                        L'équipe <strong>{target?.title}</strong> a été notifiée.
                        Vous recevrez une réponse via vos notifications.
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
                        <button className="btn btn-secondary" onClick={onBack}>
                            ← Voir d'autres projets
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate("dashboard-student")}>
                            🏠 Retour au tableau de bord
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="collab-form-wrap">
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={onBack} disabled={sending}>
                ← Retour
            </button>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: "-.03em" }}>
                Demande de collaboration
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 20 }}>
                Proposez une collaboration avec l'équipe {target?.title}.
            </p>

            <div className="collab-target-preview">
                <span className="collab-target-emoji">🌿</span>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{target?.title || "Projet"}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {target?.category}
                    </div>
                </div>
                <span className="collab-sim-badge">{target?.similarityScore ?? 0}% similaire</span>
            </div>

            <div className="card" style={{ padding: 24 }}>
                <div className="form-group">
                    <label className="form-label">Message de présentation <span className="required">*</span></label>
                    <textarea
                        className="form-input form-textarea"
                        placeholder="Expliquez pourquoi cette collaboration serait bénéfique pour les deux projets…"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        style={{ minHeight: 140 }}
                    />
                </div>

                <div className="collab-form-actions">
                    <button className="btn btn-secondary" onClick={onBack} disabled={sending}>
                        Annuler
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSend}
                        disabled={!message.trim() || sending}
                    >
                        {sending ? "Envoi…" : "🚀 Envoyer la demande"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Sous-écran : Boîte de réception (demandes reçues/envoyées) ── */
function InboxScreen({ showToast, navigate }) {
    const [inbox, setInbox]     = useState({ received: [], sent: [] });
    const [loading, setLoading] = useState(true);
    const [tab, setTab]         = useState("received");

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await collaborationsApi.inbox();
                const data = res.data || res;
                setInbox({ received: data.received || [], sent: data.sent || [] });
            } catch (err) {
                showToast(err.message || "Erreur lors du chargement.", "error");
            } finally {
                setLoading(false);
            }
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleAccept(id) {
        try {
            await collaborationsApi.accept(id);
            setInbox(prev => ({
                ...prev,
                received: prev.received.map(c => c.id === id ? { ...c, status: "accepted" } : c),
            }));
            showToast("Demande acceptée !", "success");
        } catch (err) {
            showToast(err.message || "Erreur lors de l'acceptation.", "error");
        }
    }

    async function handleDecline(id) {
        const reason = window.prompt("Raison du refus (optionnel) :") || undefined;
        try {
            await collaborationsApi.decline(id, reason);
            setInbox(prev => ({
                ...prev,
                received: prev.received.map(c => c.id === id ? { ...c, status: "declined" } : c),
            }));
            showToast("Demande refusée.", "info");
        } catch (err) {
            showToast(err.message || "Erreur lors du refus.", "error");
        }
    }

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner" />
                <div className="loading-state__title">Chargement de vos demandes…</div>
            </div>
        );
    }

    const list = tab === "received" ? inbox.received : inbox.sent;

    return (
        <div>
            <div className="filter-tabs" style={{ marginBottom: 16 }}>
                <button className={`filter-tab${tab === "received" ? " active" : ""}`} onClick={() => setTab("received")}>
                    📥 Reçues ({inbox.received.length})
                </button>
                <button className={`filter-tab${tab === "sent" ? " active" : ""}`} onClick={() => setTab("sent")}>
                    📤 Envoyées ({inbox.sent.length})
                </button>
            </div>

            {list.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🤝</div>
                    <div className="empty-state__title">Aucune demande {tab === "received" ? "reçue" : "envoyée"}</div>
                </div>
            ) : (
                list.map(c => (
                    <div key={c.id} className="card" style={{ padding: 18, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                    <Avatar label={`${c.requester?.firstName?.[0] || "?"}${c.requester?.lastName?.[0] || "?"}`} size="sm" />
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                                            {tab === "received"
                                                ? `${c.requester?.firstName} ${c.requester?.lastName}`
                                                : c.project?.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                            {tab === "received" ? `pour ${c.project?.title}` : c.project?.category}
                                        </div>
                                    </div>
                                </div>
                                {c.message && (
                                    <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>{c.message}</p>
                                )}
                            </div>
                            <Badge color={
                                c.status === "accepted" ? "green" :
                                c.status === "declined" ? "gray" : "yellow"
                            }>
                                {c.status === "accepted" ? "✅ Acceptée" :
                                 c.status === "declined" ? "❌ Refusée" : "⏳ En attente"}
                            </Badge>
                        </div>
                        {tab === "received" && c.status === "pending" && (
                            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                                <button className="btn btn-success btn-sm" onClick={() => handleAccept(c.id)}>
                                    ✓ Accepter
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDecline(c.id)}>
                                    ✕ Refuser
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

/* ── COMPOSANT PRINCIPAL ── */
export default function Collaboration() {
    const { navigate, collabStep, collabTarget, showToast } = useApp();

    const [localStep, setLocalStep]   = useState(collabStep || "found");
    const [target, setTarget]         = useState(collabTarget || null);
    const [similarProjects, setSimilarProjects] = useState([]);

    useEffect(() => {
        if (collabStep) setLocalStep(collabStep);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collabStep]);

    function handleSimilarLoaded(projects) {
        setSimilarProjects(projects);
        setLocalStep("found");
    }

    function handleRequest(project) {
        setTarget(project);
        setLocalStep("request");
    }

    function handleSkip() {
        showToast("Vous continuez votre projet en solo. Bonne chance !", "info");
        navigate("dashboard-student");
    }

    return (
        <div className="animate-fadeUp">

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
                            {localStep === "inbox" && "Vos demandes de collaboration."}
                        </p>
                    </div>
                    <div className="page-header-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => setLocalStep("inbox")}>
                            📥 Mes demandes
                        </button>
                    </div>
                </div>
            )}

            {localStep === "detecting" && <DetectingScreen onLoaded={handleSimilarLoaded} />}

            {localStep === "found" && (
                <>
                    <FoundScreen
                        similarProjects={similarProjects}
                        onRequest={handleRequest}
                        onSkip={handleSkip}
                        navigate={navigate}
                    />
                    <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate("dashboard-student")}>
                            ← Retour
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setLocalStep("detecting")}>
                            🔄 Relancer l'analyse
                        </button>
                    </div>
                </>
            )}

            {localStep === "request" && (
                <RequestScreen
                    target={target}
                    onBack={() => setLocalStep("found")}
                    navigate={navigate}
                    showToast={showToast}
                />
            )}

            {localStep === "inbox" && (
                <InboxScreen showToast={showToast} navigate={navigate} />
            )}

        </div>
    );
}