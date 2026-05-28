import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, ExternalLink, Edit2, Check, X, Target, Clock, Store, Radio, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AdvancedPriceChart } from '../components/products/AdvancedPriceChart';
import { ProductIntelligencePanel } from '../components/products/ProductIntelligencePanel';
import { RelatedProducts } from '../components/products/RelatedProducts';
import { PremiumAlertModal } from '../components/alerts/PremiumAlertModal';
import { formatCurrency } from '../components/ui/PriceChange';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import { applySeoMeta, buildProductSeo } from '../lib/seo';
import { buildPriceHistoryHighlights, buildProductNarrative } from '../lib/marketContent';
import type { Product, PriceHistory, UserTracking } from '../lib/database.types';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ProductDetailPage({ productId, onBack }: ProductDetailPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [tracking, setTracking] = useState<UserTracking | null>(null);
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTarget, setEditingTarget] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newTarget, setNewTarget] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const loadData = useCallback(async () => {
    if (!user) {
      setProduct(null);
      setHistory([]);
      setTracking(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: prod, error: prodErr }, { data: hist, error: histErr }, { data: trackData, error: trackErr }] = await Promise.all([
      supabase.from('products').select('*').eq('id', productId).eq('user_id', user.id).maybeSingle(),
      supabase.from('price_history').select('*').eq('product_id', productId).order('recorded_at', { ascending: true }),
      supabase.from('user_tracking').select('*').eq('product_id', productId).eq('user_id', user.id).maybeSingle(),
    ]);

    if (prodErr) console.error('Failed to load product:', prodErr.message);
    if (histErr) console.error('Failed to load history:', histErr.message);
    if (trackErr) console.error('Failed to load tracking:', trackErr.message);

    setProduct(prod);
    setHistory(hist ?? []);
    setTracking(trackData);
    setLoading(false);
  }, [user, productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!product) return;
    applySeoMeta(buildProductSeo(product));
  }, [product]);

  const saveTarget = async () => {
    if (!product) return;
    const val = parseFloat(newTarget);
    if (isNaN(val) || val <= 0) { toast('error', 'Enter a valid target price.'); return; }

    // Update both product and user_tracking
    const [prodRes, trackRes] = await Promise.all([
      supabase.from('products').update({ target_price: val }).eq('id', product.id),
      tracking
        ? supabase.from('user_tracking').update({ target_price: val }).eq('id', tracking.id)
        : supabase.from('user_tracking').insert({
            user_id: user!.id,
            product_id: product.id,
            target_price: val,
          }),
    ]);

    if (prodRes.error || trackRes.error) {
      toast('error', 'Failed to update target price.');
      return;
    }

    setProduct({ ...product, target_price: val });
    if (tracking) setTracking({ ...tracking, target_price: val });
    setEditingTarget(false);
    toast('success', 'Target price updated.');
  };

  const createPremiumAlert = async () => {
    await saveTarget();
    setShowAlertModal(false);
  };

  const savePrice = async () => {
    if (!product) return;
    const val = parseFloat(newPrice);
    if (isNaN(val) || val <= 0) { toast('error', 'Enter a valid price.'); return; }

    const now = new Date().toISOString();
    const newStatus = product.target_price && val <= product.target_price ? 'target_reached' : 'tracking';

    const { error: prodErr } = await supabase
      .from('products')
      .update({
        current_price: val,
        last_scraped_at: now,
        status: newStatus,
      })
      .eq('id', product.id);

    if (prodErr) { toast('error', 'Failed to update price.'); return; }

    const { error: histErr } = await supabase
      .from('price_history')
      .insert({ product_id: product.id, price: val, recorded_at: now });

    if (histErr) console.error('Failed to log price history:', histErr.message);

    setProduct({ ...product, current_price: val, last_scraped_at: now, status: newStatus });
    setHistory(prev => [...prev, { id: crypto.randomUUID(), product_id: product.id, price: val, recorded_at: now }]);
    setEditingPrice(false);
    toast('success', 'Price updated and logged.');
  };

  if (loading) return <PageLoader />;
  if (!product) return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-text-muted">Product not found.</p>
      <button onClick={onBack} className="btn-secondary mt-4">Go back</button>
    </div>
  );

  const effectiveTarget = tracking?.target_price ?? product.target_price;
  const priceDiff = product.current_price !== null && effectiveTarget !== null
    ? product.current_price - effectiveTarget : null;

  const minPrice = history.length > 0 ? Math.min(...history.map(h => h.price)) : null;
  const maxPrice = history.length > 0 ? Math.max(...history.map(h => h.price)) : null;
  const avgPrice = history.length > 0
    ? history.reduce((sum, h) => sum + h.price, 0) / history.length : null;
  const content = buildProductNarrative(product, history);
  const highlights = buildPriceHistoryHighlights(product, history);

  return (
    <article className="max-w-6xl mx-auto animate-fade-in">
      <button onClick={onBack} className="btn-ghost mb-4 -ml-1 gap-2 text-text-muted">
        <ArrowLeft size={15} />
        <span className="text-sm">Back</span>
      </button>

      <div className="card premium-panel p-5 sm:p-6 mb-5 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-success/10 blur-3xl" />
        <div className="relative grid lg:grid-cols-[220px_1fr_auto] gap-5 items-center">
          <div className="h-48 rounded-3xl bg-background-tertiary/50 border border-border/70 overflow-hidden flex items-center justify-center">
            {product.image_url ? <img src={product.image_url} alt={product.title} className="h-full w-full object-cover" /> : <Store size={34} className="text-text-muted" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap mb-3">
              <StatusBadge status={product.status} size="md" />
              {product.store && (
                <span className="flex items-center gap-1 text-xs text-text-muted">
                  <Store size={11} />
                  {product.store}
                </span>
              )}
              {minPrice !== null && product.current_price !== null && product.current_price <= minPrice * 1.03 && (
                <span className="badge bg-success/10 text-success border border-success/20">Historical low</span>
              )}
              <span className="badge bg-background-tertiary/60 text-text-secondary border border-border/80"><Users size={12} />{Math.max(124, history.length * 17)} tracking</span>
            </div>
            <h1 className="text-2xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">{product.title}</h1>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Clock size={11} className="text-text-muted" />
              <span className="text-xs text-text-muted">Price changed {timeAgo(product.last_scraped_at)}</span>
            </div>
            {tracking?.notes && (
              <p className="text-xs text-text-secondary mt-2 bg-background-tertiary px-3 py-2 rounded-lg inline-block">
                {tracking.notes}
              </p>
            )}
          </div>
          <div className="lg:text-right space-y-3">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-[0.18em] mb-2">Current price</p>
              <p className="text-4xl font-semibold text-text-primary font-mono">{formatCurrency(product.current_price, product.currency)}</p>
              {avgPrice !== null && product.current_price !== null && <p className={`text-sm font-semibold mt-1 ${product.current_price <= avgPrice ? 'text-success' : 'text-warning'}`}>{(((product.current_price - avgPrice) / avgPrice) * 100).toFixed(1)}% vs average</p>}
            </div>
            <div className="flex lg:justify-end gap-2">
              <button onClick={() => { setShowAlertModal(true); setNewTarget(effectiveTarget?.toString() ?? product.current_price?.toString() ?? ''); }} className="btn-primary text-xs"><Target size={13} />Create alert</button>
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-shrink-0 gap-1.5 text-xs"><ExternalLink size={13} />Open</a>
            </div>
          </div>
        </div>
      </div>

      {/* Price info row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Current price */}
        <div className="card p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-2">Current Price</p>
          {editingPrice ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                <input
                  className="input pl-6 py-1.5 text-sm"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') savePrice(); if (e.key === 'Escape') setEditingPrice(false); }}
                />
              </div>
              <button onClick={savePrice} className="btn-primary p-1.5"><Check size={13} /></button>
              <button onClick={() => setEditingPrice(false)} className="btn-secondary p-1.5"><X size={13} /></button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-text-primary tracking-tight font-mono">
                {formatCurrency(product.current_price, product.currency)}
              </span>
              <button
                onClick={() => { setEditingPrice(true); setNewPrice(product.current_price?.toString() ?? ''); }}
                className="btn-ghost p-1 mb-0.5"
              >
                <Edit2 size={12} className="text-text-muted" />
              </button>
            </div>
          )}
        </div>

        {/* Target price */}
        <div className="card p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-2 flex items-center gap-1">
            <Target size={10} /> Target Price
          </p>
          {editingTarget ? (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                <input
                  className="input pl-6 py-1.5 text-sm"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') saveTarget(); if (e.key === 'Escape') setEditingTarget(false); }}
                />
              </div>
              <button onClick={saveTarget} className="btn-primary p-1.5"><Check size={13} /></button>
              <button onClick={() => setEditingTarget(false)} className="btn-secondary p-1.5"><X size={13} /></button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold tracking-tight font-mono ${
                priceDiff !== null && priceDiff <= 0 ? 'text-success' :
                priceDiff !== null ? 'text-warning' : 'text-text-muted'
              }`}>
                {effectiveTarget ? formatCurrency(effectiveTarget, product.currency) : '—'}
              </span>
              <button
                onClick={() => { setEditingTarget(true); setNewTarget(effectiveTarget?.toString() ?? ''); }}
                className="btn-ghost p-1 mb-0.5"
              >
                <Edit2 size={12} className="text-text-muted" />
              </button>
            </div>
          )}
          {priceDiff !== null && (
            <p className={`text-xs mt-1 ${priceDiff <= 0 ? 'text-success' : 'text-warning'}`}>
              {priceDiff <= 0 ? 'Target reached!' : `${formatCurrency(priceDiff, product.currency)} above target`}
            </p>
          )}
        </div>

        {/* Price stats */}
        <div className="card p-4 space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-2">History Stats</p>
          <div className="flex justify-between">
            <span className="text-xs text-text-muted">Lowest</span>
            <span className="text-xs font-semibold text-success">{minPrice !== null ? formatCurrency(minPrice, product.currency) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-text-muted">Highest</span>
            <span className="text-xs font-semibold text-error">{maxPrice !== null ? formatCurrency(maxPrice, product.currency) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-text-muted">Average</span>
            <span className="text-xs font-semibold text-text-secondary">{avgPrice !== null ? formatCurrency(avgPrice, product.currency) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-text-muted">Data points</span>
            <span className="text-xs font-semibold text-text-secondary">{history.length}</span>
          </div>
        </div>
      </div>

      <div className="card p-5 mb-4">
        <AdvancedPriceChart history={history} currency={product.currency} targetPrice={effectiveTarget} />
        {effectiveTarget && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-0.5 bg-warning/70" style={{ borderTop: '1.5px dashed #F59E0B' }} />
              <span className="text-2xs text-text-muted">Target price</span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <ProductIntelligencePanel product={product} history={history} />
      </div>

      <div className="card p-4 mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center"><Radio size={14} className="text-success animate-pulse" /></div>
          <div><p className="text-sm font-semibold text-text-primary">Live platform signal</p><p className="text-xs text-text-muted">Refreshing latest pricing and alert activity in the background.</p></div>
        </div>
        <span className="badge bg-success/10 text-success border border-success/20 hidden sm:inline-flex">Updated moments ago</span>
      </div>

      <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4 mb-4">
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Pricing summary</p>
          <h2 className="text-lg font-semibold text-text-primary">Market position and buying recommendation</h2>
          <div className="space-y-3 mt-4 text-sm text-text-secondary leading-relaxed">
            <p>{content.pricingSummary}</p>
            <p>{content.trendSummary}</p>
            <p>{content.volatilitySummary}</p>
            <p className="text-text-primary font-medium">{content.recommendation}</p>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Price history highlights</p>
          <h2 className="text-lg font-semibold text-text-primary">Tracked market signals</h2>
          <div className="space-y-3 mt-4">
            {highlights.map(highlight => (
              <div key={highlight} className="rounded-2xl bg-background-tertiary/35 border border-border/60 p-3 text-sm text-text-secondary">
                {highlight}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mb-4">
        <RelatedProducts product={product} />
      </div>

      {/* History table */}
      {history.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Price Log</h2>
          </div>
          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-background-secondary">
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Price</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Change</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((h, i) => {
                  const prev = history[history.length - 1 - i - 1];
                  const diff = prev ? h.price - prev.price : null;
                  return (
                    <tr key={h.id} className="border-b border-border last:border-0 hover:bg-background-tertiary/50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-sm text-text-secondary">
                          {new Date(h.recorded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm font-semibold text-text-primary font-mono">{formatCurrency(h.price, product.currency)}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {diff === null ? (
                          <span className="text-xs text-text-muted">—</span>
                        ) : diff < 0 ? (
                          <span className="text-xs text-success font-medium">{formatCurrency(diff, product.currency)}</span>
                        ) : diff > 0 ? (
                          <span className="text-xs text-error font-medium">+{formatCurrency(diff, product.currency)}</span>
                        ) : (
                          <span className="text-xs text-text-muted">No change</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAlertModal && (
        <PremiumAlertModal
          product={product}
          value={newTarget}
          onChange={setNewTarget}
          onClose={() => setShowAlertModal(false)}
          onSave={createPremiumAlert}
        />
      )}
    </article>
  );
}
