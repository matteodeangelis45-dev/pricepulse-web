import { Bell, Mail, Store, Zap } from 'lucide-react';
import type { Product } from '../../lib/database.types';
import { formatCurrency } from '../ui/PriceChange';

interface PremiumAlertModalProps {
  product: Product;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function PremiumAlertModal({ product, value, onChange, onClose, onSave }: PremiumAlertModalProps) {
  const current = product.current_price ?? 0;
  const numericValue = Number(value) || current;
  const min = Math.max(1, Math.floor(current * 0.65));
  const max = Math.max(min + 1, Math.ceil(current * 1.05));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl card premium-panel p-6 animate-slide-up overflow-hidden">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-success/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Premium alert</p>
            <h3 className="text-xl font-semibold text-text-primary">Create a smarter price alert</h3>
            <p className="text-sm text-text-secondary mt-2">Set a target for {product.title}. PricePulse will keep the signal quiet until it matters.</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 text-text-muted">×</button>
        </div>

        <div className="relative space-y-5">
          <div className="rounded-3xl bg-background-tertiary/35 border border-border/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-text-primary">Target price</span>
              <span className="text-xl font-semibold text-success font-mono">{formatCurrency(numericValue, product.currency)}</span>
            </div>
            <input type="range" min={min} max={max} value={Math.min(max, Math.max(min, numericValue))} onChange={event => onChange(event.target.value)} className="w-full accent-[#00C896]" />
            <div className="flex justify-between text-2xs text-text-muted mt-2"><span>{formatCurrency(min, product.currency)}</span><span>Current {formatCurrency(current, product.currency)}</span><span>{formatCurrency(max, product.currency)}</span></div>
            <input className="input mt-4" value={value} onChange={event => onChange(event.target.value)} />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <Option icon={<Store size={14} />} title="Retailer" body={product.store ?? 'Any verified retailer'} />
            <Option icon={<Zap size={14} />} title="Frequency" body="Instant alerts" />
            <Option icon={<Mail size={14} />} title="Preview" body="Push + email ready" />
          </div>

          <div className="rounded-3xl bg-success/10 border border-success/20 p-4 flex items-start gap-3">
            <Bell size={16} className="text-success mt-0.5" />
            <p className="text-sm text-text-secondary leading-relaxed">Notification preview: “{product.title} reached {formatCurrency(numericValue, product.currency)} at {product.store ?? 'a verified retailer'}.”</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onSave} className="btn-primary flex-1">Create alert</button>
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Option({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-background-tertiary/35 border border-border/60 p-3">
      <div className="flex items-center gap-2 text-brand-300 mb-2">{icon}<span className="text-xs font-semibold uppercase tracking-[0.16em]">{title}</span></div>
      <p className="text-xs text-text-secondary">{body}</p>
    </div>
  );
}
