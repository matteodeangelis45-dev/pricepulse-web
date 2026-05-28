import { useState } from 'react';
import { Activity, Flame, Layers, TrendingDown, Users } from 'lucide-react';
import { mockPriceHistory } from '../data/mockPriceHistory';
import { getDiscountPercent, getSparklineValues } from '../lib/chartUtils';
import { getCategoryMarket, getMomentumSignal, getPricePulseScore } from '../lib/phase8Intelligence';
import type { ProductCategory } from '../types/platform.types';
import { MomentumBadge } from '../components/dashboard/Phase8DashboardSections';
import { formatCurrency } from '../components/ui/PriceChange';

const categories: ProductCategory[] = ['GPUs', 'Smartphones', 'Gaming', 'Laptops', 'Audio', 'Monitors'];

function MiniChart({ values }: { values: readonly number[] }) {
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-9 w-24"><polyline points={points} fill="none" stroke="#00C896" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function CategoryMarketPage() {
  const [category, setCategory] = useState<ProductCategory>('GPUs');
  const market = getCategoryMarket(category);
  const trackers = market.products.reduce((sum, product) => sum + product.tracking_count, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <section className="card premium-panel p-6 lg:p-7 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-success/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-3">Category intelligence</p><h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-text-primary">{category} market overview</h1><p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">{market.summary}</p></div>
          <select className="input w-auto" value={category} onChange={event => setCategory(event.target.value as ProductCategory)}>{categories.map(item => <option key={item} value={item}>{item}</option>)}</select>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Stat icon={<Layers size={14} />} label="Tracked products" value={`${market.products.length}`} />
        <Stat icon={<Users size={14} />} label="Active trackers" value={trackers.toLocaleString()} />
        <Stat icon={<TrendingDown size={14} />} label="Strongest deal" value={market.strongestDeals[0] ? `${getDiscountPercent(market.strongestDeals[0].current_price, market.strongestDeals[0].previous_price)}%` : '—'} />
        <Stat icon={<Activity size={14} />} label="Market status" value="Live" />
      </div>

      <section className="grid lg:grid-cols-2 gap-5">
        <CategoryColumn title="Trending products" icon={<Flame size={15} />} products={market.trending} />
        <CategoryColumn title="Strongest deals" icon={<TrendingDown size={15} />} products={market.strongestDeals} />
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="stat-card"><div className="flex items-center justify-between mb-4"><span className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em]">{label}</span><span className="text-brand-300">{icon}</span></div><p className="text-2xl font-semibold text-text-primary">{value}</p><p className="text-xs text-text-muted mt-1">Updated moments ago</p></div>;
}

function CategoryColumn({ title, icon, products }: { title: string; icon: React.ReactNode; products: ReturnType<typeof getCategoryMarket>['products'] }) {
  return <div className="card p-5"><div className="flex items-center gap-2 mb-4"><span className="text-brand-300">{icon}</span><h2 className="text-sm font-semibold text-text-primary">{title}</h2></div><div className="space-y-3">{products.map(product => { const history = mockPriceHistory.filter(item => item.product_id === product.id); return <div key={product.id} className="rounded-3xl bg-background-tertiary/25 border border-border/60 p-4"><div className="flex items-center gap-3"><img src={product.image} alt={product.title} className="h-16 w-16 rounded-2xl object-cover border border-border/60" loading="lazy" /><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 mb-1"><MomentumBadge signal={getMomentumSignal(product)} /><span className="badge bg-success/10 text-success border border-success/20">Score {getPricePulseScore(product)}</span></div><h3 className="text-sm font-semibold text-text-primary truncate">{product.title}</h3><p className="text-xs text-text-muted mt-1">{product.retailer} · {formatCurrency(product.current_price)}</p></div><MiniChart values={getSparklineValues(history)} /></div></div>; })}</div></div>;
}
