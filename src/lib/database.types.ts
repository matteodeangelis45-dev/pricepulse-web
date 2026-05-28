export type ProductStatus = 'tracking' | 'target_reached' | 'price_dropped' | 'price_increased' | 'unavailable';
export type AlertType = 'target_reached' | 'price_drop' | 'price_increase' | 'back_in_stock';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  alert_email: boolean;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  title: string;
  url: string;
  image_url: string | null;
  current_price: number | null;
  target_price: number | null;
  currency: string;
  store: string | null;
  status: ProductStatus;
  last_scraped_at: string;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  recorded_at: string;
}

export interface UserTracking {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number | null;
  notify_price_drop: boolean;
  notify_target: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  product_id: string | null;
  type: AlertType;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: { id: string } & Partial<Profile>;
        Update: Partial<Profile>;
      };
      products: {
        Row: Product;
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Product, 'id' | 'user_id' | 'created_at'>>;
      };
      price_history: {
        Row: PriceHistory;
        Insert: Omit<PriceHistory, 'id'>;
        Update: Partial<PriceHistory>;
      };
      alerts: {
        Row: Alert;
        Insert: Omit<Alert, 'id' | 'created_at'>;
        Update: Partial<Alert>;
      };
      user_tracking: {
        Row: UserTracking;
        Insert: Omit<UserTracking, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserTracking, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}
