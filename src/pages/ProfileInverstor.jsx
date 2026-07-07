// ============================================================
// LAUNCHPAD — Profile Investor Page
// Chemin : src/pages/ProfileInverstor.jsx
// ============================================================

import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, Badge } from "../components/UI";
import { paymentsApi } from "../utils/api";
import "./OtherPages.css";

export default function ProfileInvestor() {
  const { navigate, currentUser } = useApp();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = currentUser || {};
  const profile = user.profile || {};
  const interests = user.interests || profile.interests || [];

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    paymentsApi
      .list()
      .then((res) => {
        const data = res.data?.investments || res.data?.data?.investments || res.data?.data || res.data || [];
        setInvestments(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Erreur chargement investissements :", err);
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  const portfolioCount = investments.length;

  return (
    <div className="animate-fadeUp">
      <div style={{ position: "relative", marginBottom: 60 }}>
        <div
          className="profile-cover"
          style={{
            background: "linear-gradient(135deg, rgba(34,197,94,.12), rgba(91,115,245,.10))",
          }}
        />
        <div className="profile-avatar-wrap">
          <Avatar
            label={user.avatarUrl || user.avatar || user.firstName?.[0] || "I"}
            size="2xl"
            ring
            style={{ background: "linear-gradient(135deg, #22C55E, #5B73F5)" }}
          />
        </div>

        <div className="profile-header-bar" style={{ paddingLeft: 160 }}>
          <div>
            <div className="profile-name">{`${user.firstName || "Investor"} ${user.lastName || ""}`.trim()}</div>
            <div className="profile-sub">{profile.company || "Investisseur"} · {profile.location || "Non spécifié"}</div>
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
                  ⚠️ Vérifier mon compte →
                </button>
              )}
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => navigate("messages")}>💬 Contacter</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24, overflow: "hidden" }}>
        <div className="profile-stats-strip">
          {[
            ["💼", portfolioCount, "Investissements"],
            ["📈", totalInvested ? `${Math.round(totalInvested / Math.max(portfolioCount, 1))} XAF` : "N/A", "Ticket moyen"],
            ["⭐", user.reputationScore ?? profile.reputationScore ?? "N/A", "Score plateforme"],
            ["💰", `${totalInvested.toLocaleString("fr-FR")} XAF`, "Investi total"],
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
            <p className="profile-about-text">{user.bio || profile.bio || "Aucune description disponible."}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {interests.map((interest) => (
                <Badge key={interest} color="green">{interest}</Badge>
              ))}
            </div>
          </div>

          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 18px 0" }}>
              <div className="section-title">Portfolio investi</div>
            </div>
            <div style={{ paddingTop: 8 }}>
              <div className="portfolio-detail-header">
                {["Projet", "Montant", "Statut"].map((header) => (
                  <span key={header}>{header}</span>
                ))}
              </div>

              {loading ? (
                <div style={{ padding: 30, textAlign: "center", color: "var(--text-secondary)" }}>
                  Chargement du portefeuille...
                </div>
              ) : investments.length === 0 ? (
                <div style={{ padding: 30, textAlign: "center", color: "var(--text-secondary)" }}>
                  Aucune transaction d'investissement trouvée pour le moment.
                </div>
              ) : (
                investments.map((investment) => {
                  const status = investment.status || "N/A";
                  const isReleased = String(status).toLowerCase() === "released";
                  return (
                    <div
                      key={investment.id}
                      className="portfolio-detail-row"
                      onClick={() => investment.project && navigate("project-detail", { project: investment.project })}
                    >
                      <span style={{ fontWeight: 600 }}>{investment.project?.title || "Projet inconnu"}</span>
                      <span style={{ fontWeight: 600 }}>{`${Number(investment.amount || 0).toLocaleString("fr-FR")} XAF`}</span>
                      <span style={{ fontWeight: 700, color: isReleased ? "var(--success)" : "var(--text-secondary)" }}>
                        {isReleased ? "Terminé" : status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="two-col-side">
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>Critères d'investissement</div>
            {[
              ["💰", "Ticket minimum", profile.minTicket || user.criteria?.minTicket],
              ["📈", "Ticket maximum", profile.maxTicket || user.criteria?.maxTicket],
              ["📊", "Stade minimum", profile.stage || user.criteria?.stage],
              ["🌍", "Zone géographique", profile.region || user.criteria?.region],
            ].map(([icon, label, value]) => (
              <div key={label} className="profile-info-row">
                <span>{icon}</span>
                <span className="profile-info-key">{label}</span>
                <span className="profile-info-value">{value || "Non spécifié"}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Informations</div>
            {[
              ["📅", "Membre depuis", user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "Non spécifié"],
              ["🏢", "Société", profile.company || user.company || "Non spécifié"],
              ["📍", "Localisation", profile.location || user.location || "Non spécifié"],
            ].map(([icon, label, value]) => (
              <div key={label} className="profile-info-row">
                <span>{icon}</span>
                <span className="profile-info-key">{label}</span>
                <span className="profile-info-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
