import { useCallback, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { adminApi } from "../utils/api";
import "./InvestmentAdminPanel.css";

const STATUS_LABELS = {
  pending: "En attente",
  in_escrow: "En escrow",
  released: "Libéré",
  refunded: "Marqué remboursé",
  failed: "Échoué",
};

const METHOD_LABELS = {
  mtn_money: "MTN Mobile Money",
  orange_money: "Orange Money",
  stripe: "Stripe",
  bank_transfer: "Virement bancaire",
};

function formatXaf(value) {
  return `${Number(value || 0).toLocaleString("fr-FR")} XAF`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("fr-FR") : "—";
}

export default function InvestmentAdminPanel() {
  const { showToast } = useApp();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundSaving, setRefundSaving] = useState(false);

  const loadInvestments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.getInvestmentsControl({
        status,
        method,
        search: search || undefined,
        page,
        limit: 20,
      });
      const result = response?.data || response;
      if (!Array.isArray(result?.investments)) {
        throw new Error("Réponse invalide : la liste des investissements est absente.");
      }
      setData(result);
    } catch (loadError) {
      setError(loadError.message || "Impossible de charger les investissements.");
    } finally {
      setLoading(false);
    }
  }, [status, method, search, page]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadInvestments();
  }, [loadInvestments]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function applySearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  async function submitInternalRefund(event) {
    event.preventDefault();
    if (!refundTarget || refundReason.trim().length < 5) return;
    setRefundSaving(true);
    try {
      await adminApi.refundInvestment(refundTarget.id, refundReason.trim());
      showToast("Statut de remboursement enregistré dans LaunchPad.", "success");
      setRefundTarget(null);
      setRefundReason("");
      setSelected(null);
      await loadInvestments();
    } catch (refundError) {
      showToast(refundError.message || "Impossible d'enregistrer ce statut.", "error");
    } finally {
      setRefundSaving(false);
    }
  }

  const stats = data?.stats || [];
  const totalInvestments = stats.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const totalVolume = stats.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const activeCount = stats
    .filter((item) => ["pending", "in_escrow"].includes(item.status))
    .reduce((sum, item) => sum + Number(item.count || 0), 0);

  return (
    <section className="investment-admin">
      <header className="investment-admin__hero">
        <div>
          <span className="investment-admin__eyebrow">CENTRE DE CONTRÔLE</span>
          <h2>Investissements</h2>
          <p>Recherche, suivi des paiements et historique de chaque investissement.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={loadInvestments} disabled={loading}>
          {loading ? "Actualisation…" : "↻ Actualiser"}
        </button>
      </header>

      <div className="investment-admin__metrics">
        <article><span>Investissements</span><strong>{totalInvestments}</strong><small>Tous statuts</small></article>
        <article><span>Volume enregistré</span><strong>{formatXaf(totalVolume)}</strong><small>Somme des engagements</small></article>
        <article><span>En traitement</span><strong>{activeCount}</strong><small>En attente ou en escrow</small></article>
        <article><span>Résultats</span><strong>{data?.total ?? 0}</strong><small>Selon les filtres actifs</small></article>
      </div>

      <div className="investment-admin__status-grid">
        {stats.map((item) => (
          <button
            type="button"
            className={`investment-admin__status-card${status === item.status ? " is-active" : ""}`}
            key={item.status}
            onClick={() => { setStatus(status === item.status ? "all" : item.status); setPage(1); }}
          >
            <span>{STATUS_LABELS[item.status] || item.status}</span>
            <strong>{item.count}</strong>
            <small>{formatXaf(item.total)}</small>
          </button>
        ))}
      </div>

      <section className="investment-admin__table-card">
        <form className="investment-admin__filters" onSubmit={applySearch}>
          <label>
            Statut
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
              <option value="all">Tous les statuts</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label>
            Moyen de paiement
            <select value={method} onChange={(event) => { setMethod(event.target.value); setPage(1); }}>
              <option value="all">Tous les moyens</option>
              {Object.entries(METHOD_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
          <label className="investment-admin__search">
            Recherche
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Investisseur, projet, email, transaction…"
            />
          </label>
          <button className="btn btn-primary" type="submit">Rechercher</button>
        </form>

        {loading ? (
          <div className="investment-admin__empty">Chargement des opérations…</div>
        ) : error ? (
          <div className="investment-admin__empty investment-admin__error" role="alert">
            <span>{error}</span>
            <button className="btn btn-secondary btn-sm" type="button" onClick={loadInvestments}>Réessayer</button>
          </div>
        ) : data.investments.length === 0 ? (
          <div className="investment-admin__empty">
            <span>💳</span><strong>Aucun investissement trouvé</strong><small>Modifie les filtres ou la recherche.</small>
          </div>
        ) : (
          <div className="investment-admin__list">
            {data.investments.map((investment) => (
              <article className="investment-admin__item" key={investment.id}>
                <div className="investment-admin__item-mark">↗</div>
                <div className="investment-admin__item-main">
                  <div className="investment-admin__item-title">
                    <strong>{investment.project?.title || "Projet supprimé"}</strong>
                    <span className={`investment-admin__badge status-${investment.status}`}>
                      {STATUS_LABELS[investment.status] || investment.status}
                    </span>
                  </div>
                  <p>
                    {investment.investor?.firstName} {investment.investor?.lastName}
                    {investment.investor?.email ? ` · ${investment.investor.email}` : ""}
                  </p>
                  <div className="investment-admin__item-meta">
                    <span>{METHOD_LABELS[investment.paymentMethod] || investment.paymentMethod}</span>
                    <span>{formatDate(investment.createdAt)}</span>
                    {investment.transactions?.[0] && <span>Transaction : {investment.transactions[0].status}</span>}
                  </div>
                  {investment.status === "refunded" && investment.refundReason && (
                    <small className="investment-admin__refund-reason">Motif enregistré : {investment.refundReason}</small>
                  )}
                </div>
                <div className="investment-admin__amount">
                  <strong>{formatXaf(investment.amount)}</strong>
                  <small>Frais plateforme : {formatXaf(investment.platformFee)}</small>
                </div>
                <div className="investment-admin__actions">
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => setSelected(selected?.id === investment.id ? null : investment)}>
                    {selected?.id === investment.id ? "Fermer les détails" : "Détails"}
                  </button>
                  {!["refunded", "failed"].includes(investment.status) && (
                    <button className="btn btn-danger btn-sm" type="button" onClick={() => setRefundTarget(investment)}>
                      Marquer remboursé
                    </button>
                  )}
                </div>
                {selected?.id === investment.id && (
                  <div className="investment-admin__details">
                    <div><span>Référence escrow</span><strong>{investment.escrowRef || "—"}</strong></div>
                    <div><span>Transaction externe</span><strong>{investment.externalTxId || "—"}</strong></div>
                    <div><span>Catégorie projet</span><strong>{investment.project?.category || "—"}</strong></div>
                    <div><span>Investisseur ID</span><strong>{investment.investor?.id || "—"}</strong></div>
                    <div className="investment-admin__transactions">
                      <strong>Historique des transactions</strong>
                      {!investment.transactions?.length ? <small>Aucune transaction rattachée.</small> : investment.transactions.map((transaction) => (
                        <div key={transaction.id}>
                          <span>{transaction.provider} · {transaction.status} · {formatDate(transaction.createdAt)}</span>
                          <strong>{formatXaf(transaction.amount)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}

        <footer className="investment-admin__pagination">
          <span>Page {data?.page || page} sur {data?.totalPages || 1} · {data?.total || 0} résultat(s)</span>
          <div>
            <button className="btn btn-secondary btn-sm" type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>← Précédent</button>
            <button className="btn btn-secondary btn-sm" type="button" disabled={page >= (data?.totalPages || 1) || loading} onClick={() => setPage((value) => value + 1)}>Suivant →</button>
          </div>
        </footer>
      </section>

      {refundTarget && (
        <div className="modal-overlay" onClick={() => !refundSaving && setRefundTarget(null)}>
          <form className="modal investment-admin__refund-modal" onSubmit={submitInternalRefund} onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Enregistrer un remboursement interne</h3>
              <button className="modal-close" type="button" onClick={() => setRefundTarget(null)} disabled={refundSaving}>✕</button>
            </div>
            <div className="modal-body">
              <p>Investissement de <strong>{formatXaf(refundTarget.amount)}</strong> pour « {refundTarget.project?.title || "Projet"} ».</p>
              <div className="investment-admin__warning">
                Cette action met à jour le statut et le journal LaunchPad uniquement. Elle ne déclenche pas de transfert de fonds chez MTN, Orange Money ou Stripe.
              </div>
              <label>
                Motif obligatoire
                <textarea minLength={5} maxLength={500} required rows={4} value={refundReason} onChange={(event) => setRefundReason(event.target.value)} />
              </label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" type="button" onClick={() => setRefundTarget(null)} disabled={refundSaving}>Annuler</button>
              <button className="btn btn-danger" type="submit" disabled={refundSaving || refundReason.trim().length < 5}>
                {refundSaving ? "Enregistrement…" : "Confirmer le statut interne"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
