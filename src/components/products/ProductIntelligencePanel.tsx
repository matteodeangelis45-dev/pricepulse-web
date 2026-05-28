import { Activity, BarChart3, Sparkles, TrendingDown } from 'lucide-react';
import type { PriceHistory, Product } from '../../lib/database.types';
import { buildBuyTimingInsights, calculatePricePulseScore } from '../../lib/productIntelligence';

interface ProductIntelligencePanelProps {
  product: Product;
  history: PriceHistory[];
}

export function ProductIntelligencePanel({ product, history }: ProductIntelligencePanelProps) {
  const score = calculatePricePulseScore(product, history);
  const insights = buildBuyTimingInsights(product, history);
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score.score / 100) * circumference;
  const firstPrice = history[0]?.price ?? product.current_price ?? 0;
  const latestPrice = history[history.length - 1]?.price ?? product.current_price ?? 0;
  const movement = firstPrice > 0 ? ((latestPrice - firstPrice) / firstPrice) * 100 : 0;
  const volatilityLabel = score.volatility > 70 ? 'High volatility detected' : score.volatility > 38 ? 'Measured price movement' : 'Historically stable pricing';
  const trendLabel = movement < -8 ? 'Rapid downward trend detected' : movement > 6 ? 'Price recovering after recent lows' : 'Long-term trend remains controlled';
  const confidenceLabel = score.score >= 78 ? 'Strong buying opportunity' : score.score >= 58 ? 'Balanced buying window' : 'Watch before buying';

  return (
    <section className="grid lg:grid-cols-[320px_1fr] gap-4">
      <div className="card premium-panel p-5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-success/10 blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="relative h-28 w-28 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#22373D" strokeWidth="9" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="#00C896" strokeWidth="9" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-text-primary font-mono">{score.score}</span>
              <span className="text-[10px] text-text-muted">/100</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">PricePulse Score</p>
            <h3 className="text-lg font-semibold text-text-primary">Market evaluation</h3>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">{score.summary}</p>
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-3 mt-5 text-xs">
          <Metric label="Deal quality" value={score.dealQuality} />
          <Metric label="History rank" value={score.historicalPosition} />
          <Metric label="Volatility" value={score.volatility} />
          <Metric label="Discount" value={score.discountStrength} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const Icon = index === 0 ? Sparkles : index === 1 ? TrendingDown : index === 2 ? BarChart3 : Activity;
          return (
            <div key={insight.title} className={`rounded-3xl border p-5 ${insight.tone === 'success' ? 'bg-success/10 border-success/20' : insight.tone === 'warning' ? 'bg-warning/10 border-warning/20' : 'bg-brand-800/20 border-brand-500/20'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={15} className={insight.tone === 'success' ? 'text-success' : insight.tone === 'warning' ? 'text-warning' : 'text-brand-300'} />
                <h4 className="text-sm font-semibold text-text-primary">{insight.title}</h4>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{insight.body}</p>
            </div>
          );
        })}
      </div>

      <div className="lg:col-span-2 grid md:grid-cols-3 gap-4">
        <NarrativeCard title="Long-term trend" value={trendLabel} body={`Tracked movement is ${movement.toFixed(1)}% across the available history window.`} />
        <NarrativeCard title="Pricing behavior" value={volatilityLabel} body="PricePulse compares current movement against historical range and recent market behavior." />
        <NarrativeCard title="Buy timing confidence" value={confidenceLabel} body="Confidence blends deal quality, historical position, volatility, and discount strength." />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-background-tertiary/45 border border-border/60 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted">{label}</span>
        <span className="text-text-primary font-mono font-semibold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-background overflow-hidden">
        <div className="h-full rounded-full bg-success" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function NarrativeCard({ title, value, body }: { title: string; value: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background-tertiary/25 p-5">
      <p className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em] mb-2">{title}</p>
      <h4 className="text-sm font-semibold text-text-primary">{value}</h4>
      <p className="text-xs text-text-secondary leading-relaxed mt-2">{body}</p>
    </div>
  );
}
