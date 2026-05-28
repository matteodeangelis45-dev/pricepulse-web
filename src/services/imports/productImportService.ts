import { supabase } from '../../lib/supabase';
import type { OfferAvailability, ProductOfferRow, ProductRowV2 } from '../../types/database-v2.types';
import type { ImportResult, ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

export interface ProductImportInput {
  slug: string;
  title: string;
  brand?: string | null;
  category: string;
  image_url?: string | null;
  description?: string | null;
  retailer_id?: string;
  product_url?: string;
  affiliate_url?: string | null;
  current_price?: number | null;
  availability?: OfferAvailability;
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const productImportService = {
  normalize(input: ProductImportInput): ProductImportInput {
    return {
      ...input,
      slug: normalizeSlug(input.slug || input.title),
      title: input.title.trim(),
      category: input.category.trim(),
      brand: input.brand?.trim() || null,
      image_url: input.image_url?.trim() || null,
      description: input.description?.trim() || null,
      product_url: input.product_url?.trim(),
      affiliate_url: input.affiliate_url?.trim() || null,
    };
  },

  async importProducts(inputs: ProductImportInput[]): Promise<ServiceResult<ImportResult>> {
    const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };

    try {
      for (const rawInput of inputs) {
        const input = this.normalize(rawInput);
        if (!input.slug || !input.title || !input.category) {
          result.skipped += 1;
          continue;
        }

        const { data: product, error: productError } = await supabase
          .from('products_v2')
          .upsert({ slug: input.slug, title: input.title, brand: input.brand ?? null, category: input.category, image_url: input.image_url ?? null, description: input.description ?? null, active: true }, { onConflict: 'slug' })
          .select()
          .single();

        if (productError) {
          result.errors.push(`${input.title}: ${productError.message}`);
          continue;
        }

        result.updated += 1;

        if (input.retailer_id && input.product_url) {
          const { error: offerError } = await supabase
            .from('product_offers')
            .upsert({ product_id: (product as ProductRowV2).id, retailer_id: input.retailer_id, product_url: input.product_url, affiliate_url: input.affiliate_url ?? null, current_price: input.current_price ?? null, previous_price: null, availability: input.availability ?? 'unknown' }, { onConflict: 'product_id,retailer_id,product_url' });

          if (offerError) result.errors.push(`${input.title} offer: ${offerError.message}`);
        }
      }

      return ok(result);
    } catch (error) {
      return fail(error);
    }
  },

  async createOffer(input: Omit<ProductOfferRow, 'id' | 'updated_at'>): Promise<ServiceResult<ProductOfferRow>> {
    try {
      const { data, error } = await supabase.from('product_offers').insert(input).select().single();
      if (error) throw error;
      return ok(data as ProductOfferRow);
    } catch (error) {
      return fail(error);
    }
  },
};
