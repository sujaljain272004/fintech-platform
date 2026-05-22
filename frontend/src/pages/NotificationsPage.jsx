import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationPanel from "../components/NotificationPanel";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationService";
import { useAuth } from "../context/AuthContext";

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
    <div className="glass-panel">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="section-title">{t("notifications")}</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Transfer alerts, AI updates, and security events stay in one place.
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={handleMarkAllRead}>
          {t("markAllRead")}
        </button>
      </div>

      {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">{t("loading")}</p> : null}
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}
      {!loading ? <NotificationPanel notifications={notifications} onMarkRead={handleMarkRead} /> : null}
    </div>
  );
};

export default NotificationsPage;
