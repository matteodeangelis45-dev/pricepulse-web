import { useMemo, useState } from 'react';
import { BarChart3, GitCompare, TrendingDown, Users, Zap } from 'lucide-react';
import { mockProducts } from '../data/mockProducts';
import { mockPriceHistory } from '../data/mockPriceHistory';
import { getDiscountPercent, getSparklineValues } from '../lib/chartUtils';
import { getMomentumSignal, getPricePulseScore } from '../lib/phase8Intelligence';
import { MomentumBadge } from '../components/dashboard/Phase8DashboardSections';
import { formatCurrency } from '../components/ui/PriceChange';

function MiniChart({ values }: { values: readonly number[] }) {
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-12 w-full"><polyline points={points} fill="none" stroke="#00C896" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function ProductComparisonPage() {
  const [firstId, setFirstId] = useState(mockProducts[0].id);
  const [secondId, setSecondId] = useState(mockProducts[2].id);
  const products = useMemo(() => [mockProducts.find(product => product.id === firstId), mockProducts.find(product => product.id === secondId)].filter(Boolean), [firstId, secondId]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <section className="card premium-panel p-6 lg:p-7 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-3">Product comparison</p><h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-text-primary">Compare market strength side by side</h1><p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">Evaluate prices, trends, volatility, deal quality, and tracking popularity before deciding what to buy.</p></div>
          <span className="badge bg-brand-800/25 text-brand-300 border border-brand-500/20"><GitCompare size={12} /> Analytical compare</span>
        </div>
      </section>

      <section className="card p-5 flex flex-col md:flex-row gap-3">
        <select className="input" value={firstId} onChange={event => setFirstId(event.target.value)}>{mockProducts.map(product => <option key={product.id} value={product.id}>{product.title}</option>)}</select>
        <select className="input" value={secondId} onChange={event => setSecondId(event.target.value)}>{mockProducts.map(product => <option key={product.id} value={product.id}>{product.title}</option>)}</select>
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        {products.map(product => {
          if (!product) return null;
          const history = mockPriceHistory.filter(item => item.product_id === product.id);
          const discount = getDiscountPercent(product.current_price, product.previous_price);
          return <article key={product.id} className="card p-5"><div className="flex gap-4"><img src={product.image} alt={product.title} className="h-24 w-24 rounded-3xl object-cover border border-border/60" loading="lazy" /><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 mb-2"><MomentumBadge signal={getMomentumSignal(product)} /><span className="badge bg-success/10 text-success border border-success/20">Score {getPricePulseScore(product)}</span></div><h2 className="text-lg font-semibold text-text-primary line-clamp-2">{product.title}</h2><p className="text-xs text-text-muted mt-1">{product.retailer} · {product.category}</p></div></div><div className="mt-5 rounded-3xl bg-background-tertiary/25 border border-border/60 p-4"><MiniChart values={getSparklineValues(history)} /></div><div className="grid grid-cols-2 gap-3 mt-4"><Metric icon={<TrendingDown size={14} />} label="Current price" value={formatCurrency(product.current_price)} /><Metric icon={<Zap size={14} />} label="Discount" value={`-${discount}%`} /><Metric icon={<BarChart3 size={14} />} label="Volatility" value={product.volatility} /><Metric icon={<Users size={14} />} label="Tracking" value={product.tracking_count.toLocaleString()} /></div></article>;
        })}
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl bg-background-tertiary/35 border border-border/60 p-3"><div className="flex items-center gap-2 text-brand-300 mb-2">{icon}<span className="text-2xs uppercase tracking-[0.18em] text-text-muted">{label}</span></div><p className="text-sm font-semibold text-text-primary capitalize">{value}</p></div>;
}
