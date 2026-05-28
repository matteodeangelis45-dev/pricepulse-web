export const platformFeatures = {
  premiumAnalytics: {
    enabled: false,
    label: 'Pro analytics',
  },
  advancedAlerts: {
    enabled: false,
    label: 'Advanced alerts',
  },
  affiliateAttribution: {
    enabled: false,
    label: 'Affiliate integrations',
  },
  realtimeDealPipeline: {
    enabled: false,
    label: 'Live deal pipeline',
  },
} as const;

export type PlatformFeatureKey = keyof typeof platformFeatures;
