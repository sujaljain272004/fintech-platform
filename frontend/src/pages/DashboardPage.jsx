import { ArrowRightLeft, Bell, Brain, RefreshCw } from "lucide-react";
import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import WalletCard from "../components/WalletCard";
import SummaryCard from "../components/SummaryCard";
import QuickActionCard from "../components/QuickActionCard";
import TransactionList from "../components/TransactionList";
import InsightCard from "../components/InsightCard";
import ActivityGraph from "../components/ActivityGraph";
import useDashboardData from "../hooks/useDashboardData";
import { formatCompactCurrency } from "../utils/formatters";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/ui/PageTransition";
import { DashboardSkeleton, EmptyState } from "../components/ui/StateBlocks";
import { RefreshCw as RefreshIcon } from "lucide-react";

const AnalyticsChartSuite = lazy(() => import("../components/AnalyticsChartSuite"));

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { dashboard, loading, error, refresh } = useDashboardData();

  if (loading) {
    return <PageTransition><DashboardSkeleton /></PageTransition>;
  }

  if (error) {
    return (
      <PageTransition>
        <EmptyState
          title="Dashboard unavailable"
          description={error}
          action={
            <button type="button" className="primary-button gap-2" onClick={refresh}>
              <RefreshIcon size={16} />
              Retry
            </button>
          }
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-6">
      {user?.kycStatus !== "verified" ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
          {t("limitedAccessWarning")}
        </div>
      ) : null}

      <div className="topbar-shell">
        <div>
          <p className="page-kicker">{t("dashboard")}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{t("summary")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">
            Track the wallet, review recent movement, and jump straight into transfers or insights.
          </p>
        </div>
        <button type="button" className="secondary-button gap-2" onClick={refresh}>
          <RefreshCw size={16} />
          {t("refresh")}
        </button>
      </div>

      <div className="dashboard-grid">
        <WalletCard wallet={dashboard?.wallet} profile={dashboard?.profile} />
        <div className="section-shell space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="page-kicker">{t("summary")}</p>
              <h3 className="mt-3 text-xl font-extrabold tracking-tight">At a glance</h3>
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-800">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Health</p>
              <p className="text-lg font-extrabold">{dashboard?.analytics?.financialHealthScore || 0}/100</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="metric-tile">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">Recent activity</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{dashboard?.recentTransactions?.length || 0} transactions in view</p>
            </div>
            <div className="metric-tile">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">Notifications</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{dashboard?.summary?.unreadNotifications || 0} unread alerts</p>
            </div>
          </div>
        </div>
      </div>

      <section className="section-shell">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="page-kicker">{t("activity") || "Activity"}</p>
            <h3 className="mt-3 text-2xl font-extrabold tracking-tight">Transfer flow</h3>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <p>{dashboard?.analytics?.monthlyTrend?.length || 0} months tracked</p>
            <p>{dashboard?.recentTransactions?.length || 0} recent transactions</p>
          </div>
        </div>
        <ActivityGraph transactions={dashboard?.recentTransactions || []} analytics={dashboard?.analytics} />
      </section>

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

      <Suspense fallback={<div className="glass-panel text-sm text-slate-500 dark:text-slate-400">Loading analytics charts...</div>}>
        <AnalyticsChartSuite analytics={dashboard?.analytics} currency={dashboard?.wallet?.currency || "INR"} />
      </Suspense>

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
    </PageTransition>
  );
};

export default DashboardPage;
