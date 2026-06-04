import { BellRing } from "lucide-react";
import { formatDateTime } from "../utils/formatters";

const NotificationPanel = ({ notifications = [], onMarkRead }) => {
  if (!notifications.length) {
    return (
      <div className="surface-stack">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No notifications yet. Transfer, AI, and security updates will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <button
          type="button"
          key={notification._id}
          className={`w-full text-left ${notification.read ? "opacity-80" : ""}`}
          onClick={() => !notification.read && onMarkRead(notification._id)}
        >
          <div className="surface-stack">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-300">
                <BellRing size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold">{notification.title}</p>
                  {!notification.read ? (
                    <span className="pill-chip border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default NotificationPanel;
