// ============================================================
<<<<<<< HEAD
// LAUNCHPAD — Explore Page (API Connectée — CONFIGURATION FIXÉE)
=======
// LAUNCHPAD — Explore Page (API Connectée — CORRIGÉE)
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
// Fichier : src/pages/Explore.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { ProjectCard, Tag } from "../components/UI";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";

=======
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
import SocialActions from "../components/SocialActions";
import "./Projects.css";

const CATEGORIES = ["Tous", "GreenTech", "HealthTech", "FinTech", "EdTech", "SaaS", "AgriTech"];
const STAGES = ["Tous les stades", "Idée", "Prototype", "MVP", "Beta", "Commercialisé"];
const SORT_OPTIONS = [
    { value: "recent", label: "Plus récents" },
<<<<<<< HEAD
    { value: "funded", label: "Mieux financés" },
=======
    { value: "funding", label: "Mieux financés" },
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
    { value: "popular", label: "Plus populaires" },
];

export default function Explore() {
<<<<<<< HEAD
    // Initialisation propre du hook de navigation natif de React Router
    const localNavigate = useNavigate();

    // Récupération de l'application context
    const appCtx = useApp();
=======
    // Récupération de l'application context
    const appCtx = useApp();
    const navigate = appCtx?.navigate;
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
    const showToast = appCtx?.showToast;
    
    // Sécurisation de la récupération du Token d'authentification
    const token = typeof appCtx?.getAccessToken === "function" 
        ? appCtx.getAccessToken() 
        : (appCtx?.token || appCtx?.accessToken || "");
    
    // ── États synchronisés avec la base de données ───────────────────────────
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // ── États des filtres utilisateur ───────────────────────────────────────
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("Tous");
    const [stage, setStage] = useState("Tous les stades");
    const [sort, setSort] = useState("recent");

    // Mappage des labels français vers les enums minuscules de ton schema.prisma
    const mapStageToEnum = (stageLabel) => {
        switch (stageLabel) {
            case "Idée": return "idea";
            case "Prototype": return "prototype";
            case "MVP": return "mvp";
            case "Beta": return "beta";
            case "Commercialisé": return "launched";
            default: return undefined;
        }
    };

    // ── Fonction de chargement dynamique ─────────────────────────────────────
    const loadProjects = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                status: "active",
                sort: sort,
                ...(cat !== "Tous" && { category: cat }),
                ...(stage !== "Tous les stades" && { stage: mapStageToEnum(stage) }),
                ...(search.trim() !== "" && { search: search.trim() })
            });

            const headers = {
                "Content-Type": "application/json"
            };

            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

<<<<<<< HEAD
=======
            // FIX : Nettoyage drastique de l'URL pour supprimer définitivement le double /api/api
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
            const envUrl = import.meta.env.VITE_API_URL || "";
            const cleanBaseUrl = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
            const finalUrl = `${cleanBaseUrl}/api/projects?${queryParams.toString()}`;

            const response = await fetch(finalUrl, {
                method: "GET",
                headers: headers
            });

            if (!response.ok) throw new Error("Échec du chargement des projets.");
            const data = await response.json();
            
<<<<<<< HEAD
=======
            // Adaptation à la structure renvoyée par ton API
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
            setProjects(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            console.error("Erreur Explore:", err);
            if (typeof showToast === "function") {
                showToast("Erreur lors de la récupération du catalogue de projets", "error");
            }
        } finally {
            setLoading(false);
        }
    }, [cat, stage, search, sort, token, showToast]);

    // Déclencheur à chaque changement de filtres
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadProjects();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [loadProjects]);

<<<<<<< HEAD
    // ── FONCTION DE NAVIGATION CORRIGÉE ──────────────────────────────────────
    const handleNavigateToDetail = (idDuProjet, donnéesDuProjet) => {
        if (!idDuProjet) {
            console.error("Impossible de naviguer : ID du projet manquant");
            return;
        }
        localNavigate(`/projects/${idDuProjet}`, { state: { id: idDuProjet, ...donnéesDuProjet } });
    };

