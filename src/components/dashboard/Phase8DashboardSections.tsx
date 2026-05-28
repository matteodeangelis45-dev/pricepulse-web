import { Activity, Bell, Eye, Layers, Radio, ShieldCheck, Sparkles, TrendingDown, Users, Zap } from 'lucide-react';
import { mockPriceHistory } from '../../data/mockPriceHistory';
import { getDiscountPercent, getSavingsAmount, getSparklineValues } from '../../lib/chartUtils';
import { getDailyDealCollections, getMomentumSignal, getPersonalizedProducts, getPricePulseScore, retailerSignals } from '../../lib/phase8Intelligence';
import type { MomentumSignal } from '../../lib/phase8Intelligence';
import type { PlatformProduct } from '../../types/platform.types';
import { formatCurrency } from '../ui/PriceChange';

function MiniChart({ values }: { values: readonly number[] }) {
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-8 w-20"><polyline points={points} fill="none" stroke="#00C896" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function MomentumBadge({ signal }: { signal: MomentumSignal }) {
  const tone = signal === 'Falling Fast' ? 'text-success bg-success/10 border-success/20' : signal === 'High Volatility' ? 'text-warning bg-warning/10 border-warning/20' : signal === 'Demand Increasing' ? 'text-brand-300 bg-brand-800/25 border-brand-500/20' : 'text-text-secondary bg-background-tertiary/50 border-border/70';
  return <span className={`badge ${tone}`}><Activity size={11} />{signal}</span>;
}

function DealCard({ product, compact = false }: { product: PlatformProduct; compact?: boolean }) {
  const history = mockPriceHistory.filter(item => item.product_id === product.id);
  const discount = getDiscountPercent(product.current_price, product.previous_price);
  const savings = getSavingsAmount(product.current_price, product.previous_price);
  return <div className="card card-hover p-4"><div className="flex gap-3"><img src={product.image} alt={product.title} className={`${compact ? 'h-14 w-14' : 'h-20 w-20'} rounded-2xl object-cover border border-border/60 shrink-0`} loading="lazy" /><div className="min-w-0 flex-1"><div className="flex items-center gap-2 mb-1"><MomentumBadge signal={getMomentumSignal(product)} /><span className="text-2xs text-text-muted">Score {getPricePulseScore(product)}</span></div><h3 className="text-sm font-semibold text-text-primary line-clamp-2">{product.title}</h3><p className="text-xs text-text-muted mt-1">{product.retailer} · {product.volatility} volatility</p></div></div><div className="flex items-end justify-between mt-4"><div><p className="text-lg font-semibold text-text-primary font-mono">{formatCurrency(product.current_price)}</p><p className="text-xs text-success">-{discount}% · save {formatCurrency(savings)}</p></div><MiniChart values={getSparklineValues(history)} /></div></div>;
}

