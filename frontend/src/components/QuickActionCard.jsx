import { Link } from "react-router-dom";

const QuickActionCard = ({ title, description, icon: Icon, to, accent }) => (
  <Link
    to={to}
    className="group soft-panel flex items-start gap-4 transition hover:-translate-y-1 hover:border-teal-200 dark:hover:border-teal-500/40"
  >
    <div
      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
      style={{ background: accent }}
    >
      <Icon size={22} />
    </div>
    <div>
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  </Link>
);

export default QuickActionCard;
