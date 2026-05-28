import { ShieldCheck, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency } from '../ui/PriceChange';
import { InsightStatusBadge, type InsightStatus } from './InsightStatusBadge';

export interface ProductInsight {
  id: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  currency: string;
  historicalAverageDeltaPct: number;
  buyConfidence: 'High' | 'Strong' | 'Measured';
  status: InsightStatus;
}

interface ProductInsightCardProps {
  product: ProductInsight;
}

export function ProductInsightCard({ product }: ProductInsightCardProps) {
  const isBelowAverage = product.historicalAverageDeltaPct < 0;
  const deltaLabel = `${isBelowAverage ? '' : '+'}${product.historicalAverageDeltaPct.toFixed(1)}%`;

  return (
    <article className="card card-hover group overflow-hidden cursor-default">
      <div className="aspect-[4/3] bg-background-tertiary/50 border-b border-border/60 overflow-hidden relative">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover opacity-90 group-hover:scale-[1.03] group-hover:opacity-100 transition-all duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background-secondary/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <InsightStatusBadge status={product.status} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">{product.title}</h3>
          <p className="text-2xl font-semibold tracking-tight text-text-primary font-mono mt-2">
            {formatCurrency(product.currentPrice, product.currency)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-background-tertiary/45 border border-border/60 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted font-medium">vs avg</p>
            <div className={`flex items-center gap-1.5 mt-1 text-sm font-semibold ${isBelowAverage ? 'text-success' : 'text-text-secondary'}`}>
              {isBelowAverage ? <TrendingDown size={13} /> : <Minus size={13} />}
              <span>{deltaLabel}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-background-tertiary/45 border border-border/60 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted font-medium">confidence</p>
            <div className="flex items-center gap-1.5 mt-1 text-sm font-semibold text-brand-200">
              <ShieldCheck size={13} />
              <span>{product.buyConfidence}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
