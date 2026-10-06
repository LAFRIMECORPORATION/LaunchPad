// ============================================================
// LAUNCHPAD — AppointmentsPage.jsx  ✅ GESTION MODERNE & ISOLATION DES IDENTITÉS
// Chemin : src/pages/AppointmentsPage.jsx
// ============================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Avatar, KycAlert } from "../components/UI";
import { appointmentsApi, usersApi, projectsApi, messagesApi } from "../utils/api";
import "./Appointments.css";

const STATUS_CONFIG = {
  confirmed: { label: "Confirmé",   cls: "status-confirmed", badgeBg: "#22C55E20", badgeColor: "#22C55E", icon: "✅" },
  pending:   { label: "En attente", cls: "status-pending",   badgeBg: "#F59E0B20", badgeColor: "#F59E0B", icon: "⏳" },
  cancelled: { label: "Annulé",     cls: "status-cancelled", badgeBg: "#EF444420", badgeColor: "#EF4444", icon: "❌" },
  completed: { label: "Terminé",    cls: "status-completed", badgeBg: "#94A3B820", badgeColor: "#94A3B8", icon: "✔️" },
};

const TYPE_LABELS = {
  pitch:         { label: "Présentation projet / Pitch", icon: "🚀" },
  mentoring:     { label: "Mentorat & Conseil stratégique", icon: "💡" },
  due_diligence: { label: "Due Diligence & Audit", icon: "🔍" },
  interview:     { label: "Entretien / Recrutement", icon: "👥" },
  follow_up:     { label: "Point d'étape & Suivi", icon: "📈" },
};

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return "Demain";
  }

  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function getCounterpart(appt, currentUserId) {
  const isOrganizer = (appt.organizer?.id || appt.organizerId) === currentUserId;
  const partner = isOrganizer
    ? (appt.participant || appt.host)
    : (appt.organizer || appt.requester);
  return partner || { firstName: "Utilisateur", lastName: "" };
}

