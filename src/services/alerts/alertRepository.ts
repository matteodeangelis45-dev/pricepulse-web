import { supabase } from '../../lib/supabase';
import type { AlertRowV2 } from '../../types/database-v2.types';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

export interface CreateAlertInput {
  user_id: string;
  product_id: string;
  target_price: number;
}

export const alertRepository = {
  async listForUser(userId: string, activeOnly = false): Promise<ServiceResult<AlertRowV2[]>> {
    try {
      let query = supabase.from('alerts_v2').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (activeOnly) query = query.eq('active', true);
      const { data, error } = await query;
      if (error) throw error;
      return ok((data ?? []) as AlertRowV2[]);
    } catch (error) {
      return fail(error);
    }
  },

  async create(input: CreateAlertInput): Promise<ServiceResult<AlertRowV2>> {
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

  async deactivate(alertId: string): Promise<ServiceResult<AlertRowV2>> {
    try {
      const { data, error } = await supabase
        .from('alerts_v2')
        .update({ active: false })
        .eq('id', alertId)
        .select()
        .single();
      if (error) throw error;
      return ok(data as AlertRowV2);
    } catch (error) {
      return fail(error);
    }
  },
};
