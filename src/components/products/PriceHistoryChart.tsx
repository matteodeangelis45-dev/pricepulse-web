import { useMemo } from 'react';
import type { PriceHistory } from '../../lib/database.types';

interface PriceHistoryChartProps {
  history: PriceHistory[];
  currency?: string;
  targetPrice?: number | null;
}

export function PriceHistoryChart({ history, currency = 'USD', targetPrice }: PriceHistoryChartProps) {
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);

  const sorted = useMemo(() =>
    [...history].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()),
  [history]);

  if (sorted.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-text-muted text-sm">
        No price history yet
      </div>
    );
  }

  const prices = sorted.map(h => h.price);
  const allPrices = targetPrice ? [...prices, targetPrice] : prices;
  const minPrice = Math.min(...allPrices) * 0.98;
  const maxPrice = Math.max(...allPrices) * 1.02;
  const range = maxPrice - minPrice || 1;

  const WIDTH = 600;
  const HEIGHT = 160;
  const PAD_X = 8;
  const PAD_Y = 16;
  const chartW = WIDTH - PAD_X * 2;
  const chartH = HEIGHT - PAD_Y * 2;

  const toX = (i: number) => PAD_X + (i / Math.max(sorted.length - 1, 1)) * chartW;
  const toY = (price: number) => PAD_Y + (1 - (price - minPrice) / range) * chartH;

  const pathD = sorted.map((h, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(h.price)}`).join(' ');
  const areaD = pathD + ` L ${toX(sorted.length - 1)} ${HEIGHT} L ${PAD_X} ${HEIGHT} Z`;

  const fmtDate = (s: string) => {
    const d = new Date(s);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const ticks = sorted.length <= 7
    ? sorted.map((h, i) => ({ x: toX(i), label: fmtDate(h.recorded_at) }))
    : [0, Math.floor(sorted.length / 2), sorted.length - 1].map(i => ({
        x: toX(i),
        label: fmtDate(sorted[i].recorded_at),
      }));

  const latest = sorted[sorted.length - 1];
  const isDown = sorted.length > 1 && latest.price < sorted[0].price;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height: '160px' }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isDown ? '#10B981' : '#EF4444'} stopOpacity="0.2" />
            <stop offset="100%" stopColor={isDown ? '#10B981' : '#EF4444'} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => (
          <line
            key={t}
            x1={PAD_X} y1={PAD_Y + t * chartH}
            x2={WIDTH - PAD_X} y2={PAD_Y + t * chartH}
            stroke="#293548" strokeWidth="1"
          />
        ))}

        {/* Target price line */}
        {targetPrice && (
          <line
            x1={PAD_X} y1={toY(targetPrice)}
            x2={WIDTH - PAD_X} y2={toY(targetPrice)}
            stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5,4"
            opacity="0.7"
          />
        )}

        {/* Area fill */}
        <path d={areaD} fill="url(#lineGrad)" />

        {/* Price line */}
        <path
          d={pathD}
          fill="none"
          stroke={isDown ? '#10B981' : '#EF4444'}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Latest dot */}
        <circle
          cx={toX(sorted.length - 1)}
          cy={toY(latest.price)}
          r="4"
          fill={isDown ? '#10B981' : '#EF4444'}
          stroke="#1E293B"
          strokeWidth="2"
        />
      </svg>

      {/* X-axis ticks */}
      <div className="relative" style={{ height: '20px' }}>
        {ticks.map((t, i) => (
          <span
            key={i}
            className="absolute text-2xs text-text-muted -translate-x-1/2 whitespace-nowrap"
            style={{ left: `${(t.x / WIDTH) * 100}%`, top: 0 }}
          >
            {t.label}
          </span>
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="flex justify-between mt-1">
        <span className="text-2xs text-text-muted">{fmt(minPrice)}</span>
        <span className="text-2xs text-text-muted">{fmt(maxPrice)}</span>
      </div>
    </div>
  );
}
