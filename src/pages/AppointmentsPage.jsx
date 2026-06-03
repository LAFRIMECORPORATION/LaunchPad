// ============================================================
// LAUNCHPAD — AppointmentsPage.jsx  🆕 NOUVELLE PAGE
// Chemin : src/pages/AppointmentsPage.jsx
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Avatar, KycAlert } from "../components/UI";
import { APPOINTMENTS } from "../data/mockData";
import "./Appointments.css";

const SLOTS = [
  { id:1, day:"Lun 2 Juin", time:"10h00 – 11h00", free:true  },
  { id:2, day:"Lun 2 Juin", time:"14h00 – 15h00", free:true  },
  { id:3, day:"Mar 3 Juin", time:"09h00 – 10h00", free:false },
  { id:4, day:"Mar 3 Juin", time:"16h00 – 17h00", free:true  },
  { id:5, day:"Mer 4 Juin", time:"11h00 – 12h00", free:true  },
  { id:6, day:"Jeu 5 Juin", time:"14h00 – 15h00", free:false },
];

const STATUS_CONFIG = {
  confirmed: { label:"✅ Confirmé",        cls:"badge-success" },
  pending:   { label:"⏳ En attente",      cls:"badge-warning" },
  cancelled: { label:"❌ Annulé",          cls:"badge-danger"  },
  completed: { label:"✔️ Effectué",        cls:"badge-gray"    },
};

export default function AppointmentsPage() {
  const { currentUser, navigate, requireKyc, showToast } = useApp();
  const isInvestor = currentUser?.role === "investor";
  const [tab, setTab] = useState("upcoming");

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
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => showToast("Fonctionnalité Cal.com bientôt disponible", "info")}>
            + Proposer un créneau
          </button>
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

      {/* Appointment cards */}
      <div className="appt-list">
        {APPOINTMENTS.map(a => {
          const st = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
          return (
            <div key={a.id} className="appointment-card card">
              <Avatar label={a.avatar} size="lg" />
              <div className="appointment-card__info">
                <div className="appointment-card__name">
                  {a.with}
                  <span className={`badge ${st.cls}`} style={{ marginLeft: 10 }}>{st.label}</span>
                </div>
                <div className="appointment-card__company">{a.role} — {a.company}</div>
                <div className="appointment-card__details">
                  <span>📅 {a.date}</span>
                  <span>⏰ {a.time}</span>
                  <span>💻 {a.type}</span>
                </div>
                {a.project && (
                  <div className="appointment-card__project">
                    Projet : <strong>{a.project}</strong>
                  </div>
                )}
              </div>
              <div className="appointment-card__actions">
                {a.status === "confirmed" && (
                  <a href={a.link} className="btn btn-primary btn-sm">Rejoindre 🔗</a>
                )}
                <button className="btn btn-secondary btn-sm"
                  onClick={() => showToast("Reprogrammation disponible bientôt", "info")}>
                  Reporter
                </button>
                <button className="btn btn-danger btn-sm"
                  onClick={() => showToast("Rendez-vous annulé", "success")}>
                  Annuler
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Available slots */}
      <div className="card" style={{ padding: 22, marginTop: 24 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>
          Créneaux disponibles
        </div>
        <div className="slots-grid">
          {SLOTS.map(s => (
            <button
              key={s.id}
              disabled={!s.free}
              className={`slot-item${s.free ? " free" : " taken"}`}
              onClick={() => s.free && showToast(`Créneau ${s.day} ${s.time} réservé !`, "success")}
            >
              <div className="slot-item__day">{s.day}</div>
              <div className="slot-item__time">{s.time}</div>
              <span className={`badge ${s.free ? "badge-success" : "badge-gray"}`}>
                {s.free ? "Disponible" : "Réservé"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}