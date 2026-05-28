import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { mockAlerts, mockWatchlist } from '../data/mockProducts';
import type { PlatformAlert, PlatformActivityItem, PlatformWatchlistItem } from '../types/platform.types';

interface PlatformStoreValue {
  watchlist: PlatformWatchlistItem[];
  alerts: PlatformAlert[];
  activity: PlatformActivityItem[];
  addToWatchlist: (productId: string) => void;
  removeFromWatchlist: (productId: string) => void;
  createAlert: (productId: string, targetPrice: number) => void;
  toggleAlert: (alertId: string) => void;
  clearActivity: () => void;
}

const PlatformStoreContext = createContext<PlatformStoreValue | null>(null);

export function PlatformStoreProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<PlatformWatchlistItem[]>(mockWatchlist);
  const [alerts, setAlerts] = useState<PlatformAlert[]>(mockAlerts);
  const [activity, setActivity] = useState<PlatformActivityItem[]>([]);

  const pushActivity = useCallback((item: Omit<PlatformActivityItem, 'id' | 'created_at'>) => {
    setActivity(prev => [{ ...item, id: `local-activity-${Date.now()}`, created_at: new Date().toISOString() }, ...prev].slice(0, 8));
  }, []);

  const addToWatchlist = useCallback((productId: string) => {
    setWatchlist(prev => {
      if (prev.some(item => item.product_id === productId)) return prev;
      return [{ id: `local-watch-${Date.now()}`, user_id: 'mock-user', product_id: productId, created_at: new Date().toISOString() }, ...prev];
    });
    pushActivity({ product_id: productId, message: 'Product added to watchlist', type: 'watchlist' });
  }, [pushActivity]);

  const removeFromWatchlist = useCallback((productId: string) => {
    setWatchlist(prev => prev.filter(item => item.product_id !== productId));
    pushActivity({ product_id: productId, message: 'Product removed from watchlist', type: 'watchlist' });
  }, [pushActivity]);

  const createAlert = useCallback((productId: string, targetPrice: number) => {
    setAlerts(prev => [{ id: `local-alert-${Date.now()}`, user_id: 'mock-user', product_id: productId, target_price: targetPrice, created_at: new Date().toISOString(), active: true }, ...prev]);
    pushActivity({ product_id: productId, message: `Alert created at ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(targetPrice)}`, type: 'alert' });
  }, [pushActivity]);

  const toggleAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => alert.id === alertId ? { ...alert, active: !alert.active } : alert));
  }, []);

  const clearActivity = useCallback(() => setActivity([]), []);

  const value = useMemo(() => ({ watchlist, alerts, activity, addToWatchlist, removeFromWatchlist, createAlert, toggleAlert, clearActivity }), [watchlist, alerts, activity, addToWatchlist, removeFromWatchlist, createAlert, toggleAlert, clearActivity]);

  return <PlatformStoreContext.Provider value={value}>{children}</PlatformStoreContext.Provider>;
}

export function usePlatformStore() {
  const context = useContext(PlatformStoreContext);
  if (!context) throw new Error('usePlatformStore must be used within PlatformStoreProvider');
  return context;
}
