export type SubscriptionTier = 'free' | 'pro' | 'team' | 'enterprise';
export type OfferAvailability = 'in_stock' | 'limited_stock' | 'out_of_stock' | 'preorder' | 'unknown';
export type TrackingJobStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'paused';
export type NotificationType = 'price_drop' | 'watchlist_alert' | 'historical_low' | 'trend_reversal' | 'market_shift' | 'system';

export interface PlatformUserRow {
  id: string;
  email: string;
  created_at: string;
  subscription_tier: SubscriptionTier;
  settings: Record<string, unknown>;
}

export interface ProductRowV2 {
  id: string;
  slug: string;
  title: string;
  brand: string | null;
  category: string;
  image_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface RetailerRow {
  id: string;
  name: string;
  logo: string | null;
  affiliate_base_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductOfferRow {
  id: string;
  product_id: string;
  retailer_id: string;
  current_price: number | null;
  previous_price: number | null;
  availability: OfferAvailability;
  product_url: string;
  affiliate_url: string | null;
  updated_at: string;
}

export interface PriceHistoryRowV2 {
  id: string;
  product_offer_id: string;
  price: number;
  recorded_at: string;
}

export interface WatchlistRow {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface AlertRowV2 {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number;
  active: boolean;
  created_at: string;
  triggered_at: string | null;
  last_notification_at: string | null;
}

export interface TrackingJobRow {
  id: string;
  product_offer_id: string;
  last_checked_at: string | null;
  next_check_at: string;
  status: TrackingJobStatus;
  error_count: number;
  last_error: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProductWithOffers extends ProductRowV2 {
  offers: Array<ProductOfferRow & { retailer: RetailerRow | null }>;
}

export interface DatabaseV2 {
  public: {
    Tables: {
      users: { Row: PlatformUserRow; Insert: Omit<PlatformUserRow, 'created_at'> & Partial<Pick<PlatformUserRow, 'created_at' | 'subscription_tier' | 'settings'>>; Update: Partial<Omit<PlatformUserRow, 'id' | 'created_at'>> };
      products_v2: { Row: ProductRowV2; Insert: Omit<ProductRowV2, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<ProductRowV2, 'id' | 'created_at' | 'updated_at' | 'active'>>; Update: Partial<Omit<ProductRowV2, 'id' | 'created_at'>> };
      retailers: { Row: RetailerRow; Insert: Omit<RetailerRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<RetailerRow, 'id' | 'created_at' | 'updated_at' | 'active'>>; Update: Partial<Omit<RetailerRow, 'id' | 'created_at'>> };
      product_offers: { Row: ProductOfferRow; Insert: Omit<ProductOfferRow, 'id' | 'updated_at'> & Partial<Pick<ProductOfferRow, 'id' | 'updated_at'>>; Update: Partial<Omit<ProductOfferRow, 'id'>> };
      price_history_v2: { Row: PriceHistoryRowV2; Insert: Omit<PriceHistoryRowV2, 'id' | 'recorded_at'> & Partial<Pick<PriceHistoryRowV2, 'id' | 'recorded_at'>>; Update: Partial<PriceHistoryRowV2> };
      watchlists: { Row: WatchlistRow; Insert: Omit<WatchlistRow, 'id' | 'created_at'> & Partial<Pick<WatchlistRow, 'id' | 'created_at'>>; Update: Partial<WatchlistRow> };
      alerts_v2: { Row: AlertRowV2; Insert: Omit<AlertRowV2, 'id' | 'created_at' | 'triggered_at' | 'last_notification_at'> & Partial<Pick<AlertRowV2, 'id' | 'created_at' | 'triggered_at' | 'last_notification_at' | 'active'>>; Update: Partial<Omit<AlertRowV2, 'id' | 'user_id' | 'created_at'>> };
      tracking_jobs: { Row: TrackingJobRow; Insert: Omit<TrackingJobRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<TrackingJobRow, 'id' | 'created_at' | 'updated_at' | 'status' | 'error_count'>>; Update: Partial<Omit<TrackingJobRow, 'id' | 'created_at'>> };
      notifications: { Row: NotificationRow; Insert: Omit<NotificationRow, 'id' | 'created_at' | 'read' | 'metadata'> & Partial<Pick<NotificationRow, 'id' | 'created_at' | 'read' | 'metadata'>>; Update: Partial<Omit<NotificationRow, 'id' | 'user_id' | 'created_at'>> };
    };
  };
}
