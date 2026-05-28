import { useMemo, useState } from 'react';
import { Activity, ArrowDown, Filter, Flame, TrendingDown, Users } from 'lucide-react';
import { mockCategorySummaries, mockProducts } from '../data/mockProducts';
import { mockPriceHistory } from '../data/mockPriceHistory';
import { getDiscountPercent, getSparklineValues } from '../lib/chartUtils';
import { formatCurrency } from '../components/ui/PriceChange';
import type { ProductCategory, ProductAvailability } from '../types/platform.types';

type SortMode = 'biggest_drops' | 'historical_low' | 'most_tracked' | 'newest' | 'volatility';

function MiniChart({ values }: { values: readonly number[] }) {
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-9 w-24"><polyline points={points} fill="none" stroke="#00C896" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function MarketOverviewPage() {
  const [sort, setSort] = useState<SortMode>('biggest_drops');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [availability, setAvailability] = useState<ProductAvailability | 'all'>('all');

  const products = useMemo(() => {
    return [...mockProducts]
      .filter(product => category === 'all' || product.category === category)
      .filter(product => availability === 'all' || product.availability === availability)
      .sort((a, b) => {
        if (sort === 'most_tracked') return b.tracking_count - a.tracking_count;
        if (sort === 'historical_low') return (a.current_price / a.lowest_price) - (b.current_price / b.lowest_price);
        if (sort === 'volatility') return (b.volatility === 'high' ? 2 : b.volatility === 'medium' ? 1 : 0) - (a.volatility === 'high' ? 2 : a.volatility === 'medium' ? 1 : 0);
        if (sort === 'newest') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        return getDiscountPercent(b.current_price, b.previous_price) - getDiscountPercent(a.current_price, a.previous_price);
      });
  }, [availability, category, sort]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <section className="card premium-panel p-6 lg:p-7 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-3">Market overview</p><h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-text-primary">Live pricing intelligence hub</h1><p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">Explore categories, deal momentum, tracking spikes, volatility, and recent alert pressure across the PricePulse market graph.</p></div>
          <span className="badge bg-success/10 text-success border border-success/20"><Activity size={12} /> Monitoring 24/7</span>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {mockCategorySummaries.slice(0, 5).map(item => <div key={item.category} className="stat-card"><div className="flex items-center justify-between mb-4"><span className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em]">{item.category}</span><Flame size={14} className="text-brand-300" /></div><p className="text-2xl font-semibold text-text-primary">{item.live_activity_count.toLocaleString()}</p><p className="text-xs text-success mt-1">{item.average_discount}% avg discount</p></div>)}
      </div>

      <section className="card p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div><h2 className="text-base font-semibold text-text-primary">Advanced market filters</h2><p className="text-xs text-text-muted mt-1">Sort by market movement, popularity, historical position, and availability.</p></div>
          <div className="flex flex-wrap gap-2"><Filter size={14} className="text-text-muted mt-2" /><select className="input py-2 text-xs w-auto" value={sort} onChange={event => setSort(event.target.value as SortMode)}><option value="biggest_drops">Biggest drops</option><option value="historical_low">Lowest historical price</option><option value="most_tracked">Most tracked</option><option value="newest">Newest deals</option><option value="volatility">Highest volatility</option></select><select className="input py-2 text-xs w-auto" value={category} onChange={event => setCategory(event.target.value as ProductCategory | 'all')}><option value="all">All categories</option>{mockCategorySummaries.map(item => <option key={item.category} value={item.category}>{item.category}</option>)}</select><select className="input py-2 text-xs w-auto" value={availability} onChange={event => setAvailability(event.target.value as ProductAvailability | 'all')}><option value="all">All availability</option><option value="in_stock">In stock</option><option value="limited_stock">Limited stock</option><option value="out_of_stock">Out of stock</option><option value="preorder">Preorder</option></select></div>
        </div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.slice(0, 9).map((product, index) => {
            const history = mockPriceHistory.filter(item => item.product_id === product.id);
            const discount = getDiscountPercent(product.current_price, product.previous_price);
            return <div key={product.id} className="rounded-3xl border border-border/70 bg-background-tertiary/25 p-4 hover:border-success/25 transition-colors"><div className="flex items-center justify-between gap-3 mb-3"><div><span className="text-xs text-text-muted mr-2">#{index + 1}</span><span className="badge bg-brand-800/25 text-brand-300 border border-brand-500/20">{product.category}</span></div><span className="badge bg-success/10 text-success border border-success/20"><ArrowDown size={11} /> {discount}%</span></div><div className="flex gap-3"><img src={product.image} alt={product.title} className="h-16 w-16 rounded-2xl object-cover border border-border/60" loading="lazy" /><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-text-primary truncate">{product.title}</h3><p className="text-xs text-text-muted mt-1">{product.retailer} · {product.availability.replace('_', ' ')}</p><p className="text-sm font-semibold text-text-primary font-mono mt-2">{formatCurrency(product.current_price)}</p></div><MiniChart values={getSparklineValues(history)} /></div><div className="flex items-center justify-between mt-4 text-xs text-text-muted"><span><Users size={11} className="inline mr-1" />{product.tracking_count.toLocaleString()} tracking</span><span><TrendingDown size={11} className="inline mr-1" />{product.volatility}</span></div></div>;
          })}
        </div>
      </section>
    </div>
  );
}
