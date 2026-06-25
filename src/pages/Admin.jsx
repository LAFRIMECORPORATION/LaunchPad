import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { StatCard, Badge } from "../components/UI";
import { kycApi, projectsApi } from "../utils/api"; 
import { ADMIN_DATA } from "../data/mockData"; 
import "./OtherPages.css";

export default function Admin() {
    const { navigate, showToast } = useApp();
    const [tab, setTab] = useState("overview");
    
    const [kycList, setKycList] = useState([]);
    const [pendingProjects, setPendingProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [projectsLoading, setProjectsLoading] = useState(false);

    const TABS = [
        { id: "overview", icon: "📊", label: "Vue d'ensemble" },
        { id: "projects", icon: "📦", label: `Projets (${pendingProjects.length})` },
        { id: "users", icon: "👥", label: "Utilisateurs" },
        { id: "kyc", icon: "🛡️", label: `KYC (${kycList.length})` },
        { id: "reports", icon: "🚨", label: "Signalements" },
    ];

    // ── FONCTIONS DE CHARGEMENT ──
    const loadPendingKyc = async () => {
        setLoading(true);
        try {
            const res = await kycApi.getPending({ page: 1, limit: 10 });
            const data = res.data?.data || res.data || res;
            setKycList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur fetch KYC:", error);
            showToast(error.message || "Erreur lors du chargement des dossiers KYC", "error");
        } finally {
            setLoading(false);
        }
    };

    const loadPendingProjects = async () => {
        setProjectsLoading(true);
        try {
            // Ajout d'un timestamp ou headers no-cache si ton axios/fetch le permet pour tuer le 304
            const res = await projectsApi.getPending();
            const data = res.data?.data || res.data || res;
            setPendingProjects(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur fetch projets:", error);
            showToast("Erreur chargement projets", "error");
        } finally {
            setProjectsLoading(false);
        }
    };

    // ── UN SEUL EFFECT POUR GÉRER LE CYCLE DE VIE ET LES ONGLETS ──
    useEffect(() => {
        // Au chargement initial de la page, on récupère TOUT pour avoir les compteurs à jour
        if (tab === "overview") {
            loadPendingProjects();
            loadPendingKyc();
        }
        
        // Si on change d'onglet, on rafraîchit la section concernée
        if (tab === "kyc") loadPendingKyc();
        if (tab === "projects") loadPendingProjects();
    }, [tab]);

    // ── LOGIQUE DE MODÉRATION DES PROJETS CORRIGÉE ──
const handleApproveProject = async (projectId) => {
    try {
        // Au lieu de { note: "..." }, on envoie directement la string attendue par le backend
        await projectsApi.approve(projectId, "Projet approuvé par l'administration");
        
        showToast("Projet approuvé ✅", "success");
        setPendingProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
        console.error("Erreur détaillée approbation :", error.response?.data || error);
        showToast(error.response?.data?.message || "Erreur lors de l'approbation du projet", "error");
    }
};

const handleRejectProject = async (projectId) => {
    const reason = prompt("Motif du rejet du projet :");
    if (reason === null) return;
    if (!reason.trim()) return showToast("Un motif est requis", "error");

    try {
        await projectsApi.reject(projectId, reason);
        showToast("Projet rejeté ✕", "info");
        setPendingProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
        // Ajout du log pour voir immédiatement si le backend rejette le motif
        console.error("Erreur détaillée rejet :", error.response?.data || error);
        showToast(error.response?.data?.message || "Erreur lors du rejet du projet", "error");
    }
};

    // ── LOGIQUE DES DOSSIERS KYC ──
    const handleApproveKyc = async (userId, userName) => {
        try {
            await kycApi.approve(userId);
            showToast(`✅ Le profil de ${userName} a été vérifié avec succès !`, "success");
            setKycList(prev => prev.filter(item => item.id !== userId));
        } catch (error) {
            showToast(error.message || "Erreur lors de la validation du KYC", "error");
        }
    };

    const handleRejectKyc = async (userId, userName) => {
        const reason = prompt(`Motif du refus pour ${userName} :`);
        if (reason === null) return;
        if (!reason.trim()) return showToast("Un motif est obligatoire pour rejeter un dossier", "error");

        try {
            await kycApi.reject(userId, reason);
            showToast(`✕ Le dossier de ${userName} a été refusé.`, "info");
            setKycList(prev => prev.filter(item => item.id !== userId));
        } catch (error) {
            showToast(error.message || "Erreur lors du rejet du KYC", "error");
        }
    };

    const handleRequestDocs = async (userId, userName) => {
        const docsListStr = prompt("Quels documents manquent ? (Sépare par des virgules) :\nEx: Certificat de scolarité, Recto CNI");
        if (docsListStr === null) return;
        if (!docsListStr.trim()) return showToast("La liste des documents demandés ne peut pas être vide", "error");

        const requestedDocs = docsListStr.split(",").map(d => d.trim());

        try {
            if (kycApi.requestDocs) {
                await kycApi.requestDocs(userId, requestedDocs);
            } else {
                const response = await fetch(`/api/admin/kyc/${userId}/request-docs`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ requestedDocs })
                });
                if (!response.ok) throw new Error("Échec de l'envoi de la demande.");
            }
            showToast("Demande de documents complémentaires envoyée avec succès", "info");
            setKycList(prev => prev.filter(item => item.id !== userId));
        } catch (error) {
            showToast(error.message || "Erreur lors de la demande de documents supplémentaires", "error");
        }
    };

    return (
        <div className="animate-fadeUp">

            {/* ── Header ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Dashboard Administrateur</h1>
                    <p className="page-subtitle">Supervision et modération de la plateforme Launchpad.</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate("home")}>
                        ← Quitter admin
                    </button>
                </div>
            </div>

            {/* ── Stats globales ── */}
            <div className="grid-5" style={{ marginBottom: 24, display: "grid", gap: 16 }}>
                <StatCard icon="👥" value={ADMIN_DATA.stats.users.toLocaleString()} label="Utilisateurs inscrits" color="#5B73F5" bgColor="#EEF2FF" delta="+48 cette semaine" />
                <StatCard icon="📦" value={ADMIN_DATA.stats.projects} label="Projets publiés" color="#22C55E" bgColor="#F0FDF4" delta="+12 ce mois" />
                <StatCard icon="⏳" value={pendingProjects.length} label="En attente de projet" color="#F59E0B" bgColor="#FFFBEB" />
                <StatCard icon="🛡️" value={kycList.length} label="KYC en attente" color="var(--accent)" bgColor="rgba(91,115,245,.1)" />
                <StatCard icon="🚨" value={ADMIN_DATA.stats.reports} label="Signalements actifs" color="#EF4444" bgColor="#FEF2F2" />
            </div>

            {/* ── Tabs ── */}
            <div className="admin-tabs">
                {TABS.map(t => (
                    <button key={t.id} className={`admin-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* ── Vue d'ensemble ── */}
            {tab === "overview" && (
                <div className="two-col">
                    <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <div className="card" style={{ overflow: "hidden" }}>
                            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div className="section-title">File de modération (Aperçu)</div>
                                <Badge color="yellow">{pendingProjects.length} en attente</Badge>
                            </div>
                            {pendingProjects.slice(0, 5).map(p => (
                                <div key={p.id} className="pending-row">
                                    <div className="pending-row-info">
                                        <div className="pending-row-title">{p.title}</div>
                                        <div className="pending-row-meta">
                                            {p.author?.firstName || "Auteur inconnu"} · {p.category}
                                        </div>
                                    </div>
                                    <Badge color="blue">{p.stage || "Nouveau"}</Badge>
                                    <div className="pending-row-actions">
                                        <button className="btn btn-success btn-sm" onClick={() => handleApproveProject(p.id)}>✓ Approuver</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleRejectProject(p.id)}>✕ Rejeter</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Onglet Projets Réel ── */}
            {tab === "projects" && (
                <div className="admin-section card" style={{ padding: 20 }}>
                    <div className="section-title" style={{ marginBottom: 16 }}>📦 File d'attente des projets</div>
                    {projectsLoading ? (
                        <div style={{ textAlign: "center", padding: 20 }}>Chargement des projets...</div>
                    ) : pendingProjects.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>Aucun projet en attente de modération.</div>
                    ) : (
                        pendingProjects.map(p => (
                            <div key={p.id} className="pending-row" style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                                <div className="pending-row-info">
                                    <div className="pending-row-title" style={{ fontWeight: 600 }}>{p.title}</div>
                                    {/* Correction ici : goalAmount au lieu de goal + Ajout du nom de l'auteur */}
                                    <div className="pending-row-meta">
                                        Par : {p.author?.firstName || "Inconnu"} · {p.category} · Objectif : {p.goalAmount?.toLocaleString() || 0} XAF
                                    </div>
                                    {/* Petit aperçu de la description reçue pour valider visuellement */}
                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                                        {p.tagline || p.description?.substring(0, 100) + "..."}
                                    </p>
                                </div>
                                <div className="pending-row-actions">
                                    <button className="btn btn-success btn-sm" onClick={() => handleApproveProject(p.id)}>✓ Approuver</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleRejectProject(p.id)}>✕ Rejeter</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── 🛡️ Section KYC Connectée ── */}
            {tab === "kyc" && (
                <div className="admin-section">
                    <div className="section-title" style={{ marginBottom: 16, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>
                        🛡️ Dossiers KYC en attente de validation
                    </div>

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "40px" }}>Chargement des dossiers depuis la DB Neon...</div>
                    ) : kycList.length === 0 ? (
                        <div className="empty-state" style={{ textAlign: "center", padding: "40px 20px" }}>
                            <div className="empty-state__icon" style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                            <div className="empty-state__title" style={{ color: "var(--text-muted)" }}>Aucun dossier en attente</div>
                        </div>
                    ) : (
                        <div className="admin-kyc-list">
                            {kycList.map(userItem => (
                                <div key={userItem.id} className="admin-kyc-card card">
                                    <div className="admin-kyc-card__header">
                                        <div className="admin-kyc-card__avatar">
                                            {userItem.firstName?.[0] || ""}{userItem.lastName?.[0] || ""}
                                        </div>
                                        <div className="admin-kyc-card__info">
                                            <div className="admin-kyc-card__name">{userItem.firstName} {userItem.lastName}</div>
                                            <div className="admin-kyc-card__meta">
                                                <Badge color="gray">{userItem.role}</Badge> · {userItem.email}
                                            </div>
                                            <div className="admin-kyc-card__date">
                                                Soumis le : {new Date(userItem.kycDocuments?.[0]?.createdAt || Date.now()).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Badge color="yellow">⏳ En attente</Badge>
                                    </div>

                                    <div className="admin-kyc-card__docs">
                                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "var(--text-secondary)" }}>
                                            Pièces jointes sécurisées :
                                        </div>
                                        {userItem.kycDocuments?.map(doc => (
                                            <div key={doc.id} className="admin-kyc-card__doc" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-light)", borderRadius: 6, marginBottom: 6 }}>
                                                <span style={{ fontSize: 13, fontWeight: 500 }}>📂 {doc.docType.toUpperCase().replace("_", " ")}</span>
                                                <a href={doc.signedUrl || doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: "none", color: "var(--accent)" }}>
                                                    👁️ Ouvrir le document
                                                </a>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="admin-kyc-card__actions">
                                        <button className="btn btn-success btn-sm" onClick={() => handleApproveKyc(userItem.id, `${userItem.firstName} ${userItem.lastName}`)}>
                                            ✅ Approuver le profil
                                        </button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => handleRequestDocs(userItem.id, `${userItem.firstName} ${userItem.lastName}`)}>
                                            📋 Demander corrections
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleRejectKyc(userItem.id, `${userItem.firstName} ${userItem.lastName}`)}>
                                            ✕ Rejeter
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Reste des onglets en jachère */}
            {tab !== "overview" && tab !== "kyc" && tab !== "projects" && (
                <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                        Section « {TABS.find(t => t.id === tab)?.label} »
                    </div>
                    <button className="btn btn-primary" onClick={() => setTab("overview")}>Retour à la vue d'ensemble</button>
                </div>
            )}
        </div>
    );
}