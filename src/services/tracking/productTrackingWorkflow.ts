import { scoreBuyingWindow } from '../../analysis/buyingWindow';
import { analyzeMomentum } from '../../analysis/momentumAnalysis';
import { analyzePriceHistory } from '../../analysis/priceAnalysis';
import type { ExtractedOfferSnapshot, NormalizedProductIdentity, ProductUrlInput, TrackingWorkflowResult } from '../../tracking/trackingModels';
import { createTrackingLogger } from '../../tracking/trackingLogger';
import { supabase } from '../../lib/supabase';
import { alertEngine } from '../alerts/alertEngine';
import { fail, ok, type ServiceResult } from '../core/types';
import { historyService } from '../history/historyService';
import { productImportService } from '../imports/productImportService';
import { retailerRepository } from '../retailers/retailerRepository';

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/https?:\/\//, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
}

function inferRetailerName(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname.split('.')[0].replace(/-/g, ' ');
  } catch {
    return 'Unknown retailer';
  }
}

export const productTrackingWorkflow = {
  normalizeProduct(input: ProductUrlInput): NormalizedProductIdentity {
    const retailerName = inferRetailerName(input.url);
    const slug = slugify(input.url);
    return {
      slug,
      title: slug.replace(/-/g, ' ').slice(0, 96) || 'Tracked product',
      brand: null,
      category: 'Uncategorized',
      canonical_url: input.url,
      retailer_name: retailerName,
    };
  },

  extractOffer(identity: NormalizedProductIdentity): ExtractedOfferSnapshot {
    return {
      retailer_name: identity.retailer_name,
      product_url: identity.canonical_url,
      affiliate_url: null,
      current_price: null,
      availability: 'unknown',
      captured_at: new Date().toISOString(),
    };
  },

  async run(input: ProductUrlInput): Promise<ServiceResult<TrackingWorkflowResult>> {
    const logger = createTrackingLogger();
    const result: TrackingWorkflowResult = { product_id: null, offer_id: null, price_recorded: false, priceAnalysis: null, momentum: null, buyingWindow: null, alertsEvaluated: 0, notificationsPrepared: 0, errors: [] };

    try {
      logger.info('normalize_product', 'Normalizing product URL', { url: input.url });
      const identity = this.normalizeProduct(input);

      logger.info('extract_offer', 'Preparing offer extraction snapshot', { retailer: identity.retailer_name });
      const offer = this.extractOffer(identity);

      logger.info('upsert_product', 'Importing normalized product shell');
      const retailers = await retailerRepository.importRetailers([{ name: identity.retailer_name, active: true }]);
      if (retailers.error) result.errors.push(retailers.error);

      const retailerLookup = await supabase.from('retailers').select('*').eq('name', identity.retailer_name).maybeSingle();
      if (retailerLookup.error) throw retailerLookup.error;
      if (!retailerLookup.data) throw new Error('Retailer could not be created or found.');

      const imported = await productImportService.importProducts([{ slug: identity.slug, title: identity.title, brand: identity.brand, category: identity.category, retailer_id: retailerLookup.data.id, product_url: offer.product_url, affiliate_url: offer.affiliate_url, current_price: offer.current_price, availability: offer.availability }]);
      if (imported.error) throw new Error(imported.error);

      const productLookup = await supabase.from('products_v2').select('*').eq('slug', identity.slug).maybeSingle();
      if (productLookup.error) throw productLookup.error;
      if (!productLookup.data) throw new Error('Product could not be created or found.');
      result.product_id = productLookup.data.id;

      const offerLookup = await supabase.from('product_offers').select('*').eq('product_id', productLookup.data.id).eq('retailer_id', retailerLookup.data.id).eq('product_url', offer.product_url).maybeSingle();
      if (offerLookup.error) throw offerLookup.error;
      if (!offerLookup.data) throw new Error('Offer could not be created or found.');
      result.offer_id = offerLookup.data.id;

      if (offer.current_price !== null) {
        logger.info('record_history', 'Recording extracted price point', { price: offer.current_price });
        const recorded = await historyService.record(offerLookup.data.id, offer.current_price, offer.captured_at);
        if (recorded.error) result.errors.push(recorded.error);
        result.price_recorded = !recorded.error;
      } else {
        logger.warn('record_history', 'No price extracted; history recording skipped');
      }

      logger.info('analyze_market', 'Calculating market intelligence from historical prices');
      const history = await historyService.getOfferHistory(offerLookup.data.id);
      if (history.error) throw new Error(history.error);
      const points = (history.data ?? []).map(point => ({ price: point.price, recorded_at: point.recorded_at }));
      result.priceAnalysis = analyzePriceHistory(points);
      result.momentum = analyzeMomentum(points);
      result.buyingWindow = scoreBuyingWindow(points);

      logger.info('evaluate_alerts', 'Evaluating target price alerts');
      const evaluated = await alertEngine.evaluateOffer(productLookup.data.id, offerLookup.data);
      if (evaluated.error) result.errors.push(evaluated.error);
      result.alertsEvaluated = evaluated.data?.triggeredAlerts.length ?? 0;
      result.notificationsPrepared = evaluated.data?.notifications.length ?? 0;

      logger.info('prepare_notifications', 'Workflow completed', { entries: logger.entries().length });
      return ok(result);
    } catch (error) {
      logger.error('prepare_notifications', error instanceof Error ? error.message : 'Tracking workflow failed');
      result.errors.push(error instanceof Error ? error.message : 'Tracking workflow failed');
      return fail(error);
    }
  },
};
