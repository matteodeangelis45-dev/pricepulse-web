import { Menu, Bell, Plus, RefreshCw } from 'lucide-react';

type Page = 'dashboard' | 'products' | 'market' | 'compare' | 'categories' | 'alerts' | 'settings';

interface HeaderProps {
  currentPage: Page;
  onMobileMenuOpen: () => void;
  onAddProduct: () => void;
  unreadAlerts: number;
  onNavigate: (page: Page) => void;
}

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your tracked products' },
  products: { title: 'Products', subtitle: 'Manage your price tracking list' },
  market: { title: 'Market', subtitle: 'Live deal and category intelligence' },
  compare: { title: 'Compare', subtitle: 'Side-by-side product intelligence' },
  categories: { title: 'Categories', subtitle: 'Category-level market intelligence' },
  alerts: { title: 'Alerts', subtitle: 'Price change notifications' },
  settings: { title: 'Settings', subtitle: 'Account and preferences' },
};

export function Header({ currentPage, onMobileMenuOpen, onAddProduct, unreadAlerts, onNavigate }: HeaderProps) {
  const { title, subtitle } = pageTitles[currentPage];

  return (
    <header className="flex items-center justify-between px-4 lg:px-8 h-20 border-b border-border/70 bg-background-secondary/50 glass flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden btn-ghost p-2"
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-text-primary leading-tight tracking-tight">{title}</h1>
          <p className="text-xs text-text-secondary hidden sm:block mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="btn-ghost p-2 relative"
          onClick={() => onNavigate('alerts')}
          title="Alerts"
        >
          <Bell size={16} />
          {unreadAlerts > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-warning animate-pulse-soft shadow-glow-amber" />
          )}
        </button>
        <button
          className="btn-ghost p-2"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
        <button onClick={onAddProduct} className="btn-primary gap-1.5 px-3.5 py-2.5 text-xs">
          <Plus size={14} />
          <span className="hidden sm:inline">Add Product</span>
        </button>
      </div>
    </header>
  );
}
