// ============================================================
// LAUNCHPAD — DueDiligencePage.jsx  🆕 NOUVELLE PAGE
// Chemin : src/pages/DueDiligencePage.jsx
// ============================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { PROJECTS } from "../data/mockData";
import "./DueDiligence.css";

/* ── Mock IA analysis ────────────────────────────────────── */
function generateAnalysis(project) {
  const score = Math.floor(60 + Math.random() * 35);
  return {
    score,
    risk: score >= 75 ? "Faible" : score >= 55 ? "Modéré" : "Élevé",
    market:   score >= 70
      ? "✅ Marché porteur — " + project.category + " en forte croissance en Afrique Centrale (+23%/an)"
      : "⚠️ Marché local limité — nécessite validation de la taille de l'opportunité",
    team:     "⚠️ Équipe jeune — " + project.teamSize + " membres · 0 expérience entrepreneuriale préalable documentée",
    finance:  score >= 65
      ? "✅ Projections réalistes — modèle " + (project.model?.includes("B2C") ? "B2C" : "B2B") + " validé"
      : "⚠️ Projections financières optimistes — hypothèses à challenger lors du RDV",
    redFlags: [
      "Absence de brevet ou protection IP déclarée",
      score < 70 ? "Dépendance forte aux subventions publiques camerounaises" : null,
      project.teamSize < 3 ? "Équipe mono-fondateur — risque opérationnel élevé" : null,
    ].filter(Boolean),
    questions: [
      "Quelle est votre stratégie d'acquisition clients dans les zones rurales du Cameroun ?",
      "Avez-vous des lettres d'intention (LOI) signées avec des clients ou partenaires ?",
      "Quel est votre plan de sortie prévu pour les investisseurs (horizon, valorisation) ?",
      "Comment gérez-vous les risques réglementaires spécifiques à votre secteur au Cameroun ?",
    ],
  };
}

/* ── KYC Blocked ─────────────────────────────────────────── */
function KycBlocked({ navigate }) {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 Due Diligence IA</h1>
          <p className="page-subtitle">Analyse approfondie des projets avant investissement</p>
        </div>
      </div>
      <div className="kyc-gate-full">
        <div className="kyc-gate-full__icon">🤖</div>
        <h2 className="kyc-gate-full__title">Accès réservé aux investisseurs vérifiés</h2>
        <p className="kyc-gate-full__desc">
          La Due Diligence IA est disponible uniquement pour les investisseurs
          dont le compte a été vérifié (KYC).
        </p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate("kyc-verification")}>
          Vérifier mon compte →
        </button>
      </div>
    </div>
  );
}

