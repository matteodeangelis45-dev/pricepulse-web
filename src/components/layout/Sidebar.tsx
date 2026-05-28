import { LayoutDashboard, Package, Bell, Settings, TrendingDown, X, ChevronRight, Activity, GitCompare, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Page = 'dashboard' | 'products' | 'market' | 'compare' | 'categories' | 'alerts' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  unreadAlerts: number;
}

const navItems: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'market', label: 'Market', icon: Activity },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ currentPage, onNavigate, mobileOpen, onMobileClose, unreadAlerts }: SidebarProps) {
  const { profile, user } = useAuth();

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-6 border-b border-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-brand-700/80 border border-brand-500/20 flex items-center justify-center shadow-glow">
            <TrendingDown size={16} className="text-brand-100" />
          </div>
          <span className="text-base font-semibold text-text-primary tracking-tight">PricePulse</span>
        </div>
        <button
          onClick={onMobileClose}
          className="lg:hidden btn-ghost p-1.5"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { onNavigate(id); onMobileClose(); }}
            className={`nav-item w-full group ${currentPage === id ? 'nav-item-active' : ''}`}
          >
            <Icon size={16} className={currentPage === id ? 'text-brand-200' : ''} />
            <span className="flex-1 text-left">{label}</span>
            {id === 'alerts' && unreadAlerts > 0 && (
              <span className="badge bg-warning/15 text-warning border border-warning/20 font-semibold">
                {unreadAlerts > 99 ? '99+' : unreadAlerts}
              </span>
            )}
            {currentPage === id && <ChevronRight size={12} className="text-text-muted" />}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-5 pt-4 border-t border-border/70">
        <button
          onClick={() => { onNavigate('settings'); onMobileClose(); }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-background-tertiary/70 transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-2xl bg-brand-800/60 border border-brand-500/20 flex items-center justify-center text-xs font-semibold text-brand-100 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
          <ChevronRight size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-background-secondary/80 border-r border-border/70 flex-shrink-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-background/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-64 bg-background-secondary border-r border-border flex flex-col animate-slide-in-right">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
