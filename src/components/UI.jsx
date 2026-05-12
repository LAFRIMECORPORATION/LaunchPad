// ============================================================
// LAUNCHPAD — UI Components (bibliothèque partagée)
// ============================================================

import { useApp } from "../context/AppContext";

/* ── AVATAR ── */
export function Avatar({ label, size = "md", ring = false, style = {} }) {
    return (
        <div
            className={`avatar avatar-${size}${ring ? " avatar-ring" : ""}`}
            style={style}
        >
            {label}
        </div>
    );
}

/* ── BADGE ── */
const BADGE_COLOR_MAP = {
    blue: "badge-blue",
    purple: "badge-purple",
    green: "badge-green",
    yellow: "badge-yellow",
    red: "badge-red",
    teal: "badge-teal",
    gray: "badge-gray",
    GreenTech: "badge-green",
    HealthTech: "badge-purple",
    FinTech: "badge-blue",
    EdTech: "badge-teal",
    SaaS: "badge-blue",
    AgriTech: "badge-yellow",
    active: "badge-green",
    pending: "badge-yellow",
    urgent: "badge-red",
};

export function Badge({ children, color = "blue" }) {
    const cls = BADGE_COLOR_MAP[color] || BADGE_COLOR_MAP[children] || "badge-gray";
    return <span className={`badge ${cls}`}>{children}</span>;
}

/* ── TAG ── */
export function Tag({ children, active = false, onClick }) {
    return (
        <span
            className={`tag${active ? " active" : ""}`}
            onClick={onClick}
        >
            {children}
        </span>
    );
}

/* ── PROGRESS BAR ── */
export function ProgressBar({ value, max, size = "normal", showMeta = true }) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
        <div>
            <div className={`progress-bar${size === "thin" ? " thin" : size === "thick" ? " thick" : ""}`}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            {showMeta && (
                <div className="progress-meta">
                    <span className="progress-label">
                        €{(value / 1000).toFixed(0)}K / €{(max / 1000).toFixed(0)}K
                    </span>
                    <span className="progress-value">{pct}%</span>
                </div>
            )}
        </div>
    );
}

/* ── STAT CARD ── */
export function StatCard({ icon, value, label, delta, color = "#5B73F5", bgColor = "#EEF2FF" }) {
    return (
        <div className="stat-card">
            <div className="stat-icon-wrap" style={{ background: bgColor, color }}>
                {icon}
            </div>
            <div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
            </div>
            {delta && (
                <div className={`stat-delta ${delta.startsWith("+") ? "up" : "down"}`}>
                    {delta.startsWith("+") ? "↑" : "↓"} {delta}
                </div>
            )}
        </div>
    );
}

/* ── PROJECT CARD ── */

// Ajoute cet import en haut de UI.jsx
// (isProjectSaved et toggleSave viennent du context)

export function ProjectCard({ project, onClick, compact = false }) {

    const { toggleSave, isProjectSaved } = useApp();
    const pct = Math.round((project.raised / project.goal) * 100);
    const saved = isProjectSaved(project.id);

    return (
        <div
            className="card card-interactive"
            onClick={onClick}
            style={{ padding: compact ? "14px" : "20px" }}
        >
            {/* Cover avec bookmark button */}
            <div style={{ position: "relative" }}>
                <div style={{
                    height: compact ? 80 : 110,
                    borderRadius: "var(--r-md)",
                    background: project.colorBg || "#EEF2FF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: compact ? 32 : 44,
                    marginBottom: 14,
                    border: "1px solid var(--border)",
                }}>
                    {project.emoji}
                </div>

                {/* ── Bookmark button ── */}
                <button
                    onClick={e => { e.stopPropagation(); toggleSave(project.id); }}
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.92)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: 16,
                        transition: "var(--tr-fast)",
                        backdropFilter: "blur(8px)",
                    }}
                    title={saved ? "Retirer des favoris" : "Sauvegarder"}
                >
                    {saved ? "⭐" : "☆"}
                </button>
            </div>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: compact ? 14 : 16, letterSpacing: "-.02em" }}>
                        {project.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                        {project.category}
                    </div>
                </div>
                <Badge color={project.category}>{project.tags[0]}</Badge>
            </div>

            {!compact && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 14 }}>
                    {project.tagline}
                </p>
            )}

            <ProgressBar value={project.raised} max={project.goal} size="thin" />

            {!compact && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {project.tags.map(t => (
                        <Badge key={t} color="gray">{t}</Badge>
                    ))}
                    <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
                        👥 {project.investors}
                    </span>
                </div>
            )}
        </div>

    );
}

