// ============================================================
// LAUNCHPAD — KycVerification.jsx 
// Chemin : src/pages/KycVerification.jsx
// ============================================================

import { useState, useRef } from "react";
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

// ── Upload zone réutilisable (Gestion des fichiers réels) ──
function UploadZone({ docType, icon, label, sub, value, onFileSelect }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(docType, file);
  };

  return (
    <div
      className={`upload-zone${value ? " upload-zone--done" : ""}`}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      {value ? (
        <>
          <div className="upload-zone__icon">✅</div>
          <div className="upload-zone__done">{value.name}</div>
          <div className="upload-zone__sub">{(value.size / 1024 / 1024).toFixed(2)} MB</div>
        </>
      ) : (
        <>
          <div className="upload-zone__icon">{icon}</div>
          <div className="upload-zone__label">{label}</div>
          <div className="upload-zone__sub">{sub}</div>
        </>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────
export default function KycVerification() {
  const { currentUser, navigate, submitKyc, approveKyc, getAccessToken, showToast } = useApp();

  const isStudent   = currentUser?.role === "student";
  const isSubmitted = currentUser?.kycStatus === "submitted";
  const isApproved  = currentUser?.kycValidated;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // States pour les champs texte
  const [textData, setTextData] = useState({
    cniNumber: "",
    university: "",
    matricule: "",
    level: "",
    repName: "",
    repCni: "",
    entityName: "",
    entityType: "",
    rccm: "",
  });

  // State dynamique pour stocker les vrais objets File
  const [files, setFiles] = useState({});

  const handleTextChange = (key, val) => {
    setTextData(prev => ({ ...prev, [key]: val }));
  };

  const handleFileSelect = (docType, file) => {
    setFiles(prev => ({ ...prev, [docType]: file }));
  };

  const STEPS_S = ["Identité", "Scolarité", "Confirmation"];
  const STEPS_I = ["Identité", "Entreprise", "Confirmation"];
  const steps   = isStudent ? STEPS_S : STEPS_I;

  // ── Fonction de soumission réelle vers l'API Backend ─────
  const handleSubmitKyc = async () => {
    setLoading(true);
    try {
      const formData = new FormData();

      // 1. Injection de tous les fichiers réels sélectionnés
      Object.entries(files).forEach(([docType, file]) => {
        formData.append(docType, file);
      });

      // 2. Injection des données textuelles selon le profil utilisateur
      if (isStudent) {
        formData.append("cniNumber",  textData.cniNumber);
        formData.append("university", textData.university);
        formData.append("matricule",  textData.matricule);
        formData.append("level",      textData.level);
      } else {
        formData.append("repName",    textData.repName);
        formData.append("repCni",     textData.repCni);
        formData.append("entityName", textData.entityName);
        formData.append("entityType", textData.entityType);
        formData.append("rccm",       textData.rccm || "");
      }

      // 3. Requête HTTP multipart/form-data
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/kyc/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
            // Le navigateur se charge lui-même de mettre le Content-Type avec le bon boundary
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la soumission du dossier.");
      }

      // 4. Notification et mise à jour de l'état contextuel global
      if (typeof showToast === "function") showToast("Dossier KYC envoyé avec succès !", "success");
      submitKyc(files); 

    } catch (error) {
      if (typeof showToast === "function") {
        showToast(error.message, "error");
      } else {
        alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Rendu Écran : Approved (Compte Vérifié) ──────────────
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

  // ── Rendu Écran : Submitted (Dossier en attente) ──────────
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

        {/* Bouton de simulation Dev/Démo */}
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

  // ── Composant Bannière d'information ────────────────────
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
        Fournissez une pièce d'identité officielle camerounaise valide (CNI, passeport ou permis de conduire).
      </p>
      <div className="form-group">
        <label className="form-label">Numéro CNI / Passeport <span className="req">*</span></label>
        <input className="form-input" placeholder="Ex : 123456789A"
          value={textData.cniNumber} onChange={e => handleTextChange("cniNumber", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Recto de la pièce d'identité <span className="req">*</span></label>
        <UploadZone docType="cniFile" icon="🪪" label="Glissez ou cliquez pour choisir" sub="JPG, PNG, PDF — max 5 MB"
          value={files.cniFile} onFileSelect={handleFileSelect} />
      </div>
      <div className="form-group">
        <label className="form-label">Selfie en tenant la pièce d'identité <span className="req">*</span></label>
        <UploadZone docType="selfie" icon="📸" label="Photo nette, éclairage correct" sub="Tenez votre CNI à côté de votre visage"
          value={files.selfie} onFileSelect={handleFileSelect} />
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
          value={textData.university} onChange={e => handleTextChange("university", e.target.value)}
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
            value={textData.matricule} onChange={e => handleTextChange("matricule", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Niveau d'études <span className="req">*</span></label>
          <select className="form-input form-select"
            value={textData.level} onChange={e => handleTextChange("level", e.target.value)}
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
        <UploadZone docType="certifScol" icon="🎓"
          label="Certificat de scolarité — année académique en cours"
          sub="Document officiel signé et tamponné par votre établissement — PDF, JPG"
          value={files.certifScol} onFileSelect={handleFileSelect} />
      </div>
      <div className="form-group">
        <label className="form-label">Carte d'étudiant <span className="req">*</span></label>
        <UploadZone docType="carteEtu" icon="🆔"
          label="Recto de votre carte étudiante en cours de validité"
          sub="Photo nette, texte lisible — JPG, PNG"
          value={files.carteEtu} onFileSelect={handleFileSelect} />
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
          value={textData.repName} onChange={e => handleTextChange("repName", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Numéro CNI / Passeport <span className="req">*</span></label>
        <input className="form-input" placeholder="Ex : 123456789A"
          value={textData.repCni} onChange={e => handleTextChange("repCni", e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Recto de la pièce d'identité <span className="req">*</span></label>
        <UploadZone docType="repCniFile" icon="🪪" label="CNI ou passeport — recto visible"
          sub="JPG, PNG, PDF — max 5 MB"
          value={files.repCniFile} onFileSelect={handleFileSelect} />
      </div>
      <div className="form-group">
        <label className="form-label">Justificatif de domicile (moins de 3 mois)</label>
        <UploadZone docType="domicile" icon="🏠"
          label="Facture eau, électricité ou relevé bancaire"
          sub="Moins de 3 mois — PDF, JPG"
          value={files.domicile} onFileSelect={handleFileSelect} />
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
          value={textData.entityName} onChange={e => handleTextChange("entityName", e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Type de structure</label>
          <select className="form-input form-select"
            value={textData.entityType} onChange={e => handleTextChange("entityType", e.target.value)}
          >
            <option value="">Choisir…</option>
            {INVEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Numéro RCCM</label>
          <input className="form-input" placeholder="RC/DLA/2020/B/0001"
            value={textData.rccm} onChange={e => handleTextChange("rccm", e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Registre du Commerce (RCCM) <span className="req">*</span></label>
        <UploadZone docType="rccmFile" icon="📋"
          label="Document RCCM officiel ou statuts de l'entreprise"
          sub="PDF signé par le greffe du tribunal — max 10 MB"
          value={files.rccmFile} onFileSelect={handleFileSelect} />
      </div>
      <div className="kyc-angel-note">
        💡 <strong>Particulier sans entreprise ?</strong> Vous pouvez investir en tant que Business Angel.
        Fournissez simplement votre CNI macro et un relevé bancaire récent.
      </div>
    </div>
  );

  // ── STEP 3 — Confirmation ─────────────────────────────
  const StepConfirmation = () => {
    const studentItems = [
      ["🪪", "Pièce d'identité (CNI / Passeport)", files.cniFile],
      ["📸", "Selfie avec la pièce d'identité",    files.selfie],
      ["🎓", "Certificat de scolarité",            files.certifScol],
      ["🆔", "Carte étudiante",                    files.carteEtu],
    ];
    const investorItems = [
      ["🪪", "Pièce d'identité du représentant", files.repCniFile],
      ["🏠", "Justificatif de domicile",          files.domicile],
      ["📋", "Registre du Commerce (RCCM)",       files.rccmFile],
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

  // ── Sélection de l'étape à afficher ────────────────────
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
            <button className="btn btn-secondary" disabled={loading} onClick={() => setStep(s => s - 1)}>
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
              style={{ flex: 1, justifyContent: "center" }}
              disabled={loading}
              onClick={handleSubmitKyc}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, marginRight: 8 }} />
                  Envoi en cours...
                </>
              ) : (
                "📤 Envoyer mon dossier KYC"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}