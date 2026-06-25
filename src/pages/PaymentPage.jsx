// ============================================================
// LAUNCHPAD — PaymentPage.jsx  🆕 NOUVELLE PAGE
// Chemin : src/pages/PaymentPage.jsx
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { PROJECTS } from "../data/mockData";
import "./Payment.css";

const METHODS = [
  {
    id: "mtn",
    icon: "💛",
    name: "MTN Mobile Money",
    regions: "Cameroun · Nigeria · Ghana · Côte d'Ivoire",
    fee: "Commission 1,5%",
    feeRate: 0.015,
    color: "#FFD700",
    bg: "rgba(255,215,0,.07)",
    border: "rgba(255,215,0,.35)",
    placeholder: "6XXXXXXXX (Cameroun MTN)",
  },
  {
    id: "orange",
    icon: "🟠",
    name: "Orange Money",
    regions: "Cameroun · Sénégal · Mali · Guinée",
    fee: "Commission 1,5%",
    feeRate: 0.015,
    color: "#FF6600",
    bg: "rgba(255,102,0,.07)",
    border: "rgba(255,102,0,.35)",
    placeholder: "6XXXXXXXX (Cameroun Orange)",
  },
  {
    id: "stripe",
    icon: "💳",
    name: "Carte bancaire (Stripe)",
    regions: "International · Visa · Mastercard · SEPA",
    fee: "Commission 2,9% + 150 XAF",
    feeRate: 0.029,
    color: "#5B73F5",
    bg: "rgba(91,115,245,.07)",
    border: "rgba(91,115,245,.25)",
    placeholder: null,
  },
];

/* ── Formats number with spaces ────────────────────────────── */
function fmt(n) {
  return Math.round(n).toLocaleString("fr-FR");
}

/* ── Step: KYC blocked ─────────────────────────────────────── */
function KycBlocked({ navigate }) {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">💳 Investir dans un projet</h1>
          <p className="page-subtitle">Paiement Mobile Money & carte bancaire</p>
        </div>
      </div>
      <div className="kyc-gate-full">
        <div className="kyc-gate-full__icon">🔐</div>
        <h2 className="kyc-gate-full__title">Vérification requise</h2>
        <p className="kyc-gate-full__desc">
          Pour investir sur Launchpad, votre identité doit être vérifiée (KYC).
          Cela protège les étudiants et sécurise les transactions financières.
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("kyc-verification")}>
          Vérifier mon compte →
        </button>
      </div>
    </div>
  );
}

/* ── Step: Success ─────────────────────────────────────────── */
function PaySuccess({ method, phone, amount, project, navigate, showToast }) {
  return (
    <div className="page-wrapper">
      <div className="pay-success">
        <div className="pay-success__icon">🎉</div>
        <h1 className="pay-success__title">Investissement initié !</h1>
        <p className="pay-success__desc">
          Vous recevrez une demande de confirmation
          {method.id !== "stripe" && <> sur votre téléphone <strong>{phone}</strong></>}.
          Acceptez le paiement sur votre application <strong>{method.name}</strong>.
        </p>

        <div className="pay-recap card">
          <div className="pay-recap__title">Récapitulatif</div>
          {[
            ["Projet",    project.title],
            ["Montant",   `${fmt(amount)} XAF`],
            ["Méthode",   `${method.icon} ${method.name}`],
            ...(method.id !== "stripe" ? [["Numéro", `+237 ${phone}`]] : []),
            ["Escrow",    "✅ Activé — fonds sécurisés"],
            ["Statut",    "⏳ En attente de confirmation"],
          ].map(([k, v]) => (
            <div key={k} className="pay-recap__row">
              <span className="pay-recap__key">{k}</span>
              <span className="pay-recap__val">{v}</span>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary btn-lg btn-full"
          onClick={() => { showToast("Investissement enregistré !", "success"); navigate("dashboard-investor"); }}
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function PaymentPage() {
  const { currentUser, navigate, showToast } = useApp();

  const [step,       setStep]       = useState(1); // 1=form 2=confirm 3=success
  const [method,     setMethod]     = useState(METHODS[0]);
  const [phone,      setPhone]      = useState("");
  const [amount,     setAmount]     = useState("");
  const [project,    setProject]    = useState(PROJECTS[0]);

  /* KYC gate */
  if (!currentUser?.kycValidated) return <KycBlocked navigate={navigate} />;

  /* Success */
  if (step === 3) return (
    <PaySuccess
      method={method} phone={phone} amount={parseInt(amount)}
      project={project} navigate={navigate} showToast={showToast}
    />
  );

  const fee   = method.id === "stripe"
    ? Math.round(parseInt(amount || 0) * method.feeRate) + 150
    : Math.round(parseInt(amount || 0) * method.feeRate);
  const total = parseInt(amount || 0) + fee;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 8 }}
            onClick={() => navigate("dashboard-investor")}
          >← Retour</button>
          <h1 className="page-title">💳 Investir dans un projet</h1>
          <p className="page-subtitle">Paiement sécurisé · Escrow activé</p>
        </div>
      </div>

      {/* ── STEP 1 ─ Form ────────────────────────────────── */}
      {step === 1 && (
        <div className="pay-layout">

          {/* Left column */}
          <div className="pay-left">

            {/* Project selector */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>
                Choisir le projet
              </div>
              {PROJECTS.slice(0, 4).map(p => (
                <button
                  key={p.id}
                  className={`project-option${project.id === p.id ? " selected" : ""}`}
                  onClick={() => setProject(p)}
                >
                  <span className="project-option__emoji">{p.emoji}</span>
                  <div className="project-option__info">
                    <div className="project-option__name">{p.title}</div>
                    <div className="project-option__meta">
                      {p.category} · {Math.round((p.raised / p.goal) * 100)}% financé
                    </div>
                  </div>
                  {project.id === p.id && <span className="project-option__check">✓</span>}
                </button>
              ))}
            </div>

            {/* Method selector */}
            <div className="card" style={{ padding: 20 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>
                Méthode de paiement
              </div>
              {METHODS.map(m => (
                <div
                  key={m.id}
                  className={`payment-method${method.id === m.id ? " selected" : ""}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setMethod(m)}
                  onKeyDown={e => e.key === "Enter" && setMethod(m)}
                  style={method.id === m.id
                    ? { borderColor: m.color, background: m.bg }
                    : {}
                  }
                >
                  <div className="payment-method__icon">{m.icon}</div>
                  <div className="payment-method__info">
                    <div className="payment-method__name">{m.name}</div>
                    <div className="payment-method__regions">{m.regions}</div>
                    <div className="payment-method__fee">{m.fee}</div>
                  </div>
                  {method.id === m.id && <div className="payment-method__check">✓</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="pay-right">
            <div className="card" style={{ padding: 22 }}>
              <div className="section-title" style={{ marginBottom: 18 }}>
                Détails du paiement
              </div>

              {/* Method badge */}
              <div
                className="pay-method-badge"
                style={{ background: method.bg, borderColor: method.border }}
              >
                <span style={{ fontSize: 28 }}>{method.icon}</span>
                <div>
                  <div className="pay-method-badge__name">{method.name}</div>
                  <div className="pay-method-badge__sub">
                    {method.id === "stripe" ? "Paiement Stripe sécurisé" : `Entrez votre numéro ${method.id === "mtn" ? "MTN" : "Orange"}`}
                  </div>
                </div>
              </div>

              {/* Phone */}
              {method.id !== "stripe" && (
                <div className="form-group">
                  <label className="form-label">
                    Numéro {method.id === "mtn" ? "MTN" : "Orange"} <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder={method.placeholder}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                  <div className="form-hint">Indicatif +237 ajouté automatiquement</div>
                </div>
              )}

              {/* Amount */}
              <div className="form-group">
                <label className="form-label">Montant (XAF) <span className="req">*</span></label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="500 000"
                  min="500000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
                <div className="form-hint">Minimum : 500 000 XAF (~750 €)</div>
              </div>

              {/* Summary */}
              {amount && parseInt(amount) > 0 && (
                <div className="pay-summary">
                  {[
                    ["Montant investi", `${fmt(parseInt(amount))} XAF`],
                    ["Commission",      `${fmt(fee)} XAF`],
                    ["Total prélevé",   `${fmt(total)} XAF`],
                    ["Escrow",          "✅ Activé"],
                  ].map(([k, v]) => (
                    <div key={k} className="pay-summary__row">
                      <span className="pay-summary__key">{k}</span>
                      <span className="pay-summary__val">{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Escrow note */}
              <div className="escrow-box" style={{ marginBottom: 16 }}>
                🔐 <strong>Fonds en Escrow :</strong> Votre argent est conservé en sécurité
                et libéré progressivement selon les milestones validés. Remboursement intégral
                si le projet n'atteint pas ses objectifs.
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                disabled={!amount || parseInt(amount) < 500000 || (method.id !== "stripe" && !phone)}
                onClick={() => setStep(2)}
              >
                Continuer → Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 2 ─ Confirm ─────────────────────────────── */}
      {step === 2 && (
        <div className="pay-confirm">
          <div className="card" style={{ padding: 28, maxWidth: 560, margin: "0 auto" }}>
            <h2 className="pay-confirm__title">Confirmer l'investissement</h2>
            <p className="pay-confirm__sub">Vérifiez les détails avant de valider.</p>

            <div className="pay-recap card" style={{ marginBottom: 20 }}>
              <div className="pay-recap__title">Récapitulatif</div>
              {[
                ["Projet",    project.title],
                ["Montant",   `${fmt(parseInt(amount))} XAF`],
                ["Méthode",   `${method.icon} ${method.name}`],
                ...(method.id !== "stripe" ? [["Numéro", `+237 ${phone}`]] : []),
                ["Commission",`${fmt(fee)} XAF`],
                ["Total",     `${fmt(total)} XAF`],
                ["Escrow",    "✅ Activé"],
              ].map(([k, v]) => (
                <div key={k} className="pay-recap__row">
                  <span className="pay-recap__key">{k}</span>
                  <span className="pay-recap__val">{v}</span>
                </div>
              ))}
            </div>

            <div className="pay-confirm__actions">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Modifier
              </button>
              <button
                className="btn btn-primary"
                onClick={() => { showToast("Demande de paiement envoyée !", "success"); setStep(3); }}
              >
                ✅ Confirmer & Payer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}