// ============================================================
// LAUNCHPAD — AppointmentsPage.jsx  ✅ BRANCHÉ SUR L'API RÉELLE
// Chemin : src/pages/AppointmentsPage.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, KycAlert } from "../components/UI";
import { appointmentsApi } from "../utils/api";
import "./Appointments.css";

const STATUS_CONFIG = {
  confirmed: { label:"✅ Confirmé",        cls:"badge-success" },
  pending:   { label:"⏳ En attente",      cls:"badge-warning" },
  cancelled: { label:"❌ Annulé",          cls:"badge-danger"  },
  completed: { label:"✔️ Effectué",        cls:"badge-gray"    },
};

const TYPE_LABELS = {
  pitch:          "Présentation projet",
  mentoring:      "Mentorat",
  due_diligence:  "Due Diligence",
  follow_up:      "Suivi",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });
}
function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}
function counterpartName(appt, myId) {
  const isRequester = appt.requester?.id === myId;
  const person = isRequester ? appt.host : appt.requester;
  return person ? `${person.firstName} ${person.lastName}` : "—";
}
function counterpartInitials(appt, myId) {
  const isRequester = appt.requester?.id === myId;
  const person = isRequester ? appt.host : appt.requester;
  if (!person) return "??";
  return `${(person.firstName || "?")[0]}${(person.lastName || "?")[0]}`.toUpperCase();
}

export default function AppointmentsPage() {
  const { currentUser, navigate, showToast } = useApp();
  const isInvestor = currentUser?.role === "investor";

  const [tab, setTab]                 = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actingId, setActingId]       = useState(null);

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

  async function handleConfirm(id) {
    setActingId(id);
    try {
      await appointmentsApi.confirm(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "confirmed" } : a));
      showToast("Rendez-vous confirmé.", "success");
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
      showToast("Rendez-vous annulé.", "success");
    } catch (err) {
      showToast(err.message || "Erreur lors de l'annulation.", "error");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Mes Rendez-vous</h1>
          <p className="page-subtitle">
            Gérez vos meetings avec {isInvestor ? "les étudiants" : "les investisseurs"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="filter-tabs">
        {[["upcoming","À venir"],["past","Passés"]].map(([id,lbl]) => (
          <button key={id} className={`filter-tab${tab===id?" active":""}`} onClick={() => setTab(id)}>
            {lbl}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <div className="loading-state__title">Chargement…</div>
        </div>
      )}

      {/* Appointment cards */}
      {!loading && (
        <div className="appt-list">
          {appointments.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📅</div>
              <div className="empty-state__title">
                Aucun rendez-vous {tab === "upcoming" ? "à venir" : "passé"}
              </div>
            </div>
          )}

          {appointments.map(a => {
            const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
            const isHost = a.host?.id === currentUser?.id;
            return (
              <div key={a.id} className="appointment-card card">
                <Avatar label={counterpartInitials(a, currentUser?.id)} size="lg" />
                <div className="appointment-card__info">
                  <div className="appointment-card__name">
                    {counterpartName(a, currentUser?.id)}
                    <span className={`badge ${st.cls}`} style={{ marginLeft: 10 }}>{st.label}</span>
                  </div>
                  <div className="appointment-card__company">
                    {TYPE_LABELS[a.type] || a.type} {a.project ? `— ${a.project.title}` : ""}
                  </div>
                  <div className="appointment-card__details">
                    <span>📅 {fmtDate(a.scheduledAt)}</span>
                    <span>⏰ {fmtTime(a.scheduledAt)} ({a.durationMinutes} min)</span>
                    {a.meetingLink && <span>💻 Visio</span>}
                  </div>
                  {a.notes && (
                    <div className="appointment-card__project">{a.notes}</div>
                  )}
                </div>
                <div className="appointment-card__actions">
                  {a.status === "confirmed" && a.meetingLink && (
                    <a href={a.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                      Rejoindre 🔗
                    </a>
                  )}
                  {a.status === "pending" && isHost && (
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}