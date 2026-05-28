import { useEffect, useState, useCallback, useRef } from 'react';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
import type { Alert, AlertType } from '../lib/database.types';

interface AlertsPageProps {
  onAlertsChange: (count: number) => void;
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

const alertConfig: Record<AlertType, { label: string; cardClass: string; dotClass: string }> = {
  price_drop: { label: 'Price Drop', cardClass: 'border-success/20 bg-success/5', dotClass: 'bg-success' },
  target_reached: { label: 'Target Reached', cardClass: 'border-warning/20 bg-warning/5', dotClass: 'bg-warning' },
  price_increase: { label: 'Price Increase', cardClass: 'border-error/20 bg-error/5', dotClass: 'bg-error' },
  back_in_stock: { label: 'Back in Stock', cardClass: 'border-brand-700/30 bg-brand-800/10', dotClass: 'bg-brand-400' },
};

const ALERTS_TIMEOUT_MS = 10000;

function devLog(message: string, payload?: unknown) {
  if (import.meta.env.DEV) {
    console.log(`[PricePulse alerts] ${message}`, payload ?? '');
  }
}

export function AlertsPage({ onAlertsChange }: AlertsPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const loadAlerts = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (!user) {
      setAlerts([]);
      setLoading(false);
      setErrorMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    devLog('Loading started', { requestId, userId: user.id });

    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Alerts request timed out.')), ALERTS_TIMEOUT_MS);
    });

    try {
      const { data, error } = await Promise.race([
        supabase
          .from('alerts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        timeout,
      ]);

      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      if (error) throw new Error(error.message);
      setAlerts(data ?? []);
      devLog('Loading succeeded', { requestId, alerts: data?.length ?? 0 });
    } catch (err) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to load alerts.';
      console.error('Failed to load alerts:', message);
      setErrorMessage(message);
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
        devLog('Loading finished', { requestId });
      }
    }
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    void loadAlerts();
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [loadAlerts]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        devLog('Tab visible, refreshing alerts');
        void loadAlerts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadAlerts, user]);

  useEffect(() => {
    onAlertsChange(alerts.filter(a => !a.is_read).length);
  }, [alerts, onAlertsChange]);

  const markAllRead = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      toast('error', 'Failed to mark alerts as read.');
      return;
    }
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    toast('success', 'All alerts marked as read.');
  };

  const markRead = async (id: string) => {
    const { error } = await supabase.from('alerts').update({ is_read: true }).eq('id', id);
    if (error) {
      console.error('Failed to mark alert as read:', error.message);
      return;
    }
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
  };

  const deleteAlert = async (id: string) => {
    const { error } = await supabase.from('alerts').delete().eq('id', id);
    if (error) {
      toast('error', 'Failed to delete alert.');
      return;
    }
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAll = async () => {
    if (!user) return;
    if (!confirm('Clear all alerts?')) return;
    const { error } = await supabase.from('alerts').delete().eq('user_id', user.id);
    if (error) {
      toast('error', 'Failed to clear alerts.');
      return;
    }
    setAlerts([]);
    toast('success', 'All alerts cleared.');
  };

  if (loading) return <PageLoader />;

  if (errorMessage) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="card premium-panel p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-3xl bg-warning/10 border border-warning/20 flex items-center justify-center mb-4">
            <Bell size={20} className="text-warning" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand-300 mb-2">Alerts recovery</p>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">We couldn’t refresh your alerts.</h2>
          <p className="text-sm text-text-secondary mt-3 max-w-xl mx-auto">{errorMessage}</p>
          <button onClick={() => void loadAlerts()} className="btn-primary mt-6">
            Retry alerts
          </button>
        </div>
      </div>
    );
  }

  const unread = alerts.filter(a => !a.is_read).length;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {alerts.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text-primary">{alerts.length} Alerts</h2>
            {unread > 0 && (
              <span className="badge bg-warning/10 text-warning border border-warning/20">{unread} unread</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button onClick={markAllRead} className="btn-ghost text-xs gap-1.5">
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
            <button onClick={clearAll} className="btn-danger text-xs gap-1.5">
              <Trash2 size={13} />
              Clear all
            </button>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Bell size={22} />}
            title="No alerts"
            description="Price change alerts will appear here when your tracked products have updates."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const cfg = alertConfig[alert.type as AlertType] ?? alertConfig.price_drop;
            return (
              <div
                key={alert.id}
                onClick={() => !alert.is_read && markRead(alert.id)}
                className={`card p-4 border cursor-pointer transition-all duration-150 group ${cfg.cardClass} ${!alert.is_read ? 'shadow-card-hover' : 'opacity-70 hover:opacity-90'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dotClass} ${!alert.is_read ? 'animate-pulse-soft' : 'opacity-40'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-text-primary">{cfg.label}</span>
                      {!alert.is_read && (
                        <span className="badge bg-warning/10 text-warning border border-warning/20">New</span>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{alert.message}</p>
                    <p className="text-xs text-text-muted mt-1.5">{timeAgo(alert.created_at)}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteAlert(alert.id); }}
                    className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-error"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
