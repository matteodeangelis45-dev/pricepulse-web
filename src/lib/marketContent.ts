import type { PriceHistory, Product } from './database.types';
import { getHistoryStats } from './productIntelligence';

export function buildPriceHistoryHighlights(product: Product, history: PriceHistory[]) {
  const stats = getHistoryStats(history, product.current_price);
  const current = stats.latest ?? 0;
  const nearLow = stats.lowest ? current <= stats.lowest * 1.05 : false;
  const recovering = stats.movementPercent > 4;
  const stable = stats.volatilityPercent < 12;

  return [
    nearLow ? 'Lowest price in the current tracking window' : `Best recorded price remains ${format(product.currency, stats.lowest)}`,
    recovering ? 'Price recovering after a recent low' : stats.movementPercent < -4 ? 'Price has been trending downward' : 'Price movement is currently measured',
    stable ? 'Historically stable pricing pattern' : 'High volatility detected across recent records',
    stats.average ? `Average market price is ${format(product.currency, stats.average)}` : 'More historical records will improve the summary',
  ];
}

export function buildProductNarrative(product: Product, history: PriceHistory[]) {
  const stats = getHistoryStats(history, product.current_price);
  const current = stats.latest ?? product.current_price ?? 0;
  const belowAverage = stats.belowAveragePercent;
  const recommendation = belowAverage >= 12
    ? 'This is a strong buying window based on the tracked average and recent price position.'
    : belowAverage >= 5
      ? 'This is a favorable price, especially if it aligns with your target.'
      : 'This product is worth monitoring before buying unless you need it immediately.';

  return {
    pricingSummary: `${product.title} is currently tracked at ${format(product.currency, current)}${product.store ? ` from ${product.store}` : ''}. The tracked average is ${format(product.currency, stats.average)} and the best recorded price is ${format(product.currency, stats.lowest)}.`,
    volatilitySummary: stats.volatilityPercent > 20 ? 'Pricing has moved widely during the tracking window, making alerts useful for timing.' : 'Pricing has remained within a controlled range, suggesting a more predictable market pattern.',
    trendSummary: stats.movementPercent < -4 ? 'Recent data shows downward price pressure.' : stats.movementPercent > 4 ? 'Recent data shows upward recovery after prior lows.' : 'Recent data shows mostly stable pricing.',
    recommendation,
  };
}

function format(currency: string, value: number | null | undefined) {
  if (!value) return 'not enough data';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}
