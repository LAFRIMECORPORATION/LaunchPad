// ============================================================
// LAUNCHPAD — Profile Student Page
// Chemin : src/pages/ProfileStudent.jsx
// ============================================================

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, Badge, ProjectCard } from "../components/UI";
import { projectsApi } from "../utils/api";
import "./OtherPages.css";

export default function ProfileStudent() {
  const { navigate, currentUser } = useApp();
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = currentUser || {};
  const profile = user.profile || {};
  const projectCount = myProjects.length;
  const skills = profile.skills || user.skills || [];
  const links = {
    linkedin: profile.linkedinUrl || user.links?.linkedin || "",
    github: profile.githubUrl || user.links?.github || "",
    portfolio: profile.portfolioUrl || user.links?.portfolio || "",
  };
  const isOwn = currentUser?.role === "student";

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    projectsApi
      .list({ authorId: currentUser.id, page: 1, limit: 12 })
      .then((res) => {
        const data = res.data?.data?.projects || res.data?.projects || res.data?.data || res.data || res;
        setMyProjects(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Erreur chargement projets de l'étudiant :", err);
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  return (
    <div className="animate-fadeUp">
      <div style={{ position: "relative", marginBottom: 60 }}>
        <div
          className="profile-cover"
          style={{
            background: "linear-gradient(135deg, rgba(91,115,245,.15), rgba(139,92,246,.12))",
          }}
        />
        <div className="profile-avatar-wrap">
          <Avatar label={user.avatarUrl || user.avatar || user.firstName?.[0] || "E"} size="2xl" ring />
        </div>

        <div className="profile-header-bar" style={{ paddingLeft: 160 }}>
          <div>
            <div className="profile-name">{`${user.firstName || "Étudiant"} ${user.lastName || ""}`.trim()}</div>
            <div className="profile-sub">{profile.university || "Université inconnue"} · {profile.location || "Localisation inconnue"}</div>

            <div style={{ marginTop: 10 }}>
              {currentUser?.kycValidated ? (
                <span className="kyc-badge kyc-badge--verified">✅ Compte vérifié</span>
              ) : currentUser?.kycStatus === "submitted" ? (
                <span className="kyc-badge kyc-badge--submitted">⏳ Vérification en cours</span>
              ) : (
                <button
                  className="kyc-badge kyc-badge--pending"
                  onClick={() => navigate("kyc-verification")}
                  style={{ cursor: "pointer", border: "none", fontFamily: "inherit" }}
                >
                  ⚠️ Vérifier mon compte
                </button>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {isOwn ? (
              <button className="btn btn-secondary" style={{ minWidth: 0 }} onClick={() => navigate("profile-edit")}>Modifier</button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => navigate("messages", { targetUserId: currentUser?.id })}>
                  Message
                </button>
                <button className="btn btn-primary" onClick={() => navigate("collaboration")} style={{ whiteSpace: "nowrap" }}>
                  Collaborer
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, overflow: "hidden" }}>
        <div className="profile-stats-strip">
          {[
            ["📁", projectCount, "Projets publiés"],
            ["💸", profile.raised ?? "N/A", "Financements levés"],
            ["🤝", profile.collabs ?? user.stats?.collabs ?? "N/A", "Collaborations"],
            ["⭐", user.reputationScore ?? profile.score ?? "N/A", "Score crédibilité"],
          ].map(([icon, value, label]) => (
            <div key={label} className="profile-stat">
              <div className="profile-stat-icon">{icon}</div>
              <div className="profile-stat-value">{value}</div>
              <div className="profile-stat-label">{label}</div>
            </div>
          ))}
          <div className="profile-stat">
            <div className="profile-stat-icon">🛡️</div>
            <div className="profile-stat-value">{currentUser?.kycValidated ? "40" : "0"}</div>
            <div className="profile-stat-label">Score réputation</div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card" style={{ padding: 22 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>À propos</div>
            <p className="profile-about-text">{user.bio || "Aucune description disponible."}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {skills.map((skill) => (
                <Badge key={skill} color="blue">{skill}</Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="section-header">
              <span className="section-title">Projets publiés</span>
              <Badge color="gray">{projectCount}</Badge>
            </div>
            <div className="grid-2">
              {loading ? (
                <div style={{ padding: 20, color: "var(--text-secondary)" }}>Chargement des projets...</div>
              ) : projectCount === 0 ? (
                <div style={{ padding: 20, color: "var(--text-secondary)" }}>Aucun projet publié pour le moment.</div>
              ) : (
                myProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => navigate("project-detail", { project })}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="two-col-side">
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Liens</div>
            {[
              ["🔗", "LinkedIn", links.linkedin],
              ["🐙", "GitHub", links.github],
              ["🧾", "Portfolio", links.portfolio],
            ].map(([icon, label, href]) => (
              <a
                key={label}
                href={href || "#"}
                className="profile-link"
                target="_blank"
                rel="noreferrer"
                style={{ pointerEvents: href ? "auto" : "none", opacity: href ? 1 : 0.5 }}
              >
                {icon} {label}
              </a>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Informations</div>
            {[
              ["📅", "Membre depuis", user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "Non spécifié"],
              ["🎓", "Université", profile.university || "Non spécifié"],
              ["📍", "Localisation", profile.location || "Non spécifié"],
            ].map(([icon, label, value]) => (
              <div key={label} className="profile-info-row">
                <span>{icon}</span>
                <span className="profile-info-key">{label}</span>
                <span className="profile-info-value">{value}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20, marginTop: 16 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>Badges obtenus</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { icon: "🏅", label: "Premier projet", earned: projectCount > 0 },
                { icon: "🔥", label: "Trending", earned: false },
                { icon: "🤝", label: "Collaborateur", earned: false },
                { icon: "💰", label: "Financement", earned: false },
              ].map((badge) => (
                <div
                  key={badge.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "10px 14px",
                    borderRadius: "var(--r-md)",
                    border: "1px solid var(--border)",
                    background: badge.earned ? "var(--accent-light)" : "var(--bg-card)",
                    opacity: badge.earned ? 1 : 0.5,
                    flex: "1 1 calc(50% - 5px)",
                    minWidth: 75,
                  }}
                >
                  <span style={{ fontSize: 24, filter: badge.earned ? "none" : "grayscale(1)" }}>{badge.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textAlign: "center" }}>{badge.label}</span>
                </div>
              ))}
              <button
                className="btn btn-secondary btn-sm btn-full"
                onClick={() => navigate("badges")}
                style={{ marginTop: 6 }}
              >
                Voir tous
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
