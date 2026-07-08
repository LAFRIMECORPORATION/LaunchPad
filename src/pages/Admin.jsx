// ============================================================
// LAUNCHPAD — Admin.jsx  ✅ BRANCHÉ SUR L'API RÉELLE
// Chemin : src/pages/Admin.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { StatCard, Badge } from "../components/UI";
import { kycApi, adminApi } from "../utils/api";
import "./OtherPages.css";

// ── Formatage ──────────────────────────────────────────────
function fmt(n) {
  return Number(n || 0).toLocaleString("fr-FR");
}
function fmtXAF(n) {
  const v = Number(n || 0);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M XAF`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}K XAF`;
  return `${v} XAF`;
}

export default function Admin() {
  const { navigate, showToast } = useApp();
  const [tab, setTab] = useState("overview");

  // ── Stats ─────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // ── KYC ───────────────────────────────────────────────────
  const [kycList, setKycList]   = useState([]);
  const [kycLoading, setKycLoading] = useState(false);

  // ── Projects ──────────────────────────────────────────────
  const [pendingProjects, setPendingProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // ── Users ─────────────────────────────────────────────────
  const [users, setUsers]       = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch]    = useState("");

  // ── Audit logs ────────────────────────────────────────────
  const [auditLogs, setAuditLogs]     = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const TABS = [
    { id: "overview",  icon: "📊", label: "Vue d'ensemble"                         },
    { id: "projects",  icon: "📦", label: `Projets (${pendingProjects.length})`    },
    { id: "users",     icon: "👥", label: "Utilisateurs"                           },
    { id: "kyc",       icon: "🛡️", label: `KYC (${kycList.length})`               },
    { id: "audit",     icon: "📋", label: "Audit logs"                             },
  ];

  // ── Chargement stats globales ─────────────────────────────
  useEffect(() => {
    async function loadStats() {
      setStatsLoading(true);
      try {
        const res  = await adminApi.getStats();
        setStats(res.data || res);
      } catch (err) {
        showToast(err.message || "Erreur chargement statistiques.", "error");
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Chargement selon onglet actif ─────────────────────────
  const loadKyc = useCallback(async () => {
    setKycLoading(true);
    try {
      const res  = await kycApi.getPending({ page: 1, limit: 20 });
      const data = res.data?.data || res.data || res;
      setKycList(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || "Erreur chargement KYC.", "error");
    } finally {
      setKycLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProjects = useCallback(async () => {
    setProjectsLoading(true);
    try {
      const res  = await adminApi.getProjects({ status: "pending", limit: 50 });
      const data = res.data?.projects || res.data || [];
      setPendingProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || "Erreur chargement projets.", "error");
    } finally {
      setProjectsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = useCallback(async (search = "") => {
    setUsersLoading(true);
    try {
      const res  = await adminApi.getUsers({ search: search || undefined, limit: 30 });
      const data = res.data?.users || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || "Erreur chargement utilisateurs.", "error");
    } finally {
      setUsersLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res  = await adminApi.getAuditLogs({ limit: 50 });
      const data = res.data?.logs || res.data || [];
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || "Erreur chargement logs.", "error");
    } finally {
      setAuditLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tab === "overview") {
      loadProjects();
      loadKyc();
    } else if (tab === "kyc")      loadKyc();
    else if (tab === "projects")   loadProjects();
    else if (tab === "users")      loadUsers();
    else if (tab === "audit")      loadAuditLogs();
  }, [tab, loadKyc, loadProjects, loadUsers, loadAuditLogs]);

  // ── Actions Projets ───────────────────────────────────────
  async function handleApproveProject(id) {
    try {
      await adminApi.approveProject(id, "Projet approuvé par l'administration");
      showToast("Projet approuvé ✅", "success");
      setPendingProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      showToast(err.message || "Erreur approbation projet.", "error");
    }
  }

  async function handleRejectProject(id) {
    const reason = window.prompt("Motif du rejet :");
    if (!reason?.trim()) return showToast("Un motif est requis.", "error");
    try {
      await adminApi.rejectProject(id, reason.trim());
      showToast("Projet rejeté ✕", "info");
      setPendingProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      showToast(err.message || "Erreur rejet projet.", "error");
    }
  }

  // ── Actions KYC ───────────────────────────────────────────
  async function handleApproveKyc(userId, name) {
    try {
      await kycApi.approve(userId);
      showToast(`✅ KYC de ${name} approuvé !`, "success");
      setKycList(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      showToast(err.message || "Erreur approbation KYC.", "error");
    }
  }

  async function handleRejectKyc(userId, name) {
    const reason = window.prompt(`Motif du refus pour ${name} :`);
    if (!reason?.trim()) return showToast("Un motif est obligatoire.", "error");
    try {
      await kycApi.reject(userId, reason.trim());
      showToast(`KYC de ${name} refusé.`, "info");
      setKycList(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      showToast(err.message || "Erreur rejet KYC.", "error");
    }
  }

  async function handleRequestDocs(userId, name) {
    const docsStr = window.prompt("Documents manquants (séparés par des virgules) :");
    if (!docsStr?.trim()) return showToast("La liste ne peut pas être vide.", "error");
    const docs = docsStr.split(",").map(d => d.trim()).filter(Boolean);
    try {
      await kycApi.requestDocs(userId, docs);
      showToast("Demande de documents envoyée.", "info");
    } catch (err) {
      showToast(err.message || "Erreur lors de la demande.", "error");
    }
  }

  // ── Actions Users ─────────────────────────────────────────
  async function handleToggleUser(userId, isActive, name) {
    const reason = !isActive ? undefined : window.prompt(`Raison de la suspension de ${name} :`);
    try {
      await adminApi.toggleUserStatus(userId, reason || undefined);
      showToast(isActive ? `${name} suspendu.` : `${name} réactivé.`, isActive ? "info" : "success");
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
    } catch (err) {
      showToast(err.message || "Erreur mise à jour utilisateur.", "error");
    }
  }

  return (
    <div className="animate-fadeUp">

      {/* ── Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard Administrateur</h1>
          <p className="page-subtitle">Supervision et modération de la plateforme Launchpad.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("home")}>
            ← Quitter admin
          </button>
        </div>
      </div>

      {/* ── Stats globales ── */}
      {statsLoading ? (
        <div className="loading-state" style={{ minHeight: 80 }}>
          <div className="spinner" />
        </div>
      ) : stats && (
        <div className="grid-5" style={{ marginBottom: 24, display: "grid", gap: 16 }}>
          <StatCard icon="👥" value={fmt(stats.users?.total)}     label="Utilisateurs inscrits" color="#5B73F5" bgColor="#EEF2FF" delta={`+${fmt(stats.users?.new30d)} ce mois`} />
          <StatCard icon="📦" value={fmt(stats.projects?.total)}  label="Projets publiés"       color="#22C55E" bgColor="#F0FDF4" delta={`${fmt(stats.projects?.active)} actifs`} />
          <StatCard icon="⏳" value={fmt(stats.projects?.pending)} label="En attente"           color="#F59E0B" bgColor="#FFFBEB" />
          <StatCard icon="🛡️" value={fmt(stats.users?.pendingKyc)} label="KYC en attente"      color="var(--accent)" bgColor="rgba(91,115,245,.1)" />
          <StatCard icon="💰" value={fmtXAF(stats.investments?.totalVolume)} label="Volume investi" color="#8B5CF6" bgColor="#F3EFFE" delta={`revenus 30j : ${fmtXAF(stats.investments?.revenue30d)}`} />
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`admin-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          VUE D'ENSEMBLE
      ════════════════════════════════════════════════ */}
      {tab === "overview" && (
        <div className="two-col">
          <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* File de modération */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="section-title">File de modération</div>
                <Badge color="yellow">{pendingProjects.length} en attente</Badge>
              </div>
              {projectsLoading ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Chargement…</div>
              ) : pendingProjects.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>✅ Aucun projet en attente</div>
              ) : (
                pendingProjects.slice(0, 5).map(p => (
                  <div key={p.id} className="pending-row">
                    <div className="pending-row-info">
                      <div className="pending-row-title">{p.title}</div>
                      <div className="pending-row-meta">
                        {p.author?.firstName} {p.author?.lastName} · {p.category}
                      </div>
                    </div>
                    <Badge color="blue">{p.stage || "Nouveau"}</Badge>
                    <div className="pending-row-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleApproveProject(p.id)}>✓</button>
                      <button className="btn btn-danger btn-sm"  onClick={() => handleRejectProject(p.id)}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* KYC en attente */}
            <div className="card" style={{ overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="section-title">KYC en attente</div>
                <Badge color="purple">{kycList.length} dossiers</Badge>
              </div>
              {kycLoading ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Chargement…</div>
              ) : kycList.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>✅ Aucun dossier KYC en attente</div>
              ) : (
                kycList.slice(0, 3).map(u => (
                  <div key={u.id} className="pending-row">
                    <div className="pending-row-info">
                      <div className="pending-row-title">{u.firstName} {u.lastName}</div>
                      <div className="pending-row-meta">{u.role} · {u.email}</div>
                    </div>
                    <div className="pending-row-actions">
                      <button className="btn btn-success btn-sm" onClick={() => handleApproveKyc(u.id, `${u.firstName} ${u.lastName}`)}>✓ Valider</button>
                      <button className="btn btn-danger btn-sm"  onClick={() => handleRejectKyc(u.id, `${u.firstName} ${u.lastName}`)}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar stats répartition */}
          {stats && (
            <div className="two-col-side">
              <div className="card" style={{ padding: 20 }}>
                <div className="section-title" style={{ marginBottom: 14 }}>👥 Répartition utilisateurs</div>
                {(stats.users?.byRole || []).map(r => (
                  <div key={r.role} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                    <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{r.role}</span>
                    <strong>{fmt(r.count)}</strong>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding: 20, marginTop: 16 }}>
                <div className="section-title" style={{ marginBottom: 14 }}>📦 Projets par catégorie</div>
                {(stats.projects?.byCategory || []).slice(0, 5).map(c => (
                  <div key={c.category} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{c.category}</span>
                    <strong>{fmt(c.count)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          PROJETS
      ════════════════════════════════════════════════ */}
      {tab === "projects" && (
        <div className="admin-section card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>📦 File d'attente des projets</div>
          {projectsLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" /></div>
          ) : pendingProjects.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucun projet en attente.</div>
          ) : (
            pendingProjects.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: 20, padding: 16, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                  {p.coverImageUrl ? (
                    <img src={p.coverImageUrl} alt={p.title} style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                  ) : (
                    <div style={{ width: 120, height: 80, background: "var(--bg-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: "1px solid var(--border)" }}>
                      📦
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{p.title}</h3>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                      <strong>Auteur:</strong> {p.author?.firstName} {p.author?.lastName} · {p.author?.email}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge color="blue">{p.category}</Badge>
                      {p.stage && <Badge color="green">{p.stage}</Badge>}
                    </div>
                  </div>
                </div>

                {p.description && (
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 12 }}>
                    {p.description}
                  </p>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, padding: 12, background: "var(--bg-light)", borderRadius: 6, marginBottom: 12, fontSize: 13 }}>
                  <div>
                    <div style={{ color: "var(--text-muted)" }}>Objectif</div>
                    <strong>{Number(p.goalAmount || 0).toLocaleString("fr-FR")} XAF</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-muted)" }}>Equity</div>
                    <strong>{p.equity || p.equityPct || 0}%</strong>
                  </div>
                  <div>
                    <div style={{ color: "var(--text-muted)" }}>Deadline</div>
                    <strong>{p.deadline ? new Date(p.deadline).toLocaleDateString("fr-FR") : "N/A"}</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, fontSize: 13, marginBottom: 12 }}>
                  {p.githubUrl    && <a href={p.githubUrl}    target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>🔗 GitHub</a>}
                  {p.demoVideoUrl && <a href={p.demoVideoUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>🎥 Démo</a>}
                  {p.pitchDeckUrl && <a href={p.pitchDeckUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>📊 Pitch</a>}
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <button className="btn btn-success btn-sm" onClick={() => handleApproveProject(p.id)}>✓ Approuver</button>
                  <button className="btn btn-danger btn-sm"  onClick={() => handleRejectProject(p.id)}>✕ Rejeter</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          UTILISATEURS
      ════════════════════════════════════════════════ */}
      {tab === "users" && (
        <div className="admin-section card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>👥 Gestion des utilisateurs</div>
          <div style={{ marginBottom: 16 }}>
            <input
              className="form-input"
              placeholder="Rechercher par nom ou email…"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && loadUsers(userSearch)}
              style={{ maxWidth: 360 }}
            />
            <button className="btn btn-secondary btn-sm" style={{ marginLeft: 8 }} onClick={() => loadUsers(userSearch)}>
              Rechercher
            </button>
          </div>

          {usersLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucun utilisateur trouvé.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                    {["Nom", "Email", "Rôle", "KYC", "Score", "Statut", "Actions"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                      <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>{u.email}</td>
                      <td style={{ padding: "10px 12px" }}><Badge color="blue">{u.role}</Badge></td>
                      <td style={{ padding: "10px 12px" }}>
                        <Badge color={u.kycValidated ? "green" : u.kycStatus === "submitted" ? "yellow" : "gray"}>
                          {u.kycValidated ? "✅" : u.kycStatus === "submitted" ? "⏳" : "—"}
                        </Badge>
                      </td>
                      <td style={{ padding: "10px 12px" }}>{u.reputationScore ?? 0} pts</td>
                      <td style={{ padding: "10px 12px" }}>
                        <Badge color={u.isActive !== false ? "green" : "gray"}>
                          {u.isActive !== false ? "Actif" : "Suspendu"}
                        </Badge>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <button
                          className={`btn btn-sm ${u.isActive !== false ? "btn-danger" : "btn-success"}`}
                          onClick={() => handleToggleUser(u.id, u.isActive !== false, `${u.firstName} ${u.lastName}`)}
                        >
                          {u.isActive !== false ? "Suspendre" : "Réactiver"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          KYC
      ════════════════════════════════════════════════ */}
      {tab === "kyc" && (
        <div className="admin-section">
          <div className="section-title" style={{ marginBottom: 16, fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>
            🛡️ Dossiers KYC en attente
          </div>

          {kycLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" /></div>
          ) : kycList.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <div className="empty-state__icon" style={{ fontSize: 32 }}>✅</div>
              <div className="empty-state__title">Aucun dossier en attente</div>
            </div>
          ) : (
            <div className="admin-kyc-list">
              {kycList.map(u => (
                <div key={u.id} className="admin-kyc-card card">
                  <div className="admin-kyc-card__header">
                    <div className="admin-kyc-card__avatar">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div className="admin-kyc-card__info">
                      <div className="admin-kyc-card__name">{u.firstName} {u.lastName}</div>
                      <div className="admin-kyc-card__meta">
                        <Badge color="gray">{u.role}</Badge> · {u.email}
                      </div>
                      <div className="admin-kyc-card__date">
                        Soumis le : {u.kycDocuments?.[0]?.createdAt ? new Date(u.kycDocuments[0].createdAt).toLocaleDateString("fr-FR") : "—"}
                      </div>
                    </div>
                    <Badge color="yellow">⏳ En attente</Badge>
                  </div>

                  {u.kycDocuments?.length > 0 && (
                    <div className="admin-kyc-card__docs">
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: "var(--text-secondary)" }}>
                        Pièces jointes :
                      </div>
                      {u.kycDocuments.map(doc => (
                        <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-light)", borderRadius: 6, marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>📂 {doc.docType?.toUpperCase().replace("_", " ")}</span>
                          {(doc.signedUrl || doc.url) && (
                            <a href={doc.signedUrl || doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: "none", color: "var(--accent)" }}>
                              👁️ Ouvrir
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="admin-kyc-card__actions">
                    <button className="btn btn-success btn-sm" onClick={() => handleApproveKyc(u.id, `${u.firstName} ${u.lastName}`)}>
                      ✅ Approuver
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleRequestDocs(u.id, `${u.firstName} ${u.lastName}`)}>
                      📋 Demander corrections
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleRejectKyc(u.id, `${u.firstName} ${u.lastName}`)}>
                      ✕ Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════
          AUDIT LOGS
      ════════════════════════════════════════════════ */}
      {tab === "audit" && (
        <div className="admin-section card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>📋 Logs d'audit</div>
          {auditLoading ? (
            <div style={{ textAlign: "center", padding: 40 }}><div className="spinner" /></div>
          ) : auditLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Aucun log disponible.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                    {["Date", "Admin", "Action", "Entité", "Détails"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(log.createdAt).toLocaleString("fr-FR")}
                      </td>
                      <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                        {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : "—"}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <Badge color={
                          log.action.includes("APPROVED") ? "green" :
                          log.action.includes("REJECTED") ? "gray"  :
                          log.action.includes("SUSPENDED") ? "red"  : "blue"
                        }>
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>
                        {log.entityType} #{log.entityId?.slice(0, 8)}…
                      </td>
                      <td style={{ padding: "10px 12px", color: "var(--text-secondary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.newValues ? JSON.stringify(log.newValues).slice(0, 60) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}