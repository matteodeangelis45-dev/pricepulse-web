import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Package, TrendingDown, Target, Bell, ArrowUpRight, Plus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { formatCurrency } from '../components/ui/PriceChange';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductInsightCard, type ProductInsight } from '../components/insights/ProductInsightCard';
import { ProductEcosystemPrototype } from '../components/product-experience/ProductEcosystemPrototype';
import { MarketTrendsSection } from '../components/dashboard/MarketTrendsSection';
import { LiveActivityFeed } from '../components/dashboard/LiveActivityFeed';
import {
  MostTrackedThisWeekSection,
  PricePulseInsightsGrid,
  SmartSavingsSummary,
  TodaysBestDealsSection,
  TrustSignalStrip,
} from '../components/dashboard/RetentionDashboardSections';
import {
  AdvancedDiscoverySystem,
  AdvancedSavingsAnalytics,
  GlobalIntelligenceDashboard,
  LiveDealStream,
  MarketStatusSystem,
  PricePulseMarketIndex,
  ProNotificationArchitecture,
} from '../components/dashboard/Phase9PlatformSections';
import type { Product, Alert, UserTracking } from '../lib/database.types';

interface DashboardPageProps {
  onAddProduct: () => void;
  onViewProduct: (id: string) => void;
  refreshKey: number;
}

interface TrackedProductRow extends Product {
  user_tracking: UserTracking[] | null;
}

type DashboardStatus = 'loading' | 'success' | 'empty' | 'error' | 'reconnecting';
const DASHBOARD_TIMEOUT_MS = 10000;

