import { useState, FormEvent } from 'react';
import { X, Link, DollarSign, Store, Tag, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import type { Product } from '../../lib/database.types';

interface AddProductModalProps {
  onClose: () => void;
  onAdded: (product: Product) => void;
}

export function AddProductModal({ onClose, onAdded }: AddProductModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    url: '',
    store: '',
    current_price: '',
    target_price: '',
    currency: 'USD',
    notify_price_drop: true,
    notify_target: true,
    notes: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.title.trim() || !form.url.trim()) return;

    setLoading(true);
    try {
      const currentPrice = form.current_price ? parseFloat(form.current_price) : null;
      const targetPrice = form.target_price ? parseFloat(form.target_price) : null;

      // 1. Insert product
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          title: form.title.trim(),
          url: form.url.trim(),
          store: form.store.trim() || null,
          current_price: currentPrice,
          target_price: targetPrice,
          currency: form.currency,
          status: 'tracking' as const,
          last_scraped_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (prodErr) throw prodErr;
      if (!product) throw new Error('Failed to create product');

      // 2. Insert initial price history if price provided
      if (currentPrice) {
        const { error: histErr } = await supabase.from('price_history').insert({
          product_id: product.id,
          price: currentPrice,
          recorded_at: new Date().toISOString(),
        });
        if (histErr) console.error('Failed to log initial price:', histErr.message);
      }

      // 3. Insert user_tracking entry
      const { error: trackErr } = await supabase.from('user_tracking').insert({
        user_id: user.id,
        product_id: product.id,
        target_price: targetPrice,
        notify_price_drop: form.notify_price_drop,
        notify_target: form.notify_target,
        notes: form.notes.trim() || null,
      });
      if (trackErr) console.error('Failed to create tracking entry:', trackErr.message);

      onAdded(product);
      toast('success', `"${product.title}" is now being tracked.`);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add product.';
      toast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: string | boolean) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-background-secondary border border-border rounded-2xl shadow-card-hover animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-background-secondary z-10">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Track a Product</h2>
            <p className="text-xs text-text-muted mt-0.5">Add a product URL to start monitoring prices</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 text-text-muted">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Product Name */}
          <div>
            <label className="label">
              <Tag size={10} className="inline mr-1" />Product Name
            </label>
            <input
              className="input"
              placeholder="e.g. Sony WH-1000XM5 Headphones"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* URL */}
          <div>
            <label className="label">
              <Link size={10} className="inline mr-1" />Product URL
            </label>
            <input
              className="input"
              placeholder="https://www.amazon.com/..."
              type="url"
              value={form.url}
              onChange={e => set('url', e.target.value)}
              required
            />
          </div>

          {/* Store */}
          <div>
            <label className="label">
              <Store size={10} className="inline mr-1" />Store / Retailer
            </label>
            <input
              className="input"
              placeholder="e.g. Amazon, Best Buy, Walmart"
              value={form.store}
              onChange={e => set('store', e.target.value)}
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                <DollarSign size={10} className="inline mr-1" />Current Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                <input
                  className="input pl-7"
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.current_price}
                  onChange={e => set('current_price', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="label">Target Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                <input
                  className="input pl-7"
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.target_price}
                  onChange={e => set('target_price', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="label">Currency</label>
            <select
              className="input"
              value={form.currency}
              onChange={e => set('currency', e.target.value)}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
              <option value="JPY">JPY — Japanese Yen</option>
            </select>
          </div>

          {/* Notification preferences */}
          <div className="space-y-2.5 pt-1">
            <label className="label">
              <Bell size={10} className="inline mr-1" />Notification Preferences
            </label>
            <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-xl">
              <div>
                <p className="text-sm text-text-primary">Price drop alerts</p>
                <p className="text-xs text-text-muted">Notify when price decreases</p>
              </div>
              <button
                type="button"
                onClick={() => set('notify_price_drop', !form.notify_price_drop)}
                className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
                  form.notify_price_drop ? 'bg-brand-800' : 'bg-background-secondary border border-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                    form.notify_price_drop ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-background-tertiary rounded-xl">
              <div>
                <p className="text-sm text-text-primary">Target reached alerts</p>
                <p className="text-xs text-text-muted">Notify when target price is hit</p>
              </div>
              <button
                type="button"
                onClick={() => set('notify_target', !form.notify_target)}
                className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${
                  form.notify_target ? 'bg-brand-800' : 'bg-background-secondary border border-border'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${
                    form.notify_target ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              className="input min-h-[60px] resize-none"
              placeholder="Any notes about this product..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          {/* Target price hint */}
          {form.target_price && form.current_price && parseFloat(form.target_price) >= parseFloat(form.current_price) && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/8 border border-warning/20">
              <span className="text-warning text-xs mt-0.5">!</span>
              <p className="text-xs text-text-secondary">Target price is higher than current price. You'll be alerted if the price changes.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-text-primary/20 border-t-text-primary animate-spin" />
                  Adding...
                </span>
              ) : (
                'Start Tracking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
