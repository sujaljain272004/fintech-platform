import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationPanel from "../components/NotificationPanel";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/ui/PageTransition";
import { EmptyState, ListSkeleton } from "../components/ui/StateBlocks";

const NotificationsPage = () => {
  const { t } = useTranslation();
  const { setUnreadNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getNotifications();
      setNotifications(data);
      setUnreadNotifications(data.filter((notification) => !notification.read).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (notificationId) => {
    try {
      await markNotificationRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadNotifications((count) => Math.max(count - 1, 0));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      setUnreadNotifications(0);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PageTransition className="space-y-5">
      <div className="topbar-shell">
        <div>
          <p className="page-kicker">{t("notifications")}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{t("notifications")}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Transfer alerts, AI updates, and security events stay in one place.
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={handleMarkAllRead}>
          {t("markAllRead")}
        </button>
      </div>

      <div className="glass-panel">
        {loading ? <ListSkeleton rows={3} /> : null}
        {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
        {!loading && notifications.length ? <NotificationPanel notifications={notifications} onMarkRead={handleMarkRead} /> : null}
        {!loading && !notifications.length ? (
          <EmptyState
            title="No notifications"
            description="Transfer alerts, AI summaries, and security notices will appear here."
          />
        ) : null}
      </div>
    </PageTransition>
  );
};

export default NotificationsPage;
