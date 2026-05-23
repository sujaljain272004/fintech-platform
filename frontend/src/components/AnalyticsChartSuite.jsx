import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";

const PIE_COLORS = ["#14b8a6", "#0f172a", "#38bdf8", "#f59e0b", "#8b5cf6", "#ef4444", "#22c55e", "#64748b"];

const formatAmount = (value = 0, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const ChartTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-fintech dark:border-slate-700 dark:bg-slate-950/95">
      <p className="font-semibold text-slate-900 dark:text-white">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-slate-600 dark:text-slate-300">
          {entry.name}: {formatAmount(entry.value, currency)}
        </p>
      ))}
    </div>
  );
};

const AnalyticsChartSuite = ({ analytics, currency = "INR" }) => {
  const { t } = useTranslation();

  const categoryData = analytics?.categoryBreakdown || [];
  const monthlyTrend = analytics?.monthlyTrend || [];
  const savingsEstimate = analytics?.monthlySavingsEstimate || 0;
  const healthScore = analytics?.financialHealthScore || 0;
  const warnings = analytics?.warnings || [];
  const recommendations = analytics?.recommendations || [];

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="surface-stack overflow-hidden">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="page-kicker">{t("insights")}</p>
            <h3 className="mt-3 text-2xl font-extrabold tracking-tight">Spending mix</h3>
          </div>
          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-800">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Score</p>
            <p className="text-lg font-extrabold">{healthScore}/100</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="h-[320px] min-h-[320px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={320}>
              <PieChart>
                <Pie
                  data={categoryData.length ? categoryData : [{ name: "Others", amount: 1, percentage: 100 }]}
                  dataKey="amount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={65}
                  paddingAngle={4}
                >
                  {(categoryData.length ? categoryData : [{ name: "Others" }]).map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {categoryData.length ? (
              categoryData.map((category, index) => (
                <div key={category.name} className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/70">
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      {category.name}
                    </span>
                    <span>{category.percentage}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                      style={{ width: `${Math.max(category.percentage || 0, 8)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatAmount(category.amount, currency)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Generate an insight to view the category chart.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="surface-stack">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="page-kicker">Trend</p>
              <h3 className="mt-3 text-xl font-extrabold tracking-tight">6-month flow</h3>
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-800">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Savings</p>
              <p className="text-lg font-extrabold">{formatAmount(savingsEstimate, currency)}</p>
            </div>
          </div>

          <div className="h-[280px] min-h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={280}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0.08} />
                  </linearGradient>
                  <linearGradient id="receivedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(value) => `${value}`} />
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Legend />
                <Area type="monotone" dataKey="received" name="Incoming" stroke="#14b8a6" fill="url(#receivedGradient)" />
                <Area type="monotone" dataKey="sent" name="Outgoing" stroke="#0f172a" fill="url(#sentGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-stack">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="page-kicker">Signals</p>
              <h3 className="mt-3 text-xl font-extrabold tracking-tight">Health + warnings</h3>
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Health</p>
              <p className="text-lg font-extrabold">{healthScore}/100</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Warnings</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {warnings.length ? warnings.map((warning) => <p key={warning}>• {warning}</p>) : <p>No major warning signals detected.</p>}
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tips</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {recommendations.length ? recommendations.slice(0, 3).map((tip) => <p key={tip}>• {tip}</p>) : <p>Generate an insight to unlock recommendations.</p>}
              </div>
            </div>
          </div>

          <div className="mt-4 h-[220px] min-h-[220px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={220}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip content={<ChartTooltip currency={currency} />} />
                <Legend />
                <Bar dataKey="sent" name="Outgoing" radius={[12, 12, 0, 0]} fill="#0f172a" />
                <Bar dataKey="received" name="Incoming" radius={[12, 12, 0, 0]} fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsChartSuite;