import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import TransactionList from "../components/TransactionList";
import { getTransactions, verifyTransaction } from "../services/transactionService";

const TransactionsPage = () => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifyingId, setVerifyingId] = useState("");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  return (
    <div className="glass-panel">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="section-title">{t("history")}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Full transfer trail with blockchain-style verification hashes.
          </p>
        </div>
        <button type="button" className="secondary-button gap-2" onClick={fetchTransactions}>
          <RefreshCw size={16} />
          {t("refresh")}
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p> : null}
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
      {!loading ? (
        <TransactionList transactions={transactions} onVerify={handleVerify} verifyingId={verifyingId} />
      ) : null}
    </div>
  );
};

export default TransactionsPage;
