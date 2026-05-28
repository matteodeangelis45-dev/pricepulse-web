import { supabase } from '../../lib/supabase';
import type { ProductOfferRow, ProductRowV2, ProductWithOffers, RetailerRow } from '../../types/database-v2.types';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

interface CreateProductInput {
  slug: string;
  title: string;
  brand?: string | null;
  category: string;
  image_url?: string | null;
  description?: string | null;
}

export const productRepository = {
  async listActiveProducts(category?: string): Promise<ServiceResult<ProductRowV2[]>> {
    try {
      let query = supabase.from('products_v2').select('*').eq('active', true).order('updated_at', { ascending: false });
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      return ok((data ?? []) as ProductRowV2[]);
    } catch (error) {
      return fail(error);
    }
  },

  async getProductBySlug(slug: string): Promise<ServiceResult<ProductWithOffers | null>> {
    try {
      const { data, error } = await supabase
        .from('products_v2')
        .select('*, offers:product_offers(*, retailer:retailers(*))')
        .eq('slug', slug)
        .eq('active', true)
        .maybeSingle();
      if (error) throw error;
      return ok((data ?? null) as ProductWithOffers | null);
    } catch (error) {
      return fail(error);
    }
  },

  async upsertProduct(input: CreateProductInput): Promise<ServiceResult<ProductRowV2>> {
    try {
      const { data, error } = await supabase
        .from('products_v2')
        .upsert({ ...input, active: true }, { onConflict: 'slug' })
        .select()
        .single();
      if (error) throw error;
      return ok(data as ProductRowV2);
    } catch (error) {
      return fail(error);
    }
  },

  async getOffers(productId: string): Promise<ServiceResult<Array<ProductOfferRow & { retailer: RetailerRow | null }>>> {
    try {
      const { data, error } = await supabase
        .from('product_offers')
        .select('*, retailer:retailers(*)')
        .eq('product_id', productId)
        .order('current_price', { ascending: true });
      if (error) throw error;
      return ok((data ?? []) as Array<ProductOfferRow & { retailer: RetailerRow | null }>);
    } catch (error) {
      return fail(error);
    }
  },
};
