import { useEffect, useMemo, useState } from 'react';
import { Bell, Clock, Eye, LineChart, Package, Radio, SlidersHorizontal, Sparkles } from 'lucide-react';
import { platformApi } from '../../services/platformApi';
import { getBuyTimingLabel, getPriceMovementPercent, getSparklineValues } from '../../lib/chartUtils';
import { usePlatformStore } from '../../store/PlatformStore';
import type { PlatformActivityItem, PlatformCategorySummary, PlatformPriceHistory, PlatformProduct } from '../../types/platform.types';
import { formatCurrency } from '../ui/PriceChange';

function TinyTrend({ values }: { values: readonly number[] }) {
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-9 w-24"><polyline points={points} fill="none" stroke="#7BAE9A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PriceChart({ history }: { history: PlatformPriceHistory[] }) {
  const prices = history.map(point => point.price);
  const min = Math.min(...prices) * 0.97;
  const max = Math.max(...prices) * 1.03;
  const range = max - min || 1;
  const path = history.map((point, index) => {
    const x = (index / Math.max(history.length - 1, 1)) * 100;
    const y = 100 - ((point.price - min) / range) * 100;
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  const area = `${path} L 100 100 L 0 100 Z`;

  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[220px]">
        <defs><linearGradient id="platform-chart-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7BAE9A" stopOpacity="0.24" /><stop offset="100%" stopColor="#7BAE9A" stopOpacity="0" /></linearGradient></defs>
        {[20, 40, 60, 80].map(y => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#22373D" strokeWidth="0.5" />)}
        <path d={area} fill="url(#platform-chart-area)" />
        <path d={path} fill="none" stroke="#7BAE9A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="100" cy={100 - ((history[history.length - 1].price - min) / range) * 100} r="2.8" fill="#D8A75F" />
      </svg>
      <div className="flex justify-between text-2xs text-text-muted mt-2">
        {history.map((point, index) => <span key={point.id}>{index === history.length - 1 ? 'Now' : new Date(point.timestamp).toLocaleDateString('en-US', { month: 'short' })}</span>)}
      </div>
    </div>
  );
}

function InsightCard({ title, body, tone = 'success' }: { title: string; body: string; tone?: 'success' | 'warning' }) {
  return <div className={`rounded-3xl border p-4 ${tone === 'warning' ? 'bg-warning/10 border-warning/20' : 'bg-success/10 border-success/20'}`}><div className="flex items-center gap-2 mb-2"><Sparkles size={14} className={tone === 'warning' ? 'text-warning' : 'text-success'} /><p className="text-sm font-semibold text-text-primary">{title}</p></div><p className="text-xs text-text-secondary leading-relaxed">{body}</p></div>;
}

function AlertModal({ product, onClose }: { product: PlatformProduct; onClose: () => void }) {
  const { createAlert } = usePlatformStore();
  const [target, setTarget] = useState(String(product.lowest_price));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-lg card premium-panel p-6 animate-slide-up">
        <div className="flex items-start justify-between gap-4 mb-6"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Create alert</p><h3 className="text-xl font-semibold text-text-primary">Never miss a major price drop.</h3><p className="text-sm text-text-secondary mt-2">We’ll notify you instantly when {product.title} reaches your target.</p></div><button onClick={onClose} className="btn-ghost p-2">×</button></div>
        <div className="space-y-4"><div><label className="label">Target price</label><input className="input" value={target} onChange={event => setTarget(event.target.value)} /></div><div><label className="label">Retailer</label><select className="input"><option>Any verified retailer</option><option>{product.retailer}</option></select></div><div className="rounded-2xl bg-background-tertiary/45 border border-border/60 p-4"><div className="flex items-center justify-between mb-3"><span className="text-sm text-text-secondary">Instant alerts</span><span className="h-6 w-11 rounded-full bg-success/30 border border-success/30 p-0.5"><span className="block h-5 w-5 rounded-full bg-success ml-auto" /></span></div><div className="flex items-center justify-between"><span className="text-sm text-text-secondary">Email summary</span><span className="h-6 w-11 rounded-full bg-background border border-border p-0.5"><span className="block h-5 w-5 rounded-full bg-text-muted" /></span></div></div><button onClick={() => { createAlert(product.id, Number(target)); onClose(); }} className="btn-primary w-full">Create Alert</button></div>
      </div>
    </div>
  );
}

function ProductDetailTemplate({ product, history, onAlert }: { product: PlatformProduct; history: PlatformPriceHistory[]; onAlert: () => void }) {
  const { addToWatchlist, watchlist } = usePlatformStore();
  const isTracked = watchlist.some(item => item.product_id === product.id);
  const change = ((product.current_price - product.previous_price) / product.previous_price) * 100;
  const prices = history.map(point => point.price);
  const lowest = Math.min(...prices);
  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  return (
    <section className="space-y-5">
      <div className="card premium-panel p-5 sm:p-6 overflow-hidden relative"><div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-success/10 blur-3xl" /><div className="relative grid lg:grid-cols-[180px_1fr_auto] gap-5 items-center"><img src={product.image} alt={product.title} className="h-40 w-full lg:w-44 object-cover rounded-3xl border border-border/70" loading="lazy" /><div><div className="flex flex-wrap gap-2 mb-3"><span className="badge bg-brand-800/30 text-brand-200 border border-brand-500/20">{product.retailer}</span><span className="badge bg-success/10 text-success border border-success/20">{product.availability.replace('_', ' ')}</span><span className="badge bg-background-tertiary/60 text-text-secondary border border-border/80">/product/{product.slug}</span></div><h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">{product.title}</h2><p className="text-sm text-text-secondary mt-2">Price updated moments ago · {product.tracking_count.toLocaleString()} users tracking this now · lowest price in 90 days</p></div><div className="lg:text-right"><p className="text-3xl font-semibold text-text-primary font-mono">{formatCurrency(product.current_price)}</p><p className="text-sm font-semibold text-success mt-1">{change.toFixed(1)}% vs previous</p></div></div></div>
      <div className="grid xl:grid-cols-[1fr_340px] gap-5"><div className="space-y-5"><div className="card p-5 sm:p-6"><div className="flex items-center justify-between gap-4 mb-5"><div><h3 className="text-base font-semibold text-text-primary">Price history</h3><p className="text-xs text-text-muted mt-1">Realistic historical tracking from centralized mock API</p></div><span className="badge bg-success/10 text-success border border-success/20"><Radio size={12} />Live tracking</span></div><PriceChart history={history} /></div><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"><InsightCard title="Best time to buy" body={getBuyTimingLabel(product)} /><InsightCard title="Below average" body={`Current price is ${Math.round(((average - product.current_price) / average) * 100)}% below average.`} /><InsightCard title="Lowest price ever" body={`${formatCurrency(lowest)} is the lowest tracked price.`} /><InsightCard title="Volatility" body={`${product.volatility} market movement over recent periods.`} tone={product.volatility === 'high' ? 'warning' : 'success'} /></div></div><aside className="space-y-4"><div className="card p-5 space-y-3"><button onClick={() => addToWatchlist(product.id)} className="btn-primary w-full"><Eye size={14} />{isTracked ? 'Tracked' : 'Track Product'}</button><button onClick={onAlert} className="btn-secondary w-full"><Bell size={14} />Create Alert</button></div><div className="card p-5"><h3 className="text-sm font-semibold text-text-primary mb-4">Price summary</h3><div className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-text-muted">Target</span><span className="text-warning font-mono">{formatCurrency(product.lowest_price)}</span></div><div className="flex justify-between"><span className="text-text-muted">Average</span><span className="text-text-primary font-mono">{formatCurrency(average)}</span></div><div className="flex justify-between"><span className="text-text-muted">Movement</span><span className="text-success font-mono">{getPriceMovementPercent(history)}%</span></div></div></div></aside></div>
    </section>
  );
}

function WatchlistExperience({ products, histories }: { products: PlatformProduct[]; histories: Record<string, PlatformPriceHistory[]> }) {
  const { watchlist, removeFromWatchlist } = usePlatformStore();
  const rows = watchlist.map(item => products.find(product => product.id === item.product_id)).filter(Boolean) as PlatformProduct[];

  return (
    <section className="grid xl:grid-cols-[1fr_320px] gap-5"><div className="card p-5 sm:p-6"><div className="flex items-center justify-between gap-4 mb-5"><div><h3 className="text-base font-semibold text-text-primary">Premium watchlist</h3><p className="text-xs text-text-muted mt-1">Organized targets, alerts, and market signals</p></div><span className="badge bg-success/10 text-success border border-success/20">Best deal today</span></div><div className="space-y-3">{rows.length === 0 ? <div className="rounded-3xl bg-background-tertiary/35 border border-border/70 p-8 text-center"><Package className="mx-auto text-brand-300" /><p className="text-sm font-semibold text-text-primary mt-3">Your watchlist is ready</p><p className="text-xs text-text-muted mt-1">Track a product once and PricePulse keeps watching quietly.</p></div> : rows.map(product => { const history = histories[product.id] ?? []; return <div key={product.id} className="rounded-3xl bg-background-tertiary/35 border border-border/70 p-4 hover:border-success/25 transition-all duration-300"><div className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 items-center"><div><p className="text-sm font-semibold text-text-primary">{product.title}</p><p className="text-xs text-text-muted">Target {formatCurrency(product.lowest_price)} · price updated moments ago</p></div><TinyTrend values={getSparklineValues(history)} /><div className="sm:text-right"><p className="text-sm font-semibold text-text-primary font-mono">{formatCurrency(product.current_price)}</p><p className="text-xs text-success">{getPriceMovementPercent(history)}% tracked</p></div><button onClick={() => removeFromWatchlist(product.id)} className="badge bg-background-tertiary text-text-secondary border border-border">Remove</button></div></div>; })}</div></div><div className="card premium-panel p-5 flex flex-col justify-center text-center min-h-[260px]"><div className="mx-auto h-12 w-12 rounded-3xl bg-brand-800/40 border border-brand-500/20 flex items-center justify-center mb-4"><Package size={20} className="text-brand-200" /></div><h3 className="text-base font-semibold text-text-primary">Start a focused watchlist</h3><p className="text-sm text-text-secondary mt-2">Track a product once and PricePulse keeps watching the market quietly in the background.</p></div></section>
  );
}

function ActivityFeed({ activity }: { activity: PlatformActivityItem[] }) {
  const { activity: localActivity } = usePlatformStore();
  const feed = [...localActivity, ...activity].slice(0, 6);
  return <section className="card p-5 sm:p-6"><div className="flex items-center justify-between gap-4 mb-5"><div><h3 className="text-base font-semibold text-text-primary">Recently triggered alerts</h3><p className="text-xs text-text-muted mt-1">Live retention signals from watched products</p></div><span className="badge bg-success/10 text-success border border-success/20"><Clock size={12} />Updated moments ago</span></div><div className="grid md:grid-cols-2 gap-3">{feed.map((item, index) => <div key={item.id} className="rounded-2xl bg-background-tertiary/35 border border-border/70 p-4 flex items-start gap-3"><span className={`mt-1.5 h-2 w-2 rounded-full ${index === 0 ? 'bg-warning animate-pulse-soft' : 'bg-success'}`} /><div><p className="text-sm font-medium text-text-primary">{item.message}</p><p className="text-xs text-text-muted mt-1">{index + 2} minutes ago</p></div></div>)}</div></section>;
}

function PopularCategories({ categories }: { categories: PlatformCategorySummary[] }) {
  return <section className="space-y-4"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Explore signals</p><h3 className="text-base font-semibold text-text-primary">Popular categories</h3></div><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{categories.map(category => <div key={category.category} className="card card-hover p-5"><div className="flex items-center justify-between mb-4"><h4 className="text-sm font-semibold text-text-primary">{category.category}</h4><LineChart size={15} className="text-brand-300" /></div><p className="text-xs text-text-muted">Trending: {category.trending_products.join(', ')}</p><p className="text-sm text-success mt-3">{category.average_discount}% avg discounts</p><p className="text-xs text-text-muted mt-1">{category.live_activity_count.toLocaleString()} live movements</p></div>)}</div></section>;
}

function SkeletonPreview() {
  return <div className="card p-5"><div className="flex items-center gap-3 mb-4"><SlidersHorizontal size={15} className="text-brand-300" /><h3 className="text-sm font-semibold text-text-primary">Advanced loading states</h3></div><div className="space-y-3"><div className="h-4 w-2/3 rounded-full bg-background-tertiary animate-pulse" /><div className="h-28 rounded-3xl bg-background-tertiary/60 animate-pulse" /><div className="grid grid-cols-3 gap-3"><div className="h-12 rounded-2xl bg-background-tertiary/60 animate-pulse" /><div className="h-12 rounded-2xl bg-background-tertiary/60 animate-pulse" /><div className="h-12 rounded-2xl bg-background-tertiary/60 animate-pulse" /></div></div></div>;
}

export function ProductEcosystemPrototype() {
  const [products, setProducts] = useState<PlatformProduct[]>([]);
  const [histories, setHistories] = useState<Record<string, PlatformPriceHistory[]>>({});
  const [activity, setActivity] = useState<PlatformActivityItem[]>([]);
  const [categories, setCategories] = useState<PlatformCategorySummary[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [trending, liveActivity, categoryData] = await Promise.all([platformApi.getTrendingProducts(6), platformApi.getLiveActivity(), platformApi.getPopularCategories()]);
      const historyEntries = await Promise.all(trending.data.map(product => platformApi.getProductHistory(product.id)));
      if (!mounted) return;
      setProducts(trending.data);
      setSelectedId(trending.data[0]?.id ?? '');
      setActivity(liveActivity.data);
      setCategories(categoryData.data);
      setHistories(Object.fromEntries(trending.data.map((product, index) => [product.id, historyEntries[index].data])));
    }
    load();
    return () => { mounted = false; };
  }, []);

  const selected = useMemo(() => products.find(product => product.id === selectedId) ?? products[0], [products, selectedId]);

  if (!selected) return <SkeletonPreview />;

  return (
    <div className="space-y-8"><section className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Product ecosystem prototype</p><h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-text-primary">A market watcher that feels alive after signup</h2><p className="text-sm text-text-secondary mt-2 max-w-3xl">Reusable mock product experiences prepared for future routes like /product/rtx-5090 and real data integration.</p></div><div className="flex gap-2 overflow-x-auto pb-1">{products.slice(0, 3).map(product => <button key={product.id} onClick={() => setSelectedId(product.id)} className={`btn-ghost text-xs border whitespace-nowrap ${selected.id === product.id ? 'border-success/30 bg-success/10 text-success' : 'border-border/60'}`}>{product.slug}</button>)}</div></section><ProductDetailTemplate product={selected} history={histories[selected.id] ?? []} onAlert={() => setShowAlert(true)} /><WatchlistExperience products={products} histories={histories} /><ActivityFeed activity={activity} /><div className="grid xl:grid-cols-[1fr_320px] gap-5"><PopularCategories categories={categories} /><SkeletonPreview /></div>{showAlert && <AlertModal product={selected} onClose={() => setShowAlert(false)} />}</div>
  );
}
