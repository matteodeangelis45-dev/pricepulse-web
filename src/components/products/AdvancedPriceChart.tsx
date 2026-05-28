import { memo, useMemo, useState } from 'react';
import type { PriceHistory } from '../../lib/database.types';
import { filterHistoryByRange, type PriceRange } from '../../lib/productIntelligence';

interface AdvancedPriceChartProps {
  history: PriceHistory[];
  currency?: string;
  targetPrice?: number | null;
}

const ranges: { label: string; value: PriceRange }[] = [
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '90d', value: '90d' },
  { label: '1y', value: '1y' },
  { label: 'All', value: 'all' },
];

export const AdvancedPriceChart = memo(function AdvancedPriceChart({ history, currency = 'USD', targetPrice }: AdvancedPriceChartProps) {
  const [range, setRange] = useState<PriceRange>('90d');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const fmt = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }), [currency]);

  const chart = useMemo(() => {
    const sorted = filterHistoryByRange([...history].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()), range);
    const prices = sorted.map(item => item.price);
    const allPrices = targetPrice ? [...prices, targetPrice] : prices;
    const minPrice = Math.min(...allPrices) * 0.97;
    const maxPrice = Math.max(...allPrices) * 1.03;
    const width = 720;
    const height = 260;
    const padX = 18;
    const padY = 22;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;
    const rangeSize = maxPrice - minPrice || 1;
    const toX = (index: number) => padX + (index / Math.max(sorted.length - 1, 1)) * chartW;
    const toY = (price: number) => padY + (1 - (price - minPrice) / rangeSize) * chartH;
    const path = sorted.map((item, index) => `${index === 0 ? 'M' : 'L'} ${toX(index)} ${toY(item.price)}`).join(' ');
    const area = path ? `${path} L ${toX(sorted.length - 1)} ${height} L ${padX} ${height} Z` : '';
    const latest = sorted[sorted.length - 1];
    const first = sorted[0];
    const isDown = latest && first ? latest.price <= first.price : true;
    const hover = hoverIndex !== null ? sorted[hoverIndex] : null;

    return { sorted, minPrice, maxPrice, width, height, padX, padY, chartW, chartH, toX, toY, path, area, isDown, hover };
  }, [history, hoverIndex, range, targetPrice]);

  if (history.length === 0 || chart.sorted.length === 0) {
    return <div className="h-72 flex items-center justify-center text-sm text-text-muted">No price history yet</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Advanced price history</h3>
          <p className="text-xs text-text-muted mt-1">Financial-style movement view with range filtering</p>
        </div>
        <div className="flex gap-1.5 rounded-2xl bg-background-tertiary/50 border border-border/70 p-1 overflow-x-auto">
          {ranges.map(item => (
            <button key={item.value} onClick={() => setRange(item.value)} className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${range === item.value ? 'bg-success/15 text-success border border-success/20' : 'text-text-muted hover:text-text-primary'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-3xl bg-background/45 border border-border/60 p-3 overflow-hidden">
        <div className="absolute inset-x-12 top-8 h-24 bg-success/10 blur-3xl" />
        <svg viewBox={`0 0 ${chart.width} ${chart.height}`} preserveAspectRatio="none" className="relative w-full h-[260px]">
          <defs>
            <linearGradient id="advancedPriceArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chart.isDown ? '#00C896' : '#F97316'} stopOpacity="0.28" />
              <stop offset="100%" stopColor={chart.isDown ? '#00C896' : '#F97316'} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map(t => <line key={t} x1={chart.padX} x2={chart.width - chart.padX} y1={chart.padY + t * chart.chartH} y2={chart.padY + t * chart.chartH} stroke="#22373D" strokeWidth="1" />)}
          {targetPrice && <line x1={chart.padX} x2={chart.width - chart.padX} y1={chart.toY(targetPrice)} y2={chart.toY(targetPrice)} stroke="#D8A75F" strokeWidth="1.6" strokeDasharray="6 6" opacity="0.75" />}
          <path d={chart.area} fill="url(#advancedPriceArea)" className="animate-fade-in" />
          <path d={chart.path} fill="none" stroke={chart.isDown ? '#00C896' : '#F97316'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(0,200,150,0.22)]" />
          {chart.sorted.map((item, index) => <circle key={item.id} cx={chart.toX(index)} cy={chart.toY(item.price)} r={hoverIndex === index ? 5 : 8} fill="transparent" onMouseEnter={() => setHoverIndex(index)} onMouseLeave={() => setHoverIndex(null)} />)}
          {chart.hover && hoverIndex !== null && <g><line x1={chart.toX(hoverIndex)} x2={chart.toX(hoverIndex)} y1={chart.padY} y2={chart.height - chart.padY} stroke="#7BAE9A" strokeWidth="1" strokeDasharray="4 5" opacity="0.7" /><circle cx={chart.toX(hoverIndex)} cy={chart.toY(chart.hover.price)} r="5" fill="#00C896" stroke="#0B1114" strokeWidth="3" /></g>}
        </svg>
        {chart.hover && hoverIndex !== null && (
          <div className="absolute right-5 top-5 rounded-2xl border border-success/20 bg-background-secondary/95 px-4 py-3 shadow-card-hover backdrop-blur-md">
            <p className="text-xs text-text-muted">{new Date(chart.hover.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <p className="text-lg font-semibold text-text-primary font-mono mt-1">{fmt.format(chart.hover.price)}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between text-2xs text-text-muted">
        <span>{fmt.format(chart.minPrice)}</span>
        <span>{chart.sorted.length} points</span>
        <span>{fmt.format(chart.maxPrice)}</span>
      </div>
    </div>
  );
});
