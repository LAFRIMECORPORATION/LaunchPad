// ============================================================
// LAUNCHPAD — Saved Projects Page
// ============================================================

import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ProjectCard } from "../components/UI";
import SocialActions from "../components/SocialActions";
import BackButton from "../components/BackButton";
import "./SavedProjects.css";

export default function SavedProjects() {
    const routerNavigate = useNavigate();
    const { projects, savedProjects } = useApp();

    const saved = projects.filter(p => savedProjects.includes(p.id));

    const handleNavigateToDetail = (projectId) => {
        routerNavigate(`/projects/${projectId}`);
    };

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
                    {saved.map(p => {
                        const projectId = p.id || p.project_id;
                        return (
                            <div key={projectId}>
                                <div 
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleNavigateToDetail(projectId)}
                                >
                                    <ProjectCard project={p} />
                                </div>
                                <div className="project-social-bar">
                                    <SocialActions
                                        project={p}
                                        size="sm"
                                        onCommentClick={() => handleNavigateToDetail(projectId)}
                                    />
                                </div>
                            </div>
                        );
                    })}
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
                        onClick={() => routerNavigate("/explore")}
                    >
                        🔍 Explorer les projets
                    </button>
                </div>
            )}
        </div>
    );
}