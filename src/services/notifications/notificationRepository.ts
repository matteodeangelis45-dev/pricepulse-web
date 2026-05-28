import { supabase } from '../../lib/supabase';
import type { NotificationRow, NotificationType } from '../../types/database-v2.types';
import type { ServiceResult } from '../core/types';
import { fail, ok } from '../core/types';

export const notificationRepository = {
  async listForUser(userId: string, unreadOnly = false): Promise<ServiceResult<NotificationRow[]>> {
    try {
      let query = supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (unreadOnly) query = query.eq('read', false);
      const { data, error } = await query;
      if (error) throw error;
      return ok((data ?? []) as NotificationRow[]);
    } catch (error) {
      return fail(error);
    }
  },

  async enqueue(input: { user_id: string; type: NotificationType; title: string; message: string; metadata?: Record<string, unknown> }): Promise<ServiceResult<NotificationRow>> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({ ...input, metadata: input.metadata ?? {}, read: false })
        .select()
        .single();
      if (error) throw error;
      return ok(data as NotificationRow);
    } catch (error) {
      return fail(error);
    }
  },

  async markRead(id: string): Promise<ServiceResult<NotificationRow>> {
    try {
      const { data, error } = await supabase.from('notifications').update({ read: true }).eq('id', id).select().single();
      if (error) throw error;
      return ok(data as NotificationRow);
    } catch (error) {
      return fail(error);
    }
  },
};
