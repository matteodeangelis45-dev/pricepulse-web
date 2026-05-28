import type { PlatformPriceHistory, PlatformProduct } from '../types/platform.types';

export function getDiscountPercent(current: number, previous: number) {
  if (previous <= 0) return 0;
  return Number((((previous - current) / previous) * 100).toFixed(1));
}

export function getSavingsAmount(current: number, previous: number) {
  return Math.max(0, previous - current);
}

export function getPriceMovementPercent(history: PlatformPriceHistory[]) {
  if (history.length < 2) return 0;
  const sorted = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const first = sorted[0].price;
  const latest = sorted[sorted.length - 1].price;
  if (first <= 0) return 0;
  return Number((((latest - first) / first) * 100).toFixed(1));
}

export function getSparklineValues(history: PlatformPriceHistory[]) {
  if (history.length === 0) return [];
  const prices = history.map(item => item.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  return prices.map(price => Math.round(((price - min) / range) * 70 + 15));
}

export function getBuyTimingLabel(product: PlatformProduct) {
  const belowAverage = ((product.average_price - product.current_price) / product.average_price) * 100;
  if (belowAverage >= 15) return 'Excellent time to buy';
  if (belowAverage >= 8) return 'Historically low pricing';
  if (product.volatility === 'high') return 'Monitor closely';
  return 'Market currently stable';
}

export function createChartPath(values: readonly number[]) {
  if (values.length === 0) return '';
  return values.map((value, index) => `${index === 0 ? 'M' : 'L'} ${(index / Math.max(values.length - 1, 1)) * 100} ${100 - value}`).join(' ');
}
