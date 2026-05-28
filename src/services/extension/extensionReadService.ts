import { historyService } from '../history/historyService';
import { marketIntelligenceService } from '../intelligence/marketIntelligenceService';
import { productRepository } from '../products/productRepository';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

export interface ExtensionProductSummary {
  slug: string;
  title: string;
  image_url: string | null;
  best_price: number | null;
  retailer: string | null;
  buying_window: string;
  confidence: number;
  momentum: string;
  volatility: string;
  overlay_message: string;
}

export const extensionReadService = {
  async getProductOverlayBySlug(slug: string): Promise<ServiceResult<ExtensionProductSummary | null>> {
    try {
      const productResult = await productRepository.getProductBySlug(slug);
      if (productResult.error) throw new Error(productResult.error);
      const product = productResult.data;
      if (!product) return ok(null);

      const historyByOfferId: Record<string, NonNullable<Awaited<ReturnType<typeof historyService.getOfferHistory>>['data']>> = {};
      for (const offer of product.offers) {
        const history = await historyService.getOfferHistory(offer.id, 180);
        if (history.error) throw new Error(history.error);
        historyByOfferId[offer.id] = history.data ?? [];
      }

      const intelligence = marketIntelligenceService.summarizeProduct(product, historyByOfferId);
      const bestSummary = intelligence.bestOffer ? intelligence.offerSummaries.find(summary => summary.offerId === intelligence.bestOffer?.id) : intelligence.offerSummaries[0];
      const bestOfferWithRetailer = intelligence.bestOffer ? product.offers.find(offer => offer.id === intelligence.bestOffer?.id) : null;

      return ok({
        slug: product.slug,
        title: product.title,
        image_url: product.image_url,
        best_price: intelligence.bestOffer?.current_price ?? null,
        retailer: bestOfferWithRetailer?.retailer?.name ?? null,
        buying_window: bestSummary?.buyingWindow.signal ?? 'insufficient_data',
        confidence: bestSummary?.buyingWindow.confidence ?? 0,
        momentum: bestSummary?.momentumLabel ?? 'insufficient_data',
        volatility: bestSummary?.volatilityLabel ?? 'insufficient_data',
        overlay_message: bestSummary?.interpretation ?? 'No historical pricing summary is available yet.',
      });
    } catch (error) {
      return fail(error);
    }
  },
};
