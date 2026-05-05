// ============================================================
// LAUNCHPAD — Bottom Navigation (Mobile uniquement)
// ============================================================

import { useApp } from "../context/AppContext";
import "./BottomNav.css";

export default function BottomNav() {
    const { currentPage, currentUser, navigate, unreadMessages, unreadCount } = useApp();

    if (!currentUser) return null;

    const studentTabs = [
        { id: "dashboard-student", icon: "🏠", label: "Home" },
        { id: "explore", icon: "🔍", label: "Explorer" },
        { id: "publish", icon: "➕", label: "Publier" },
        { id: "collaboration", icon: "🤝", label: "Collab" },
        { id: "investor-requests", icon: "📋", label: "Offres investisseurs" },
        { id: "messages", icon: "💬", label: "Messages", badge: unreadMessages },
    ];

    const investorTabs = [
        { id: "dashboard-investor", icon: "🏠", label: "Home" },
        { id: "explore", icon: "🔍", label: "Explorer" },
        { id: "investor-requests", icon: "📋", label: "Offres" },
        { id: "saved-projects", icon: "⭐", label: "Sauvegardés" },
        { id: "messages", icon: "💬", label: "Messages", badge: unreadMessages },
    ];

    const adminTabs = [
        { id: "admin", icon: "📊", label: "Admin" },
        { id: "explore", icon: "📦", label: "Projets" },
        { id: "messages", icon: "👥", label: "Users" },
        { id: "notifications", icon: "🚨", label: "Modérer" },
    ];

    const tabs =
        currentUser.role === "student" ? studentTabs :
            currentUser.role === "investor" ? investorTabs : adminTabs;

    return (
        <nav className="bottom-nav">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`bottom-nav-item${currentPage === tab.id ? " active" : ""}`}
                    onClick={() => navigate(tab.id)}
                >
                    <div className="bottom-nav-icon-wrap">
                        <span className="bottom-nav-icon">{tab.icon}</span>
                        {tab.badge > 0 && (
                            <span className="bottom-nav-badge">{tab.badge}</span>
                        )}
                    </div>
                    <span className="bottom-nav-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}