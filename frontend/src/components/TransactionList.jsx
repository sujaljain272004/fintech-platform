import { BadgeCheck, Download, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDateTime, truncateHash } from "../utils/formatters";

const statusToneMap = {
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  reversed: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

const TransactionList = ({ transactions = [], onVerify, verifyingId = "", onSelectTransaction }) => {
  const { t } = useTranslation();

  if (!transactions.length) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">{t("noTransactions")}</p>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        const incoming = transaction.direction === "received";

        return (
          <div
            key={transaction.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectTransaction?.(transaction)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                onSelectTransaction?.(transaction);
              }
            }}
            className="surface-stack w-full text-left transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div
                  className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl ${
                    incoming
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                  }`}
                >
                  {incoming ? <Download size={18} /> : <Upload size={18} />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{transaction.counterpartyName}</p>
                    <span className="pill-chip">{incoming ? t("received") : t("sent")}</span>
                    <span className={`pill-chip border-0 ${statusToneMap[transaction.status] || statusToneMap.completed}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {transaction.note || transaction.reference}
                  </p>
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    {formatDateTime(transaction.createdAt)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-lg font-extrabold ${
                    incoming ? "text-emerald-600 dark:text-emerald-300" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {incoming ? "+" : "-"}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onVerify?.(transaction.id);
                  }}
                  className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 hover:text-teal-600 dark:bg-slate-800 dark:text-teal-300 dark:hover:bg-slate-700"
                  disabled={verifyingId === transaction.id}
                >
                  {verifyingId === transaction.id ? "Verifying..." : truncateHash(transaction.blockchain?.hash || "", 10, 10)}
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-teal-700 dark:text-teal-300">
              <BadgeCheck size={14} />
              <span>{t("secureLedger")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList;
