export const queryKeys = {
  products: {
    all: ['products'] as const,
    active: (category?: string) => ['products', 'active', category ?? 'all'] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    offers: (productId: string) => ['products', productId, 'offers'] as const,
  },
  pricing: {
    history: (productOfferId: string) => ['pricing', 'history', productOfferId] as const,
    trendSummary: (productOfferId: string) => ['pricing', 'trend-summary', productOfferId] as const,
  },
  watchlist: {
    user: (userId: string) => ['watchlist', userId] as const,
  },
  notifications: {
    user: (userId: string, unreadOnly = false) => ['notifications', userId, unreadOnly ? 'unread' : 'all'] as const,
  },
  alerts: {
    user: (userId: string, activeOnly = false) => ['alerts', userId, activeOnly ? 'active' : 'all'] as const,
  },
  extension: {
    overlay: (slug: string) => ['extension', 'overlay', slug] as const,
    insights: (slug: string) => ['extension', 'insights', slug] as const,
  },
  tracking: {
    dueJobs: ['tracking', 'due-jobs'] as const,
  },
};
