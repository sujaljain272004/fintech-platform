import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatCompactCurrency } from "../utils/formatters";

const scoreToLabel = (score) => {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Healthy";
  if (score >= 40) return "Watch";
  return "Needs focus";
};

const getRiskTone = (riskLevel = "medium") => {
  const normalized = String(riskLevel).toLowerCase();

  if (normalized.includes("low")) return "from-emerald-500 to-cyan-400";
  if (normalized.includes("high")) return "from-rose-500 to-orange-400";
  return "from-amber-500 to-teal-400";
};

const InsightGraphSuite = ({ insight, currency = "INR" }) => {
  const { t } = useTranslation();

  const score = Number(insight?.financialHealthScore || 0);
  const recommendations = insight?.recommendations?.length || 0;
  const categories = insight?.categories || [];

  const categoryTotal = useMemo(
    () => categories.reduce((sum, category) => sum + Number(category.percentage || 0), 0),
    [categories]
  );

  const ringStyle = {
    background: `conic-gradient(#14b8a6 ${score * 3.6}deg, rgba(148,163,184,0.18) 0deg)`,
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="metric-tile relative overflow-hidden">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
              {t("insights")}
            </p>
            <h3 className="mt-2 text-xl font-extrabold tracking-tight">Financial health dial</h3>
          </div>
          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-800">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Score</p>
            <p className="text-lg font-extrabold">{score}/100</p>
          </div>
        </div>

        <div className="grid place-items-center">
          <div className="relative grid h-56 w-56 place-items-center rounded-full bg-slate-50 dark:bg-slate-950/70">
            <div className="absolute inset-0 rounded-full p-3" style={ringStyle} />
            <div className="relative grid h-40 w-40 place-items-center rounded-full border border-white/80 bg-white text-center shadow-fintech dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-teal-700 dark:text-teal-300">
                  {scoreToLabel(score)}
                </p>
                <p className="mt-2 text-4xl font-extrabold">{score}</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{insight?.cashFlowStatus || "Status pending"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Risk", value: insight?.riskLevel || "medium" },
            { label: "Source", value: insight?.source || "heuristic" },
            { label: "Recommendations", value: recommendations },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900/70">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="metric-tile relative overflow-hidden">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
              Distribution
            </p>
            <h3 className="mt-2 text-xl font-extrabold tracking-tight">Category breakdown</h3>
          </div>
          <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-800">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Total</p>
            <p className="text-lg font-extrabold">{categoryTotal}%</p>
          </div>
        </div>

        <div className="space-y-4">
          {categories.length ? (
            categories.map((category, index) => {
              const width = Math.min(Number(category.percentage || 0), 100);

              return (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                    <span>{category.name}</span>
                    <span>{width}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400"
                      style={{ width: `${Math.max(width, 8)}%`, opacity: 1 - index * 0.07 }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Generate an insight to unlock the category and health graphs.
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/70">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Cash flow
            </p>
            <div className="mt-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getRiskTone(insight?.riskLevel)}`}
                style={{ width: `${Math.max(score, 8)}%` }}
              />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {insight?.cashFlowStatus || "Awaiting analysis"}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900/70">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Suggested savings
            </p>
            <p className="mt-3 text-2xl font-extrabold">
              {formatCompactCurrency(
                categories.reduce((sum, category) => sum + (Number(category.percentage || 0) * 125), 0),
                currency
              )}
            </p>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              A visual proxy based on current category intensity and wallet activity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InsightGraphSuite;