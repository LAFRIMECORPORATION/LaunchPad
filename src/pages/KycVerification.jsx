// ============================================================
// LAUNCHPAD — KycVerification.jsx  🆕 NOUVELLE PAGE
// Chemin : src/pages/KycVerification.jsx
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./KycVerification.css";

// ── Établissements camerounais ────────────────────────────
const UNIVERSITIES = {
  "Universités d'État": [
    "Université de Yaoundé I",
    "Université de Yaoundé II — Soa",
    "Université de Douala",
    "Université de Dschang",
    "Université de Buea",
    "Université de Ngaoundéré",
    "Université de Maroua",
    "Université de Bamenda",
  ],
  "Grandes Écoles": [
    "École Polytechnique de Yaoundé (Poly-YDE)",
    "École Nationale Supérieure Polytechnique (ENSP)",
    "École Nationale Supérieure des Postes (SUP'PTIC)",
    "Institut Universitaire de Technologie de Douala",
    "ESSEC Business School Douala",
    "Institut National de la Jeunesse et des Sports",
  ],
  "Établissements privés agréés": [
    "Institut Siantou Supérieur",
    "Institut Universitaire des Grandes Écoles (IUGE)",
    "Université Catholique d'Afrique Centrale (UCAC)",
    "Institut des Relations Internationales du Cameroun (IRIC)",
    "Autre établissement agréé MINESUP",
  ],
};

const INVEST_TYPES = [
  "Entreprise (SARL / SA / SAS)",
  "Fonds d'investissement",
  "Association / ONG",
  "Business Angel (particulier)",
  "Family Office",
];

// ── Step indicator ────────────────────────────────────────
function StepIndicator({ steps, current }) {
  return (
    <div className="kyc-steps">
      {steps.map((label, i) => {
        const num    = i + 1;
        const done   = num < current;
        const active = num === current;
        return (
          <div key={label} className="kyc-steps__item">
            <div className={`kyc-steps__circle${done ? " done" : active ? " active" : ""}`}>
              {done ? "✓" : num}
            </div>
            <span className={`kyc-steps__label${active ? " active" : ""}`}>{label}</span>
            {i < steps.length - 1 && <div className={`kyc-steps__line${done ? " done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Upload zone ───────────────────────────────────────────
function UploadZone({ icon, label, sub, value, onUpload }) {
  if (value) {
    return (
      <div className="upload-zone upload-zone--done">
        <div className="upload-zone__icon">✅</div>
        <div className="upload-zone__done">{value}</div>
      </div>
    );
  }
  return (
    <div className="upload-zone" role="button" tabIndex={0}
      onClick={onUpload}
      onKeyDown={e => e.key === "Enter" && onUpload()}
    >
      <div className="upload-zone__icon">{icon}</div>
      <div className="upload-zone__label">{label}</div>
      <div className="upload-zone__sub">{sub}</div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────
export default function KycVerification() {
  const { currentUser, navigate, submitKyc, approveKyc } = useApp();

  const isStudent   = currentUser?.role === "student";
  const isSubmitted = currentUser?.kycStatus === "submitted";
  const isApproved  = currentUser?.kycValidated;

  const [step, setStep] = useState(1);
  const [docs, setDocs] = useState({
    // student
    cniNumber: "", cniFile: "", selfie: "", certifScol: "", carteEtu: "", university: "", level: "",
    // investor
    repName: "", repCni: "", repCniFile: "", domicile: "", entityName: "", entityType: "", rccm: "", rccmFile: "",
  });

  const setDoc = (key, val) => setDocs(d => ({ ...d, [key]: val }));

  const STEPS_S = ["Identité", "Scolarité", "Confirmation"];
  const STEPS_I = ["Identité", "Entreprise", "Confirmation"];
  const steps   = isStudent ? STEPS_S : STEPS_I;

  // ── Approved ──────────────────────────────────────────
  if (isApproved) return (
    <div className="kyc-page">
      <div className="kyc-success">
        <div className="kyc-success__icon">✅</div>
        <h1 className="kyc-success__title">Compte vérifié !</h1>
        <p className="kyc-success__desc">
          Votre identité a été confirmée. Vous avez maintenant accès à
          toutes les fonctionnalités de Launchpad.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate(isStudent ? "dashboard-student" : "dashboard-investor")}
        >
          Accéder à mon espace →
        </button>
      </div>
    </div>
  );

  // ── Submitted — en attente ─────────────────────────────
  if (isSubmitted) return (
    <div className="kyc-page">
      <div className="kyc-success">
        <div className="kyc-success__icon">⏳</div>
        <h1 className="kyc-success__title">Dossier en cours d'examen</h1>
        <p className="kyc-success__desc">
          Votre dossier KYC a été transmis à notre équipe. Résultat attendu
          sous <strong>24 à 48 heures ouvrées</strong>.
        </p>

        <div className="recap-list" style={{ textAlign:"left", width:"100%", maxWidth:440 }}>
          <div className="recap-list__title">Documents soumis</div>
          {(isStudent
            ? [["🪪","Pièce d'identité"],["📸","Selfie avec CNI"],["🎓","Certificat de scolarité"],["🆔","Carte étudiante"]]
            : [["🪪","Pièce d'identité du représentant"],["🏠","Justificatif de domicile"],["📋","Registre du Commerce (RCCM)"]]
          ).map(([ico, lbl]) => (
            <div key={lbl} className="recap-list__item">
              <span>{ico}</span>
              <span className="recap-list__label">{lbl}</span>
              <span className="badge badge-success">Soumis</span>
            </div>
          ))}
        </div>

        {/* Simulation admin — démo uniquement */}
        <div className="kyc-demo-box">
          <div className="kyc-demo-box__label">🛠️ Démo uniquement — Simuler la validation admin</div>
          <button className="btn btn-success btn-sm btn-full" onClick={approveKyc}>
            ✅ Valider le KYC (Admin)
          </button>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate(isStudent ? "dashboard-student" : "dashboard-investor")}
        >
          Retour au tableau de bord
        </button>
      </div>
    </div>
  );

  // ── Why KYC banner ────────────────────────────────────
  const WhyBanner = () => (
    <div className="kyc-why-box">
      <div className="kyc-why-box__icon">🔐</div>
      <div>
        <div className="kyc-why-box__title">Pourquoi vérifier votre compte ?</div>
        <div className="kyc-why-box__desc">
          {isStudent
            ? <>La vérification confirme que vous êtes bien un <strong>étudiant inscrit dans un établissement camerounais</strong>. Elle donne de la crédibilité à vos projets et rassure les investisseurs. Une fois vérifié, vous pouvez <strong>publier des projets, accéder au marketplace et collaborer</strong>.</>
            : <>La vérification confirme que votre <strong>entreprise ou fonds d'investissement existe légalement</strong>. Elle rassure les étudiants et sécurise les transactions financières. Une fois vérifié, vous pouvez <strong>investir, accéder à la Due Diligence IA et planifier des RDV</strong>.</>
          }
        </div>
      </div>
    </div>
  );

  // ── STEP 1 Étudiant — Identité ────────────────────────
  const StepStudentIdentity = () => (
    <div className="kyc-form">
      <h2 className="kyc-form__title">🪪 Preuve d'identité</h2>
      <p className="kyc-form__desc">
        Fournissez une pièce d'identité officielle camerounaise valide
        (CNI, passeport ou permis de conduire).
      </p>
      <div className="form-group">
        <label className="form-label">Numéro CNI / Passeport <span className="req">*</span></label>
        <input className="form-input" placeholder="Ex : 123456789A"
          value={docs.cniNumber} onChange={e => setDoc("cniNumber", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Recto de la pièce d'identité <span className="req">*</span></label>
        <UploadZone icon="🪪" label="Glissez ou cliquez pour choisir" sub="JPG, PNG, PDF — max 5 MB"
          value={docs.cniFile} onUpload={() => setDoc("cniFile", "cni_recto.jpg")} />
      </div>
      <div className="form-group">
        <label className="form-label">Selfie en tenant la pièce d'identité <span className="req">*</span></label>
        <UploadZone icon="📸" label="Photo nette, éclairage correct" sub="Tenez votre CNI à côté de votre visage"
          value={docs.selfie} onUpload={() => setDoc("selfie", "selfie_cni.jpg")} />
      </div>
    </div>
  );

  // ── STEP 2 Étudiant — Scolarité ───────────────────────
  const StepStudentScolarite = () => (
    <div className="kyc-form">
      <h2 className="kyc-form__title">🎓 Preuve de scolarité</h2>
      <p className="kyc-form__desc">
        Justifiez votre statut d'étudiant dans un établissement camerounais reconnu par le MINESUP.
      </p>
      <div className="form-group">
        <label className="form-label">Établissement <span className="req">*</span></label>
        <select className="form-input form-select"
          value={docs.university} onChange={e => setDoc("university", e.target.value)}
        >
          <option value="">Choisir un établissement…</option>
          {Object.entries(UNIVERSITIES).map(([group, list]) => (
            <optgroup key={group} label={group}>
              {list.map(u => <option key={u} value={u}>{u}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Numéro matricule <span className="req">*</span></label>
          <input className="form-input" placeholder="Ex : 20A0001"
            value={docs.matricule} onChange={e => setDoc("matricule", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Niveau d'études <span className="req">*</span></label>
          <select className="form-input form-select"
            value={docs.level} onChange={e => setDoc("level", e.target.value)}
          >
            <option value="">Choisir…</option>
            {["Licence 1","Licence 2","Licence 3","Master 1","Master 2","Doctorat","BTS 1","BTS 2","DUT","Classe préparatoire"].map(l =>
              <option key={l} value={l}>{l}</option>
            )}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Certificat de scolarité en cours de validité <span className="req">*</span></label>
        <UploadZone icon="🎓"
          label="Certificat de scolarité — année académique en cours"
          sub="Document officiel signé et tamponné par votre établissement — PDF, JPG"
          value={docs.certifScol} onUpload={() => setDoc("certifScol", "certificat_scolarite.pdf")} />
      </div>
      <div className="form-group">
        <label className="form-label">Carte d'étudiant <span className="req">*</span></label>
        <UploadZone icon="🆔"
          label="Recto de votre carte étudiante en cours de validité"
          sub="Photo nette, texte lisible — JPG, PNG"
          value={docs.carteEtu} onUpload={() => setDoc("carteEtu", "carte_etudiant.jpg")} />
      </div>
    </div>
  );

  // ── STEP 1 Investisseur — Identité ────────────────────
  const StepInvestorIdentity = () => (
    <div className="kyc-form">
      <h2 className="kyc-form__title">🪪 Identité du représentant</h2>
      <p className="kyc-form__desc">
        En tant que représentant de l'entité investisseuse, fournissez votre pièce d'identité personnelle.
      </p>
      <div className="form-group">
        <label className="form-label">Nom complet du représentant <span className="req">*</span></label>
        <input className="form-input" placeholder="Jean-Paul Mbarga"
          value={docs.repName} onChange={e => setDoc("repName", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Numéro CNI / Passeport <span className="req">*</span></label>
        <input className="form-input" placeholder="Ex : 123456789A"
          value={docs.repCni} onChange={e => setDoc("repCni", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Recto de la pièce d'identité <span className="req">*</span></label>
        <UploadZone icon="🪪" label="CNI ou passeport — recto visible"
          sub="JPG, PNG, PDF — max 5 MB"
          value={docs.repCniFile} onUpload={() => setDoc("repCniFile", "cni_representant.jpg")} />
      </div>
      <div className="form-group">
        <label className="form-label">Justificatif de domicile (moins de 3 mois)</label>
        <UploadZone icon="🏠"
          label="Facture eau, électricité ou relevé bancaire"
          sub="Moins de 3 mois — PDF, JPG"
          value={docs.domicile} onUpload={() => setDoc("domicile", "justif_domicile.pdf")} />
      </div>
    </div>
  );

  // ── STEP 2 Investisseur — Entreprise ──────────────────
  const StepInvestorEntreprise = () => (
    <div className="kyc-form">
      <h2 className="kyc-form__title">🏢 Preuve d'entreprise</h2>
      <p className="kyc-form__desc">
        Confirmez que votre structure existe légalement.
        Accepté : entreprise, fonds, association, ou particulier Business Angel.
      </p>
      <div className="form-group">
        <label className="form-label">Nom de l'entité investisseuse <span className="req">*</span></label>
        <input className="form-input" placeholder="Cameroon Tech Ventures SARL"
          value={docs.entityName} onChange={e => setDoc("entityName", e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Type de structure</label>
          <select className="form-input form-select"
            value={docs.entityType} onChange={e => setDoc("entityType", e.target.value)}
          >
            <option value="">Choisir…</option>
            {INVEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Numéro RCCM</label>
          <input className="form-input" placeholder="RC/DLA/2020/B/0001"
            value={docs.rccm} onChange={e => setDoc("rccm", e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Registre du Commerce (RCCM) <span className="req">*</span></label>
        <UploadZone icon="📋"
          label="Document RCCM officiel ou statuts de l'entreprise"
          sub="PDF signé par le greffe du tribunal — max 10 MB"
          value={docs.rccmFile} onUpload={() => setDoc("rccmFile", "rccm_certifie.pdf")} />
      </div>
      <div className="kyc-angel-note">
        💡 <strong>Particulier sans entreprise ?</strong> Vous pouvez investir en tant que Business Angel.
        Fournissez simplement votre CNI et un relevé bancaire récent.
      </div>
    </div>
  );

  // ── STEP 3 — Confirmation ─────────────────────────────
  const StepConfirmation = () => {
    const studentItems = [
      ["🪪", "Pièce d'identité (CNI / Passeport)", docs.cniFile],
      ["📸", "Selfie avec la pièce d'identité",    docs.selfie],
      ["🎓", "Certificat de scolarité",            docs.certifScol],
      ["🆔", "Carte étudiante",                    docs.carteEtu],
    ];
    const investorItems = [
      ["🪪", "Pièce d'identité du représentant", docs.repCniFile],
      ["🏠", "Justificatif de domicile",          docs.domicile],
      ["📋", "Registre du Commerce (RCCM)",       docs.rccmFile],
    ];
    const items = isStudent ? studentItems : investorItems;

    return (
      <div className="kyc-form">
        <h2 className="kyc-form__title">✅ Récapitulatif & envoi</h2>

        <div className="recap-list">
          <div className="recap-list__title">Documents à envoyer</div>
          {items.map(([ico, lbl, val]) => (
            <div key={lbl} className="recap-list__item">
              <span>{ico}</span>
              <span className="recap-list__label">{lbl}</span>
              <span className={`badge ${val ? "badge-success" : "badge-danger"}`}>
                {val ? "✅ Prêt" : "⚠️ Manquant"}
              </span>
            </div>
          ))}
        </div>

        <div className="kyc-privacy-note">
          🔒 <strong>Confidentialité garantie :</strong> Vos documents sont chiffrés et accessibles
          uniquement à notre équipe de vérification. Conformité RGPD et loi camerounaise sur la
          protection des données personnelles (Loi n°2010/012).
        </div>

        <div className="kyc-delay-note">
          ⏱️ <strong>Délai de traitement :</strong> 24 à 48 heures ouvrées.
          Vous recevrez une notification dès que votre dossier est examiné.
        </div>
      </div>
    );
  };

  // ── Render steps ──────────────────────────────────────
  const renderStep = () => {
    if (isStudent) {
      if (step === 1) return <StepStudentIdentity />;
      if (step === 2) return <StepStudentScolarite />;
      if (step === 3) return <StepConfirmation />;
    } else {
      if (step === 1) return <StepInvestorIdentity />;
      if (step === 2) return <StepInvestorEntreprise />;
      if (step === 3) return <StepConfirmation />;
    }
  };

  return (
    <div className="kyc-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm"
            onClick={() => navigate(isStudent ? "dashboard-student" : "dashboard-investor")}
            style={{ marginBottom: 8 }}
          >
            ← Retour
          </button>
          <h1 className="page-title">Vérification de compte 🛡️</h1>
          <p className="page-subtitle">
            Étape {step} / {steps.length} —{" "}
            {isStudent ? "Vérification étudiant" : "Vérification investisseur"}
          </p>
        </div>
      </div>

      {/* Why KYC */}
      <WhyBanner />

      {/* Step indicator */}
      <StepIndicator steps={steps} current={step} />

      {/* Form card */}
      <div className="card" style={{ padding: 28, marginTop: 24 }}>
        {renderStep()}

        {/* Navigation buttons */}
        <div className="kyc-form__nav">
          {step > 1 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>
              ← Étape précédente
            </button>
          )}
          {step < steps.length ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              Étape suivante →
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => submitKyc(docs)}
            >
              📤 Envoyer mon dossier KYC
            </button>
          )}
        </div>
      </div>
    </div>
  );
}