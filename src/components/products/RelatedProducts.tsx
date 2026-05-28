import { ArrowUpRight } from 'lucide-react';
import { mockProducts } from '../../data/mockProducts';
import { mockPriceHistory } from '../../data/mockPriceHistory';
import { getDiscountPercent, getSparklineValues } from '../../lib/chartUtils';
import type { Product } from '../../lib/database.types';
import { formatCurrency } from '../ui/PriceChange';

interface RelatedProductsProps {
  product: Product;
}

function inferCategory(title: string) {
  const text = title.toLowerCase();
  if (text.includes('rtx') || text.includes('gpu')) return 'GPUs';
  if (text.includes('iphone')) return 'Smartphones';
  if (text.includes('macbook') || text.includes('laptop')) return 'Laptops';
  if (text.includes('monitor') || text.includes('odyssey')) return 'Monitors';
  if (text.includes('playstation') || text.includes('steam')) return 'Gaming';
  return 'Audio';
}

function MiniChart({ values }: { values: readonly number[] }) {
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${100 - value}`).join(' ');
  return <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-8 w-20"><polyline points={points} fill="none" stroke="#00C896" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function RelatedProducts({ product }: RelatedProductsProps) {
  const category = inferCategory(product.title);
  const related = mockProducts.filter(item => item.category === category || item.title.toLowerCase().includes(product.store?.toLowerCase() ?? '')).slice(0, 3);

  return (
    <section className="space-y-4">
      <div><p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Related products</p><h2 className="text-base font-semibold text-text-primary tracking-tight">Comparable market opportunities</h2></div>
      <div className="grid md:grid-cols-3 gap-4">
        {related.map(item => {
          const history = mockPriceHistory.filter(point => point.product_id === item.id);
          const discount = getDiscountPercent(item.current_price, item.previous_price);
          return (
            <div key={item.id} className="card card-hover p-4">
              <div className="h-28 rounded-2xl overflow-hidden border border-border/60 mb-3"><img src={item.image} alt={item.title} className="h-full w-full object-cover" loading="lazy" /></div>
              <div className="flex items-center justify-between gap-2 mb-2"><span className="badge bg-success/10 text-success border border-success/20">-{discount}%</span><ArrowUpRight size={13} className="text-text-muted" /></div>
              <h3 className="text-sm font-semibold text-text-primary line-clamp-2 min-h-[40px]">{item.title}</h3>
              <div className="flex items-end justify-between mt-3"><div><p className="text-lg font-semibold text-text-primary font-mono">{formatCurrency(item.current_price)}</p><p className="text-xs text-text-muted">{item.retailer}</p></div><MiniChart values={getSparklineValues(history)} /></div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
