const shimmerColumns = ["w-24", "w-36", "w-28", "w-40", "w-32"];

export const ListSkeleton = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="surface-stack animate-pulse space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
            <div className="h-3 w-56 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
          </div>
          <div className="h-8 w-24 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="glass-panel space-y-4">
      <div className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
      <div className="h-10 w-64 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
      <div className="grid gap-3 md:grid-cols-3">
        {shimmerColumns.map((width) => (
          <div key={width} className="surface-stack space-y-3">
            <div className="h-3 w-20 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
            <div className={`h-8 ${width} rounded-full bg-slate-200/80 dark:bg-slate-800/80`} />
            <div className="h-3 w-28 rounded-full bg-slate-200/60 dark:bg-slate-800/60" />
          </div>
        ))}
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="surface-stack h-28" />
      ))}
    </div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="surface-stack space-y-4">
    <div className="h-4 w-32 rounded-full bg-slate-200/80 dark:bg-slate-800/80" />
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="skeleton-block h-72" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="skeleton-block h-14" />
        ))}
      </div>
    </div>
  </div>
);

export const EmptyState = ({ title, description, action, icon: Icon }) => (
  <div className="section-shell text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-200">
      {Icon ? <Icon size={24} /> : null}
    </div>
    <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
    {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
  </div>
);