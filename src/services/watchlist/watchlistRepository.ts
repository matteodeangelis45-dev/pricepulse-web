import { supabase } from '../../lib/supabase';
import type { ProductRowV2, WatchlistRow } from '../../types/database-v2.types';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

export interface WatchlistItemWithProduct extends WatchlistRow {
  product: ProductRowV2 | null;
}

export const watchlistRepository = {
  async listForUser(userId: string): Promise<ServiceResult<WatchlistItemWithProduct[]>> {
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .select('*, product:products_v2(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return ok((data ?? []) as WatchlistItemWithProduct[]);
    } catch (error) {
      return fail(error);
    }
  },

  async add(userId: string, productId: string): Promise<ServiceResult<WatchlistRow>> {
    try {
      const { data, error } = await supabase
        .from('watchlists')
        .upsert({ user_id: userId, product_id: productId }, { onConflict: 'user_id,product_id' })
        .select()
        .single();
      if (error) throw error;
      return ok(data as WatchlistRow);
    } catch (error) {
      return fail(error);
    }
  },

  async remove(userId: string, productId: string): Promise<ServiceResult<boolean>> {
    try {
      const { error } = await supabase.from('watchlists').delete().eq('user_id', userId).eq('product_id', productId);
      if (error) throw error;
      return ok(true);
    } catch (error) {
      return fail(error);
    }
  },
};
