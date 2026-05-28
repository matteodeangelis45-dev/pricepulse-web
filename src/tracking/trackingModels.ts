import type { OfferAvailability } from '../types/database-v2.types';
import type { BuyingWindowScore } from '../analysis/buyingWindow';
import type { MomentumAnalysis } from '../analysis/momentumAnalysis';
import type { PriceAnalysisSummary } from '../analysis/priceAnalysis';

export interface ProductUrlInput {
  url: string;
  user_id?: string;
  target_price?: number;
}

export interface NormalizedProductIdentity {
  slug: string;
  title: string;
  brand: string | null;
  category: string;
  canonical_url: string;
  retailer_name: string;
}

export interface ExtractedOfferSnapshot {
  retailer_name: string;
  product_url: string;
  affiliate_url: string | null;
  current_price: number | null;
  availability: OfferAvailability;
  captured_at: string;
}

export interface TrackingWorkflowResult {
  product_id: string | null;
  offer_id: string | null;
  price_recorded: boolean;
  priceAnalysis: PriceAnalysisSummary | null;
  momentum: MomentumAnalysis | null;
  buyingWindow: BuyingWindowScore | null;
  alertsEvaluated: number;
  notificationsPrepared: number;
  errors: string[];
}

export type TrackingWorkflowStage = 'normalize_product' | 'extract_offer' | 'upsert_product' | 'record_history' | 'analyze_market' | 'evaluate_alerts' | 'prepare_notifications';
