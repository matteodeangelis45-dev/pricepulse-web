import { supabase } from '../../lib/supabase';
import type { PriceHistoryRowV2 } from '../../types/database-v2.types';
import { analyzeBuyingWindow, calculateHistoricalStats, type BuyingWindowAnalysis, type HistoricalStats, type PricePoint } from '../../utils/marketAnalysis';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

export interface PriceTrendSummary {
  stats: HistoricalStats;
  buyingWindow: BuyingWindowAnalysis;
  points: PricePoint[];
}

function toPricePoint(row: PriceHistoryRowV2): PricePoint {
  return { price: row.price, recorded_at: row.recorded_at };
}

export const historyService = {
  async record(productOfferId: string, price: number, recordedAt = new Date().toISOString()): Promise<ServiceResult<PriceHistoryRowV2>> {
    try {
      const { data, error } = await supabase
        .from('price_history_v2')
        .insert({ product_offer_id: productOfferId, price, recorded_at: recordedAt })
        .select()
        .single();
      if (error) throw error;
      return ok(data as PriceHistoryRowV2);
    } catch (error) {
      return fail(error);
    }
  },

  async getOfferHistory(productOfferId: string, limit = 730): Promise<ServiceResult<PriceHistoryRowV2[]>> {
    try {
      const { data, error } = await supabase
        .from('price_history_v2')
        .select('*')
        .eq('product_offer_id', productOfferId)
        .order('recorded_at', { ascending: true })
        .limit(limit);
      if (error) throw error;
      return ok((data ?? []) as PriceHistoryRowV2[]);
    } catch (error) {
      return fail(error);
    }
  },

  async getTrendSummary(productOfferId: string): Promise<ServiceResult<PriceTrendSummary>> {
    try {
      const history = await this.getOfferHistory(productOfferId);
      if (history.error) throw new Error(history.error);
      const points = (history.data ?? []).map(toPricePoint);
      return ok({ stats: calculateHistoricalStats(points), buyingWindow: analyzeBuyingWindow(points), points });
    } catch (error) {
      return fail(error);
    }
  },

  async getLowestHighest(productOfferId: string): Promise<ServiceResult<{ lowest: number | null; highest: number | null }>> {
    try {
      const history = await this.getOfferHistory(productOfferId);
      if (history.error) throw new Error(history.error);
      const prices = (history.data ?? []).map(item => item.price);
      return ok({ lowest: prices.length ? Math.min(...prices) : null, highest: prices.length ? Math.max(...prices) : null });
    } catch (error) {
      return fail(error);
    }
  },
};
