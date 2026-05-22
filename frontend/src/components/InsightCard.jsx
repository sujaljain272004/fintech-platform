import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const InsightCard = ({ insight }) => {
  const { t } = useTranslation();

  if (!insight) {
    return (
      <div className="soft-panel">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No AI insight generated yet. Tap the button below to create one from your wallet activity.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-300">
          <Sparkles size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{t("latestInsight")}</p>
          <h3 className="text-xl font-extrabold">{t("summary")}</h3>
        </div>
      </div>

      <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{insight.summary}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="soft-panel">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {t("healthScore")}
          </p>
          <p className="mt-2 text-3xl font-extrabold">{insight.financialHealthScore}/100</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{insight.cashFlowStatus}</p>
        </div>
        <div className="soft-panel">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {t("savingsTip")}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{insight.savingsTip}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="soft-panel">
          <h4 className="font-bold">{t("categories")}</h4>
          <div className="mt-4 space-y-3">
            {insight.categories?.map((category) => (
              <div key={category.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{category.name}</span>
                  <span>{category.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-400"
                    style={{ width: `${Math.min(category.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-panel">
          <h4 className="font-bold">{t("recommendations")}</h4>
          <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            <p>{insight.spendingPattern}</p>
            {insight.recommendations?.map((recommendation) => (
              <div key={recommendation} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                {recommendation}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
