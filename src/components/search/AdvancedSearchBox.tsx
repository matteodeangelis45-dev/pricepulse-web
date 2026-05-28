import { Search, Sparkles, TrendingUp } from 'lucide-react';
import { mockCategorySummaries, mockProducts } from '../../data/mockProducts';

interface AdvancedSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onCategorySelect?: (category: string) => void;
}

export function AdvancedSearchBox({ value, onChange, onCategorySelect }: AdvancedSearchBoxProps) {
  const suggestions = mockProducts
    .filter(product => value.length === 0 || product.title.toLowerCase().includes(value.toLowerCase()) || product.category.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 4);

  return (
    <div className="relative w-full">
      <Search size={14} className="absolute left-3 top-3.5 text-text-muted" />
      <input
        className="input pl-9 pr-3"
        placeholder="Search products, categories, retailers..."
        value={value}
        onChange={event => onChange(event.target.value)}
      />
      <div className="mt-3 rounded-3xl border border-border/70 bg-background-secondary/70 p-3 shadow-card backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3"><Sparkles size={13} className="text-brand-300" /><span className="text-xs font-semibold text-text-primary">Smart suggestions</span></div>
        <div className="grid sm:grid-cols-2 gap-2">
          {suggestions.map(product => (
            <button key={product.id} type="button" onClick={() => onChange(product.title)} className="rounded-2xl bg-background-tertiary/35 border border-border/60 p-3 text-left hover:border-success/25 transition-colors">
              <p className="text-xs font-semibold text-text-primary truncate">{product.title}</p>
              <p className="text-2xs text-text-muted mt-1">{product.category} · {product.retailer} · {product.tracking_count.toLocaleString()} tracking</p>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {mockCategorySummaries.slice(0, 5).map(category => (
            <button key={category.category} type="button" onClick={() => onCategorySelect?.(category.category)} className="badge bg-brand-800/25 text-brand-300 border border-brand-500/20 hover:border-success/25 transition-colors">
              <TrendingUp size={11} /> {category.category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
