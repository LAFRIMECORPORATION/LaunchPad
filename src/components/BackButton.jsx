// ============================================================
// LAUNCHPAD — BackButton intelligent
// ============================================================

import { useApp } from "../context/AppContext";
import "./BackButton.css";

export default function BackButton({ to, label }) {
    const { currentUser, navigate, goBack, pageHistory } = useApp();

    // Détermine le dashboard selon le rôle
    const dashMap = {
        student: "dashboard-student",
        investor: "dashboard-investor",
        admin: "admin",
    };

    const dashboard = dashMap[currentUser?.role] || "home";

    function handleBack() {
        if (to) {
            navigate(to);
        } else if (pageHistory?.length > 0) {
            goBack();
        } else {
            navigate(dashboard);
        }
    }

    const backLabel = label || "Dashboard";

    return (
        <button className="back-button" onClick={handleBack}>
            <span className="back-button-arrow">←</span>
            <span className="back-button-label">{backLabel}</span>
        </button>
    );
}