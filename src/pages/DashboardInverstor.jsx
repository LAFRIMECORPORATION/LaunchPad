import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  StatCard,
  ProjectCard,
  AIBadge,
  Badge,
  KycAlert,
} from "../components/UI";
import SocialActions from "../components/SocialActions";
import { paymentsApi, projectsApi, feedApi } from "../utils/api";
import "./Dashboard.css";

function fmt(n) {
  return Math.round(Number(n || 0)).toLocaleString("fr-FR");
}

export default function DashboardInvestor() {
  const { navigate, currentUser } = useApp();

  const [investments, setInvestments] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendLoading, setRecommendLoading] = useState(true);
  const [totalInvested, setTotalInvested] = useState(0);

  useEffect(() => {
    feedApi.get({ limit: 5 })
      .then(res => {
        const events = res.data?.events || res.data || [];
        setRecentActivities(Array.isArray(events) ? events : []);
      })
      .catch(() => setRecentActivities([]));
  }, []);

  useEffect(() => {
    paymentsApi
      .list()
      .then((res) => {
        const list = res.data?.investments || [];
        setInvestments(list);
        setTotalInvested(
          list.reduce((sum, inv) => sum + Number(inv.amount || 0), 0),
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur de chargement des investissements :", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    projectsApi
      .list({ page: 1, limit: 4, sort: "popular", status: "active" })
      .then((res) => {
        const data =
          res.data?.data?.projects ||
          res.data?.projects ||
          res.data?.data ||
          res.data ||
          res;
        setRecommendedProjects(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Erreur chargement recommandations :", err);
      })
      .finally(() => setRecommendLoading(false));
  }, []);

  return (
    <div className="animate-fadeUp">
      {/* ── HEADER DE LA PAGE ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Tableau de bord investisseur</h1>
          <p className="page-subtitle">
            Découvrez et pilotez vos opportunités du moment.
          </p>
        </div>
        <div className="page-header-actions dashboard-investor-header-actions">
          <button
            className="btn btn-primary dashboard-investor-explore-btn"
            onClick={() => navigate("explore")}
          >
            🔍 Explorer les projets
          </button>
        </div>
      </div>

      {/* ── ALERTE KYC INTERACTIVE ── */}
      <KycAlert />

      {/* ── GRILLE DE STATISTIQUES (XAF Localized) ── */}
      <div
        className="grid-4 dashboard-investor-stats-grid"
        style={{ marginBottom: 24, marginTop: 20 }}
      >
        <StatCard
          icon="⭐"
          value={`${investments.length}`}
          label="Projets financés"
          color="#F59E0B"
          bgColor="#FFFBEB"
        />
        <StatCard
          icon="💬"
          value="0"
          label="Messages"
          color="#5B73F5"
          bgColor="#EEF2FF"
        />
        <StatCard
          icon="💰"
          value={`${totalInvested.toLocaleString("fr-FR")} XAF`}
          label="Investi total"
          color="#22C55E"
          bgColor="#F0FDF4"
          delta={
            investments.length
              ? `+${Math.round(totalInvested / investments.length)} XAF moyen`
              : ""
          }
        />
        <StatCard
          icon="🆕"
          value={`${recommendedProjects.length}`}
          label="Projets recommandés"
          color="#8B5CF6"
          bgColor="#F3EFFE"
        />
      </div>

      {/* ── ACCÈS RAPIDE V2 AVEC CONTRÔLE KYC 🔐 ── */}
      <div className="section-title" style={{ marginBottom: 14 }}>
        Accès rapide
      </div>
      <div
        className="grid-4 dashboard-investor-quick-grid"
        style={{ marginBottom: 24 }}
      >
        {[
          {
            icon: "🛒",
            label: "Marketplace",
            id: "investor-requests",
            desc: "Offres et candidatures",
            locked: false,
          },
          {
            icon: "💰",
            label: "Investir",
            id: "payment",
            desc: "MTN · Orange · Stripe",
            locked: !currentUser?.kycValidated,
          },
          {
            icon: "🤖",
            label: "Due Diligence IA",
            id: "due-diligence",
            desc: "Analysez les projets",
            locked: !currentUser?.kycValidated,
          },
          {
            icon: "📅",
            label: "Rendez-vous",
            id: "appointments",
            desc: "Planifiez vos meetings",
            locked: !currentUser?.kycValidated,
          },
          {
            icon: "📰",
            label: "Feed",
            id: "feed",
            desc: "Actualités investisseur",
            locked: false,
          },
          {
            icon: "🏆",
            label: "Badges",
            id: "badges",
            desc: "Votre réputation",
            locked: false,
          },
          {
            icon: "💬",
            label: "Forum",
            id: "forum",
            desc: "Communauté startup Cameroun",
            locked: false,
          },
        ].map((item) => (
          <div
            key={item.id}
            className={`card card-hover quick-access-card${item.locked ? " locked" : ""}`}
            onClick={() =>
              item.locked ? navigate("kyc-verification") : navigate(item.id)
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              (item.locked ? navigate("kyc-verification") : navigate(item.id))
            }
          >
            <div className="quick-access-card__icon">
              {item.icon}
              {item.locked && (
                <span className="quick-access-card__lock">🔐</span>
              )}
            </div>
            <div className="quick-access-card__label">{item.label}</div>
            <div className="quick-access-card__desc">
              {item.locked ? "KYC requis" : item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* ── DESIGN EN DEUX COLONNES ── */}
      <div className="two-col">
        {/* 🏠 COLONNE PRINCIPALE (GAUCHE) */}
        <div
          className="two-col-main"
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* RECOMMANDATIONS IA */}
          <div>
            <div className="section-header" style={{ marginBottom: 14 }}>
              <span className="section-title">
                Projets recommandés <AIBadge />
              </span>
              <span
                className="section-link"
                onClick={() => navigate("explore")}
              >
                Voir tout
              </span>
            </div>
            {recommendLoading ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                Chargement des recommandations...
              </div>
            ) : recommendedProjects.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: 20,
                  color: "var(--text-muted)",
                }}
              >
                Aucune recommandation disponible pour le moment.
              </div>
            ) : (
              <div className="grid-3 dashboard-investor-projects-grid">
                {recommendedProjects.map((p) => (
                  <div
                    key={p.id}
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <ProjectCard
                      project={p}
                      onClick={() => navigate("project-detail", { project: p })}
                    />
                    <div
                      style={{
                        padding: "10px 14px",
                        background: "var(--bg-card)",
                        borderLeft: "1px solid var(--border)",
                        borderRight: "1px solid var(--border)",
                        borderBottom: "1px solid var(--border)",
                        borderRadius: "0 0 var(--r-md) var(--r-md)",
                        marginTop: -1,
                      }}
                    >
                      <button
                        className="btn btn-secondary btn-sm btn-full"
                        onClick={() =>
                          navigate("messages", { targetUserId: p.author?.id })
                        }
                      >
                        💬 Contacter l'équipe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MON PORTFOLIO V2 */}
          <div
            className="card dashboard-investor-portfolio-card"
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="section-title">
                Mes investissements (Cameroun)
              </div>
            </div>
            {loading ? (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                Chargement de vos investissements...
              </div>
            ) : investments.length === 0 ? (
              <div
                style={{
                  padding: 30,
                  textAlign: "center",
                  color: "var(--text-secondary)",
                }}
              >
                <p style={{ marginBottom: 12 }}>
                  Vous n'avez pas encore d'investissements.
                </p>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("explore")}
                >
                  Découvrir les startups
                </button>
              </div>
            ) : (
              <>
                <div className="dashboard-investor-portfolio-table">
                  <div className="portfolio-header">
                    {["Projet", "Méthode", "Montant", "Date", "Statut"].map(
                      (h) => (
                        <span key={h}>{h}</span>
                      ),
                    )}
                  </div>
                  {investments.map((inv) => {
                    const projTitle = inv.project?.title || "Projet inconnu";
                    const dateStr = new Date(inv.createdAt).toLocaleDateString(
                      "fr-FR",
                    );
                    const formattedAmount = `${fmt(inv.amount)} XAF`;

                    // Mapping du badge de statut
                    let statusColor = "gray";
                    let statusText = inv.status;
                    if (inv.status === "pending") {
                      statusColor = "yellow";
                      statusText = "Attente";
                    } else if (inv.status === "in_escrow") {
                      statusColor = "blue";
                      statusText = "En Escrow";
                    } else if (inv.status === "released") {
                      statusColor = "green";
                      statusText = "Libéré";
                    } else if (inv.status === "refunded") {
                      statusColor = "teal";
                      statusText = "Remboursé";
                    } else if (inv.status === "failed") {
                      statusColor = "red";
                      statusText = "Échoué";
                    }

                    return (
                      <div
                        key={inv.id}
                        className="portfolio-row"
                        onClick={() =>
                          inv.project &&
                          navigate("project-detail", { project: inv.project })
                        }
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {projTitle}
                        </span>
                        <span>
                          <Badge color="purple">
                            {inv.paymentMethod?.toUpperCase()}
                          </Badge>
                        </span>
                        <span style={{ fontWeight: 600 }}>
                          {formattedAmount}
                        </span>
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: 13,
                          }}
                        >
                          {dateStr}
                        </span>
                        <Badge color={statusColor}>{statusText}</Badge>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 🗂️ SIDEBAR LATÉRALE (DROITE) */}
        <div
          className="two-col-side"
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* CRITÈRES DE FILTRAGE RÉELS */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div className="section-title">Critères d'investissement</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("profile-investor")}>✏️ Modifier</button>
            </div>
            {[
              ["💰", "Ticket minimum", currentUser?.profile?.minTicket ? `${fmt(currentUser.profile.minTicket)} XAF` : "Non défini"],
              ["📈", "Ticket maximum", currentUser?.profile?.maxTicket ? `${fmt(currentUser.profile.maxTicket)} XAF` : "Non défini"],
              ["📊", "Secteurs ciblés", (currentUser?.interests?.length ? currentUser.interests.join(", ") : (currentUser?.profile?.interests?.join(", ") || "Tous secteurs"))],
              ["🌍", "Zones ciblées", (currentUser?.profile?.investmentRegions?.length ? currentUser.profile.investmentRegions.join(", ") : "Cameroun (CEMAC)")],
            ].map(([ico, label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  gap: 8,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 13,
                }}
              >
                <span>{ico}</span>
                <span style={{ color: "var(--text-secondary)", flex: 1 }}>
                  {label}
                </span>
                <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                  {val}
                </span>
              </div>
            ))}
          </div>

          {/* ACTIVITÉ RÉCENTE DYNAMIQUE */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>
              Activité récente
            </div>
            {recentActivities.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "10px 0" }}>
                Aucune activité récente.
              </div>
            ) : (
              <div className="activity-feed">
                {recentActivities.map((a, i) => (
                  <div key={a.id || i} className="activity-item">
                    <span className="activity-icon">
                      {a.eventType === "project_published" ? "📦" : a.eventType === "investment_made" ? "💰" : "📰"}
                    </span>
                    <div>
                      <div className="activity-text">{a.metadata?.title || a.entityType || "Événement de la plateforme"}</div>
                      <div className="activity-time">{new Date(a.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
