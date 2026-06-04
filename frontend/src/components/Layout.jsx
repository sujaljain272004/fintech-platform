import { Bell, Brain, House, LogOut, Shield, Repeat2, SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";
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
  "/admin": Shield,
};

const Layout = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user, unreadNotifications, signOutUser } = useAuth();
  const navItems = [
    { path: "/dashboard", label: t("dashboard") },
    { path: "/transfer", label: t("transfer") },
    { path: "/transactions", label: t("history") },
    { path: "/insights", label: t("insights") },
    { path: "/notifications", label: t("notifications") },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ path: "/admin", label: "Admin" });
  }

  const activeQuickPath = pathname === "/transfer" ? "/transfer" : "/dashboard";

  return (
    <div className="min-h-screen">
      <aside className="sidebar-shell">
        <div className="sidebar-panel">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl text-lg font-extrabold text-white shadow-lg" style={{ backgroundColor: user?.avatarColor || "#14b8a6" }}>
              {getInitials(user?.fullName || "FinLink User")}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{t("welcome")}</p>
              <h1 className="mt-1 truncate text-xl font-extrabold tracking-tight">{user?.fullName || t("appName")}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.phoneNumber}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="surface-stack p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Status</p>
              <p className="mt-2 text-sm font-bold">{user?.kycStatus === "verified" ? t("verifiedBadge") : t("underReviewBadge")}</p>
            </div>
            <div className="surface-stack p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Role</p>
              <p className="mt-2 text-sm font-bold">{user?.role || "USER"}</p>
            </div>
          </div>

          <div className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.path];
              const isActive = pathname === item.path;

              return (
                <NavLink key={item.path} to={item.path} className={({ isActive: linkActive }) => `sidebar-nav-link ${linkActive ? "sidebar-nav-link-active" : ""}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.path === "/notifications" && unreadNotifications > 0 ? (
                    <span className={`ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-rose-500 text-white"}`}>
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  ) : null}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-auto space-y-3">
            <div className="rounded-[28px] bg-gradient-to-br from-slate-950 to-slate-700 p-4 text-white dark:from-teal-500 dark:to-cyan-400 dark:text-slate-950">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/70 dark:text-slate-700">{t("secureAccess")}</p>
              <p className="mt-2 text-sm font-semibold">{unreadNotifications > 0 ? `${unreadNotifications} unread updates` : "All caught up"}</p>
            </div>
            <div className="flex gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <button type="button" className="secondary-button w-full gap-2" onClick={signOutUser}>
              <LogOut size={16} />
              {t("logout")}
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-80">
        <div className="main-shell">
          <header className="topbar-shell">
            <div className="glow-accent -left-12 top-0 h-40 w-40 bg-teal-300/20 dark:bg-teal-400/20" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl text-lg font-extrabold text-white shadow-lg" style={{ backgroundColor: user?.avatarColor || "#14b8a6" }}>
                {getInitials(user?.fullName || "FinLink User")}
              </div>
              <div>
                <div className="pill-chip mb-2">{t("welcome")}</div>
                <h1 className="text-2xl font-extrabold tracking-tight">{user?.fullName || t("appName")}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("secureAccess")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="pill-chip">{user?.kycStatus === "verified" ? t("verifiedBadge") : t("underReviewBadge")}</span>
                  {user?.role === "ADMIN" ? <span className="pill-chip border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-200">Admin</span> : null}
                  {unreadNotifications > 0 ? <span className="pill-chip border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">{unreadNotifications} unread</span> : null}
                </div>
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              {user?.role === "ADMIN" ? (
                <NavLink to="/admin" className="secondary-button gap-2">
                  <Shield size={16} />
                  Admin
                </NavLink>
              ) : null}
              <NavLink to={activeQuickPath} className="secondary-button gap-2">
                <SendHorizontal size={16} />
                Quick send
              </NavLink>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </header>

          <motion.main key={pathname} className="pb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24, ease: "easeOut" }}>
            <Outlet />
          </motion.main>
        </div>
      </div>

      <nav className="mobile-nav-shell">
        <div className={`grid gap-2 ${navItems.length > 5 ? "grid-cols-6" : "grid-cols-5"}`}>
          {navItems.map((item) => {
            const Icon = iconMap[item.path];

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: linkActive }) => `mobile-nav-item ${linkActive ? "mobile-nav-item-active" : "text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
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

      <NavLink to="/transfer" className="floating-action fixed bottom-24 right-4 z-30 lg:hidden">
        <SendHorizontal size={20} />
      </NavLink>
    </div>
  );
};

export default Layout;
