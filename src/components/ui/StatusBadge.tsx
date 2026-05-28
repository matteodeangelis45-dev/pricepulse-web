import type { ProductStatus } from '../../lib/database.types';

const config: Record<ProductStatus, { label: string; className: string; dot: string }> = {
  tracking: {
    label: 'Tracking',
    className: 'bg-border text-text-secondary border border-border-strong',
    dot: 'bg-text-muted',
  },
  target_reached: {
    label: 'Target Reached',
    className: 'bg-warning/10 text-warning border border-warning/20',
    dot: 'bg-warning',
  },
  price_dropped: {
    label: 'Price Dropped',
    className: 'bg-success/10 text-success border border-success/20',
    dot: 'bg-success',
  },
  price_increased: {
    label: 'Price Increased',
    className: 'bg-error/10 text-error border border-error/20',
    dot: 'bg-error',
  },
  unavailable: {
    label: 'Unavailable',
    className: 'bg-background-tertiary text-text-muted border border-border',
    dot: 'bg-text-muted',
  },
};

interface StatusBadgeProps {
  status: ProductStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { label, className, dot } = config[status] ?? config.tracking;
  return (
    <span className={`badge ${className} ${size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-2xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} flex-shrink-0`} />
      {label}
    </span>
  );
}
