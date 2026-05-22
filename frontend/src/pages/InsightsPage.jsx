import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import InsightCard from "../components/InsightCard";
import { generateInsight, getLatestInsight } from "../services/insightService";

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
    <div className="space-y-5">
      <div className="glass-panel flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="section-title">{t("insights")}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Turn transaction history into simple savings guidance, risk awareness, and expense breakdowns that are easier to act on.
          </p>
        </div>
        <button type="button" className="primary-button gap-2" onClick={handleGenerate} disabled={generating}>
          <Sparkles size={16} />
          {generating ? "Analyzing..." : t("generateInsight")}
        </button>
      </div>

      {loading ? <div className="glass-panel text-sm text-slate-500 dark:text-slate-400">{t("loading")}</div> : null}
      {error ? <div className="glass-panel text-sm text-rose-600">{error}</div> : null}
      {!loading ? <InsightCard insight={insight} /> : null}
    </div>
  );
};

export default InsightsPage;