/* ── PROFILE CARD ── */
export function ProfileCard({ user, onClick }) {
    return (
        <div className="card card-hover" style={{ padding: 20, cursor: "pointer" }} onClick={onClick}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
                <Avatar label={user.avatar} size="lg" />
                <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
                        {user.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {user.university || user.company}
                    </div>
                </div>
            </div>
            {user.bio && (
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
                    {user.bio.slice(0, 100)}…
                </p>
            )}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(user.skills || user.interests || []).slice(0, 3).map(s => (
                    <Badge key={s} color="blue">{s}</Badge>
                ))}
            </div>
        </div>
    );
}

/* ── NOTIFICATION ITEM ── */
export function NotificationItem({ notif, onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: "flex",
                gap: 12,
                padding: "14px 16px",
                borderRadius: "var(--r-md)",
                background: notif.unread ? "var(--accent-light)" : "var(--bg-card)",
                border: `1px solid ${notif.unread ? "var(--accent-mid)" : "var(--border)"}`,
                cursor: "pointer",
                transition: "var(--tr-fast)",
                alignItems: "flex-start",
            }}
        >
            <><span style={{ fontSize: 22, flexShrink: 0 }}>{notif.icon}</span><div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{notif.title}</span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0, marginLeft: 8 }}>
                        {notif.time}
                    </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {notif.desc}
                </p>
            </div>
            </>
            {
                notif.unread && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, marginTop: 4 }} />
                )
            }
        </div >
    );
}


/* ── CHAT MESSAGE ── */
export function ChatMessage({ message, senderLabel }) {
    return (
        <div style={{ display: "flex", justifyContent: message.me ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
            {!message.me && <Avatar label={senderLabel} size="xs" />}
            <div style={{ maxWidth: "68%" }}>
                <div style={{
                    padding: "10px 14px",
                    borderRadius: message.me ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: message.me
                        ? "linear-gradient(135deg, var(--accent), var(--purple))"
                        : "var(--bg-card)",
                    border: message.me ? "none" : "1px solid var(--border)",
                    color: message.me ? "white" : "var(--text-primary)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    boxShadow: "var(--shadow-xs)",
                }}>
                    {message.text}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, textAlign: message.me ? "right" : "left" }}>
                    {message.time}
                </div>
            </div>
        </div>
    );
}

