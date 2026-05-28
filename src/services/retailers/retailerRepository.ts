import { supabase } from '../../lib/supabase';
import type { RetailerRow } from '../../types/database-v2.types';
import type { ImportResult, ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

export interface RetailerImportInput {
  name: string;
  logo?: string | null;
  affiliate_base_url?: string | null;
  active?: boolean;
}

export const retailerRepository = {
  async listActive(): Promise<ServiceResult<RetailerRow[]>> {
    try {
      const { data, error } = await supabase
        .from('retailers')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      return ok((data ?? []) as RetailerRow[]);
    } catch (error) {
      return fail(error);
    }
  },

  async importRetailers(retailers: RetailerImportInput[]): Promise<ServiceResult<ImportResult>> {
    const result: ImportResult = { created: 0, updated: 0, skipped: 0, errors: [] };
    try {
      for (const retailer of retailers) {
        if (!retailer.name.trim()) {
          result.skipped += 1;
          continue;
        }

        const { error } = await supabase
          .from('retailers')
          .upsert({ name: retailer.name.trim(), logo: retailer.logo ?? null, affiliate_base_url: retailer.affiliate_base_url ?? null, active: retailer.active ?? true }, { onConflict: 'name' });

        if (error) {
          result.errors.push(`${retailer.name}: ${error.message}`);
        } else {
          result.updated += 1;
        }
      }

      return ok(result);
    } catch (error) {
      return fail(error);
    }
  },
};
