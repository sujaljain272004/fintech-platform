const accentClasses = {
  teal: "text-teal-600 dark:text-teal-300",
  emerald: "text-emerald-600 dark:text-emerald-300",
  orange: "text-orange-600 dark:text-orange-300",
};

const SummaryCard = ({ label, value, accent = "teal", helper }) => (
  <div className="soft-panel">
    <p
      className={`text-xs font-bold uppercase tracking-[0.2em] ${
        accentClasses[accent] || accentClasses.teal
      }`}
    >
      {label}
    </p>
    <p className="mt-3 text-2xl font-extrabold">{value}</p>
    {helper ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p> : null}
  </div>
);

export default SummaryCard;
