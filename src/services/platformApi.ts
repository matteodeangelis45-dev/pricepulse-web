import { mockActivity, mockAlerts, mockCategorySummaries, mockPlatformMeta, mockProducts, mockWatchlist } from '../data/mockProducts';
import { mockPriceHistory } from '../data/mockPriceHistory';
import { getDiscountPercent, getSavingsAmount } from '../lib/chartUtils';
import type { ApiResult, PlatformActivityItem, PlatformAlert, PlatformCategorySummary, PlatformDeal, PlatformPriceHistory, PlatformProduct, PlatformWatchlistItem } from '../types/platform.types';

const NETWORK_DELAY_MS = 220;

function wait(ms = NETWORK_DELAY_MS) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function result<T>(data: T): Promise<ApiResult<T>> {
  await wait();
  return {
    data,
    error: null,
    updated_at: new Date().toISOString(),
  };
}

function toDeal(product: PlatformProduct): PlatformDeal {
  return {
    ...product,
    discount_percent: getDiscountPercent(product.current_price, product.previous_price),
    savings_amount: getSavingsAmount(product.current_price, product.previous_price),
    lowest_price_label: product.current_price <= product.lowest_price * 1.05 ? 'Lowest in 90 days' : 'Below average',
    urgency_label: product.availability === 'limited_stock' ? 'Limited stock' : 'Verified drop',
  };
}

export const platformApi = {
  async getTrendingProducts(limit = 10): Promise<ApiResult<PlatformProduct[]>> {
    return result([...mockProducts].sort((a, b) => b.tracking_count - a.tracking_count).slice(0, limit));
  },

  async getTopDeals(limit = 6): Promise<ApiResult<PlatformDeal[]>> {
    return result([...mockProducts].map(toDeal).sort((a, b) => b.discount_percent - a.discount_percent).slice(0, limit));
  },

  async getProductBySlug(slug: string): Promise<ApiResult<PlatformProduct | null>> {
    return result(mockProducts.find(product => product.slug === slug) ?? null);
  },

  async getProductHistory(productId: string): Promise<ApiResult<PlatformPriceHistory[]>> {
    return result(mockPriceHistory.filter(item => item.product_id === productId));
  },

  async getWatchlist(userId = 'mock-user'): Promise<ApiResult<PlatformWatchlistItem[]>> {
    return result(mockWatchlist.filter(item => item.user_id === userId));
  },

  async getRecentAlerts(userId = 'mock-user'): Promise<ApiResult<PlatformAlert[]>> {
    return result(mockAlerts.filter(item => item.user_id === userId));
  },

  async getLiveActivity(limit = 8): Promise<ApiResult<PlatformActivityItem[]>> {
    return result(mockActivity.slice(0, limit));
  },

  async getPopularCategories(): Promise<ApiResult<PlatformCategorySummary[]>> {
    return result(mockCategorySummaries);
  },

  async getPlatformMeta() {
    return result(mockPlatformMeta);
  },
};

export type PlatformApi = typeof platformApi;
