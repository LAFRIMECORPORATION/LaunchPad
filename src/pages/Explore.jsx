// ============================================================
// LAUNCHPAD — Explore Page
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ProjectCard, Tag } from "../components/UI";
import { PROJECTS } from "../data/mockData";
import SocialActions from "../components/SocialActions";
import "./Projects.css";

const CATEGORIES = ["Tous", "GreenTech", "HealthTech", "FinTech", "EdTech", "SaaS", "AgriTech"];
const STAGES = ["Tous les stades", "Idée", "Prototype", "MVP", "Beta", "Commercialisé"];
const SORT_OPTIONS = [
    { value: "recent", label: "Plus récents" },
    { value: "funding", label: "Mieux financés" },
    { value: "popular", label: "Plus populaires" },
];

export default function Explore() {
    const { navigate, projects } = useApp();
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("Tous");
    const [stage, setStage] = useState("Tous les stades");
    const [sort, setSort] = useState("recent");

    const filtered = projects.filter(p => {
        const matchCat = cat === "Tous" || p.category === cat;
        const matchStage = stage === "Tous les stades" || p.stage === stage;
        const matchSearch = !search
            || p.title.toLowerCase().includes(search.toLowerCase())
            || p.category.toLowerCase().includes(search.toLowerCase())
            || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        return matchCat && matchStage && matchSearch;
    });

    return (
        <div className="animate-fadeUp">

            {/* ── Header ── */}
            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">Explorer les projets</h1>
                    <p className="page-subtitle">{filtered.length} projet{filtered.length > 1 ? "s" : ""} disponible{filtered.length > 1 ? "s" : ""}</p>
                </div>
                <div className="page-header-actions">
                    <select
                        className="form-input form-select"
                        style={{ width: 180 }}
                        value={sort}
                        onChange={e => setSort(e.target.value)}
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Search + Filters ── */}
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
                    style={{ width: 200 }}
                    value={stage}
                    onChange={e => setStage(e.target.value)}
                >
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* ── Category chips ── */}
            <div className="chip-row" style={{ marginBottom: 24 }}>
                {CATEGORIES.map(c => (
                    <Tag key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Tag>
                ))}
            </div>

            {/* ── Projects grid ── */}
            {filtered.length > 0 ? (
                <div className="grid-auto">
                    {filtered.map(p => (
                        <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            <ProjectCard
                                project={p}
                                onClick={() => navigate("project-detail", { project: p })}
                            />
                            {/* Social actions sous chaque carte */}
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
                                    onCommentClick={() => navigate("project-detail", { project: p })}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
                        Aucun projet trouvé
                    </div>
                    <div style={{ fontSize: 14 }}>Essayez d'autres mots-clés ou catégories.</div>
                    <button
                        className="btn btn-primary"
                        style={{ marginTop: 20 }}
                        onClick={() => { setSearch(""); setCat("Tous"); setStage("Tous les stades"); }}
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            )
            }

        </div >
    );
}