/* ── Modal : Nouveau Rendez-vous ────────────────────────────── */
function ScheduleModal({ onClose, onSubmit, submitting, defaultTargetUserId, currentUser }) {
  const [title, setTitle]                 = useState("");
  const [meetingType, setMeetingType]     = useState("pitch");
  const [participantId, setParticipantId] = useState(defaultTargetUserId || "");
  const [selectedUser, setSelectedUser]   = useState(null);
  const [searchContact, setSearchContact] = useState("");
  const [projectId, setProjectId]         = useState("");
  const [date, setDate]                   = useState("");
  const [time, setTime]                   = useState("14:00");
  const [durationMin, setDurationMin]     = useState(45);
  const [notes, setNotes]                 = useState("");

  const [usersList, setUsersList]         = useState([]);
  const [projectsList, setProjectsList]   = useState([]);
  const [loadingUsers, setLoadingUsers]   = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadContactsAndProjects = async () => {
      setLoadingUsers(true);
      try {
        const contactsMap = new Map();

        // 1. Charger les discussions existantes et isoler le partenaire exact
        const convsRes = await messagesApi.getConversations().catch(() => null);
        const convs = convsRes?.data?.conversations || convsRes?.data || convsRes || [];
        if (Array.isArray(convs)) {
          convs.forEach(c => {
            const partner = c.user1?.id === currentUser?.id ? c.user2 : c.user1;
            if (partner && partner.id && partner.id !== currentUser?.id) {
              contactsMap.set(partner.id, partner);
            }
          });
        }

        // 2. Si un ID cible par défaut est passé
        if (defaultTargetUserId && defaultTargetUserId !== currentUser?.id) {
          const uRes = await usersApi.getById(defaultTargetUserId).catch(() => null);
          const u = uRes?.data?.user || uRes?.data || uRes?.user;
          if (u && isMounted) {
            contactsMap.set(u.id, u);
            setSelectedUser(u);
            setParticipantId(u.id);
          }
        }

        // 3. Charger les auteurs de projets
        const projRes = await projectsApi.list({ limit: 30 }).catch(() => null);
        const projs = projRes?.data?.projects || projRes?.data || projRes?.projects || [];
        if (Array.isArray(projs) && isMounted) {
          setProjectsList(projs);
          projs.forEach(p => {
            if (p.author && p.author.id && p.author.id !== currentUser?.id) {
              contactsMap.set(p.author.id, p.author);
            }
          });
        }

        if (isMounted) {
          const contacts = Array.from(contactsMap.values());
          setUsersList(contacts);

          // Si un participantId est déjà défini mais pas encore d'objet user
          if (defaultTargetUserId && !selectedUser) {
            const found = contacts.find(u => u.id === defaultTargetUserId);
            if (found) setSelectedUser(found);
          }
        }
      } catch (err) {
        console.error("Erreur chargement contacts:", err);
      } finally {
        if (isMounted) setLoadingUsers(false);
      }
    };

    loadContactsAndProjects();
    return () => { isMounted = false; };
  }, [defaultTargetUserId, currentUser?.id]);

  const filteredUsers = useMemo(() => {
    if (!searchContact.trim()) return usersList;
    const q = searchContact.toLowerCase();
    return usersList.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      (u.profile?.company && u.profile.company.toLowerCase().includes(q)) ||
      (u.profile?.university && u.profile.university.toLowerCase().includes(q))
    );
  }, [usersList, searchContact]);

  const canSubmit = title.trim() && date && participantId;

  function handleSubmit() {
    if (!canSubmit || submitting) return;
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    onSubmit({
      title: title.trim(),
      meetingType,
      participantId,
      projectId: projectId || undefined,
      scheduledAt,
      durationMin: Number(durationMin),
      notes: notes.trim() || undefined,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-modern" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span style={{ fontSize: 22 }}>📅</span> Planifier un rendez-vous
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Sujet du RDV */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Sujet de l'échange <span className="req" style={{ color: "var(--error)" }}>*</span>
            </label>
            <input
              className="form-input"
              placeholder="Ex : Session Pitch & Questions/Réponses Investisseur"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ borderRadius: "var(--r-md)", padding: "10px 14px" }}
            />
          </div>

          {/* Destinataire avec sélection visuelle */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Destinataire <span className="req" style={{ color: "var(--error)" }}>*</span>
            </label>

            {selectedUser ? (
              <div className="selected-contact-card">
                <div className="selected-contact-info">
                  <Avatar
                    label={selectedUser.avatarUrl || selectedUser.firstName?.[0] || "U"}
                    size="md"
                    ring
                  />
                  <div className="selected-contact-text">
                    <div className="selected-contact-name">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                    <div className="selected-contact-sub">
                      {selectedUser.role === "investor" ? "💼 Investisseur" : "🎓 Porteur de projet"}
                      {selectedUser.profile?.company ? ` · ${selectedUser.profile.company}` : selectedUser.profile?.university ? ` · ${selectedUser.profile.university}` : ""}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSelectedUser(null);
                    setParticipantId("");
                  }}
                >
                  Changer
                </button>
              </div>
            ) : (
              <div>
                <div className="contact-search-box">
                  <span>🔍</span>
                  <input
                    placeholder="Rechercher par nom, entreprise ou université…"
                    value={searchContact}
                    onChange={e => setSearchContact(e.target.value)}
                  />
                </div>

                <div className="contacts-dropdown-list">
                  {loadingUsers ? (
                    <div style={{ padding: 12, textAlign: "center", fontSize: 13, color: "var(--text-muted)" }}>
                      Chargement des contacts…
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        className="contact-option-item"
                        onClick={() => {
                          setSelectedUser(u);
                          setParticipantId(u.id);
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Avatar label={u.avatarUrl || u.firstName?.[0] || "U"} size="sm" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>
                              {u.firstName} {u.lastName}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                              {u.role === "investor" ? "💼 Investisseur" : "🎓 Porteur de projet"}
                              {u.profile?.company ? ` · ${u.profile.company}` : ""}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Choisir →</span>
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: 12, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
                      Aucun contact trouvé. Saisissez l'ID ou lancez une conversation d'abord.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Type de RDV & Projet associé */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                Type de rendez-vous
              </label>
              <select
                className="form-input form-select"
                value={meetingType}
                onChange={e => setMeetingType(e.target.value)}
                style={{ borderRadius: "var(--r-md)", padding: "10px 14px" }}
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                Projet associé (Optionnel)
              </label>
              <select
                className="form-input form-select"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                style={{ borderRadius: "var(--r-md)", padding: "10px 14px" }}
              >
                <option value="">— Aucun projet particulier —</option>
                {projectsList.map(p => (
                  <option key={p.id} value={p.id}>🚀 {p.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Heure & Durée */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                Date <span className="req" style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                className="form-input"
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setDate(e.target.value)}
                style={{ borderRadius: "var(--r-md)", padding: "10px 12px" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                Heure <span className="req" style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                className="form-input"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                style={{ borderRadius: "var(--r-md)", padding: "10px 12px" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
                Durée
              </label>
              <select
                className="form-input form-select"
                value={durationMin}
                onChange={e => setDurationMin(e.target.value)}
                style={{ borderRadius: "var(--r-md)", padding: "10px 12px" }}
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1 heure</option>
              </select>
            </div>
          </div>

          {/* Notes / Ordre du jour */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600, fontSize: 13 }}>
              Ordre du jour & Points clés (Optionnel)
            </label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Précisez les sujets à aborder (deck, démo technique, valorisation, termes d'investissement)…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ borderRadius: "var(--r-md)", padding: "10px 14px", lineHeight: 1.4 }}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Annuler
          </button>
          <button
            className="btn btn-primary"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            style={{ minWidth: 190, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {submitting ? "Planification…" : "📅 Confirmer le rendez-vous"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { currentUser, navigate, showToast, pageOptions } = useApp();
  const location = useLocation();
  const isInvestor = currentUser?.role === "investor";

  const [tab, setTab]                   = useState("upcoming"); // "upcoming" | "pending" | "past"
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actingId, setActingId]         = useState(null);
  const [showModal, setShowModal]       = useState(false);
  const [scheduling, setScheduling]     = useState(false);

  const targetUserId = location.state?.targetUserId || pageOptions?.targetUserId;

  const loadAppointments = useCallback(async (currentTab) => {
    setLoading(true);
    try {
      const res = await appointmentsApi.getAll({ tab: currentTab });
      const data = res.data || res;
      setAppointments(data.appointments || []);
    } catch (err) {
      showToast(err.message || "Erreur lors du chargement des rendez-vous.", "error");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (currentUser?.kycValidated) {
      loadAppointments(tab);
    }
  }, [tab, currentUser?.kycValidated, loadAppointments]);

  // Ouvrir la modale si un targetUserId est passé
  useEffect(() => {
    if (targetUserId) {
      setShowModal(true);
    }
  }, [targetUserId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* KYC gate */
  if (!currentUser?.kycValidated) {
    return (
      <div className="page-wrapper appointments-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">📅 Mes Rendez-vous</h1>
            <p className="page-subtitle">
              Gérez vos réunions stratégiques avec {isInvestor ? "les porteurs de projets" : "les investisseurs et mentors"}.
            </p>
          </div>
        </div>
        <KycAlert />
        <div className="kyc-gate-full card" style={{ padding: 40, marginTop: 20 }}>
          <div className="kyc-gate-full__icon">📅</div>
          <h2 className="kyc-gate-full__title">Vérification de compte requise</h2>
          <p className="kyc-gate-full__desc">
            Pour planifier des rendez-vous et accéder aux visios sécurisées, veuillez compléter la vérification de votre compte.
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate("kyc-verification")}>
            Vérifier mon compte →
          </button>
        </div>
      </div>
    );
  }

  async function handleCreateAppointment(data) {
    setScheduling(true);
    try {
      await appointmentsApi.create(data);
      showToast("Rendez-vous planifié et invitation envoyée avec succès !", "success");
      setShowModal(false);
      loadAppointments(tab);
    } catch (err) {
      showToast(err.message || "Erreur lors de la planification du rendez-vous.", "error");
    } finally {
      setScheduling(false);
    }
  }

  async function handleConfirm(id) {
    setActingId(id);
    try {
      await appointmentsApi.confirm(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "confirmed" } : a));
      showToast("Rendez-vous confirmé !", "success");
    } catch (err) {
      showToast(err.message || "Erreur lors de la confirmation.", "error");
    } finally {
      setActingId(null);
    }
  }

  async function handleCancel(id) {
    const reason = window.prompt("Raison de l'annulation (optionnel) :") || undefined;
    setActingId(id);
    try {
      await appointmentsApi.cancel(id, reason);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "cancelled" } : a));
      showToast("Rendez-vous annulé.", "info");
    } catch (err) {
      showToast(err.message || "Erreur lors de l'annulation.", "error");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="page-wrapper appointments-container animate-fadeUp">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 className="page-title">📅 Gestion des Rendez-vous</h1>
          <p className="page-subtitle">
            Organisez, confirmez et rejoignez vos réunions avec {isInvestor ? "les porteurs de projets" : "les investisseurs et mentors"}.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          ➕ Planifier un rendez-vous
        </button>
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {[
          ["upcoming", "📅 À venir"],
          ["pending",  "⏳ En attente de confirmation"],
          ["past",     "✔️ Historique / Passés"]
        ].map(([id, lbl]) => (
          <button
            key={id}
            className={`filter-tab${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-state card" style={{ padding: 40, textAlign: "center" }}>
          <div className="spinner" />
          <div className="loading-state__title" style={{ marginTop: 12 }}>Chargement des rendez-vous…</div>
        </div>
      )}

      {/* Appointments List */}
      {!loading && (
        <div className="appt-list">
          {appointments.length === 0 && (
            <div className="empty-state card" style={{ padding: 48, textAlign: "center" }}>
              <div className="empty-state__icon" style={{ fontSize: 44, marginBottom: 12 }}>📅</div>
              <div className="empty-state__title" style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
                Aucun rendez-vous {tab === "upcoming" ? "à venir" : tab === "pending" ? "en attente" : "dans l'historique"}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 16 }}>
                {tab === "upcoming"
                  ? "Vous n'avez pas de rendez-vous programmé prochainement."
                  : tab === "pending"
                  ? "Toutes les demandes de rendez-vous ont été traitées."
                  : "Aucun ancien rendez-vous archivé."}
              </p>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                ➕ Planifier un nouveau rendez-vous
              </button>
            </div>
          )}

          {appointments.map(a => {
            const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const partner = getCounterpart(a, currentUser?.id);
            const initials = `${partner.firstName?.[0] || "U"}${partner.lastName?.[0] || ""}`.toUpperCase();
            const isHost = (a.organizer?.id || a.organizerId) === currentUser?.id;
            const typeInfo = TYPE_LABELS[a.meetingType || a.type] || { label: "Rendez-vous", icon: "🤝" };

            return (
              <div key={a.id} className={`appointment-card ${st.cls}`}>
                <div className="appointment-card__main">
                  <Avatar label={partner.avatarUrl || initials} size="lg" ring />
                  <div className="appointment-card__info">
                    <div className="appointment-card__header-row">
                      <span className="appointment-card__name">
                        {partner.firstName} {partner.lastName}
                      </span>
                      <span className="appointment-card__role-tag">
                        {isHost ? "👤 Invité" : "👑 Hôte"}
                      </span>
                      <span
                        className="badge"
                        style={{
                          background: st.badgeBg,
                          color: st.badgeColor,
                          border: `1px solid ${st.badgeColor}40`,
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {st.icon} {st.label}
                      </span>
                    </div>

                    <div className="appointment-card__title">
                      <strong>{a.title}</strong>
                      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                        · {typeInfo.icon} {typeInfo.label}
                      </span>
                      {a.project && (
                        <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600 }}>
                          (Projet : {a.project.title})
                        </span>
                      )}
                    </div>

                    <div className="appointment-card__datetime">
                      <span>📅 {fmtDate(a.scheduledAt)}</span>
                      <span>⏰ {fmtTime(a.scheduledAt)} ({a.durationMin || 45} min)</span>
                      {(a.meetingUrl || a.meetingLink) && (
                        <span style={{ color: "var(--success)", fontWeight: 600 }}>
                          💻 Visio interactive active
                        </span>
                      )}
                    </div>

                    {a.notes && (
                      <div className="appointment-card__notes">
                        "{a.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="appointment-card__actions">
                  {(a.meetingUrl || a.meetingLink) && ["confirmed", "pending"].includes(a.status) && (
                    <a
                      href={a.meetingUrl || a.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <span>💻</span> Rejoindre Visio
                    </a>
                  )}

                  {a.status === "pending" && !isHost && (
                    <button
                      className="btn btn-success btn-sm"
                      disabled={actingId === a.id}
                      onClick={() => handleConfirm(a.id)}
                    >
                      ✓ Accepter
                    </button>
                  )}

                  {["pending", "confirmed"].includes(a.status) && (
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={actingId === a.id}
                      onClick={() => handleCancel(a.id)}
                    >
                      Annuler
                    </button>
                  )}

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate("messages", { targetUserId: partner.id })}
                  >
                    💬 Message
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de création */}
      {showModal && (
        <ScheduleModal
          onClose={() => !scheduling && setShowModal(false)}
          onSubmit={handleCreateAppointment}
          submitting={scheduling}
          defaultTargetUserId={targetUserId}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}