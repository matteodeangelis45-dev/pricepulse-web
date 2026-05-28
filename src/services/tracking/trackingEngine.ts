import { supabase } from '../../lib/supabase';
import type { TrackingJobRow } from '../../types/database-v2.types';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

export interface TrackingEngineConfig {
  batchSize: number;
  maxRetries: number;
  retryDelayMinutes: number;
  defaultCadenceMinutes: number;
}

export interface PriceCheckResult {
  product_offer_id: string;
  price: number | null;
  success: boolean;
  error?: string;
}

export const defaultTrackingConfig: TrackingEngineConfig = {
  batchSize: 25,
  maxRetries: 5,
  retryDelayMinutes: 30,
  defaultCadenceMinutes: 360,
};

export const trackingEngine = {
  async getDueJobs(config = defaultTrackingConfig): Promise<ServiceResult<TrackingJobRow[]>> {
    try {
      const { data, error } = await supabase
        .from('tracking_jobs')
        .select('*')
        .in('status', ['queued', 'failed', 'succeeded'])
        .lte('next_check_at', new Date().toISOString())
        .order('next_check_at', { ascending: true })
        .limit(config.batchSize);
      if (error) throw error;
      return ok((data ?? []) as TrackingJobRow[]);
    } catch (error) {
      return fail(error);
    }
  },

  async markRunning(jobId: string): Promise<ServiceResult<TrackingJobRow>> {
    try {
      const { data, error } = await supabase
        .from('tracking_jobs')
        .update({ status: 'running', locked_at: new Date().toISOString() })
        .eq('id', jobId)
        .select()
        .single();
      if (error) throw error;
      return ok(data as TrackingJobRow);
    } catch (error) {
      return fail(error);
    }
  },

  async markSucceeded(jobId: string, config = defaultTrackingConfig): Promise<ServiceResult<TrackingJobRow>> {
    try {
      const nextCheck = new Date(Date.now() + config.defaultCadenceMinutes * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('tracking_jobs')
        .update({ status: 'succeeded', last_checked_at: new Date().toISOString(), next_check_at: nextCheck, error_count: 0, last_error: null, locked_at: null })
        .eq('id', jobId)
        .select()
        .single();
      if (error) throw error;
      return ok(data as TrackingJobRow);
    } catch (error) {
      return fail(error);
    }
  },

  async markFailed(job: TrackingJobRow, errorMessage: string, config = defaultTrackingConfig): Promise<ServiceResult<TrackingJobRow>> {
    try {
      const errorCount = job.error_count + 1;
      const status = errorCount >= config.maxRetries ? 'paused' : 'failed';
      const nextCheck = new Date(Date.now() + config.retryDelayMinutes * 60 * 1000 * errorCount).toISOString();
      const { data, error } = await supabase
        .from('tracking_jobs')
        .update({ status, error_count: errorCount, last_error: errorMessage, next_check_at: nextCheck, locked_at: null })
        .eq('id', job.id)
        .select()
        .single();
      if (error) throw error;
      return ok(data as TrackingJobRow);
    } catch (error) {
      return fail(error);
    }
  },

  async enqueueOffer(productOfferId: string, nextCheckAt = new Date().toISOString()): Promise<ServiceResult<TrackingJobRow>> {
    try {
      const { data, error } = await supabase
        .from('tracking_jobs')
        .insert({ product_offer_id: productOfferId, next_check_at: nextCheckAt, status: 'queued', error_count: 0 })
        .select()
        .single();
      if (error) throw error;
      return ok(data as TrackingJobRow);
    } catch (error) {
      return fail(error);
    }
  },
};
