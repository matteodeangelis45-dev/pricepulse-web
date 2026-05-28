import { useEffect, useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setRefreshing(true);
      window.setTimeout(() => setRefreshing(false), 1800);
    };
    const handleOffline = () => setOnline(false);
    const handleVisibility = () => {
      if (!document.hidden && navigator.onLine) {
        setRefreshing(true);
        window.setTimeout(() => setRefreshing(false), 1400);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  if (online && !refreshing) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-border/80 bg-background-secondary/95 px-4 py-2 shadow-card-hover backdrop-blur-md animate-slide-up">
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        {online ? <RefreshCw size={13} className="text-success animate-spin" /> : <WifiOff size={13} className="text-warning" />}
        <span>{online ? 'Refreshing latest pricing…' : 'Reconnecting to live market data…'}</span>
      </div>
    </div>
  );
}
