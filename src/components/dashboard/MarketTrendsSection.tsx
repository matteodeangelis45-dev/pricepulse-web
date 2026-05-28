import { Activity, Flame, TrendingDown, Zap } from 'lucide-react';
import { mockProducts, mockCategorySummaries } from '../../data/mockProducts';
import { mockPriceHistory } from '../../data/mockPriceHistory';
import { getDiscountPercent, getSparklineValues } from '../../lib/chartUtils';
import { formatCurrency } from '../ui/PriceChange';

function MiniChart({ values }: { values: readonly number[] }) {
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-8 w-20"><polyline points={points} fill="none" stroke="#00C896" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function MarketTrendsSection() {
  const weeklyDrops = [...mockProducts]
    .map(product => ({ ...product, discount: getDiscountPercent(product.current_price, product.previous_price) }))
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 4);
  const volatile = [...mockProducts].sort((a, b) => (b.volatility === 'high' ? 2 : b.volatility === 'medium' ? 1 : 0) - (a.volatility === 'high' ? 2 : a.volatility === 'medium' ? 1 : 0)).slice(0, 4);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Market trends</p>
          <h2 className="text-base font-semibold text-text-primary tracking-tight">Live market intelligence</h2>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">Trending categories, hot products, weekly drops, and volatility signals.</p>
        </div>
        <span className="badge bg-success/10 text-success border border-success/20"><Activity size={12} /> Updated moments ago</span>
      </div>

      <div className="grid xl:grid-cols-4 sm:grid-cols-2 gap-4">
        <TrendCard icon={<Flame size={15} />} title="Trending categories" rows={mockCategorySummaries.slice(0, 4).map(category => ({ label: category.category, meta: `${category.live_activity_count.toLocaleString()} movements`, value: `${category.average_discount}% avg` }))} />
        <TrendCard icon={<Zap size={15} />} title="Hottest products" rows={mockProducts.slice(0, 4).map(product => ({ label: product.title, meta: `${product.tracking_count.toLocaleString()} tracking`, value: product.retailer }))} />
        <TrendCard icon={<TrendingDown size={15} />} title="Biggest weekly drops" rows={weeklyDrops.map(product => ({ label: product.title, meta: formatCurrency(product.current_price), value: `-${product.discount}%` }))} />
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4"><Activity size={15} className="text-brand-300" /><h3 className="text-sm font-semibold text-text-primary">Most volatile</h3></div>
          <div className="space-y-3">
            {volatile.map(product => {
              const history = mockPriceHistory.filter(item => item.product_id === product.id);
              return (
                <div key={product.id} className="rounded-2xl bg-background-tertiary/35 border border-border/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0"><p className="text-xs font-semibold text-text-primary truncate">{product.title}</p><p className="text-2xs text-text-muted mt-1">{product.volatility} volatility</p></div>
                    <MiniChart values={getSparklineValues(history)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function TrendCard({ icon, title, rows }: { icon: React.ReactNode; title: string; rows: { label: string; meta: string; value: string }[] }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4"><span className="text-brand-300">{icon}</span><h3 className="text-sm font-semibold text-text-primary">{title}</h3></div>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.label} className="flex items-center justify-between gap-3">
            <div className="min-w-0"><p className="text-xs font-semibold text-text-primary truncate"><span className="text-text-muted mr-2">#{index + 1}</span>{row.label}</p><p className="text-2xs text-text-muted mt-1">{row.meta}</p></div>
            <span className="text-xs font-semibold text-success whitespace-nowrap">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
