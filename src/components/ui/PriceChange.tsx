import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface PriceChangeProps {
  previous: number | null;
  current: number | null;
  currency?: string;
  showAmount?: boolean;
}

export function PriceChange({ previous, current, currency = 'USD', showAmount = false }: PriceChangeProps) {
  if (previous === null || current === null) {
    return <span className="text-text-muted text-sm">—</span>;
  }

  const diff = current - previous;
  const pct = previous === 0 ? 0 : (diff / previous) * 100;

  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency });

  if (diff === 0) {
    return (
      <span className="flex items-center gap-1 text-text-muted text-sm">
        <Minus size={12} />
        <span>0%</span>
      </span>
    );
  }

  if (diff < 0) {
    return (
      <span className="flex items-center gap-1 text-success text-sm font-medium">
        <TrendingDown size={13} />
        <span>{Math.abs(pct).toFixed(1)}%</span>
        {showAmount && <span className="text-success/70">({formatter.format(Math.abs(diff))})</span>}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-error text-sm font-medium">
      <TrendingUp size={13} />
      <span>+{pct.toFixed(1)}%</span>
      {showAmount && <span className="text-error/70">(+{formatter.format(diff)})</span>}
    </span>
  );
}

export function formatCurrency(amount: number | null, currency = 'USD') {
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
