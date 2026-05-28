import { supabase } from '../../lib/supabase';
import type { AlertRowV2, NotificationRow, ProductOfferRow } from '../../types/database-v2.types';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

export interface AlertEvaluationResult {
  triggeredAlerts: AlertRowV2[];
  notifications: NotificationRow[];
}

const ALERT_COOLDOWN_HOURS = 24;

function isCoolingDown(alert: AlertRowV2) {
  if (!alert.last_notification_at) return false;
  return Date.now() - new Date(alert.last_notification_at).getTime() < ALERT_COOLDOWN_HOURS * 60 * 60 * 1000;
}

export const alertEngine = {
  async getActiveAlertsForProduct(productId: string): Promise<ServiceResult<AlertRowV2[]>> {
    try {
      const { data, error } = await supabase
        .from('alerts_v2')
        .select('*')
        .eq('product_id', productId)
        .eq('active', true);
      if (error) throw error;
      return ok((data ?? []) as AlertRowV2[]);
    } catch (error) {
      return fail(error);
    }
  },

  async evaluateOffer(productId: string, offer: ProductOfferRow): Promise<ServiceResult<AlertEvaluationResult>> {
    try {
      if (!offer.current_price) return ok({ triggeredAlerts: [], notifications: [] });
      const alerts = await this.getActiveAlertsForProduct(productId);
      if (alerts.error) throw new Error(alerts.error);

      const triggered = (alerts.data ?? []).filter(alert => alert.active && offer.current_price !== null && offer.current_price <= alert.target_price && !isCoolingDown(alert));
      const notifications: NotificationRow[] = [];

      for (const alert of triggered) {
        const now = new Date().toISOString();
        await supabase.from('alerts_v2').update({ triggered_at: now, last_notification_at: now }).eq('id', alert.id);
        const { data, error } = await supabase
          .from('notifications')
          .insert({
            user_id: alert.user_id,
            type: 'price_drop',
            title: 'Target price reached',
            message: `A watched product reached your target price of ${alert.target_price}.`,
            read: false,
            metadata: { product_id: productId, offer_id: offer.id, alert_id: alert.id, price: offer.current_price },
          })
          .select()
          .single();
        if (error) throw error;
        notifications.push(data as NotificationRow);
      }

      return ok({ triggeredAlerts: triggered, notifications });
    } catch (error) {
      return fail(error);
    }
  },

  async createTargetAlert(input: { user_id: string; product_id: string; target_price: number }): Promise<ServiceResult<AlertRowV2>> {
    try {
      const { data, error } = await supabase
        .from('alerts_v2')
        .insert({ ...input, active: true })
        .select()
        .single();
      if (error) throw error;
      return ok(data as AlertRowV2);
    } catch (error) {
      return fail(error);
    }
  },
};
