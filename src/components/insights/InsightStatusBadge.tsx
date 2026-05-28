export type InsightStatus = 'rare_deal' | 'high_convenience' | 'price_dropping' | 'stable_price';

const statusConfig: Record<InsightStatus, { label: string; className: string; dot: string }> = {
  rare_deal: {
    label: 'Rare Deal',
    className: 'bg-warning/10 text-warning border border-warning/20',
    dot: 'bg-warning',
  },
  high_convenience: {
    label: 'High Convenience',
    className: 'bg-brand-800/30 text-brand-200 border border-brand-500/20',
    dot: 'bg-brand-300',
  },
  price_dropping: {
    label: 'Price Dropping',
    className: 'bg-success/10 text-success border border-success/20',
    dot: 'bg-success',
  },
  stable_price: {
    label: 'Stable Price',
    className: 'bg-background-tertiary/70 text-text-secondary border border-border/80',
    dot: 'bg-text-muted',
  },
};

interface InsightStatusBadgeProps {
  status: InsightStatus;
}

export function InsightStatusBadge({ status }: InsightStatusBadgeProps) {
  const { label, className, dot } = statusConfig[status];

  return (
    <span className={`badge ${className} px-2.5 py-1 text-2xs`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
      {label}
    </span>
  );
}
