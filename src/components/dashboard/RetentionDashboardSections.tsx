import { Award, Bell, Clock, PiggyBank, ShieldCheck, TrendingDown, Users, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { mockPlatformMeta, mockProducts } from '../../data/mockProducts';
import { mockPriceHistory } from '../../data/mockPriceHistory';
import { getDiscountPercent, getSavingsAmount, getSparklineValues } from '../../lib/chartUtils';
import { formatCurrency } from '../ui/PriceChange';

function MiniChart({ values }: { values: readonly number[] }) {
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-9 w-24"><polyline points={points} fill="none" stroke="#00C896" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function TrustSignalStrip() {
  const signals = [
    { icon: Clock, label: `Updated every ${mockPlatformMeta.refresh_interval_minutes} minutes` },
    { icon: ShieldCheck, label: `Tracking ${(mockPlatformMeta.monitored_products / 1000000).toFixed(1)}M+ products` },
    { icon: Users, label: `${mockPlatformMeta.active_trackers.toLocaleString()} active trackers` },
    { icon: Bell, label: `${mockPlatformMeta.alerts_today.toLocaleString()} alerts triggered today` },
  ];

  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
      {signals.map(signal => {
        const Icon = signal.icon;
        return <div key={signal.label} className="rounded-2xl border border-border/70 bg-background-tertiary/30 px-4 py-3 flex items-center gap-3"><Icon size={15} className="text-brand-300" /><span className="text-xs font-medium text-text-secondary">{signal.label}</span></div>;
      })}
    </div>
  );
}

export function SmartSavingsSummary({ trackedCount, alertCount }: { trackedCount: number; alertCount: number }) {
  const projectedSavings = mockProducts.slice(0, 5).reduce((sum, product) => sum + getSavingsAmount(product.current_price, product.previous_price), 0);
  const averageSavings = trackedCount > 0 ? projectedSavings / Math.max(trackedCount, 1) : projectedSavings / 5;

  return (
    <section className="grid md:grid-cols-3 gap-4">
      <SavingsCard icon={<PiggyBank size={17} />} label="Potential savings this month" value={formatCurrency(projectedSavings)} helper="Based on tracked market drops" />
      <SavingsCard icon={<Bell size={17} />} label="Alerts triggered this week" value={`${Math.max(3, alertCount + 3)}`} helper="Targets and meaningful price movements" />
      <SavingsCard icon={<Award size={17} />} label="Avg. savings per product" value={formatCurrency(averageSavings)} helper="Across active tracked opportunities" />
    </section>
  );
}

function SavingsCard({ icon, label, value, helper }: { icon: ReactNode; label: string; value: string; helper: string }) {
  return <div className="card premium-panel p-5"><div className="flex items-center justify-between mb-4"><span className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em]">{label}</span><span className="h-9 w-9 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-success">{icon}</span></div><p className="text-3xl font-semibold text-text-primary tracking-tight">{value}</p><p className="text-xs text-text-muted mt-2">{helper}</p></div>;
}

export function TodaysBestDealsSection() {
  const deals = [...mockProducts]
    .map(product => ({ ...product, discount: getDiscountPercent(product.current_price, product.previous_price), savings: getSavingsAmount(product.current_price, product.previous_price) }))
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 10);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Today’s best deals</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Ranked by savings strength</h2><p className="text-xs text-text-muted mt-1 max-w-2xl">Top opportunities combining discount, historical position, and demand signals.</p></div><span className="badge bg-success/10 text-success border border-success/20"><TrendingDown size={12} /> Top 10 live deals</span></div>
      <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
        {deals.map((deal, index) => {
          const history = mockPriceHistory.filter(item => item.product_id === deal.id);
          return (
            <div key={deal.id} className="card card-hover p-4 relative overflow-hidden">
              <div className="absolute right-3 top-3 text-4xl font-semibold text-success/10">#{index + 1}</div>
              <div className="relative"><div className="h-28 rounded-2xl overflow-hidden border border-border/60 mb-3"><img src={deal.image} alt={deal.title} className="h-full w-full object-cover" loading="lazy" /></div><div className="flex items-center justify-between gap-2 mb-2"><span className="badge bg-success/10 text-success border border-success/20">-{deal.discount}%</span><span className="text-xs text-text-muted">{deal.retailer}</span></div><h3 className="text-sm font-semibold text-text-primary line-clamp-2 min-h-[40px]">{deal.title}</h3><div className="flex items-end justify-between mt-3"><div><p className="text-lg font-semibold text-text-primary font-mono">{formatCurrency(deal.current_price)}</p><p className="text-xs text-success">Save {formatCurrency(deal.savings)}</p></div><MiniChart values={getSparklineValues(history)} /></div><p className="text-2xs text-text-muted mt-3">Lowest in {90 + index * 7} days · {deal.tracking_count.toLocaleString()} tracking</p></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function MostTrackedThisWeekSection() {
  const products = [...mockProducts].sort((a, b) => b.tracking_count - a.tracking_count).slice(0, 6);

  return (
    <section className="space-y-4">
      <div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Most tracked this week</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Community-driven market energy</h2></div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {products.map((product, index) => {
          const history = mockPriceHistory.filter(item => item.product_id === product.id);
          const discount = getDiscountPercent(product.current_price, product.previous_price);
          return <div key={product.id} className="card p-4 flex items-center gap-4"><div className="h-16 w-16 rounded-2xl overflow-hidden border border-border/60 shrink-0"><img src={product.image} alt={product.title} className="h-full w-full object-cover" loading="lazy" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-xs text-text-muted">#{index + 1}</span><span className="badge bg-brand-800/30 text-brand-300 border border-brand-500/20">{product.category}</span></div><h3 className="text-sm font-semibold text-text-primary truncate">{product.title}</h3><p className="text-xs text-text-muted mt-1">{product.tracking_count.toLocaleString()} tracking · +{12 + index * 3}% spike</p></div><div className="text-right"><MiniChart values={getSparklineValues(history)} /><p className="text-xs text-success mt-1">-{discount}%</p></div></div>;
        })}
      </div>
    </section>
  );
}

export function PricePulseInsightsGrid() {
  const insights = [
    { icon: TrendingDown, title: 'Prices trending downward', body: 'Gaming and monitor categories show consistent weekly compression.', tone: 'success' },
    { icon: Zap, title: 'High volatility detected', body: 'GPU prices are moving quickly. Alerts are recommended for high-demand cards.', tone: 'warning' },
    { icon: Award, title: 'Historically low pricing', body: 'Several audio products are within 5% of their tracked lows.', tone: 'success' },
    { icon: Users, title: 'Demand increasing rapidly', body: 'MacBook and iPhone tracking activity is up across the week.', tone: 'brand' },
  ];

  return <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">{insights.map(insight => { const Icon = insight.icon; return <div key={insight.title} className={`rounded-3xl border p-5 ${insight.tone === 'success' ? 'bg-success/10 border-success/20' : insight.tone === 'warning' ? 'bg-warning/10 border-warning/20' : 'bg-brand-800/20 border-brand-500/20'}`}><Icon size={16} className={insight.tone === 'warning' ? 'text-warning' : insight.tone === 'success' ? 'text-success' : 'text-brand-300'} /><h3 className="text-sm font-semibold text-text-primary mt-3">{insight.title}</h3><p className="text-xs text-text-secondary mt-2 leading-relaxed">{insight.body}</p></div>; })}</section>;
}
