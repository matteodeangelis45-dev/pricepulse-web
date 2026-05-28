import { useEffect, useState, useCallback, useRef } from 'react';
import { Package, Plus, Filter, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProductCard } from '../components/products/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { AdvancedSearchBox } from '../components/search/AdvancedSearchBox';
import type { Product, ProductStatus, UserTracking } from '../lib/database.types';

interface ProductsPageProps {
  onAddProduct: () => void;
  onViewProduct: (id: string) => void;
  refreshKey: number;
}

interface ProductWithTracking extends Product {
  user_tracking: UserTracking[] | null;
}

const STATUS_FILTERS: { label: string; value: ProductStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Tracking', value: 'tracking' },
  { label: 'Price Dropped', value: 'price_dropped' },
  { label: 'Target Reached', value: 'target_reached' },
  { label: 'Price Increased', value: 'price_increased' },
];

const PRODUCTS_TIMEOUT_MS = 10000;

function devLog(message: string, payload?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[PricePulse products] ${message}`, payload ?? '');
  }
}

export function ProductsPage({ onAddProduct, onViewProduct, refreshKey }: ProductsPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const loadProducts = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!user) {
      setProducts([]);
      setLoading(false);
      setErrorMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    devLog('Loading started', { requestId, userId: user.id, refreshKey });

    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Products request timed out.')), PRODUCTS_TIMEOUT_MS);
    });

    try {
      const { data, error } = await Promise.race([
        supabase
          .from('products')
          .select('*, user_tracking!user_tracking_product_id_fkey(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        timeout,
      ]);

      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      if (error) throw new Error(error.message);
      setProducts((data ?? []) as ProductWithTracking[]);
      devLog('Loading succeeded', { requestId, products: data?.length ?? 0 });
    } catch (err) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to load products.';
      console.error('Failed to load products:', message);
      setErrorMessage(message);
      toast('error', 'Failed to load products.');
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
        devLog('Loading finished', { requestId });
      }
    }
  }, [user, toast, refreshKey]);

  useEffect(() => {
    mountedRef.current = true;
    void loadProducts();
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [loadProducts]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        devLog('Tab visible, refreshing products');
        void loadProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadProducts, user]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast('error', 'Failed to remove product.');
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    toast('success', 'Product removed from tracking.');
  };

  const filtered = products.filter(p => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.store ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <PageLoader />;

  if (errorMessage) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="card premium-panel p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-3xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
            <Package size={20} className="text-warning" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Products recovery</p>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">We couldn’t refresh your products.</h2>
          <p className="text-sm text-text-secondary mt-3 max-w-xl mx-auto">{errorMessage}</p>
          <button onClick={() => void loadProducts()} className="btn-primary mt-6">
            Retry products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="card premium-panel p-5 mb-5">
        <div className="flex flex-col lg:flex-row items-start gap-4">
          <div className="flex-1 w-full">
            <AdvancedSearchBox value={search} onChange={setSearch} onCategorySelect={setSearch} />
          </div>
          <button onClick={onAddProduct} className="btn-primary flex-shrink-0">
            <Plus size={14} />
            Add Product
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={13} className="text-text-muted flex-shrink-0" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                statusFilter === f.value
                  ? 'bg-brand-800 text-text-primary'
                  : 'bg-background-tertiary text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card premium-panel">
          <EmptyState
            icon={search || statusFilter !== 'all' ? <Sparkles size={22} /> : <Package size={22} />}
            title={search || statusFilter !== 'all' ? 'No signal matches this search yet' : 'Start your first intelligent watchlist'}
            description={
              search || statusFilter !== 'all'
                ? 'Try a trending category, retailer, or product family from the smart suggestions.'
                : 'Track a product once and PricePulse will monitor pricing, targets, alerts, and buying windows for you.'
            }
            action={
              !search && statusFilter === 'all' ? (
                <button onClick={onAddProduct} className="btn-primary">
                  <Plus size={14} />
                  Track your first product
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
              {statusFilter !== 'all' && ` · ${STATUS_FILTERS.find(f => f.value === statusFilter)?.label}`}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => onViewProduct(product.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
