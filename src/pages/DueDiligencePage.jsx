// ============================================================
// LAUNCHPAD — DueDiligencePage.jsx  ✅ BRANCHÉ SUR L'API RÉELLE
// Chemin : src/pages/DueDiligencePage.jsx
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { projectsApi, dueDiligenceApi } from "../utils/api";
import "./DueDiligence.css";

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
  const score = result.score ?? 0;
  const cls = score >= 75 ? "high" : score >= 55 ? "medium" : "low";
  return (
    <div className={`dd-score-card dd-score-card--${cls}`}>
      <div style={{ textAlign: "center" }}>
        <div className="dd-score-value">{score}</div>
        <div className="dd-score-label">/100</div>
      </div>
      <div>
        <div className="dd-score-title">Score Due Diligence</div>
        <div className="dd-score-sub">
          Risque <strong>{result.risk}</strong> · {result.isSandbox ? "Analyse heuristique" : "Analyse générée par IA"}
          {result.recommendation && <> · Recommandation : <strong>{result.recommendation}</strong></>}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function DueDiligencePage() {
  const { currentUser, navigate, showToast, selectedProject } = useApp();

  const [projects,   setProjects]   = useState([]);
  const [loadingList,setLoadingList]= useState(true);

  const [selected,  setSelected]  = useState(selectedProject || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result,    setResult]    = useState(null);
  const [errorMsg,  setErrorMsg]  = useState(null);

  /* Charger les projets actifs */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingList(true);
      try {
        const res = await projectsApi.list({ status: "active", limit: 20 });
        const data = res.data?.projects || res.data || [];
        if (!cancelled) setProjects(data);
      } catch (err) {
        if (!cancelled) showToast(err.message || "Erreur lors du chargement des projets.", "error");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* KYC gate */
  if (!currentUser?.kycValidated) return <KycBlocked navigate={navigate} />;

  const handleAnalyze = useCallback(async (project) => {
    setSelected(project);
    setResult(null);
    setErrorMsg(null);
    setAnalyzing(true);

    try {
      const res = await dueDiligenceApi.analyze(project.id);
      const data = res.data || res;
      setResult(data);
      if (data.fromCache) {
        showToast("Rapport récupéré (analyse récente en cache).", "info");
      } else {
        showToast("Analyse IA générée avec succès.", "success");
      }
    } catch (err) {
      setErrorMsg(err.message || "Erreur lors de l'analyse IA.");
      showToast(err.message || "Erreur lors de l'analyse.", "error");
    } finally {
      setAnalyzing(false);
    }
  }, [showToast]);

  function handleReset() {
    setSelected(null);
    setResult(null);
    setErrorMsg(null);
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
            Notre IA analyse automatiquement : <strong>marché · équipe · finances · traction ·
            red flags · score de risque</strong>. Rapport mis en cache 24h pour chaque projet.
          </div>
        </div>
      )}

      {/* Project selector */}
      {!selected && (
        <>
          <div className="section-title" style={{ marginBottom: 14 }}>
            Sélectionnez un projet à analyser
          </div>

          {loadingList && (
            <div className="loading-state">
              <div className="spinner" />
              <div className="loading-state__title">Chargement des projets…</div>
            </div>
          )}

          {!loadingList && projects.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__icon">📦</div>
              <div className="empty-state__title">Aucun projet actif disponible</div>
            </div>
          )}

          {!loadingList && projects.length > 0 && (
            <div className="grid-auto">
              {projects.map(p => (
                <div key={p.id} className="dd-project-card card card-hover">
                  <div className="dd-project-card__emoji">{p.emoji || "🚀"}</div>
                  <div className="dd-project-card__name">{p.title}</div>
                  <div className="dd-project-card__meta">{p.category} · {p.stage || "—"}</div>
                  <div className="dd-project-card__tagline">{p.tagline || p.description?.slice(0, 80)}</div>
                  <button
                    className="btn btn-secondary btn-sm btn-full"
                    onClick={() => handleAnalyze(p)}
                  >
                    🤖 Analyser ce projet
                  </button>
                </div>
              ))}
            </div>
          )}
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
                <span style={{ fontSize: 40 }}>{selected.emoji || "🚀"}</span>
                <div>
                  <div className="dd-project-header__name">{selected.title}</div>
                  <div className="dd-project-header__meta">{selected.category} · {selected.stage || "—"}</div>
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

            {/* Erreur */}
            {errorMsg && !analyzing && (
              <div className="card" style={{ padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>❌</div>
                <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>{errorMsg}</p>
                <button className="btn btn-primary" onClick={() => handleAnalyze(selected)}>
                  Réessayer
                </button>
              </div>
            )}

            {/* CTA */}
            {!analyzing && !result && !errorMsg && (
              <div className="dd-cta">
                <div className="dd-cta__icon">🤖</div>
                <div className="dd-cta__title">Prêt à analyser</div>
                <p className="dd-cta__desc">
                  Notre IA va analyser le marché, l'équipe et les risques en quelques secondes.
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

                {/* Summary */}
                {result.summary && (
                  <div className="card" style={{ padding: 18, marginBottom: 16 }}>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      {result.summary}
                    </p>
                  </div>
                )}

                {/* Detail */}
                <div className="card" style={{ padding: 20 }}>
                  <div className="section-title" style={{ marginBottom: 14 }}>
                    Analyse détaillée
                  </div>
                  {[
                    ["📊 Marché",    result.market],
                    ["👥 Équipe",    result.team],
                    ["💰 Financier", result.finance],
                    ["📈 Traction",  result.traction],
                  ].filter(([, v]) => v).map(([title, block]) => (
                    <div key={title} className="dd-detail-row">
                      <div className="dd-detail-row__title">
                        {title} {block.score != null && <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>({block.score}/25)</span>}
                      </div>
                      <div className="dd-detail-row__text">{block.analysis}</div>
                    </div>
                  ))}
                </div>

                {/* Strengths */}
                {result.strengths?.length > 0 && (
                  <div className="card" style={{ padding: 20, marginTop: 16 }}>
                    <div className="section-title" style={{ marginBottom: 12 }}>
                      ✅ Points forts
                    </div>
                    {result.strengths.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14, color: "var(--text-secondary)" }}>
                        <span>•</span><span>{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Red flags */}
                {result.redFlags?.length > 0 && (
                  <div className="card dd-red-flags" style={{ marginTop: 16 }}>
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
                {result.questions?.length > 0 && (
                  <div className="card" style={{ padding: 20, marginTop: 16 }}>
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
                )}

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
                ["Objectif",      selected.goalAmount ? `${(Number(selected.goalAmount) / 1_000_000).toFixed(1)}M XAF` : "—"],
                ["Levé",          selected.raisedAmount != null ? `${(Number(selected.raisedAmount) / 1_000_000).toFixed(1)}M XAF` : "—"],
                ["Progression",   selected.goalAmount ? `${Math.round((Number(selected.raisedAmount || 0) / Number(selected.goalAmount)) * 100)}%` : "—"],
                ["Équipe",        selected.teamSize ? `${selected.teamSize} personnes` : "—"],
                ["Stade",         selected.stage || "—"],
                ["Equity offerte",selected.equity != null ? `${selected.equity}%` : "—"],
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