import { Suspense, lazy, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import InsightCard from "../components/InsightCard";
import { generateInsight, getLatestInsight } from "../services/insightService";
import PageTransition from "../components/ui/PageTransition";
import { ChartSkeleton, EmptyState } from "../components/ui/StateBlocks";

const AnalyticsChartSuite = lazy(() => import("../components/AnalyticsChartSuite"));

const InsightsPage = () => {
  const { t } = useTranslation();
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchLatest = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getLatestInsight();
      setInsight(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError("");
      const data = await generateInsight();
      setInsight(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <PageTransition className="space-y-5">
      <div className="topbar-shell">
        <div>
          <p className="page-kicker">{t("insights")}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{t("insights")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Turn transaction history into simple savings guidance, risk awareness, and expense breakdowns that are easier to act on.
          </p>
        </div>
        <button type="button" className="primary-button gap-2" onClick={handleGenerate} disabled={generating}>
          <Sparkles size={16} />
          {generating ? "Analyzing..." : t("generateInsight")}
        </button>
      </div>

      {loading ? <ChartSkeleton /> : null}
      {error ? (
        <EmptyState title="Insights unavailable" description={error} />
      ) : null}
      {!loading && !error ? (
        <div className="space-y-6">
          <Suspense fallback={<div className="glass-panel text-sm text-slate-500 dark:text-slate-400">Loading analytics charts...</div>}>
            <AnalyticsChartSuite analytics={insight?.analytics} currency="INR" />
          </Suspense>
          <InsightCard insight={insight} />
        </div>
      ) : null}
    </PageTransition>
  );
};

export default InsightsPage;
