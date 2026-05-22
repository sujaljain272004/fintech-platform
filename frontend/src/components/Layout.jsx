import { Bell, Brain, House, Repeat2, SendHorizontal } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { getInitials } from "../utils/formatters";

const iconMap = {
  "/dashboard": House,
  "/transfer": SendHorizontal,
  "/transactions": Repeat2,
  "/insights": Brain,
  "/notifications": Bell,
};

const Layout = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user, unreadNotifications } = useAuth();

  return (
    <div className="app-shell">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-3xl text-lg font-extrabold text-white shadow-lg"
            style={{ backgroundColor: user?.avatarColor || "#14b8a6" }}
          >
            {getInitials(user?.fullName || "FinLink User")}
          </div>
          <div>
            <p className="text-sm font-medium text-teal-700 dark:text-teal-300">{t("welcome")}</p>
            <h1 className="text-2xl font-extrabold tracking-tight">{user?.fullName || t("appName")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("secureAccess")}</p>
            <div className="mt-2">
              <span className="pill-chip">{user?.kycStatus === "verified" ? t("verifiedBadge") : t("underReviewBadge")}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="pb-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 rounded-[28px] border border-white/60 bg-white/90 p-2 shadow-fintech backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/90">
        <div className="grid grid-cols-5 gap-2">
          {[
            { path: "/dashboard", label: t("dashboard") },
            { path: "/transfer", label: t("transfer") },
            { path: "/transactions", label: t("history") },
            { path: "/insights", label: t("insights") },
            { path: "/notifications", label: t("notifications") },
          ].map((item) => {
            const Icon = iconMap[item.path];
            const isActive = pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white dark:bg-teal-500 dark:text-slate-950"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.path === "/notifications" && unreadNotifications > 0 ? (
                  <span className="absolute right-4 top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] text-white">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
