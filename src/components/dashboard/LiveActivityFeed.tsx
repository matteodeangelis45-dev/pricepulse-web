import { useEffect, useMemo, useState } from 'react';
import { Bell, Radio, TrendingDown, Users } from 'lucide-react';
import { mockActivity, mockProducts } from '../../data/mockProducts';
import type { PlatformActivityItem } from '../../types/platform.types';

const icons = {
  price_drop: TrendingDown,
  watchlist: Users,
  alert: Bell,
  lowest_price: TrendingDown,
  stock: Radio,
};

export function LiveActivityFeed() {
  const [items, setItems] = useState<PlatformActivityItem[]>(mockActivity);

  const generated = useMemo(() => mockProducts.map((product, index) => ({
    id: `generated-${product.id}`,
    product_id: product.id,
    type: index % 3 === 0 ? 'price_drop' : index % 3 === 1 ? 'watchlist' : 'alert',
    message: index % 3 === 0 ? `${product.title} moved below its 30-day average` : index % 3 === 1 ? `${Math.round(product.tracking_count / 132)} users started tracking ${product.title}` : `New target alerts created for ${product.title}`,
    created_at: new Date(Date.now() - (index + 2) * 60 * 1000).toISOString(),
  })) as PlatformActivityItem[], []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setItems(prev => {
        const next = generated[Math.floor(Math.random() * generated.length)];
        return [{ ...next, id: `${next.id}-${Date.now()}`, created_at: new Date().toISOString() }, ...prev].slice(0, 6);
      });
    }, 8500);

    return () => window.clearInterval(interval);
  }, [generated]);

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Live signals</p>
          <h3 className="text-base font-semibold text-text-primary">Market activity feed</h3>
          <p className="text-xs text-text-muted mt-1">Recent price drops, tracking spikes, and alert activity.</p>
        </div>
        <span className="badge bg-success/10 text-success border border-success/20"><Radio size={12} className="animate-pulse" /> Live</span>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((item, index) => {
          const Icon = icons[item.type];
          return (
            <div key={item.id} className="rounded-2xl bg-background-tertiary/35 border border-border/70 p-4 flex items-start gap-3 hover:border-success/20 transition-colors">
              <div className={`mt-0.5 h-8 w-8 rounded-2xl flex items-center justify-center ${index === 0 ? 'bg-success/15 text-success animate-pulse-soft' : 'bg-brand-800/25 text-brand-300'}`}><Icon size={14} /></div>
              <div>
                <p className="text-sm font-medium text-text-primary leading-snug">{item.message}</p>
                <p className="text-xs text-text-muted mt-1">{index === 0 ? 'Updated moments ago' : `${index + 2} minutes ago`}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