/* ── STEP INDICATOR ── */
export function StepIndicator({ steps, currentStep }) {
    return (
        <div className="steps">
            {steps.map((label, i) => {
                const n = i + 1;
                const isDone = n < currentStep;
                const isOn = n === currentStep;
                return (
                    <div key={n} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                        <div className={`step-circle${isOn ? " active" : ""}${isDone ? " done" : ""}`}>
                            {isDone ? "✓" : n}
                        </div>
                        <span className={`step-label${isOn ? " active" : ""}${isDone ? " done" : ""}`}>
                            {label}
                        </span>
                        {i < steps.length - 1 && (
                            <div className={`step-line${isDone ? " done" : ""}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* ── AI BADGE ── */
export function AIBadge() {
    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 8px",
            borderRadius: "var(--r-full)",
            background: "linear-gradient(135deg, rgba(91,115,245,.12), rgba(139,92,246,.12))",
            border: "1px solid rgba(91,115,245,.2)",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--accent)",
        }}>
            🤖 IA
        </span>
    );
}

/* ── TOAST ── */
export function Toast() {
    const { toast } = useApp();
    if (!toast) return null;
    return (
        <div className="toast-container">
            <div className={`toast ${toast.type}`}>
                {toast.type === "success" && "✅ "}
                {toast.type === "error" && "❌ "}
                {toast.type === "info" && "ℹ️ "}
                {toast.message}
            </div>
        </div>
    );
}

/* ── NAVBAR ── */
export function Navbar() {
    const { currentUser, navigate, currentPage, unreadCount, unreadMessages, logout } = useApp();

    const studentLinks = [["dashboard-student", "Dashboard"], ["explore", "Explorer"], ["publish", "Publier"]];
    const investorLinks = [["dashboard-investor", "Dashboard"], ["explore", "Explorer"]];
    const links =
        currentUser?.role === "student" ? studentLinks :
            currentUser?.role === "investor" ? investorLinks : [];

    return (
        <header className="navbar">
            <span className="navbar-logo" onClick={() => navigate("home")}>  ← Launchpad</span>

            {currentUser && (
                <button
                    className="navbar-icon-btn navbar-logout-btn"
                    onClick={logout}
                    title="Déconnexion"
                >
                    🚪
                </button>
            )}

            <nav className="navbar-links">
                {links.map(([id, label]) => (

                    <button
                        key={id}
                        className={`navbar-link${currentPage === id ? " active" : ""}`}
                        onClick={() => navigate(id)}
                    >
                        {label}
                    </button>



                ))}
            </nav>

            <div className="navbar-actions">
                {currentUser ? (
                    <>
                        <button
                            className="navbar-icon-btn"
                            onClick={() => navigate("messages")}
                            title="Messages"
                        >
                            💬
                            {unreadMessages > 0 && (
                                <span className="notif-badge" style={{ position: "absolute", top: -4, right: -4 }}>
                                    {unreadMessages}
                                </span>
                            )}
                        </button>

                        <button
                            className="navbar-icon-btn"
                            onClick={() => navigate("notifications")}
                            title="Notifications"
                        >
                            🔔
                            {unreadCount > 0 && (
                                <span className="notif-badge" style={{ position: "absolute", top: -4, right: -4 }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <button
                            className="navbar-avatar-btn"
                            onClick={() => navigate(
                                currentUser.role === "investor" ? "profile-investor" :
                                    currentUser.role === "admin" ? "admin" : "profile-student"
                            )}
                        >
                            <Avatar label={currentUser.avatar} size="sm" />
                            <span style={{ fontSize: 13.5, fontWeight: 600 }}>
                                {currentUser.firstName}
                            </span>
                        </button>
                    </>
                ) : (
                    <>
                        <button className="btn btn-secondary btn-sm" onClick={() => navigate("login")}>
                            Connexion
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate("register")}>
                            S'inscrire
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}

/* ── SIDEBAR ── */
export function Sidebar() {
    const { currentUser, currentPage, navigate, logout, unreadMessages, unreadCount } = useApp();
    if (!currentUser) return null;

    const studentItems = [
        { id: "dashboard-student", icon: "🏠", label: "Tableau de bord" },
        { id: "explore", icon: "🔍", label: "Explorer" },
        { id: "publish", icon: "➕", label: "Publier un projet" },
        { id: "collaboration", icon: "🤝", label: "Collaborations" },
        { id: "investor-requests", icon: "📋", label: "Offres investisseurs" },
        { id: "messages", icon: "💬", label: "Messages", badge: unreadMessages },
        { id: "notifications", icon: "🔔", label: "Notifications", badge: unreadCount },
        { id: "profile-student", icon: "👤", label: "Mon profil" },
    ];
    const investorItems = [
        { id: "dashboard-investor", icon: "🏠", label: "Tableau de bord" },
        { id: "explore", icon: "🔍", label: "Explorer" },
        { id: "messages", icon: "💬", label: "Messages", badge: unreadMessages },
        { id: "notifications", icon: "🔔", label: "Notifications", badge: unreadCount },
        { id: "profile-investor", icon: "👤", label: "Mon profil" },
    ];
    const adminItems = [
        { id: "admin", icon: "📊", label: "Vue d'ensemble" },
        { id: "explore", icon: "📦", label: "Projets" },
        { id: "messages", icon: "👥", label: "Utilisateurs" },
        { id: "notifications", icon: "🚨", label: "Modération" },
    ];

    const items =
        currentUser.role === "student" ? studentItems :
            currentUser.role === "investor" ? investorItems : adminItems;

    return (
        <aside className="sidebar">
            {items.map(item => (
                <button
                    key={item.id}
                    className={`sidebar-item${currentPage === item.id ? " active" : ""}`}
                    onClick={() => navigate(item.id)}
                >
                    <span className="si-icon">{item.icon}</span>
                    {item.label}
                    {item.badge > 0 && <span className="si-badge">{item.badge}</span>}
                </button>
            ))}

            <div style={{ flex: 1 }} />
            <div className="sidebar-divider" />

            <div
                className="sidebar-user"
                onClick={() => navigate(
                    currentUser.role === "investor" ? "profile-investor" : "profile-student"
                )}
            >
                <Avatar label={currentUser.avatar} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sidebar-user-name">{currentUser.name}</div>
                    <div className="sidebar-user-role">
                        {currentUser.university || currentUser.company || "Administrateur"}
                    </div>
                </div>
            </div>

            <button
                className="sidebar-item"
                style={{ color: "var(--danger)", marginTop: 4 }}
                onClick={logout}
            >
                <span className="si-icon">🚪</span>Se déconnecter
            </button>
        </aside>
    );
}

/* ── BACK BUTTON ── */
export function BackButton({ onClick, label = "Retour" }) {
    const { goBack } = useApp();
    return (
        <button
            className="btn btn-ghost btn-sm"
            onClick={onClick || goBack}
            style={{ marginBottom: 16 }}
        >
            ← {label}
        </button>
    );
}

/* ── EMPTY STATE ── */
export function EmptyState({ icon, title, description, action, onAction }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center", gap: 12 }}>
            <div style={{ fontSize: 48 }}>{icon}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>{title}</div>
            <div style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 300, lineHeight: 1.6 }}>{description}</div>
            {action && (
                <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={onAction}>
                    {action}
                </button>
            )}
        </div>
    );
}
