import { Link } from "react-router-dom";

const QuickActionCard = ({ title, description, icon: Icon, to, accent }) => (
  <Link
    to={to}
    className="group surface-stack flex items-start gap-4 transition hover:-translate-y-1 hover:border-teal-200 dark:hover:border-teal-500/40"
  >
    <div
      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
      style={{ background: accent }}
    >
      <Icon size={22} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold">{title}</h3>
        <span className="text-xs font-semibold text-teal-700 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100 dark:text-teal-300">
          Go
        </span>
      </div>
      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  </Link>
);

export default QuickActionCard;
