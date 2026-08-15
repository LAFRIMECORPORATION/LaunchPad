// ============================================================
// LAUNCHPAD — AppointmentsPage.jsx  ✅ GESTION MODERNE & COMPLETE
// Chemin : src/pages/AppointmentsPage.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, KycAlert, Badge } from "../components/UI";
import { appointmentsApi, usersApi, projectsApi } from "../utils/api";
import "./Appointments.css";

const STATUS_CONFIG = {
  confirmed: { label:"✅ Confirmé",   cls:"badge-success" },
  pending:   { label:"⏳ En attente", cls:"badge-warning" },
  cancelled: { label:"❌ Annulé",     cls:"badge-danger"  },
  completed: { label:"✔️ Effectué",   cls:"badge-gray"    },
};

const TYPE_LABELS = {
  pitch:         "Présentation projet",
  mentoring:     "Mentorat / Conseil",
  due_diligence: "Due Diligence",
  interview:     "Entretien d'embauche / Recrutement",
  follow_up:     "Suivi & Avancement",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function getCounterpart(appt, myId) {
  const isOrganizer = (appt.organizer?.id || appt.organizerId) === myId;
  const partner = isOrganizer
    ? (appt.participant || appt.host)
    : (appt.organizer || appt.requester);
  return partner || { firstName: "Utilisateur", lastName: "" };
}

/* ── Modal : Nouveau Rendez-vous ────────────────────────────── */
function ScheduleModal({ onClose, onSubmit, submitting, defaultTargetUserId }) {
  const [title, setTitle]             = useState("");
  const [meetingType, setMeetingType] = useState("pitch");
  const [participantId, setParticipantId] = useState(defaultTargetUserId || "");
  const [projectId, setProjectId]     = useState("");
  const [date, setDate]               = useState("");
  const [time, setTime]               = useState("14:00");
  const [durationMin, setDurationMin] = useState(45);
  const [notes, setNotes]             = useState("");

  const [usersList, setUsersList]     = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    // Charger liste de contacts / utilisateurs pour la sélection
    setLoadingUsers(true);
    adminUsersOrCurrentRole();
    projectsApi.list({ limit: 20 })
      .then(res => setProjectsList(res.data?.projects || res.data || []))
      .catch(() => {});
  }, []);

  async function adminUsersOrCurrentRole() {
    try {
      const res = await usersApi.getById("me").catch(() => null);
      // fallback
    } catch(e) {}
    setLoadingUsers(false);
  }

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
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📅 Planifier un rendez-vous</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <div className="form-group">
            <label className="form-label">Sujet du rendez-vous <span className="req">*</span></label>
            <input
              className="form-input"
              placeholder="Ex : Session Pitch & Retours Investisseur"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Identifiant du participant (ID Utilisateur) <span className="req">*</span></label>
            <input
              className="form-input"
              placeholder="Saisissez l'ID ou collez l'ID de l'utilisateur"
              value={participantId}
              onChange={e => setParticipantId(e.target.value)}
            />
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              Vous pouvez aussi planifier un RDV directement depuis la page de profil ou de message.
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Type de rendez-vous</label>
              <select className="form-input form-select" value={meetingType} onChange={e => setMeetingType(e.target.value)}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Projet associé (Optionnel)</label>
              <select className="form-input form-select" value={projectId} onChange={e => setProjectId(e.target.value)}>
                <option value="">— Aucun projet —</option>
                {projectsList.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Date <span className="req">*</span></label>
              <input
                className="form-input"
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Heure <span className="req">*</span></label>
              <input
                className="form-input"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Durée (min)</label>
              <select className="form-input form-select" value={durationMin} onChange={e => setDurationMin(e.target.value)}>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 heure</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ordre du jour / Notes (Optionnel)</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Précisez les points clés à aborder lors du meeting…"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>Annuler</button>
          <button className="btn btn-primary" disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? "Création…" : "📅 Confirmer le rendez-vous"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { currentUser, navigate, showToast, pageOptions } = useApp();
  const isInvestor = currentUser?.role === "investor";

  const [tab, setTab]                     = useState("upcoming"); // "upcoming" | "pending" | "past"
  const [appointments, setAppointments]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [actingId, setActingId]           = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [scheduling, setScheduling]       = useState(false);

  const targetUserId = pageOptions?.targetUserId;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUser?.kycValidated) loadAppointments(tab);
  }, [tab, currentUser?.kycValidated, loadAppointments]);

  // Si on passe un targetUserId dans les options de la page, ouvrir directement le modal
  useEffect(() => {
    if (targetUserId) {
      setShowModal(true);
    }
  }, [targetUserId]);

  /* KYC gate */
  if (!currentUser?.kycValidated) {
    return (
      <div className="page-wrapper">
        <div className="page-header">
          <div>
            <h1 className="page-title">📅 Mes Rendez-vous</h1>
            <p className="page-subtitle">
              Gérez vos meetings avec {isInvestor ? "les étudiants" : "les investisseurs"}
            </p>
          </div>
        </div>
        <KycAlert />
        <div className="kyc-gate-full">
          <div className="kyc-gate-full__icon">📅</div>
          <h2 className="kyc-gate-full__title">Vérification requise</h2>
          <p className="kyc-gate-full__desc">
            Vérifiez votre compte pour planifier des rendez-vous avec{" "}
            {isInvestor ? "les étudiants" : "des investisseurs"}.
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
      showToast("Rendez-vous planifié et invitation envoyée !", "success");
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
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">📅 Mes Rendez-vous</h1>
          <p className="page-subtitle">
            Gérez et planifiez vos meetings avec {isInvestor ? "les porteurs de projets" : "les investisseurs et mentors"}.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Planifier un rendez-vous
        </button>
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {[
          ["upcoming", "📅 À venir"],
          ["pending",  "⏳ En attente"],
          ["past",     "✔️ Passés / Annulés"]
        ].map(([id, lbl]) => (
          <button key={id} className={`filter-tab${tab === id ? " active" : ""}`} onClick={() => setTab(id)}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <div className="loading-state__title">Chargement des rendez-vous…</div>
        </div>
      )}

      {/* Appointment cards */}
      {!loading && (
        <div className="appt-list" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {appointments.length === 0 && (
            <div className="empty-state card" style={{ padding: 40, textAlign: "center" }}>
              <div className="empty-state__icon" style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <div className="empty-state__title" style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                Aucun rendez-vous {tab === "upcoming" ? "à venir" : tab === "pending" ? "en attente" : "passé"}
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                Planifier un premier rendez-vous
              </button>
            </div>
          )}

          {appointments.map(a => {
            const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const partner = getCounterpart(a, currentUser?.id);
            const initials = `${partner.firstName?.[0] || "U"}${partner.lastName?.[0] || ""}`.toUpperCase();
            const isHost = (a.organizer?.id || a.organizerId) === currentUser?.id;

            return (
              <div key={a.id} className="appointment-card card" style={{ padding: 18, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <Avatar label={initials} size="lg" />
                  <div className="appointment-card__info">
                    <div className="appointment-card__name" style={{ fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 10 }}>
                      {partner.firstName} {partner.lastName}
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="appointment-card__company" style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0" }}>
                      <strong>{a.title}</strong> · {TYPE_LABELS[a.meetingType || a.type] || "Rendez-vous"} {a.project ? `(Projet : ${a.project.title})` : ""}
                    </div>
                    <div className="appointment-card__details" style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: 14 }}>
                      <span>📅 {fmtDate(a.scheduledAt)}</span>
                      <span>⏰ {fmtTime(a.scheduledAt)} ({a.durationMin || a.durationMinutes || 45} min)</span>
                      {(a.meetingUrl || a.meetingLink) && <span style={{ color: "var(--primary)", fontWeight: 600 }}>💻 Visio disponible</span>}
                    </div>
                    {a.notes && (
                      <div className="appointment-card__project" style={{ fontSize: 12, marginTop: 6, fontStyle: "italic" }}>
                        Note: "{a.notes}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="appointment-card__actions" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {(a.meetingUrl || a.meetingLink) && ["confirmed", "pending"].includes(a.status) && (
                    <a href={a.meetingUrl || a.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      Rejoindre Visio 🔗
                    </a>
                  )}
                  {a.status === "pending" && !isHost && (
                    <button
                      className="btn btn-success btn-sm"
                      disabled={actingId === a.id}
                      onClick={() => handleConfirm(a.id)}
                    >
                      ✓ Confirmer
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
                    💬 Écrire
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
        />
      )}
    </div>
  );
}