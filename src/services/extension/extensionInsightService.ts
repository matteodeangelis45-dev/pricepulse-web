import { scoreBuyingWindow } from '../../analysis/buyingWindow';
import { analyzeMomentum } from '../../analysis/momentumAnalysis';
import { analyzePriceHistory } from '../../analysis/priceAnalysis';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';
import { historyService } from '../history/historyService';
import { productRepository } from '../products/productRepository';

export interface ExtensionInsightPayload {
  product_slug: string;
  product_title: string;
  offer_id: string;
  current_price: number | null;
  current_vs_90d_average_percent: number | null;
  lowest_price: number | null;
  highest_price: number | null;
  volatility_score: number;
  momentum_state: string;
  buying_condition: string;
  confidence: number;
  insight: string;
}

export const extensionInsightService = {
  async getInsightsBySlug(slug: string): Promise<ServiceResult<ExtensionInsightPayload | null>> {
    try {
      const productResult = await productRepository.getProductBySlug(slug);
      if (productResult.error) throw new Error(productResult.error);
      const product = productResult.data;
      if (!product || product.offers.length === 0) return ok(null);

      const bestOffer = [...product.offers]
        .filter(offer => offer.current_price !== null)
        .sort((a, b) => (a.current_price ?? Number.MAX_SAFE_INTEGER) - (b.current_price ?? Number.MAX_SAFE_INTEGER))[0] ?? product.offers[0];

      const history = await historyService.getOfferHistory(bestOffer.id, 365);
      if (history.error) throw new Error(history.error);
      const points = (history.data ?? []).map(point => ({ price: point.price, recorded_at: point.recorded_at }));
      const price = analyzePriceHistory(points);
      const momentum = analyzeMomentum(points);
      const buying = scoreBuyingWindow(points);

      return ok({
        product_slug: product.slug,
        product_title: product.title,
        offer_id: bestOffer.id,
        current_price: price.currentPrice ?? bestOffer.current_price,
        current_vs_90d_average_percent: price.currentVs90dAveragePercent,
        lowest_price: price.lowestPrice,
        highest_price: price.highestPrice,
        volatility_score: price.volatilityScore,
        momentum_state: momentum.state,
        buying_condition: buying.condition,
        confidence: Math.min(momentum.confidence, buying.analysis.confidence || momentum.confidence),
        insight: buying.summary,
      });
    } catch (error) {
      return fail(error);
    }
  },
};