/* ── Score card ──────────────────────────────────────────── */
function ScoreCard({ result }) {
  const cls = result.score >= 75 ? "high" : result.score >= 55 ? "medium" : "low";
  return (
    <div className={`dd-score-card dd-score-card--${cls}`}>
      <div style={{ textAlign: "center" }}>
        <div className="dd-score-value">{result.score}</div>
        <div className="dd-score-label">/100</div>
      </div>
      <div>
        <div className="dd-score-title">Score Due Diligence</div>
        <div className="dd-score-sub">
          Risque <strong>{result.risk}</strong> · Analyse générée par IA
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function DueDiligencePage() {
  const { currentUser, navigate, showToast } = useApp();

  const [selected,  setSelected]  = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result,    setResult]    = useState(null);

  /* KYC gate */
  if (!currentUser?.kycValidated) return <KycBlocked navigate={navigate} />;

  function handleAnalyze(project) {
    setSelected(project);
    setResult(null);
    setAnalyzing(true);
    setTimeout(() => {
      setResult(generateAnalysis(project));
      setAnalyzing(false);
    }, 2400);
  }

  function handleReset() {
    setSelected(null);
    setResult(null);
    setAnalyzing(false);
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🤖 Due Diligence IA</h1>
          <p className="page-subtitle">Analyse automatique avant investissement</p>
        </div>
      </div>

      {/* Intro banner */}
      {!selected && (
        <div className="dd-intro-banner">
          <span className="dd-intro-banner__icon">🤖</span>
          <div className="dd-intro-banner__text">
            Notre IA analyse automatiquement : <strong>cohérence du pitch · taille du marché ·
            réalisme des projections · red flags · score de risque</strong>.
            Rapport généré en moins de 10 secondes.
          </div>
        </div>
      )}

      {/* Project selector */}
      {!selected && (
        <>
          <div className="section-title" style={{ marginBottom: 14 }}>
            Sélectionnez un projet à analyser
          </div>
          <div className="grid-auto">
            {PROJECTS.map(p => (
              <div key={p.id} className="dd-project-card card card-hover">
                <div className="dd-project-card__emoji">{p.emoji}</div>
                <div className="dd-project-card__name">{p.title}</div>
                <div className="dd-project-card__meta">{p.category} · {p.stage}</div>
                <div className="dd-project-card__tagline">{p.tagline}</div>
                <button
                  className="btn btn-secondary btn-sm btn-full"
                  onClick={() => handleAnalyze(p)}
                >
                  🤖 Analyser ce projet
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Analysis view */}
      {selected && (
        <div className="dd-layout">

          {/* Main */}
          <div className="dd-main">
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }} onClick={handleReset}>
              ← Choisir un autre projet
            </button>

            {/* Project header */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div className="dd-project-header">
                <span style={{ fontSize: 40 }}>{selected.emoji}</span>
                <div>
                  <div className="dd-project-header__name">{selected.title}</div>
                  <div className="dd-project-header__meta">{selected.category} · {selected.stage}</div>
                </div>
              </div>
            </div>

            {/* Loading */}
            {analyzing && (
              <div className="loading-state">
                <div className="spinner" />
                <div className="loading-state__title">Analyse en cours…</div>
                <div className="loading-state__sub">
                  Traitement du pitch · Analyse du marché camerounais · Évaluation des risques
                </div>
              </div>
            )}

            {/* CTA */}
            {!analyzing && !result && (
              <div className="dd-cta">
                <div className="dd-cta__icon">🤖</div>
                <div className="dd-cta__title">Prêt à analyser</div>
                <p className="dd-cta__desc">
                  Notre IA va analyser le pitch, le marché, l'équipe et les risques en quelques secondes.
                </p>
                <button className="btn btn-primary btn-lg" onClick={() => handleAnalyze(selected)}>
                  🚀 Lancer l'analyse IA
                </button>
              </div>
            )}

            {/* Result */}
            {result && !analyzing && (
              <div className="dd-result">
                {/* Score */}
                <ScoreCard result={result} />

                {/* Detail */}
                <div className="card" style={{ padding: 20 }}>
                  <div className="section-title" style={{ marginBottom: 14 }}>
                    Analyse détaillée
                  </div>
                  {[
                    ["📊 Marché",    result.market],
                    ["👥 Équipe",    result.team],
                    ["💰 Financier", result.finance],
                  ].map(([title, text]) => (
                    <div key={title} className="dd-detail-row">
                      <div className="dd-detail-row__title">{title}</div>
                      <div className="dd-detail-row__text">{text}</div>
                    </div>
                  ))}
                </div>

                {/* Red flags */}
                {result.redFlags.length > 0 && (
                  <div className="card dd-red-flags">
                    <div className="dd-red-flags__title">🚩 Red Flags détectés</div>
                    {result.redFlags.map((f, i) => (
                      <div key={i} className="dd-red-flags__item">
                        <span className="dd-red-flags__dot">•</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Questions */}
                <div className="card" style={{ padding: 20 }}>
                  <div className="section-title" style={{ marginBottom: 12 }}>
                    ❓ Questions à poser à l'équipe
                  </div>
                  {result.questions.map((q, i) => (
                    <div key={i} className="dd-question">
                      <span className="dd-question__num">{i + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="dd-actions">
                  <button className="btn btn-secondary" onClick={() => navigate("appointments")}>
                    📅 Demander un RDV
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate("payment")}>
                    💰 Investir dans ce projet
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="dd-side">
            <div className="card" style={{ padding: 18 }}>
              <div className="section-title" style={{ marginBottom: 12 }}>
                📊 Données du projet
              </div>
              {[
                ["Objectif",      `${(selected.goal / 1_000_000).toFixed(0)}M XAF`],
                ["Levé",          `${(selected.raised / 1_000_000).toFixed(0)}M XAF`],
                ["Progression",   `${Math.round((selected.raised / selected.goal) * 100)}%`],
                ["Investisseurs", selected.investors],
                ["Équipe",        `${selected.teamSize} personnes`],
                ["Stade",         selected.stage],
                ["Deadline",      selected.deadline],
                ["Equity offerte",selected.equity],
              ].map(([k, v]) => (
                <div key={k} className="dd-side-row">
                  <span className="dd-side-row__key">{k}</span>
                  <span className="dd-side-row__val">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}