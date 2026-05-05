// ============================================================
// LAUNCHPAD — Saved Projects Page
// ============================================================

import { useApp } from "../context/AppContext";
import { ProjectCard } from "../components/UI";
import SocialActions from "../components/SocialActions";
import BackButton from "../components/BackButton";
import "./SavedProjects.css";

export default function SavedProjects() {
    const { navigate, projects, savedProjects } = useApp();

    const saved = projects.filter(p => savedProjects.includes(p.id));

    return (
        <div className="animate-fadeUp">
            <BackButton label="Dashboard" />

            <div className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">⭐ Projets sauvegardés</h1>
                    <p className="page-subtitle">
                        {saved.length} projet{saved.length > 1 ? "s" : ""} sauvegardé{saved.length > 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            {saved.length > 0 ? (
                <div className="grid-auto">
                    {saved.map(p => (
                        <div key={p.id}>
                            <ProjectCard
                                project={p}
                                onClick={() => navigate("project-detail", { project: p })}
                            />
                            <div className="project-social-bar">
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
                <div className="saved-empty">
                    <span className="saved-empty-icon">⭐</span>
                    <div className="saved-empty-title">Aucun projet sauvegardé</div>
                    <div className="saved-empty-desc">
                        Explorez les projets et sauvegardez ceux qui vous intéressent.
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate("explore")}
                    >
                        🔍 Explorer les projets
                    </button>
                </div>
            )}
        </div>
    );
}