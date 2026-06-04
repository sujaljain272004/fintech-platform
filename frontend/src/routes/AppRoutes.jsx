import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import OnboardingPage from "../pages/OnboardingPage";
import DashboardPage from "../pages/DashboardPage";
import TransferPage from "../pages/TransferPage";
import TransactionsPage from "../pages/TransactionsPage";
import InsightsPage from "../pages/InsightsPage";
import NotificationsPage from "../pages/NotificationsPage";
import AdminPage from "../pages/AdminPage";
import ProtectedRoute from "../components/ProtectedRoute";
import OnboardingRoute from "../components/OnboardingRoute";
import AdminRoute from "../components/AdminRoute";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const AppRoutes = () => {
  const { signOutUser, isAuthenticated, requiresOnboarding } = useAuth();
  const { t } = useTranslation();

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <button
          type="button"
          onClick={signOutUser}
          className="fixed right-6 top-6 z-30 secondary-button gap-2 px-3 py-2"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">{t("logout")}</span>
        </button>
      ) : null}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : requiresOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : requiresOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route element={<OnboardingRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/transfer" element={<TransferPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? "/dashboard" : requiresOnboarding ? "/onboarding" : "/"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