function devLog(message: string, payload?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[PricePulse dashboard] ${message}`, payload ?? '');
  }
}

const opportunityProducts: ProductInsight[] = [
  {
    id: 'opportunity-1',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=80',
    currentPrice: 298,
    currency: 'USD',
    historicalAverageDeltaPct: -18.6,
    buyConfidence: 'Strong',
    status: 'rare_deal',
  },
  {
    id: 'opportunity-2',
    title: 'Apple Watch Series 9 GPS Aluminium Case',
    imageUrl: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=900&q=80',
    currentPrice: 329,
    currency: 'USD',
    historicalAverageDeltaPct: -11.2,
    buyConfidence: 'High',
    status: 'price_dropping',
  },
  {
    id: 'opportunity-3',
    title: 'LG UltraFine 27-inch 4K Productivity Monitor',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
    currentPrice: 449,
    currency: 'USD',
    historicalAverageDeltaPct: -14.8,
    buyConfidence: 'Strong',
    status: 'rare_deal',
  },
  {
    id: 'opportunity-4',
    title: 'Logitech MX Master 3S Performance Mouse',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=900&q=80',
    currentPrice: 84,
    currency: 'USD',
    historicalAverageDeltaPct: -7.4,
    buyConfidence: 'High',
    status: 'high_convenience',
  },
  {
    id: 'opportunity-5',
    title: 'Kindle Paperwhite Signature Edition',
    imageUrl: 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=900&q=80',
    currentPrice: 149,
    currency: 'USD',
    historicalAverageDeltaPct: -9.9,
    buyConfidence: 'Measured',
    status: 'stable_price',
  },
  {
    id: 'opportunity-6',
    title: 'Anker 737 GaNPrime 120W USB-C Charger',
    imageUrl: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=900&q=80',
    currentPrice: 74,
    currency: 'USD',
    historicalAverageDeltaPct: -13.1,
    buyConfidence: 'High',
    status: 'price_dropping',
  },
  {
    id: 'opportunity-7',
    title: 'iPad Air 11-inch Wi‑Fi 128GB',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80',
    currentPrice: 549,
    currency: 'USD',
    historicalAverageDeltaPct: -6.8,
    buyConfidence: 'Measured',
    status: 'stable_price',
  },
  {
    id: 'opportunity-8',
    title: 'Bose QuietComfort Ultra Earbuds',
    imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
    currentPrice: 229,
    currency: 'USD',
    historicalAverageDeltaPct: -16.3,
    buyConfidence: 'Strong',
    status: 'rare_deal',
  },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function DashboardPage({ onAddProduct, onViewProduct, refreshKey }: DashboardPageProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<TrackedProductRow[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<DashboardStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);
  const hasLoadedDataRef = useRef(false);

  const loadData = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!user) {
      setProducts([]);
      setAlerts([]);
      setLoading(false);
      setStatus('empty');
      setErrorMessage(null);
      return;
    }

    const hadExistingData = hasLoadedDataRef.current;
    setLoading(true);
    setStatus(hadExistingData ? 'reconnecting' : 'loading');
    setErrorMessage(null);
    devLog('Loading started', { requestId, userId: user.id, refreshKey });

    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Dashboard request timed out.')), DASHBOARD_TIMEOUT_MS);
    });

    try {
      const [{ data: prods, error: prodErr }, { data: alts, error: alertErr }] = await Promise.race([
        Promise.all([
          supabase
            .from('products')
            .select('*, user_tracking!user_tracking_product_id_fkey(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('alerts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ]),
        timeout,
      ]);

      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      if (prodErr || alertErr) {
        const message = prodErr?.message ?? alertErr?.message ?? 'Dashboard data could not be loaded.';
        throw new Error(message);
      }

      const nextProducts = (prods ?? []) as TrackedProductRow[];
      const nextAlerts = alts ?? [];
      setProducts(nextProducts);
      setAlerts(nextAlerts);
      hasLoadedDataRef.current = nextProducts.length > 0 || nextAlerts.length > 0;
      setStatus(nextProducts.length === 0 && nextAlerts.length === 0 ? 'empty' : 'success');
      devLog('Loading succeeded', { requestId, products: nextProducts.length, alerts: nextAlerts.length });
    } catch (err) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      const message = err instanceof Error ? err.message : 'Dashboard data could not be loaded.';
      console.error('Failed to load dashboard:', message);
      setErrorMessage(message);
      setStatus('error');
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
        devLog('Loading finished', { requestId });
      }
    }
  }, [user, refreshKey]);

  useEffect(() => {
    mountedRef.current = true;
    void loadData();
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [loadData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        devLog('Tab visible, reconnecting dashboard');
        void loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadData, user]);

  const totalTracked = products.length;
  const dashboardMetrics = useMemo(() => ({
    droppedCount: products.filter(p => p.status === 'price_dropped').length,
    targetReachedCount: products.filter(p => p.status === 'target_reached').length,
    unreadAlerts: alerts.filter(a => !a.is_read).length,
    recentProducts: products.slice(0, 6),
  }), [products, alerts]);

  const { droppedCount, targetReachedCount, unreadAlerts, recentProducts } = dashboardMetrics;

  if (loading && status === 'loading') return <PageLoader />;

  if (status === 'error') {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="card premium-panel p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-3xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
            <Bell size={20} className="text-warning" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Dashboard recovery</p>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">We couldn’t refresh your dashboard.</h2>
          <p className="text-sm text-text-secondary mt-3 max-w-xl mx-auto">
            {errorMessage ?? 'The request took too long or the session needed a refresh. PricePulse stopped loading safely so you can retry.'}
          </p>
          <button onClick={() => void loadData()} className="btn-primary mt-6">
            Retry dashboard
          </button>
        </div>
      </div>
    );
  }

  const alertColors: Record<string, string> = {
    price_drop: 'bg-success/10 text-success border-success/20',
    target_reached: 'bg-warning/10 text-warning border-warning/20',
    price_increase: 'bg-error/10 text-error border-error/20',
    back_in_stock: 'bg-brand-800/20 text-brand-400 border-brand-700/20',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="card premium-panel p-6 lg:p-7 overflow-hidden relative">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-brand-600/10 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-3">Price intelligence</p>
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-text-primary">Track signals, not noise.</h2>
            <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
              Monitor your watched products with a calmer view of price movements, targets, and recent alerts.
            </p>
          </div>
          <button onClick={onAddProduct} className="btn-primary self-start lg:self-auto">
            <Plus size={14} />
            Add product
          </button>
        </div>
      </div>

      <GlobalIntelligenceDashboard />

      <TrustSignalStrip />

      <MarketStatusSystem />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em]">Tracked</span>
            <div className="w-9 h-9 rounded-2xl bg-background-tertiary/70 border border-border/70 flex items-center justify-center">
              <Package size={14} className="text-text-secondary" />
            </div>
          </div>
          <p className="text-3xl font-semibold tracking-tight text-text-primary">{totalTracked}</p>
          <p className="text-xs text-text-muted mt-1">Products</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em]">Dropped</span>
            <div className="w-9 h-9 rounded-2xl bg-success/10 border border-success/15 flex items-center justify-center">
              <TrendingDown size={14} className="text-success" />
            </div>
          </div>
          <p className="text-3xl font-semibold tracking-tight text-success">{droppedCount}</p>
          <p className="text-xs text-text-muted mt-1">Price drops</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em]">Targets</span>
            <div className="w-9 h-9 rounded-2xl bg-warning/10 border border-warning/15 flex items-center justify-center">
              <Target size={14} className="text-warning" />
            </div>
          </div>
          <p className="text-3xl font-semibold tracking-tight text-warning">{targetReachedCount}</p>
          <p className="text-xs text-text-muted mt-1">Reached</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] text-text-muted font-medium uppercase tracking-[0.18em]">Alerts</span>
            <div className="w-9 h-9 rounded-2xl bg-brand-800/30 border border-brand-500/15 flex items-center justify-center">
              <Bell size={14} className="text-brand-300" />
            </div>
          </div>
          <p className="text-3xl font-semibold tracking-tight text-text-primary">{unreadAlerts}</p>
          <p className="text-xs text-text-muted mt-1">Unread</p>
        </div>
      </div>

      <SmartSavingsSummary trackedCount={totalTracked} alertCount={unreadAlerts} />

      <AdvancedSavingsAnalytics />

      <PricePulseInsightsGrid />

      <TodaysBestDealsSection />

      <MostTrackedThisWeekSection />

      <LiveDealStream />

      <PricePulseMarketIndex />

      <AdvancedDiscoverySystem />

      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Curated signals</p>
            <h2 className="text-base font-semibold text-text-primary tracking-tight">Best Opportunities Today</h2>
            <p className="text-xs text-text-muted mt-1 max-w-2xl">
              A calm shortlist of products currently priced below their usual range, ranked by buying confidence.
            </p>
          </div>
          <span className="badge bg-background-tertiary/60 text-text-secondary border border-border/80 self-start sm:self-auto">
            Mock insights
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {opportunityProducts.slice(0, 10).map(product => (
            <ProductInsightCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <MarketTrendsSection />

      <LiveActivityFeed />

      <ProNotificationArchitecture />

      <ProductEcosystemPrototype />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Products table */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary tracking-tight">Recent Products</h2>
              <p className="text-xs text-text-muted mt-1">Latest tracked items and target progress</p>
            </div>
            <button onClick={onAddProduct} className="btn-ghost text-xs gap-1.5 text-brand-300">
              <Plus size={12} />
              Add product
            </button>
          </div>

          {recentProducts.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<Package size={22} />}
                title="No products tracked yet"
                description="Add your first product URL to start monitoring price changes."
                action={
                  <button onClick={onAddProduct} className="btn-primary">
                    <Plus size={14} />
                    Track your first product
                  </button>
                }
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/70 bg-background-tertiary/20">
                      <th className="text-left px-5 py-4 text-[11px] font-medium text-text-muted uppercase tracking-[0.18em]">Product</th>
                      <th className="text-right px-5 py-4 text-[11px] font-medium text-text-muted uppercase tracking-[0.18em] hidden sm:table-cell">Current</th>
                      <th className="text-right px-5 py-4 text-[11px] font-medium text-text-muted uppercase tracking-[0.18em] hidden md:table-cell">Target</th>
                      <th className="text-center px-5 py-4 text-[11px] font-medium text-text-muted uppercase tracking-[0.18em]">Status</th>
                      <th className="text-right px-5 py-4 text-[11px] font-medium text-text-muted uppercase tracking-[0.18em] hidden lg:table-cell">Updated</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {recentProducts.map(product => {
                      const trackingTarget = product.user_tracking?.[0]?.target_price ?? product.target_price;
                      return (
                        <tr
                          key={product.id}
                          onClick={() => onViewProduct(product.id)}
                          className="border-b border-border/60 last:border-0 hover:bg-background-tertiary/35 transition-colors cursor-pointer group"
                        >
                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-text-primary truncate max-w-[180px]">{product.title}</p>
                            <p className="text-xs text-text-muted truncate">{product.store || '—'}</p>
                          </td>
                          <td className="px-5 py-4 text-right hidden sm:table-cell">
                            <span className="text-sm font-semibold text-text-primary font-mono">
                              {formatCurrency(product.current_price, product.currency)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right hidden md:table-cell">
                            {trackingTarget ? (
                              <span className={`text-sm font-medium font-mono ${
                                product.current_price !== null && product.current_price <= trackingTarget
                                  ? 'text-success'
                                  : 'text-warning'
                              }`}>
                                {formatCurrency(trackingTarget, product.currency)}
                              </span>
                            ) : (
                              <span className="text-text-muted text-sm">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="px-5 py-4 text-right hidden lg:table-cell">
                            <span className="text-xs text-text-muted">{timeAgo(product.last_scraped_at)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <ArrowUpRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Alerts sidebar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary tracking-tight">Recent Alerts</h2>
              <p className="text-xs text-text-muted mt-1">Important price events</p>
            </div>
            {unreadAlerts > 0 && (
              <span className="badge bg-warning/10 text-warning border border-warning/20">{unreadAlerts} new</span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<Bell size={20} />}
                title="No alerts yet"
                description="You'll be notified when prices change or targets are reached."
              />
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`card p-4 border ${alertColors[alert.type] ?? 'border-border'} ${!alert.is_read ? 'opacity-100' : 'opacity-60'}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      alert.type === 'price_drop' ? 'bg-success' :
                      alert.type === 'target_reached' ? 'bg-warning' :
                      alert.type === 'price_increase' ? 'bg-error' : 'bg-brand-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-primary leading-relaxed">{alert.message}</p>
                      <p className="text-2xs text-text-muted mt-1">{timeAgo(alert.created_at)}</p>
                    </div>
                    {!alert.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-warning flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {products.length > 6 && (
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingDown size={16} className="text-text-muted" />
            <span className="text-sm text-text-secondary">
              Showing 6 of <span className="text-text-primary font-medium">{products.length}</span> tracked products
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
