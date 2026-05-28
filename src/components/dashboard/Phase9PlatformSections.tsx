import { ArrowDownRight, Bell, Briefcase, LineChart, Radio, ShieldCheck, Sparkles, TrendingDown, Zap } from 'lucide-react';
import { mockPriceHistory } from '../../data/mockPriceHistory';
import { getSparklineValues } from '../../lib/chartUtils';
import { getDiscoveryCollections, getLiveDealStream, getMarketIndex, getMarketStatuses, getPlatformAuthorityStats, getSavingsAnalytics, monetizationCapabilities, notificationTemplates } from '../../lib/phase9Platform';
import { getMomentumSignal, getPricePulseScore } from '../../lib/phase8Intelligence';
import type { PlatformProduct } from '../../types/platform.types';
import { MomentumBadge } from './Phase8DashboardSections';
import { formatCurrency } from '../ui/PriceChange';

function MiniChart({ values }: { values: readonly number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const normalized = values.map(value => ((value - min) / Math.max(max - min, 1)) * 100);
  const points = normalized.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-12 w-full"><defs><linearGradient id="phase9-chart" x1="0" x2="1"><stop offset="0%" stopColor="#00C896" stopOpacity="0.35" /><stop offset="100%" stopColor="#00C896" /></linearGradient></defs><polyline points={points} fill="none" stroke="url(#phase9-chart)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ProductRow({ product }: { product: PlatformProduct }) {
  const history = mockPriceHistory.filter(item => item.product_id === product.id);
  return <div className="rounded-3xl border border-border/60 bg-background-tertiary/25 p-4 hover:border-success/25 transition-colors"><div className="flex gap-3"><img src={product.image} alt={product.title} className="h-14 w-14 rounded-2xl object-cover border border-border/60" loading="lazy" /><div className="min-w-0 flex-1"><div className="flex flex-wrap gap-2 mb-1"><MomentumBadge signal={getMomentumSignal(product)} /><span className="badge bg-success/10 text-success border border-success/20">Score {getPricePulseScore(product)}</span></div><h3 className="text-sm font-semibold text-text-primary truncate">{product.title}</h3><p className="text-xs text-text-muted mt-1">{product.retailer} · {formatCurrency(product.current_price)}</p></div><div className="w-24"><MiniChart values={getSparklineValues(history)} /></div></div></div>;
}

export function GlobalIntelligenceDashboard() {
  const authority = getPlatformAuthorityStats();
  return <section className="card premium-panel p-6 lg:p-7 overflow-hidden relative"><div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-success/10 blur-3xl" /><div className="relative flex flex-col xl:flex-row xl:items-end justify-between gap-6"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-3">Global intelligence dashboard</p><h1 className="text-2xl lg:text-4xl font-semibold tracking-tight text-text-primary">PricePulse market command center</h1><p className="text-sm text-text-secondary mt-3 max-w-3xl leading-relaxed">A real-time purchasing intelligence layer combining deal quality, market momentum, retailer coverage, alert pressure, and personalized buying opportunities.</p></div><div className="grid grid-cols-2 gap-3 min-w-[320px]">{authority.map(stat => <div key={stat.label} className="rounded-2xl border border-border/60 bg-background-tertiary/30 p-3"><p className="text-2xs uppercase tracking-[0.18em] text-text-muted">{stat.label}</p><p className="text-lg font-semibold text-text-primary mt-1">{stat.value}</p></div>)}</div></div></section>;
}

export function MarketStatusSystem() {
  const statuses = getMarketStatuses();
  return <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">{statuses.map(status => <div key={status} className="rounded-2xl border border-border/70 bg-background-tertiary/30 px-4 py-3 flex items-center justify-between gap-3"><span className="text-xs font-medium text-text-secondary">{status}</span><span className="h-2 w-2 rounded-full bg-success animate-pulse" /></div>)}</section>;
}

export function PricePulseMarketIndex() {
  const indexes = getMarketIndex();
  return <section className="space-y-4"><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">PricePulse Market Index</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Proprietary category momentum and stability</h2><p className="text-xs text-text-muted mt-1 max-w-2xl">Category index scores blend deal pressure, live activity, volatility, and tracked product demand.</p></div><span className="badge bg-brand-800/25 text-brand-300 border border-brand-500/20"><LineChart size={12} /> Financial-style market view</span></div><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{indexes.map(index => <div key={index.category} className="card p-5"><div className="flex items-start justify-between gap-4 mb-4"><div><h3 className="text-sm font-semibold text-text-primary">{index.title}</h3><p className="text-xs text-text-muted mt-1">{index.volatility} volatility</p></div><div className="text-right"><p className="text-2xl font-semibold text-text-primary font-mono">{index.score}</p><p className={index.movement >= 0 ? 'text-xs text-success' : 'text-xs text-error'}>{index.movement >= 0 ? '+' : ''}{index.movement}%</p></div></div><div className="rounded-3xl bg-background-tertiary/25 border border-border/60 p-3 mb-4"><MiniChart values={index.values} /></div><p className="text-xs text-text-secondary leading-relaxed">{index.summary}</p></div>)}</div></section>;
}

export function AdvancedSavingsAnalytics() {
  const analytics = getSavingsAnalytics();
  const stats = [{ icon: TrendingDown, label: 'Total savings tracked', value: formatCurrency(analytics.totalSavings) }, { icon: ArrowDownRight, label: 'Potential extra savings', value: formatCurrency(analytics.potentialSavings) }, { icon: Sparkles, label: 'Best alert success', value: analytics.best ? analytics.best.title.split(' ').slice(0, 3).join(' ') : '—' }, { icon: Briefcase, label: 'Tracked categories', value: `${analytics.trackedCategories}` }];
  return <section className="space-y-4"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Savings analytics</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Personal value generated by PricePulse</h2></div><div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">{stats.map(stat => { const Icon = stat.icon; return <div key={stat.label} className="stat-card"><div className="flex items-center justify-between mb-4"><span className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em]">{stat.label}</span><Icon size={14} className="text-brand-300" /></div><p className="text-xl font-semibold text-text-primary truncate">{stat.value}</p><p className="text-xs text-text-muted mt-1">Calculated from watched market opportunities</p></div>; })}</div><div className="grid md:grid-cols-3 gap-4">{analytics.valuableProducts.map(product => <ProductRow key={product.id} product={product} />)}</div></section>;
}

