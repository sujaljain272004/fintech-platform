import { ArrowRightLeft, Brain, Globe2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import DemoLoginForm from "../components/DemoLoginForm";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";
import PageTransition from "../components/ui/PageTransition";

const featureCards = [
  { icon: ArrowRightLeft, titleKey: "featureTransferTitle", bodyKey: "featureTransferBody" },
  { icon: Brain, titleKey: "featureInsightTitle", bodyKey: "featureInsightBody" },
  { icon: ShieldCheck, titleKey: "featureSecurityTitle", bodyKey: "featureSecurityBody" },
];

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <PageTransition className="app-shell flex min-h-screen items-center py-8">
      <div className="relative grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glow-accent -left-8 top-8 h-56 w-56 bg-teal-300/20 dark:bg-teal-500/15" />
        <div className="glow-accent right-0 top-1/2 h-56 w-56 bg-cyan-300/20 dark:bg-cyan-400/15" />

        <div className="page-banner flex flex-col justify-between">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="pill-chip">{t("appName")}</p>
              <h1 className="mt-4 max-w-xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
                {t("tagline")}
              </h1>
            </div>
            <div className="hidden gap-2 sm:flex">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <div className="metric-tile">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
                Fast access
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in with a phone number.</p>
            </div>
            <div className="metric-tile">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
                Live wallet
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Restore balance, history, and alerts.</p>
            </div>
            <div className="metric-tile">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">
                Multilingual
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">English, Hindi, and Marathi support.</p>
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

          <div className="mt-6 hidden items-center gap-2 text-sm text-slate-500 md:flex dark:text-slate-400">
            <Globe2 size={16} />
            {t("multilingualReady")}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <DemoLoginForm />
        </div>
      </div>
    </PageTransition>
  );
};

export default LoginPage;