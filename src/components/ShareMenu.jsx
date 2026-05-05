// ============================================================
// LAUNCHPAD — ShareMenu Component
// Menu déroulant de partage de projet
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import "./ShareMenu.css";

export default function ShareMenu({ project, onClose }) {
    const { navigate, incrementShare, showToast } = useApp();
    const menuRef = useRef(null);
    const [copied, setCopied] = useState(false);

    // Ferme le menu si clic en dehors
    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    // Lien fictif du projet
    const projectUrl = `https://launchpad.app/projects/${project.id}`;

    // ── Copier le lien ──
    function handleCopyLink() {
        navigator.clipboard.writeText(projectUrl).then(() => {
            setCopied(true);
            incrementShare(project.id);
            showToast("Lien copié dans le presse-papiers !", "success");
            setTimeout(() => {
                setCopied(false);
                onClose();
            }, 1500);
        }).catch(() => {
            showToast("Impossible de copier le lien.", "error");
        });
    }

    // ── Partager dans la messagerie interne ──
    function handleShareInMessages() {
        incrementShare(project.id);
        navigate("messages");
        showToast(`Partagez"${project.title}" dans vos conversations., "info"`);
        onClose();
    }

    // ── Partager sur X (Twitter) ──
    function handleShareX() {
        const text = encodeURIComponent(`
      🚀 Découvrez "${project.title}" sur Launchpad — ${project.tagline}
   ` );
        const url = encodeURIComponent(projectUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}, "_blank"`);
        incrementShare(project.id);
        onClose();
    }

    // ── Partager sur LinkedIn ──
    function handleShareLinkedIn() {
        const url = encodeURIComponent(projectUrl);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}, "_blank"`);
        incrementShare(project.id);
        onClose();
    }

    const options = [
        {
            icon: copied ? "✅" : "🔗",
            label: copied ? "Lien copié !" : "Copier le lien",
            onClick: handleCopyLink,
            active: copied,
        },
        {
            icon: "💬",
            label: "Partager dans la messagerie",
            onClick: handleShareInMessages,
        },
        {
            icon: "𝕏",
            label: "Partager sur X",
            onClick: handleShareX,
            external: true,
        },
        {
            icon: "in",
            label: "Partager sur LinkedIn",
            onClick: handleShareLinkedIn,
            external: true,
        },
    ];

    return (
        <div className="share-menu-wrap" ref={menuRef}>
            {/* Header */}
            <div className="share-menu-header">
                <span className="share-menu-title">Partager ce projet</span>
                <button className="share-menu-close" onClick={onClose}>✕</button>
            </div>

            {/* Project preview */}
            <div className="share-menu-preview">
                <span className="share-menu-preview-emoji">{project.emoji}</span>
                <div>
                    <div className="share-menu-preview-title">{project.title}</div>
                    <div className="share-menu-preview-sub">{project.category}</div>
                </div>
            </div>

            {/* Options */}
            <div className="share-menu-options">
                {options.map(opt => (
                    <button
                        key={opt.label}
                        className={`share-menu-option${opt.active ? " active" : ""}`}
                        onClick={opt.onClick}
                    >
                        <span className="share-menu-option-icon">{opt.icon}</span>
                        <span className="share-menu-option-label">{opt.label}</span>
                        {opt.external && (
                            <span className="share-menu-option-ext">↗</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Share count */}
            <div className="share-menu-footer">
                🔁 {project.shareCount} partage{project.shareCount > 1 ? "s" : ""}
            </div>
        </div>
    );
}