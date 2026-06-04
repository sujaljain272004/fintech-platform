import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import TransactionList from "../components/TransactionList";
import { getTransactions, verifyTransaction } from "../services/transactionService";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import PageTransition from "../components/ui/PageTransition";
import { EmptyState, ListSkeleton } from "../components/ui/StateBlocks";

const TransactionsPage = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", dateFrom: "", dateTo: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1, hasMore: false });

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      const response = await getTransactions({ ...filters, page, limit: pagination.limit });
      setTransactions(response.data || []);
      setPagination(response.pagination || { page, limit: pagination.limit, total: 0, totalPages: 1, hasMore: false });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.dateFrom, filters.dateTo]);

  const summary = useMemo(() => {
    const totalSpent = transactions
      .filter((transaction) => transaction.direction === "sent" && transaction.status !== "failed")
      .reduce((accumulator, transaction) => accumulator + Number(transaction.amount || 0), 0);

    const totalReceived = transactions
      .filter((transaction) => transaction.direction === "received" && transaction.status !== "failed")
      .reduce((accumulator, transaction) => accumulator + Number(transaction.amount || 0), 0);

    return { totalSpent, totalReceived };
  }, [transactions]);

  const handleVerify = async (transactionId) => {
    try {
      setVerifyingId(transactionId);
      await verifyTransaction(transactionId);
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifyingId("");
    }
  };

  const closeDetails = () => setSelectedTransaction(null);

  return (
    <PageTransition className="space-y-5">
      <div className="topbar-shell">
        <div>
          <p className="page-kicker">{t("history")}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{t("history")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Full transfer trail with blockchain-style verification hashes.
          </p>
        </div>
        <button type="button" className="secondary-button gap-2" onClick={fetchTransactions}>
          <RefreshCw size={16} />
          {t("refresh")}
        </button>
      </div>

      <div className="glass-panel">
        <div className="mb-5 grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.6fr_0.6fr_auto]">
          <label className="input-shell flex items-center gap-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="w-full bg-transparent outline-none"
              placeholder="Search by name, phone, or reference"
            />
          </label>
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="input-shell"
          >
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))}
            className="input-shell"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))}
            className="input-shell"
          />
          <button
            type="button"
            className="secondary-button gap-2"
            onClick={() => setFilters({ search: "", status: "", dateFrom: "", dateTo: "" })}
          >
            <X size={16} />
            Clear
          </button>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="surface-stack">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Filtered total spent</p>
            <p className="mt-2 text-2xl font-extrabold">{formatCurrency(summary.totalSpent, "INR")}</p>
          </div>
          <div className="surface-stack">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Filtered total received</p>
            <p className="mt-2 text-2xl font-extrabold">{formatCurrency(summary.totalReceived, "INR")}</p>
          </div>
          <div className="surface-stack">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Matching records</p>
            <p className="mt-2 text-2xl font-extrabold">{pagination.total}</p>
          </div>
        </div>

        {loading ? <ListSkeleton rows={4} /> : null}
        {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && transactions.length ? (
          <TransactionList
            transactions={transactions}
            onVerify={handleVerify}
            verifyingId={verifyingId}
            onSelectTransaction={setSelectedTransaction}
          />
        ) : null}

        {!loading && !error && !transactions.length ? (
          <EmptyState
            title="No transactions found"
            description="Try adjusting the search, date, or status filters to find matching activity."
          />
        ) : null}

        {!loading && pagination.totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="secondary-button gap-2"
                disabled={pagination.page <= 1}
                onClick={() => fetchTransactions(Math.max(pagination.page - 1, 1))}
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <button
                type="button"
                className="secondary-button gap-2"
                disabled={!pagination.hasMore}
                onClick={() => fetchTransactions(pagination.page + 1)}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selectedTransaction ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-2xl rounded-[2rem] border border-white/20 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="page-kicker">Transaction details</p>
                <h3 className="mt-2 text-2xl font-extrabold tracking-tight">{selectedTransaction.counterpartyName}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedTransaction.reference}</p>
              </div>
              <button type="button" className="secondary-button" onClick={closeDetails}>
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="surface-stack">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Amount</p>
                <p className="mt-2 text-2xl font-extrabold">{formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</p>
              </div>
              <div className="surface-stack">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</p>
                <p className="mt-2 text-2xl font-extrabold capitalize">{selectedTransaction.status}</p>
              </div>
              <div className="surface-stack">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Phone</p>
                <p className="mt-2 text-base font-semibold">{selectedTransaction.counterpartyPhone || "N/A"}</p>
              </div>
              <div className="surface-stack">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Ledger hash</p>
                <p className="mt-2 break-all text-sm font-semibold text-teal-700 dark:text-teal-300">
                  {selectedTransaction.blockchain?.hash || "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-4 surface-stack">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Timestamp</p>
              <p className="mt-2 text-sm font-semibold">{formatDateTime(selectedTransaction.createdAt)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </PageTransition>
  );
};

export default TransactionsPage;
