// ============================================================
// LAUNCHPAD — Profile Investor Page
// ============================================================

import { useApp } from "../context/AppContext";
import { Avatar, Badge } from "../components/UI";
import { PROJECTS, USERS } from "../data/mockData";
import "./OtherPages.css";

export default function ProfileInvestor() {
    const { navigate, currentUser } = useApp();
    const user = currentUser;
    console.log("USERS=", USERS)
    console.log("Investor = ", USERS.investor)
    console.log("STATS =", user.stats)

    return (
        <div className="animate-fadeUp">

            {/* ── Cover + Avatar ── */}
            <div style={{ position: "relative", marginBottom: 60 }}>
                <div
                    className="profile-cover"
                    style={{
                        background: "linear-gradient(135deg, rgba(34,197,94,.12), rgba(91,115,245,.10))",
                    }}
                />
                <div className="profile-avatar-wrap">
                    <Avatar
                        label={user.avatar}
                        size="2xl"
                        ring
                        style={{ background: "linear-gradient(135deg, #22C55E, #5B73F5)" }}
                    />
                </div>

                <div className="profile-header-bar" style={{ paddingLeft: 160 }}>
                    <div>
                        <div className="profile-name">{user.name}</div>
                        <div className="profile-sub">Partner @ {user.company} · {user.location}</div>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate("messages")}>
                        💬 Contacter
                    </button>
                </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="card" style={{ marginBottom: 24, overflow: "hidden" }}>
                <div className="profile-stats-strip">
                    {[
                        ["💼", user.stats?.projects, "Projets financés"],
                        ["📈", user.stats?.avgReturn, "Rendement moyen"],
                        ["⭐", user.stats?.rating, "Note plateforme"],
                        ["💰", user.stats?.invested, "Investi total"],
                    ].map(([ico, v, l]) => (
                        <div key={l} className="profile-stat">
                            <div className="profile-stat-icon">{ico}</div>
                            <div className="profile-stat-value">{v}</div>
                            <div className="profile-stat-label">{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Content ── */}
            <div className="two-col">
                <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* À propos */}
                    <div className="card" style={{ padding: 22 }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>À propos</div>
                        <p className="profile-about-text">{user.bio}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {user.interests.map(s => (
                                <Badge key={s} color="green">{s}</Badge>
                            ))}
                        </div>
                    </div>

                    {/* Portfolio */}
                    <div className="card" style={{ overflow: "hidden" }}>
                        <div style={{ padding: "14px 18px 0" }}>
                            <div className="section-title">Portfolio investi</div>
                        </div>
                        <div style={{ paddingTop: 8 }}>
                            <div className="portfolio-detail-header">
                                {["Projet", "Montant", "Rendement"].map(h => (
                                    <span key={h}>{h}</span>
                                ))}
                            </div>
                            {user.portfolio.map((item, i) => {
                                const project = PROJECTS.find(p => p.title === item.name);
                                const isUp = item.return.startsWith("+");
                                return (
                                    <div
                                        key={i}
                                        className="portfolio-detail-row"
                                        onClick={() => project && navigate("project-detail", { project })}
                                    >
                                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                                        <span style={{ fontWeight: 600 }}>{item.amount}</span>
                                        <span style={{ fontWeight: 700, color: isUp ? "var(--success)" : "var(--danger)" }}>
                                            {isUp ? "↑" : "↓"} {item.return}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* ── Sidebar ── */}
                <div className="two-col-side">

                    {/* Critères */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 14 }}>
                            Critères d'investissement
                        </div>
                        {[
                            ["💰", "Ticket minimum", user.criteria.minTicket],
                            ["📈", "Ticket maximum", user.criteria.maxTicket],
                            ["📊", "Stade minimum", user.criteria.stage],
                            ["🌍", "Zone géographique", user.criteria.region],
                        ].map(([ico, label, value]) => (
                            <div key={label} className="profile-info-row">
                                <span>{ico}</span>
                                <span className="profile-info-key">{label}</span>
                                <span className="profile-info-value">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Infos */}
                    <div className="card" style={{ padding: 20 }}>
                        <div className="section-title" style={{ marginBottom: 12 }}>Informations</div>
                        {[
                            ["📅", "Membre depuis", user.joinedAt],
                            ["🏢", "Fonds", user.company],
                            ["📍", "Localisation", user.location],
                        ].map(([ico, label, value]) => (
                            <div key={label} className="profile-info-row">
                                <span>{ico}</span>
                                <span className="profile-info-key">{label}</span>
                                <span className="profile-info-value">{value}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn btn-primary btn-full"
                        onClick={() => navigate("messages")}
                    >
                        💬 Envoyer un message
                    </button>

                </div>
            </div>
        </div>
    );
}