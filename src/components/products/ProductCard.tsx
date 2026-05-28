import { ExternalLink, Trash2, Target } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { formatCurrency } from '../ui/PriceChange';
import type { Product } from '../../lib/database.types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onDelete: (id: string) => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ProductCard({ product, onClick, onDelete }: ProductCardProps) {
  const priceDiff = product.current_price !== null && product.target_price !== null
    ? product.current_price - product.target_price
    : null;
  const targetPct = product.current_price && product.target_price
    ? ((product.current_price - product.target_price) / product.current_price) * 100
    : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove "${product.title}" from tracking?`)) {
      onDelete(product.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="card card-hover p-4 cursor-pointer group relative"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-primary truncate leading-tight">{product.title}</h3>
          <p className="text-xs text-text-muted mt-0.5 truncate">{product.store || new URL(product.url).hostname.replace('www.', '')}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <StatusBadge status={product.status} />
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink size={12} />
          </a>
          <button
            onClick={handleDelete}
            className="btn-ghost p-1 opacity-0 group-hover:opacity-100 transition-opacity text-error hover:text-error hover:bg-error/10"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Price display */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-text-muted mb-0.5">Current Price</p>
          <p className="text-2xl font-bold text-text-primary tracking-tight">
            {formatCurrency(product.current_price, product.currency)}
          </p>
        </div>
        {product.target_price !== null && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-text-muted mb-0.5 justify-end">
              <Target size={10} />
              <span>Target</span>
            </div>
            <p className={`text-sm font-semibold ${priceDiff !== null && priceDiff <= 0 ? 'text-success' : 'text-warning'}`}>
              {formatCurrency(product.target_price, product.currency)}
            </p>
          </div>
        )}
      </div>

      {/* Progress toward target */}
      {targetPct !== null && product.current_price !== null && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-2xs text-text-muted">
              {priceDiff !== null && priceDiff > 0
                ? `${formatCurrency(priceDiff, product.currency)} above target`
                : priceDiff !== null && priceDiff <= 0
                ? 'Target reached!'
                : ''}
            </span>
            <span className={`text-2xs font-medium ${targetPct <= 0 ? 'text-success' : 'text-text-muted'}`}>
              {targetPct <= 0 ? '100%' : `${(100 - Math.min(targetPct, 100)).toFixed(0)}%`}
            </span>
          </div>
          <div className="h-1 bg-background-tertiary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${targetPct <= 0 ? 'bg-success' : 'bg-warning'}`}
              style={{ width: `${Math.min(100, Math.max(2, 100 - targetPct))}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-2xs text-text-muted">Updated {timeAgo(product.last_scraped_at)}</span>
      </div>
    </div>
  );
}
