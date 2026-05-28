import { createContext, useContext, useMemo, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { NotificationRow } from '../types/database-v2.types';

interface AppPreferences {
  currency: string;
  refreshIntervalMinutes: number;
  marketStatusVisible: boolean;
}

interface RealtimeActivityItem {
  id: string;
  type: 'price_update' | 'alert' | 'tracking_job' | 'notification';
  message: string;
  created_at: string;
}

interface AppState {
  preferences: AppPreferences;
  realtimeActivity: RealtimeActivityItem[];
  notifications: NotificationRow[];
}

type AppStateAction =
  | { type: 'preferences/update'; payload: Partial<AppPreferences> }
  | { type: 'activity/add'; payload: RealtimeActivityItem }
  | { type: 'notifications/set'; payload: NotificationRow[] }
  | { type: 'notifications/markRead'; payload: string };

const initialState: AppState = {
  preferences: {
    currency: 'USD',
    refreshIntervalMinutes: 5,
    marketStatusVisible: true,
  },
  realtimeActivity: [],
  notifications: [],
};

function reducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'preferences/update':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'activity/add':
      return { ...state, realtimeActivity: [action.payload, ...state.realtimeActivity].slice(0, 50) };
    case 'notifications/set':
      return { ...state, notifications: action.payload };
    case 'notifications/markRead':
      return { ...state, notifications: state.notifications.map(item => item.id === action.payload ? { ...item, read: true } : item) };
    default:
      return state;
  }
}

const AppStateContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppStateAction> } | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
}
