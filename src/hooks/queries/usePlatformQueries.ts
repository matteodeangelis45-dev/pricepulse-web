import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { alertRepository } from '../../services/alerts/alertRepository';
import { extensionInsightService } from '../../services/extension/extensionInsightService';
import { extensionReadService } from '../../services/extension/extensionReadService';
import { historyService } from '../../services/history/historyService';
import { notificationRepository } from '../../services/notifications/notificationRepository';
import { pricingService } from '../../services/pricing/pricingService';
import { productRepository } from '../../services/products/productRepository';
import { productTrackingWorkflow } from '../../services/tracking/productTrackingWorkflow';
import { watchlistRepository } from '../../services/watchlist/watchlistRepository';
import { queryKeys } from './queryKeys';

function unwrap<T>(result: { data: T | null; error: string | null }): T {
  if (result.error) throw new Error(result.error);
  return result.data as T;
}

export function useActiveProductsQuery(category?: string) {
  return useQuery({
    queryKey: queryKeys.products.active(category),
    queryFn: async () => unwrap(await productRepository.listActiveProducts(category)),
  });
}

export function useProductBySlugQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: async () => unwrap(await productRepository.getProductBySlug(slug)),
    enabled: Boolean(slug),
  });
}

export function useOfferHistoryQuery(productOfferId: string) {
  return useQuery({
    queryKey: queryKeys.pricing.history(productOfferId),
    queryFn: async () => unwrap(await pricingService.getHistory(productOfferId)),
    enabled: Boolean(productOfferId),
  });
}

export function useNotificationsQuery(userId: string | undefined, unreadOnly = false) {
  return useQuery({
    queryKey: userId ? queryKeys.notifications.user(userId, unreadOnly) : ['notifications', 'anonymous'],
    queryFn: async () => unwrap(await notificationRepository.listForUser(userId as string, unreadOnly)),
    enabled: Boolean(userId),
  });
}

export function useMarkNotificationReadMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => unwrap(await notificationRepository.markRead(notificationId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.user(userId, false) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.user(userId, true) });
    },
  });
}

export function useTrendSummaryQuery(productOfferId: string) {
  return useQuery({
    queryKey: queryKeys.pricing.trendSummary(productOfferId),
    queryFn: async () => unwrap(await historyService.getTrendSummary(productOfferId)),
    enabled: Boolean(productOfferId),
  });
}

export function useWatchlistQuery(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? queryKeys.watchlist.user(userId) : ['watchlist', 'anonymous'],
    queryFn: async () => unwrap(await watchlistRepository.listForUser(userId as string)),
    enabled: Boolean(userId),
  });
}

export function useAddWatchlistMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => unwrap(await watchlistRepository.add(userId, productId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.user(userId) });
    },
  });
}

export function useRemoveWatchlistMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => unwrap(await watchlistRepository.remove(userId, productId)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.user(userId) });
    },
  });
}

export function useExtensionOverlayQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.extension.overlay(slug),
    queryFn: async () => unwrap(await extensionReadService.getProductOverlayBySlug(slug)),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}

export function useAlertsQuery(userId: string | undefined, activeOnly = false) {
  return useQuery({
    queryKey: userId ? queryKeys.alerts.user(userId, activeOnly) : ['alerts', 'anonymous'],
    queryFn: async () => unwrap(await alertRepository.listForUser(userId as string, activeOnly)),
    enabled: Boolean(userId),
  });
}

export function useCreateAlertMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { product_id: string; target_price: number }) => unwrap(await alertRepository.create({ user_id: userId, ...input })),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts.user(userId, false) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alerts.user(userId, true) });
    },
  });
}

export function useExtensionInsightsQuery(slug: string) {
  return useQuery({
    queryKey: queryKeys.extension.insights(slug),
    queryFn: async () => unwrap(await extensionInsightService.getInsightsBySlug(slug)),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}

export function useRunTrackingWorkflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { url: string; user_id?: string; target_price?: number }) => unwrap(await productTrackingWorkflow.run(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
