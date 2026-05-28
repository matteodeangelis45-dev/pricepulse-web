import type { PriceHistory, Product } from './database.types';

export type PriceRange = '7d' | '30d' | '90d' | '1y' | 'all';

export interface PricePulseScore {
  score: number;
  dealQuality: number;
  historicalPosition: number;
  volatility: number;
  discountStrength: number;
  summary: string;
}

export interface BuyTimingInsight {
  title: string;
  body: string;
  tone: 'success' | 'warning' | 'brand';
}

export function filterHistoryByRange(history: PriceHistory[], range: PriceRange) {
  if (range === 'all') return history;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = history.filter(item => new Date(item.recorded_at).getTime() >= cutoff);
  return filtered.length >= 2 ? filtered : history.slice(-Math.min(history.length, range === '7d' ? 7 : range === '30d' ? 12 : 24));
}

export function getHistoryStats(history: PriceHistory[], currentPrice: number | null) {
  const prices = history.map(item => item.price).filter(price => Number.isFinite(price));
  const latest = currentPrice ?? prices[prices.length - 1] ?? null;
  const lowest = prices.length ? Math.min(...prices) : latest;
  const highest = prices.length ? Math.max(...prices) : latest;
  const average = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : latest;
  const first = prices[0] ?? latest;
  const movementPercent = latest && first ? ((latest - first) / first) * 100 : 0;
  const belowAveragePercent = latest && average ? ((average - latest) / average) * 100 : 0;
  const spread = highest && lowest ? highest - lowest : 0;
  const volatilityPercent = average ? (spread / average) * 100 : 0;

  return {
    latest,
    lowest,
    highest,
    average,
    movementPercent,
    belowAveragePercent,
    volatilityPercent,
  };
}

export function calculatePricePulseScore(product: Product, history: PriceHistory[]): PricePulseScore {
  const stats = getHistoryStats(history, product.current_price);
  const current = stats.latest ?? 0;
  const discountStrength = product.target_price && current
    ? Math.max(0, Math.min(100, ((product.target_price - current) / product.target_price) * 420 + 55))
    : Math.max(35, Math.min(100, stats.belowAveragePercent * 4 + 55));
  const historicalPosition = stats.lowest && stats.highest && current
    ? Math.max(0, Math.min(100, 100 - ((current - stats.lowest) / Math.max(stats.highest - stats.lowest, 1)) * 100))
    : 58;
  const volatility = Math.max(20, Math.min(100, 100 - Math.abs(stats.volatilityPercent - 12) * 2.5));
  const dealQuality = Math.max(25, Math.min(100, stats.belowAveragePercent * 3.7 + historicalPosition * 0.45 + 28));
  const score = Math.round(dealQuality * 0.35 + historicalPosition * 0.3 + volatility * 0.15 + discountStrength * 0.2);
  const summary = score >= 88
    ? 'Strong market position with pricing near its historical low.'
    : score >= 74
      ? 'Favorable pricing with several positive buying signals.'
      : score >= 58
        ? 'Fair market position. Worth watching for another movement.'
        : 'Price is not currently compelling versus recent history.';

  return {
    score,
    dealQuality: Math.round(dealQuality),
    historicalPosition: Math.round(historicalPosition),
    volatility: Math.round(volatility),
    discountStrength: Math.round(discountStrength),
    summary,
  };
}

export function buildBuyTimingInsights(product: Product, history: PriceHistory[]): BuyTimingInsight[] {
  const stats = getHistoryStats(history, product.current_price);
  const movement = stats.movementPercent;
  const belowAverage = stats.belowAveragePercent;
  const lowestDistance = stats.lowest && stats.latest ? ((stats.latest - stats.lowest) / stats.lowest) * 100 : 0;

  return [
    {
      title: belowAverage >= 15 ? 'Excellent time to buy' : belowAverage >= 7 ? 'Favorable buy window' : 'Monitor before buying',
      body: belowAverage > 0 ? `Current price is ${Math.round(belowAverage)}% below its tracked average.` : 'Current price is close to or above its tracked average.',
      tone: belowAverage >= 7 ? 'success' : 'warning',
    },
    {
      title: lowestDistance <= 5 ? 'Near historical low' : 'Above lowest tracked price',
      body: stats.lowest ? `Lowest tracked price is ${new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(stats.lowest)}.` : 'More price history is needed for a stronger low-price signal.',
      tone: lowestDistance <= 5 ? 'success' : 'brand',
    },
    {
      title: movement < -4 ? 'Prices trending downward' : Math.abs(movement) <= 3 ? 'Market currently stable' : 'Prices trending upward',
      body: `Tracked movement is ${movement.toFixed(1)}% across the selected history window.`,
      tone: movement <= 0 ? 'success' : 'warning',
    },
    {
      title: stats.volatilityPercent > 20 ? 'High volatility' : 'Controlled volatility',
      body: stats.volatilityPercent > 20 ? 'Price has moved widely, so alerts are useful.' : 'Recent pricing has stayed within a predictable range.',
      tone: stats.volatilityPercent > 20 ? 'warning' : 'brand',
    },
  ];
}