export function PersonalizedHomeSections() {
  const groups = getPersonalizedProducts();
  const rows = [
    { title: 'Recently viewed', icon: Eye, products: groups.recentlyViewed },
    { title: 'Trending in your categories', icon: Sparkles, products: groups.trendingInCategories },
    { title: 'Strongest recent drops', icon: TrendingDown, products: groups.strongestDrops },
    { title: 'Most tracked today', icon: Users, products: groups.mostTrackedToday },
  ];

  return <section className="space-y-4"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Personalized market feed</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Built around your watch behavior</h2></div><div className="grid lg:grid-cols-2 gap-4">{rows.map(row => { const Icon = row.icon; return <div key={row.title} className="card p-5"><div className="flex items-center gap-2 mb-4"><Icon size={15} className="text-brand-300" /><h3 className="text-sm font-semibold text-text-primary">{row.title}</h3></div><div className="space-y-3">{row.products.slice(0, 3).map(product => <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-background-tertiary/35 border border-border/60 p-3"><div className="min-w-0"><p className="text-xs font-semibold text-text-primary truncate">{product.title}</p><p className="text-2xs text-text-muted mt-1">{product.retailer} · {product.tracking_count.toLocaleString()} tracking</p></div><MomentumBadge signal={getMomentumSignal(product)} /></div>)}</div></div>; })}</div></section>;
}

export function DailyDealDiscovery() {
  const collections = getDailyDealCollections();
  return <section className="space-y-4"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Daily deal discovery</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Curated buying windows worth checking today</h2><p className="text-xs text-text-muted mt-1 max-w-2xl">Ranked by historical context, score, discount depth, and market demand.</p></div><span className="badge bg-success/10 text-success border border-success/20"><Zap size={12} /> refreshed today</span></div><div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">{collections.curated.map(product => <DealCard key={product.id} product={product} />)}</div><div className="grid md:grid-cols-3 gap-4"><DiscoveryColumn title="Historical lows" products={collections.historicalLows} /><DiscoveryColumn title="Hidden value" products={collections.hiddenValue} /><DiscoveryColumn title="Worth watching" products={collections.worthWatching} /></div></section>;
}

function DiscoveryColumn({ title, products }: { title: string; products: PlatformProduct[] }) {
  return <div className="card p-5"><h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3><div className="space-y-3">{products.map(product => <DealCard key={product.id} product={product} compact />)}</div></div>;
}

export function UserInsightRewardPanel({ trackedCount, alertCount }: { trackedCount: number; alertCount: number }) {
  const opportunities = getPersonalizedProducts().recommendedDeals;
  const totalSavings = opportunities.reduce((sum, product) => sum + getSavingsAmount(product.current_price, product.previous_price), 0);
  const stats = [
    { icon: TrendingDown, label: 'Total savings tracked', value: formatCurrency(totalSavings) },
    { icon: Layers, label: 'Products monitored', value: `${Math.max(trackedCount, opportunities.length)}` },
    { icon: Bell, label: 'Alerts triggered', value: `${Math.max(alertCount, 7)}` },
    { icon: Sparkles, label: 'Best opportunities found', value: `${opportunities.length}` },
  ];
  return <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{stats.map(stat => { const Icon = stat.icon; return <div key={stat.label} className="stat-card"><div className="flex items-center justify-between mb-4"><span className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em]">{stat.label}</span><Icon size={14} className="text-brand-300" /></div><p className="text-2xl font-semibold text-text-primary">{stat.value}</p><p className="text-xs text-text-muted mt-1">Updated from your live market graph</p></div>; })}</section>;
}

export function PremiumOnboardingFlow({ onAddProduct }: { onAddProduct: () => void }) {
  const steps = [
    { title: 'Track products', body: 'Add the products you care about and let PricePulse watch the market.', icon: Eye },
    { title: 'Set alerts', body: 'Define target prices and receive meaningful signals instead of noise.', icon: Bell },
    { title: 'Discover live deals', body: 'Return daily for historical lows, hidden value, and category momentum.', icon: Sparkles },
    { title: 'Read market insights', body: 'Use calm analytical summaries to decide when to buy.', icon: ShieldCheck },
  ];
  return <section className="card premium-panel p-6"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-5"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Getting started</p><h2 className="text-xl font-semibold text-text-primary tracking-tight">Build your intelligent shopping command center</h2><p className="text-sm text-text-secondary mt-2 max-w-2xl">A few tracked products are enough to unlock personalized deals, alerts, and market signals.</p></div><button onClick={onAddProduct} className="btn-primary">Track first product</button></div><div className="grid md:grid-cols-4 gap-4">{steps.map(step => { const Icon = step.icon; return <div key={step.title} className="rounded-3xl border border-border/70 bg-background-tertiary/25 p-4 hover:border-success/25 transition-colors"><Icon size={16} className="text-brand-300" /><h3 className="text-sm font-semibold text-text-primary mt-3">{step.title}</h3><p className="text-xs text-text-muted mt-2 leading-relaxed">{step.body}</p></div>; })}</div></section>;
}

export function RetailerTrustGrid() {
  return <section className="space-y-4"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Retailer intelligence</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Verified coverage and offer quality</h2></div><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{retailerSignals.slice(0, 8).map(retailer => <div key={retailer.retailer} className="card p-4"><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-semibold text-text-primary">{retailer.retailer}</h3><span className="badge bg-success/10 text-success border border-success/20"><Radio size={11} />{retailer.status}</span></div><p className="text-xs text-text-muted">{retailer.coverage}</p><p className="text-xs text-text-secondary mt-2">{retailer.shippingSpeed}</p><div className="mt-4 h-2 rounded-full bg-background-tertiary overflow-hidden"><div className="h-full bg-success rounded-full" style={{ width: `${retailer.trustScore}%` }} /></div><p className="text-2xs text-text-muted mt-2">Trust score {retailer.trustScore}/100</p></div>)}</div></section>;
}

export function LiveMarketPulseStrip() {
  const pulses = ['Prices refreshed 42s ago', '18,492 alerts evaluated today', 'Retailer coverage healthy', 'Tracking counters updating live'];
  return <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">{pulses.map(pulse => <div key={pulse} className="rounded-2xl border border-border/70 bg-background-tertiary/30 px-4 py-3 flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-success animate-pulse" /><span className="text-xs font-medium text-text-secondary">{pulse}</span></div>)}</div>;
}
