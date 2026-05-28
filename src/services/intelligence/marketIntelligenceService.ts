import type { PriceHistoryRowV2, ProductOfferRow, ProductWithOffers } from '../../types/database-v2.types';
import { analyzeBuyingWindow, calculateHistoricalStats, calculateMomentumScore, calculateVolatilityScore, type BuyingWindowAnalysis, type HistoricalStats } from '../../utils/marketAnalysis';

export interface OfferIntelligenceSummary {
  offerId: string;
  stats: HistoricalStats;
  buyingWindow: BuyingWindowAnalysis;
  momentumLabel: 'downward' | 'stable' | 'upward' | 'insufficient_data';
  volatilityLabel: 'low' | 'moderate' | 'high' | 'insufficient_data';
  interpretation: string;
}

export interface ProductIntelligenceSummary {
  productId: string;
  slug: string;
  title: string;
  bestOffer: ProductOfferRow | null;
  offerSummaries: OfferIntelligenceSummary[];
}

function getMomentumLabel(score: number, count: number): OfferIntelligenceSummary['momentumLabel'] {
  if (count < 3) return 'insufficient_data';
  if (score < -12) return 'downward';
  if (score > 12) return 'upward';
  return 'stable';
}

function getVolatilityLabel(score: number, count: number): OfferIntelligenceSummary['volatilityLabel'] {
  if (count < 3) return 'insufficient_data';
  if (score > 65) return 'high';
  if (score > 30) return 'moderate';
  return 'low';
}

export const marketIntelligenceService = {
  summarizeOffer(offer: ProductOfferRow, history: PriceHistoryRowV2[]): OfferIntelligenceSummary {
    const points = history.map(point => ({ price: point.price, recorded_at: point.recorded_at }));
    const stats = calculateHistoricalStats(points);
    const buyingWindow = analyzeBuyingWindow(points);
    const momentumScore = calculateMomentumScore(points);
    const volatilityScore = calculateVolatilityScore(points);
    const momentumLabel = getMomentumLabel(momentumScore, points.length);
    const volatilityLabel = getVolatilityLabel(volatilityScore, points.length);

    return {
      offerId: offer.id,
      stats,
      buyingWindow,
      momentumLabel,
      volatilityLabel,
      interpretation: this.buildInterpretation(momentumLabel, volatilityLabel, buyingWindow),
    };
  },

  summarizeProduct(product: ProductWithOffers, historyByOfferId: Record<string, PriceHistoryRowV2[]>): ProductIntelligenceSummary {
    const offers = product.offers.map(offer => ({ ...offer, retailer_id: offer.retailer_id }));
    const bestOffer = offers
      .filter(offer => offer.current_price !== null)
      .sort((a, b) => (a.current_price ?? Number.MAX_SAFE_INTEGER) - (b.current_price ?? Number.MAX_SAFE_INTEGER))[0] ?? null;

    return {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      bestOffer,
      offerSummaries: offers.map(offer => this.summarizeOffer(offer, historyByOfferId[offer.id] ?? [])),
    };
  },

  buildInterpretation(momentum: OfferIntelligenceSummary['momentumLabel'], volatility: OfferIntelligenceSummary['volatilityLabel'], buyingWindow: BuyingWindowAnalysis) {
    if (buyingWindow.signal === 'favorable') return 'Historically favorable pricing window based on recorded behavior, not a guaranteed prediction.';
    if (buyingWindow.signal === 'wait') return 'Recent behavior suggests waiting may be reasonable if the purchase is not urgent.';
    if (volatility === 'high') return 'High volatility detected; price may move meaningfully between checks.';
    if (momentum === 'downward') return 'Prices are trending downward across the recent history window.';
    if (momentum === 'upward') return 'Price momentum is recovering from recent lows.';
    return 'Pricing is currently within a normal historical range.';
  },
};