=======
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
    return (
        <div className="animate-fadeUp">

            {/* ── Header ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Explorer les projets</h1>
                    <p className="page-subtitle">
                        {loading ? "Mise à jour de la file..." : `${projects.length} projet${projects.length > 1 ? "s" : ""} disponible${projects.length > 1 ? "s" : ""}`}
                    </p>
                </div>
                <div className="page-header-actions">
                    <select
                        className="form-input form-select"
                        style={{ width: "min(100%, 180px)" }}
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Recherche + Filtres ── */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                <div className="explore-search-wrap">
                    <span className="explore-search-icon">🔍</span>
                    <input
                        className="form-input"
                        placeholder="Rechercher un projet, secteur, technologie…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="form-input form-select"
                    style={{ width: "min(100%, 200px)" }}
                    value={stage}
                    onChange={e => setStage(e.target.value)}
                >
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* ── Liste de puces de catégories ── */}
            <div className="chip-row" style={{ marginBottom: 24 }}>
                {CATEGORIES.map(c => (
                    <Tag key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Tag>
                ))}
            </div>

            {/* ── Grille de résultats ── */}
            {loading ? (
                <div className="loading-state" style={{ padding: "80px 0", textAlign: "center" }}>
                    <div className="spinner" style={{ display: "inline-block", marginBottom: 12 }} />
                    <div className="loading-state__title" style={{ color: "var(--text-muted)" }}>Interrogation de la base de données...</div>
                </div>
            ) : projects.length > 0 ? (
                <div className="grid-auto">
<<<<<<< HEAD
                    {projects.map(p => {
                        // Extraction sécurisée de l'ID courant du projet
                        const currentId = p?.id || p?.project_id || p?._id;
                        
                        return (
                            <div 
                                key={currentId || Math.random().toString()} 
                                style={{ display: "flex", flexDirection: "column", gap: 0, cursor: "pointer" }}
                                onClick={() => handleNavigateToDetail(currentId, p)}
                            >
                                <ProjectCard
                                    project={{
                                        ...p,
                                        emoji: p.emoji || "📦",
                                        colorBg: p.colorBg || "rgba(91,115,245,0.1)",
                                        raised: p.raisedAmount ? parseFloat(p.raisedAmount) : 0,
                                        goal: p.goalAmount ? parseFloat(p.goalAmount) : 0,
                                        desc: p.tagline || p.description
                                    }}
                                />
                                
                                {/* Isolation du conteneur d'actions sociales */}
                                <div 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                    style={{
                                        padding: "10px 14px",
                                        background: "var(--bg-card)",
                                        borderLeft: "1px solid var(--border)",
                                        borderRight: "1px solid var(--border)",
                                        borderBottom: "1px solid var(--border)",
                                        borderRadius: "0 0 var(--r-lg) var(--r-lg)",
                                        marginTop: -1,
                                    }}
                                >
                                    <SocialActions
                                        project={p}
                                        size="sm"
                                        onCommentClick={() => handleNavigateToDetail(currentId, p)}
                                    />
                                </div>
                            </div>
                        );
                    })}
=======
                    {projects.map(p => (
                        <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <ProjectCard
                                project={{
                                    ...p,
                                    emoji: p.emoji || "📦",
                                    colorBg: p.colorBg || "rgba(91,115,245,0.1)",
                                    raised: p.raisedAmount ? parseFloat(p.raisedAmount) : 0,
                                    goal: p.goalAmount ? parseFloat(p.goalAmount) : 0,
                                    desc: p.tagline || p.description
                                }}
                                onClick={() => navigate && navigate(`project-detail`, { id: p.id })}
                            />
                            <div style={{
                                padding: "10px 14px",
                                background: "var(--bg-card)",
                                borderLeft: "1px solid var(--border)",
                                borderRight: "1px solid var(--border)",
                                borderBottom: "1px solid var(--border)",
                                borderRadius: "0 0 var(--r-lg) var(--r-lg)",
                                marginTop: -1,
                            }}>
                                <SocialActions
                                    project={p}
                                    size="sm"
                                    onCommentClick={() => navigate && navigate(`project-detail`, { id: p.id })}
                                />
                            </div>
                        </div>
                    ))}
>>>>>>> 181fbf4ea466b649e8697a98255d0752f8103404
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                        Aucun projet trouvé en base de données
                    </div>
                    <div style={{ fontSize: 14 }}>Ajustez vos mots-clés ou modifiez les filtres de secteur.</div>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: 20 }}
                        onClick={() => { setSearch(""); setCat("Tous"); setStage("Tous les stades"); }}
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            )}
        </div>
    );
}