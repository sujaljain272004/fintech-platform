import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatCompactCurrency } from "../utils/formatters";

const ActivityGraph = ({ transactions = [], analytics = null, currency = "INR" }) => {
  const { t } = useTranslation();

  const chartData = useMemo(() => {
    if (analytics?.monthlyTrend?.length) {
      return analytics.monthlyTrend.map((entry, index) => {
        const amount = Number(entry.sent || 0) + Number(entry.received || 0);

        return {
          id: `${entry.label}-${index}`,
          label: entry.label,
          amount,
          direction: Number(entry.received || 0) >= Number(entry.sent || 0) ? "received" : "sent",
        };
      });
    }

    const items = transactions
      .slice(0, 6)
      .map((transaction, index) => ({
        id: transaction.id || `${transaction.createdAt}-${index}`,
        label: transaction.counterpartyName || transaction.reference || `Txn ${index + 1}`,
        amount: Number(transaction.amount || 0),
        direction: transaction.direction,
      }))
      .reverse();

    const maxAmount = Math.max(...items.map((item) => item.amount), 1);

    return items.map((item) => ({
      ...item,
      height: Math.max(Math.round((item.amount / maxAmount) * 100), 12),
    }));
  }, [analytics, transactions]);

  const totals = useMemo(() => {
    const sent = transactions
      .filter((transaction) => transaction.direction === "sent")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const received = transactions
      .filter((transaction) => transaction.direction === "received")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return { sent, received };
  }, [transactions]);

  if (!chartData.length) {
    return (
      <div className="metric-tile w-full overflow-hidden">
        <h3 className="font-bold">{t("activity") || "Activity"}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Activity graph will appear once wallet analytics or transaction history are available.
        </p>
      </div>
    );
  }

  return (
    <div className="metric-tile w-full overflow-hidden">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
            {t("activity") || "Activity"}
          </p>
          <h3 className="mt-2 text-xl font-extrabold tracking-tight">Recent transfer flow</h3>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          <p>Sent {formatCompactCurrency(totals.sent, currency)}</p>
          <p>Received {formatCompactCurrency(totals.received, currency)}</p>
        </div>
      </div>

      <div className="flex h-48 items-end gap-3 overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/50">
        {chartData.map((item) => {
          const isReceived = item.direction === "received";

          return (
            <div key={item.id} className="group flex flex-1 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end justify-center">
                <div
                  className={`w-full max-w-[42px] rounded-t-3xl transition duration-300 group-hover:scale-[1.03] ${
                    isReceived
                      ? "bg-gradient-to-t from-emerald-500 to-cyan-400"
                      : "bg-gradient-to-t from-slate-950 to-teal-500 dark:from-teal-500 dark:to-cyan-300"
                  }`}
                  style={{ height: `${item.height}%` }}
                  title={`${item.label} ${formatCompactCurrency(item.amount, currency)}`}
                />
              </div>
              <div className="w-full text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <p className="truncate">{item.label}</p>
                <p className={isReceived ? "text-emerald-600 dark:text-emerald-300" : "text-slate-700 dark:text-slate-200"}>
                  {isReceived ? "+" : "-"}{formatCompactCurrency(item.amount, currency)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Incoming
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-950 dark:bg-teal-400" />
          Outgoing
        </span>
      </div>
    </div>
  );
};

export default ActivityGraph;