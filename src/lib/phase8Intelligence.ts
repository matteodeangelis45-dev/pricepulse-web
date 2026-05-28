import { mockProducts, mockWatchlist } from '../data/mockProducts';
import { getDiscountPercent, getSavingsAmount } from './chartUtils';
import type { PlatformProduct, ProductCategory, RetailerName } from '../types/platform.types';

export type MomentumSignal = 'Falling Fast' | 'Stable Pricing' | 'High Volatility' | 'Recovering Price' | 'Demand Increasing';

export interface RetailerSignal {
  retailer: RetailerName;
  trustScore: number;
  shippingSpeed: string;
  coverage: string;
  status: 'Live' | 'Verified' | 'Monitoring';
}

export const retailerSignals: RetailerSignal[] = [
  { retailer: 'Amazon', trustScore: 96, shippingSpeed: '1-2 day shipping', coverage: '12.4k tracked offers', status: 'Live' },
  { retailer: 'Best Buy', trustScore: 94, shippingSpeed: 'Same-day pickup', coverage: '8.1k tracked offers', status: 'Verified' },
  { retailer: 'Micro Center', trustScore: 92, shippingSpeed: 'Local inventory', coverage: '5.8k tracked offers', status: 'Live' },
  { retailer: 'Apple Reseller', trustScore: 91, shippingSpeed: '2-3 day shipping', coverage: '3.7k tracked offers', status: 'Monitoring' },
  { retailer: 'Samsung', trustScore: 90, shippingSpeed: '2 day shipping', coverage: '4.2k tracked offers', status: 'Verified' },
  { retailer: 'Sony Store', trustScore: 89, shippingSpeed: '3 day shipping', coverage: '2.9k tracked offers', status: 'Monitoring' },
  { retailer: 'B&H Photo', trustScore: 93, shippingSpeed: '2 day shipping', coverage: '6.3k tracked offers', status: 'Live' },
  { retailer: 'Newegg', trustScore: 88, shippingSpeed: '2-4 day shipping', coverage: '7.6k tracked offers', status: 'Verified' },
];

export function getMomentumSignal(product: PlatformProduct): MomentumSignal {
  const discount = getDiscountPercent(product.current_price, product.previous_price);
  const nearLow = product.current_price <= product.lowest_price * 1.05;
  if (product.volatility === 'high') return 'High Volatility';
  if (discount >= 18 || nearLow) return 'Falling Fast';
  if (product.current_price > product.average_price * 1.04) return 'Recovering Price';
  if (product.tracking_count > 12000) return 'Demand Increasing';
  return 'Stable Pricing';
}

export function getPricePulseScore(product: PlatformProduct) {
  const discount = getDiscountPercent(product.current_price, product.previous_price);
  const belowAverage = Math.max(0, ((product.average_price - product.current_price) / product.average_price) * 100);
  const popularity = Math.min(20, product.tracking_count / 1500);
  const lowBonus = product.current_price <= product.lowest_price * 1.05 ? 18 : 6;
  return Math.min(99, Math.round(discount * 1.4 + belowAverage * 1.2 + popularity + lowBonus));
}

export function getPersonalizedProducts() {
  const watchedIds = new Set(mockWatchlist.map(item => item.product_id));
  const watched = mockProducts.filter(product => watchedIds.has(product.id));
  const categories = new Set(watched.map(product => product.category));
  return {
    recentlyViewed: watched.length > 0 ? watched : mockProducts.slice(0, 3),
    trendingInCategories: mockProducts.filter(product => categories.has(product.category)).sort((a, b) => b.tracking_count - a.tracking_count).slice(0, 4),
    strongestDrops: [...mockProducts].sort((a, b) => getDiscountPercent(b.current_price, b.previous_price) - getDiscountPercent(a.current_price, a.previous_price)).slice(0, 4),
    mostTrackedToday: [...mockProducts].sort((a, b) => b.tracking_count - a.tracking_count).slice(0, 4),
    recommendedDeals: [...mockProducts].sort((a, b) => getPricePulseScore(b) - getPricePulseScore(a)).slice(0, 5),
  };
}

export function getDailyDealCollections() {
  const enriched = mockProducts.map(product => ({
    ...product,
    discount: getDiscountPercent(product.current_price, product.previous_price),
    savings: getSavingsAmount(product.current_price, product.previous_price),
    score: getPricePulseScore(product),
    momentum: getMomentumSignal(product),
  }));
  return {
    curated: [...enriched].sort((a, b) => b.score - a.score).slice(0, 5),
    historicalLows: enriched.filter(product => product.current_price <= product.lowest_price * 1.06).slice(0, 4),
    hiddenValue: enriched.filter(product => product.tracking_count < 9000).sort((a, b) => b.score - a.score).slice(0, 4),
    worthWatching: enriched.filter(product => product.volatility !== 'low').slice(0, 4),
  };
}

export function getCategoryMarket(category: ProductCategory) {
  const products = mockProducts.filter(product => product.category === category);
  const averageDiscount = products.length ? products.reduce((sum, product) => sum + getDiscountPercent(product.current_price, product.previous_price), 0) / products.length : 0;
  return {
    products,
    trending: [...products].sort((a, b) => b.tracking_count - a.tracking_count),
    strongestDeals: [...products].sort((a, b) => getPricePulseScore(b) - getPricePulseScore(a)),
    summary: `${category} currently shows ${averageDiscount.toFixed(1)}% average deal pressure across tracked retailers, with ${products.reduce((sum, product) => sum + product.tracking_count, 0).toLocaleString()} active trackers.`,
  };
}
