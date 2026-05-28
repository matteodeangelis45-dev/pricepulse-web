import { supabase } from '../lib/supabase';
import type { PlatformAlert, PlatformPriceHistory, PlatformProduct, PlatformWatchlistItem } from '../types/platform.types';

export async function getSupabaseProducts(): Promise<PlatformProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PlatformProduct[];
}

export async function getSupabaseProductHistory(productId: string): Promise<PlatformPriceHistory[]> {
  const { data, error } = await supabase
    .from('price_history')
    .select('*')
    .eq('product_id', productId)
    .order('recorded_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(item => ({
    id: item.id,
    product_id: item.product_id,
    price: item.price,
    timestamp: item.recorded_at,
  })) as PlatformPriceHistory[];
}

export async function getSupabaseWatchlist(userId: string): Promise<PlatformWatchlistItem[]> {
  const { data, error } = await supabase
    .from('user_tracking')
    .select('id,user_id,product_id,created_at')
    .eq('user_id', userId);

  if (error) throw error;
  return (data ?? []) as PlatformWatchlistItem[];
}

export async function getSupabaseAlerts(userId: string): Promise<PlatformAlert[]> {
  const { data, error } = await supabase
    .from('user_tracking')
    .select('id,user_id,product_id,target_price,created_at')
    .eq('user_id', userId)
    .not('target_price', 'is', null);

  if (error) throw error;
  return (data ?? []).map(item => ({
    id: item.id,
    user_id: item.user_id,
    product_id: item.product_id,
    target_price: item.target_price ?? 0,
    created_at: item.created_at,
    active: true,
  })) as PlatformAlert[];
}
