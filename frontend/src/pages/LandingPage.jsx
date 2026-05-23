import { ArrowRightLeft, BadgeCheck, Brain, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/ui/PageTransition";

const featureCards = [
  { icon: ArrowRightLeft, titleKey: "featureTransferTitle", bodyKey: "featureTransferBody" },
  { icon: Brain, titleKey: "featureInsightTitle", bodyKey: "featureInsightBody" },
  { icon: ShieldCheck, titleKey: "featureSecurityTitle", bodyKey: "featureSecurityBody" },
];

const LandingPage = () => {
  const { t } = useTranslation();

  return (
    <PageTransition className="app-shell flex min-h-screen items-center py-8">
      <div className="relative grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="glow-accent -left-8 top-0 h-56 w-56 bg-teal-300/20 dark:bg-teal-500/15" />
        <div className="glow-accent right-0 top-1/3 h-56 w-56 bg-cyan-300/20 dark:bg-cyan-400/15" />

        <div className="page-banner relative">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="pill-chip">{t("appName")}</p>
              <h1 className="mt-4 max-w-2xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
                {t("landingTitle")}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                {t("landingSubtitle")}
              </p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="metric-tile">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
                Phone first
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Persistent wallets tied to real users.
              </p>
            </div>
            <div className="metric-tile">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
                AI insights
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Simple guidance from wallet activity.
              </p>
            </div>
            <div className="metric-tile">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
                Ledger trail
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Transparent verification on every transfer.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.titleKey} className="soft-panel">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-teal-500 dark:text-slate-950">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold">{t(item.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{t(item.bodyKey)}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="page-banner relative flex flex-col justify-between overflow-hidden">
          <div className="glow-accent -right-6 top-0 h-40 w-40 bg-amber-300/20 dark:bg-amber-400/15" />
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
              <BadgeCheck size={14} />
              {t("securityHighlights")}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">{t("getStartedTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{t("getStartedBody")}</p>
            <div className="mt-6 rounded-3xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              {t("otpBillingNotice")}
            </div>
          </div>
          <Link to="/login" className="primary-button mt-8 w-full justify-center">
            {t("getStarted")}
          </Link>
        </div>
      </div>
    </PageTransition>
  );
};

export default LandingPage;