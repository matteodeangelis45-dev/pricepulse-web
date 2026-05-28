import { mockActivity, mockCategorySummaries, mockPlatformMeta, mockProducts, mockWatchlist } from '../data/mockProducts';
import { getDiscountPercent, getSavingsAmount } from './chartUtils';
import { getMomentumSignal, getPricePulseScore } from './phase8Intelligence';
import type { PlatformProduct, ProductCategory } from '../types/platform.types';

export type MarketStatus = 'Market Cooling' | 'High Volatility' | 'Stable Pricing Week' | 'Increased GPU Demand' | 'Retailer Activity Spike';

export interface MarketIndexItem {
  category: ProductCategory;
  title: string;
  score: number;
  movement: number;
  volatility: 'Low' | 'Medium' | 'High';
  summary: string;
  values: number[];
}

export interface ProNotificationTemplate {
  type: 'price_drop' | 'watchlist_alert' | 'historical_low' | 'trend_reversal' | 'market_shift';
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high';
}

export const monetizationCapabilities = {
  subscriptions: { ready: true, label: 'Premium subscriptions' },
  proAnalytics: { ready: true, label: 'Pro analytics workspaces' },
  advancedAlerts: { ready: true, label: 'Advanced alert automation' },
  affiliateSystems: { ready: true, label: 'Affiliate attribution rails' },
  apiAccess: { ready: true, label: 'Market data API access' },
} as const;

export const notificationTemplates: ProNotificationTemplate[] = [
  { type: 'price_drop', title: 'Meaningful price drop', body: 'A tracked product moved below its recent market range.', priority: 'medium' },
  { type: 'watchlist_alert', title: 'Watchlist opportunity', body: 'A product you follow is approaching your target price.', priority: 'medium' },
  { type: 'historical_low', title: 'Historical low detected', body: 'A product reached one of its strongest recorded prices.', priority: 'high' },
  { type: 'trend_reversal', title: 'Trend reversal', body: 'A recovering product may be leaving its buying window.', priority: 'low' },
  { type: 'market_shift', title: 'Market shift', body: 'Category pricing moved outside normal weekly behavior.', priority: 'high' },
];

export function getMarketStatuses(): MarketStatus[] {
  return ['Market Cooling', 'Increased GPU Demand', 'Retailer Activity Spike', 'Stable Pricing Week'];
}

export function getMarketIndex(): MarketIndexItem[] {
  return mockCategorySummaries.map((summary, index) => {
    const products = mockProducts.filter(product => product.category === summary.category);
    const averageDiscount = products.reduce((sum, product) => sum + getDiscountPercent(product.current_price, product.previous_price), 0) / Math.max(products.length, 1);
    const volatilityScore = products.reduce((sum, product) => sum + (product.volatility === 'high' ? 3 : product.volatility === 'medium' ? 2 : 1), 0) / Math.max(products.length, 1);
    return {
      category: summary.category,
      title: `${summary.category} Market Index`,
      score: Math.round(58 + averageDiscount * 1.6 + summary.live_activity_count / 180),
      movement: Number((averageDiscount - 8 + index * 0.7).toFixed(1)),
      volatility: volatilityScore > 2.4 ? 'High' : volatilityScore > 1.5 ? 'Medium' : 'Low',
      summary: `${summary.category} shows ${averageDiscount.toFixed(1)}% average discount pressure across ${products.length} monitored products with ${summary.live_activity_count.toLocaleString()} recent movements.`,
      values: Array.from({ length: 12 }, (_, point) => 42 + Math.sin(point / 1.7 + index) * 16 + summary.average_discount + point * 1.5),
    };
  });
}

export function getSavingsAnalytics() {
  const watchlistIds = new Set(mockWatchlist.map(item => item.product_id));
  const watched = mockProducts.filter(product => watchlistIds.has(product.id));
  const products = watched.length > 0 ? watched : mockProducts.slice(0, 4);
  const totalSavings = products.reduce((sum, product) => sum + getSavingsAmount(product.current_price, product.previous_price), 0);
  const potentialSavings = products.reduce((sum, product) => sum + Math.max(0, product.current_price - product.lowest_price), 0);
  const best = [...products].sort((a, b) => getSavingsAmount(b.current_price, b.previous_price) - getSavingsAmount(a.current_price, a.previous_price))[0];
  const categories = new Set(products.map(product => product.category));
  return { totalSavings, potentialSavings, best, trackedCategories: categories.size, valuableProducts: products.sort((a, b) => getPricePulseScore(b) - getPricePulseScore(a)).slice(0, 3) };
}

export function getLiveDealStream() {
  const productEvents = mockProducts.slice(0, 8).map((product, index) => ({
    id: `stream-${product.id}`,
    product,
    message: index % 3 === 0 ? `${product.title} dropped ${getDiscountPercent(product.current_price, product.previous_price)}%` : index % 3 === 1 ? `${product.title} reached a strong tracked price` : `Price alert triggered for ${Math.round(product.tracking_count / 86)} users`,
    signal: getMomentumSignal(product),
    created_at: new Date(Date.now() - (index + 2) * 90 * 1000).toISOString(),
  }));
  return [...productEvents, ...mockActivity.map(item => ({ id: item.id, product: mockProducts.find(product => product.id === item.product_id) as PlatformProduct, message: item.message, signal: 'Stable Pricing' as const, created_at: item.created_at }))].filter(item => item.product);
}

export function getDiscoveryCollections() {
  const enriched = mockProducts.map(product => ({ ...product, score: getPricePulseScore(product), discount: getDiscountPercent(product.current_price, product.previous_price) }));
  return {
    trendingCollections: [...enriched].sort((a, b) => b.tracking_count - a.tracking_count).slice(0, 4),
    hiddenDeals: enriched.filter(product => product.tracking_count < 9000).sort((a, b) => b.score - a.score).slice(0, 4),
    recentlyVolatile: enriched.filter(product => product.volatility !== 'low').slice(0, 4),
    strongestHistoricalLows: enriched.filter(product => product.current_price <= product.lowest_price * 1.06).sort((a, b) => b.discount - a.discount).slice(0, 4),
  };
}

export function getPlatformAuthorityStats() {
  return [
    { label: 'Products monitored', value: `${(mockPlatformMeta.monitored_products / 1000000).toFixed(1)}M+` },
    { label: 'Retailer checks/day', value: '9.8M' },
    { label: 'Historical depth', value: '24 months' },
    { label: 'Update cadence', value: `${mockPlatformMeta.refresh_interval_minutes} min` },
  ];
}
