import type { NotificationType } from '../types/database-v2.types';

export interface UserNotificationPreferences {
  price_drop: boolean;
  momentum_alert: boolean;
  buying_window: boolean;
  unusual_drop: boolean;
  email: boolean;
  push: boolean;
}

export interface NotificationCandidate {
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  dedupe_key: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, unknown>;
}

export interface PreparedNotification extends NotificationCandidate {
  channels: Array<'in_app' | 'email' | 'push'>;
  prepared_at: string;
}

export interface NotificationPreparationContext {
  existingDedupeKeys: string[];
  lastSentAtByKey: Record<string, string | undefined>;
  cooldownHours: number;
  preferences: UserNotificationPreferences;
}

function isTypeEnabled(type: NotificationType, preferences: UserNotificationPreferences) {
  if (type === 'price_drop' || type === 'historical_low') return preferences.price_drop || preferences.unusual_drop;
  if (type === 'trend_reversal' || type === 'market_shift') return preferences.momentum_alert;
  if (type === 'watchlist_alert') return preferences.buying_window;
  return true;
}

function isCoolingDown(key: string, context: NotificationPreparationContext) {
  const lastSentAt = context.lastSentAtByKey[key];
  if (!lastSentAt) return false;
  return Date.now() - new Date(lastSentAt).getTime() < context.cooldownHours * 60 * 60 * 1000;
}

export function prepareNotifications(candidates: NotificationCandidate[], context: NotificationPreparationContext): PreparedNotification[] {
  const seen = new Set(context.existingDedupeKeys);
  const prepared: PreparedNotification[] = [];

  for (const candidate of candidates) {
    if (seen.has(candidate.dedupe_key)) continue;
    if (isCoolingDown(candidate.dedupe_key, context)) continue;
    if (!isTypeEnabled(candidate.type, context.preferences)) continue;

    seen.add(candidate.dedupe_key);
    prepared.push({
      ...candidate,
      channels: ['in_app', ...(context.preferences.email ? ['email' as const] : []), ...(context.preferences.push ? ['push' as const] : [])],
      prepared_at: new Date().toISOString(),
    });
  }

  return prepared;
}