export function LiveDealStream() {
  const stream = getLiveDealStream().slice(0, 8);
  return <section className="card p-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Live deal stream</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Real-time opportunity activity</h2></div><span className="badge bg-success/10 text-success border border-success/20"><Radio size={12} /> Live monitoring</span></div><div className="space-y-3 max-h-[420px] overflow-hidden">{stream.map(item => <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background-tertiary/25 p-3 animate-fade-in"><span className="h-2 w-2 rounded-full bg-success animate-pulse shrink-0" /><img src={item.product.image} alt={item.product.title} className="h-10 w-10 rounded-xl object-cover border border-border/60" loading="lazy" /><div className="min-w-0 flex-1"><p className="text-sm font-medium text-text-primary truncate">{item.message}</p><p className="text-2xs text-text-muted mt-1">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {item.product.retailer}</p></div><MomentumBadge signal={item.signal} /></div>)}</div></section>;
}

export function AdvancedDiscoverySystem() {
  const collections = getDiscoveryCollections();
  const groups = [{ title: 'Trending collections', products: collections.trendingCollections }, { title: 'Hidden deals', products: collections.hiddenDeals }, { title: 'Recently volatile', products: collections.recentlyVolatile }, { title: 'Strongest historical lows', products: collections.strongestHistoricalLows }];
  return <section className="space-y-4"><div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Advanced discovery</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Editor-style collections from market intelligence</h2></div><div className="grid lg:grid-cols-2 gap-4">{groups.map(group => <div key={group.title} className="card p-5"><div className="flex items-center gap-2 mb-4"><Zap size={15} className="text-brand-300" /><h3 className="text-sm font-semibold text-text-primary">{group.title}</h3></div><div className="space-y-3">{group.products.map(product => <ProductRow key={product.id} product={product} />)}</div></div>)}</div></section>;
}

export function ProNotificationArchitecture() {
  return <section className="grid lg:grid-cols-[1fr_0.9fr] gap-4"><div className="card p-5"><div className="flex items-center gap-2 mb-4"><Bell size={15} className="text-brand-300" /><h2 className="text-sm font-semibold text-text-primary">Premium notification architecture</h2></div><div className="grid sm:grid-cols-2 gap-3">{notificationTemplates.map(template => <div key={template.type} className="rounded-2xl border border-border/60 bg-background-tertiary/25 p-3"><span className={template.priority === 'high' ? 'badge bg-warning/10 text-warning border border-warning/20' : 'badge bg-brand-800/25 text-brand-300 border border-brand-500/20'}>{template.priority}</span><h3 className="text-sm font-semibold text-text-primary mt-3">{template.title}</h3><p className="text-xs text-text-muted mt-2 leading-relaxed">{template.body}</p></div>)}</div></div><div className="card p-5"><div className="flex items-center gap-2 mb-4"><ShieldCheck size={15} className="text-brand-300" /><h2 className="text-sm font-semibold text-text-primary">Monetization-ready capabilities</h2></div><div className="space-y-3">{Object.values(monetizationCapabilities).map(capability => <div key={capability.label} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background-tertiary/25 p-3"><span className="text-sm text-text-secondary">{capability.label}</span><span className="badge bg-success/10 text-success border border-success/20">Ready</span></div>)}</div></div></section>;
}
