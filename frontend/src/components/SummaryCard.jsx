const accentClasses = {
  teal: "text-teal-600 dark:text-teal-300",
  emerald: "text-emerald-600 dark:text-emerald-300",
  orange: "text-orange-600 dark:text-orange-300",
};

const SummaryCard = ({ label, value, accent = "teal", helper }) => (
  <div className="metric-tile">
    <div className={`mb-4 h-1.5 w-12 rounded-full ${accent === "emerald" ? "bg-emerald-500" : accent === "orange" ? "bg-orange-500" : "bg-teal-500"}`} />
    <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${accentClasses[accent] || accentClasses.teal}`}>
      {label}
    </p>
    <p className="mt-3 text-2xl font-extrabold">{value}</p>
    {helper ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p> : null}
  </div>
);

export default SummaryCard;
