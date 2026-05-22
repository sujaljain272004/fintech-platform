import { ArrowRightLeft, Bell, Brain, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import WalletCard from "../components/WalletCard";
import SummaryCard from "../components/SummaryCard";
import QuickActionCard from "../components/QuickActionCard";
import TransactionList from "../components/TransactionList";
import InsightCard from "../components/InsightCard";
import useDashboardData from "../hooks/useDashboardData";
import { formatCompactCurrency } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { dashboard, loading, error, refresh } = useDashboardData();

  if (loading) {
    return <div className="glass-panel text-sm text-slate-500 dark:text-slate-400">{t("loading")}</div>;
  }

  if (error) {
    return (
      <div className="glass-panel">
        <p className="text-sm text-rose-600">{error}</p>
        <button type="button" className="secondary-button mt-4" onClick={refresh}>
          {t("refresh")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {user?.kycStatus !== "verified" ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          {t("limitedAccessWarning")}
        </div>
      ) : null}

      <WalletCard wallet={dashboard?.wallet} profile={dashboard?.profile} />

      <div className="flex items-center justify-between">
        <h2 className="section-title">{t("summary")}</h2>
        <button type="button" className="secondary-button gap-2" onClick={refresh}>
          <RefreshCw size={16} />
          {t("refresh")}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label={t("sent")}
          value={formatCompactCurrency(dashboard?.summary?.totalSent)}
          helper="Zero-fee outgoing transfers"
        />
        <SummaryCard
          label={t("received")}
          value={formatCompactCurrency(dashboard?.summary?.totalReceived)}
          helper="Incoming support and remittance"
        />
        <SummaryCard
          label={t("unread")}
          value={dashboard?.summary?.unreadNotifications || 0}
          helper="Security, transfer, and AI updates"
        />
      </div>

      <section>
        <h2 className="section-title mb-4">{t("quickActions")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <QuickActionCard
            title={t("transfer")}
            description="Send money instantly to a phone number or wallet."
            icon={ArrowRightLeft}
            to="/transfer"
            accent="linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)"
          />
          <QuickActionCard
            title={t("insights")}
            description="Generate new savings guidance from your transaction patterns."
            icon={Brain}
            to="/insights"
            accent="linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)"
          />
          <QuickActionCard
            title={t("notifications")}
            description="Stay updated on transfers, security checks, and AI alerts."
            icon={Bell}
            to="/notifications"
            accent="linear-gradient(135deg, #ea580c 0%, #fb7185 100%)"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="glass-panel">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="section-title">{t("recentTransactions")}</h2>
            <Link to="/transactions" className="text-sm font-semibold text-teal-700 dark:text-teal-300">
              {t("viewAll")}
            </Link>
          </div>
          <TransactionList transactions={dashboard?.recentTransactions || []} />
        </div>
        <InsightCard insight={dashboard?.latestInsight} />
      </section>
    </div>
  );
};

export default DashboardPage;
