export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in">
      <div className="card premium-panel p-7"><div className="h-5 w-40 rounded-full bg-background-tertiary animate-pulse mb-4" /><div className="h-9 w-2/3 rounded-full bg-background-tertiary/70 animate-pulse" /><div className="h-4 w-1/2 rounded-full bg-background-tertiary/60 animate-pulse mt-4" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="stat-card"><div className="h-4 w-20 rounded-full bg-background-tertiary animate-pulse mb-5" /><div className="h-8 w-16 rounded-full bg-background-tertiary/70 animate-pulse" /></div>)}</div>
      <div className="grid md:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="card p-5"><div className="h-28 rounded-3xl bg-background-tertiary/60 animate-pulse mb-4" /><div className="h-4 w-4/5 rounded-full bg-background-tertiary animate-pulse" /><div className="h-3 w-2/3 rounded-full bg-background-tertiary/60 animate-pulse mt-3" /></div>)}</div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-fade-in">
      <div className="card premium-panel p-6 grid lg:grid-cols-[220px_1fr_220px] gap-5"><div className="h-48 rounded-3xl bg-background-tertiary/60 animate-pulse" /><div><div className="h-4 w-32 rounded-full bg-background-tertiary animate-pulse mb-4" /><div className="h-10 w-full rounded-full bg-background-tertiary/70 animate-pulse" /><div className="h-4 w-2/3 rounded-full bg-background-tertiary/60 animate-pulse mt-4" /></div><div className="h-24 rounded-3xl bg-background-tertiary/50 animate-pulse" /></div>
      <div className="card p-5"><div className="h-72 rounded-3xl bg-background-tertiary/45 animate-pulse" /></div>
      <div className="grid md:grid-cols-2 gap-4"><div className="card p-5 h-36 bg-background-tertiary/20 animate-pulse" /><div className="card p-5 h-36 bg-background-tertiary/20 animate-pulse" /></div>
    </div>
  );
}
