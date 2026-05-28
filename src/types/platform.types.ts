export type ProductCategory = 'GPUs' | 'Smartphones' | 'Gaming' | 'Laptops' | 'Monitors' | 'Audio';
export type ProductAvailability = 'in_stock' | 'limited_stock' | 'out_of_stock' | 'preorder';
export type ProductVolatility = 'low' | 'medium' | 'high';
export type RetailerName = 'Amazon' | 'Apple Reseller' | 'Best Buy' | 'Micro Center' | 'Samsung' | 'Sony Store' | 'B&H Photo' | 'Newegg';

export interface PlatformProduct {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: ProductCategory;
  retailer: RetailerName;
  current_price: number;
  previous_price: number;
  lowest_price: number;
  highest_price: number;
  average_price: number;
  affiliate_url: string;
  rating: number;
  review_count: number;
  availability: ProductAvailability;
  updated_at: string;
  volatility: ProductVolatility;
  tracking_count: number;
}

export interface PlatformPriceHistory {
  id: string;
  product_id: string;
  price: number;
  timestamp: string;
}

export interface PlatformAlert {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number;
  created_at: string;
  active: boolean;
}

export interface PlatformWatchlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface PlatformActivityItem {
  id: string;
  product_id: string;
  message: string;
  type: 'price_drop' | 'watchlist' | 'alert' | 'lowest_price' | 'stock';
  created_at: string;
}

export interface PlatformDeal extends PlatformProduct {
  discount_percent: number;
  savings_amount: number;
  lowest_price_label: string;
  urgency_label: string;
}

export interface PlatformCategorySummary {
  category: ProductCategory;
  trending_products: string[];
  average_discount: number;
  live_activity_count: number;
}

export interface ApiResult<T> {
  data: T;
  error: string | null;
  updated_at: string;
}
