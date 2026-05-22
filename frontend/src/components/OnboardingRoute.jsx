import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const OnboardingRoute = () => {
  const { loading, requiresOnboarding } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="glass-panel w-full max-w-md text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return requiresOnboarding ? <Outlet /> : <Navigate to="/" replace />;
};

export default OnboardingRoute;
