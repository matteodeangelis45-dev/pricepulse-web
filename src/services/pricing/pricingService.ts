import { supabase } from '../../lib/supabase';
import type { OfferAvailability, PriceHistoryRowV2, ProductOfferRow } from '../../types/database-v2.types';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

interface RecordPriceInput {
  product_offer_id: string;
  price: number;
  availability?: OfferAvailability;
}

export const pricingService = {
  async recordPrice(input: RecordPriceInput): Promise<ServiceResult<PriceHistoryRowV2>> {
    try {
      const now = new Date().toISOString();
      const { data: offer, error: offerError } = await supabase
        .from('product_offers')
        .select('*')
        .eq('id', input.product_offer_id)
        .single();
      if (offerError) throw offerError;

      const { error: updateError } = await supabase
        .from('product_offers')
        .update({ previous_price: offer.current_price, current_price: input.price, availability: input.availability ?? offer.availability, updated_at: now })
        .eq('id', input.product_offer_id);
      if (updateError) throw updateError;

      const { data, error } = await supabase
        .from('price_history_v2')
        .insert({ product_offer_id: input.product_offer_id, price: input.price, recorded_at: now })
        .select()
        .single();
      if (error) throw error;
      return ok(data as PriceHistoryRowV2);
    } catch (error) {
      return fail(error);
    }
  },

  async getHistory(productOfferId: string, limit = 365): Promise<ServiceResult<PriceHistoryRowV2[]>> {
    try {
      const { data, error } = await supabase
        .from('price_history_v2')
        .select('*')
        .eq('product_offer_id', productOfferId)
        .order('recorded_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return ok((data ?? []) as PriceHistoryRowV2[]);
    } catch (error) {
      return fail(error);
    }
  },

  calculatePriceChange(offer: ProductOfferRow) {
    if (!offer.current_price || !offer.previous_price) return 0;
    return ((offer.current_price - offer.previous_price) / offer.previous_price) * 100;
  },
};
