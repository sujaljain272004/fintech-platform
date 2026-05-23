import { useEffect, useState } from "react";
import { RefreshCw, UserX, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import {
  approveAdminUserKyc,
  getAdminAuthLogs,
  getAdminDashboard,
  getAdminTransactions,
  getAdminUsers,
  reverseAdminTransaction,
  updateAdminUserStatus,
} from "../services/adminService";
import PageTransition from "../components/ui/PageTransition";
import { EmptyState, DashboardSkeleton } from "../components/ui/StateBlocks";

const AdminPage = () => {
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [authLogs, setAuthLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      const [dashboardData, usersResponse, transactionsResponse, authLogsResponse] = await Promise.all([
        getAdminDashboard(),
        getAdminUsers({ limit: 6 }),
        getAdminTransactions({ limit: 6 }),
        getAdminAuthLogs({ limit: 6 }),
      ]);
      setDashboard(dashboardData);
      setUsers(usersResponse.data || []);
      setTransactions(transactionsResponse.data || []);
      setAuthLogs(authLogsResponse.data || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleUserStatus = async (user) => {
    const nextStatus = user.accountStatus === "active" ? "restricted" : "active";
    try {
      await updateAdminUserStatus(user._id, nextStatus);
      setUsers((current) => current.map((item) => (item._id === user._id ? { ...item, accountStatus: nextStatus } : item)));
    } catch (updateError) {
      setError(updateError.message);
    }
  };

  const handleApproveKyc = async (user) => {
    try {
      const updatedUser = await approveAdminUserKyc(user._id);
      setUsers((current) =>
        current.map((item) =>
          item._id === user._id
            ? {
                ...item,
                kycStatus: updatedUser.kycStatus,
                verificationStatus: updatedUser.verificationStatus,
                accountStatus: updatedUser.accountStatus,
                onboardingComplete: updatedUser.onboardingComplete,
              }
            : item
        )
      );
    } catch (approveError) {
      setError(approveError.message);
    }
  };

  const handleReverseTransaction = async (transactionId) => {
    try {
      const updated = await reverseAdminTransaction(transactionId);
      setTransactions((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (reverseError) {
      setError(reverseError.message);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="topbar-shell">
        <div>
          <p className="page-kicker">Admin console</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Operations and oversight</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Monitor users, transactions, and sign-in events from one place.
          </p>
        </div>
        <button type="button" className="secondary-button gap-2" onClick={fetchAdminData}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? <DashboardSkeleton /> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {dashboard ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Users", value: dashboard.summary.totalUsers },
            { label: "Active users", value: dashboard.summary.activeUsers },
            { label: "Transactions", value: dashboard.summary.totalTransactions },
            { label: "Volume", value: formatCurrency(dashboard.summary.totalVolume, "INR") },
          ].map((item) => (
            <div key={item.label} className="surface-stack">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-extrabold">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel">
          <h3 className="section-title">Recent users</h3>
          <div className="mt-4 space-y-3">
            {users.length ? users.map((user) => (
              <div key={user._id} className="surface-stack flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold">{user.fullName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.phoneNumber}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="status-badge status-success">{user.kycStatus || "pending"}</span>
                    <span className="status-badge status-pending">{user.role} · {user.accountStatus}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  {user.kycStatus !== "verified" ? (
                    <button type="button" className="primary-button gap-2" onClick={() => handleApproveKyc(user)}>
                      <span>Approve KYC</span>
                    </button>
                  ) : null}
                  <button type="button" className="secondary-button gap-2" onClick={() => toggleUserStatus(user)}>
                    <UserX size={16} />
                    {user.accountStatus === "active" ? "Restrict" : "Activate"}
                  </button>
                </div>
              </div>
            )) : <EmptyState title="No users loaded" description="Admin users will appear here once the backend returns data." />}
          </div>
        </div>

        <div className="glass-panel">
          <h3 className="section-title">Auth logs</h3>
          <div className="mt-4 space-y-3">
            {authLogs.length ? authLogs.map((log) => (
              <div key={log._id} className="surface-stack">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold">{log.eventType}</p>
                  <span className="pill-chip">{log.status}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{log.phoneNumber}</p>
                <p className="mt-1 text-xs text-slate-400">{formatDateTime(log.createdAt)}</p>
              </div>
            )) : <EmptyState title="No auth logs" description="Authentication events will show up here once users start signing in." />}
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <h3 className="section-title">Recent transactions</h3>
        <div className="mt-4 space-y-3">
          {transactions.length ? transactions.map((transaction) => (
            <div key={transaction.id} className="surface-stack flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{transaction.counterpartyName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {transaction.direction} · {transaction.status} · {formatDateTime(transaction.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-extrabold">{formatCurrency(transaction.amount, transaction.currency)}</p>
                <button type="button" className="secondary-button gap-2" onClick={() => handleReverseTransaction(transaction.id)}>
                  <RotateCcw size={16} />
                  Reverse
                </button>
              </div>
            </div>
          )) : <EmptyState title="No transactions loaded" description="Transactions matching the current filters will appear here." />}
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminPage;