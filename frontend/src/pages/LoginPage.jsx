import { ArrowRightLeft, Brain, Globe2, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import DemoLoginForm from "../components/DemoLoginForm";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSwitcher from "../components/LanguageSwitcher";

const LoginPage = () => {
  const { t } = useTranslation();

  return (
    <div className="app-shell flex min-h-screen items-center py-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between">
          <div className="mb-8 flex items-center justify-between">
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

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: ArrowRightLeft,
                title: t("featureTransferTitle"),
                description: t("featureTransferBody"),
              },
              {
                icon: Brain,
                title: t("featureInsightTitle"),
                description: t("featureInsightBody"),
              },
              {
                icon: ShieldCheck,
                title: t("featureSecurityTitle"),
                description: t("featureSecurityBody"),
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="soft-panel">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-teal-500 dark:text-slate-950">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
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
    </div>
  );
};

export default LoginPage;
