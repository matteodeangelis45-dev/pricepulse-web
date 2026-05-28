import type { ProductRowV2 } from '../../types/database-v2.types';

export interface SeoRouteDefinition {
  path: string;
  canonicalUrl: string;
  priority: number;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  lastModified?: string;
}

export interface ProductStructuredDataInput {
  product: ProductRowV2;
  canonicalUrl: string;
  lowestPrice?: number | null;
  currency?: string;
}

export function buildCanonicalUrl(origin: string, path: string) {
  const normalizedOrigin = origin.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedOrigin}${normalizedPath}`;
}

export function buildProductStructuredData(input: ProductStructuredDataInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.product.title,
    brand: input.product.brand ? { '@type': 'Brand', name: input.product.brand } : undefined,
    category: input.product.category,
    image: input.product.image_url ? [input.product.image_url] : undefined,
    description: input.product.description ?? undefined,
    url: input.canonicalUrl,
    offers: input.lowestPrice ? {
      '@type': 'AggregateOffer',
      lowPrice: input.lowestPrice,
      priceCurrency: input.currency ?? 'USD',
      availability: 'https://schema.org/InStock',
    } : undefined,
  };
}

export function buildSitemapEntries(origin: string, products: ProductRowV2[], categories: string[]): SeoRouteDefinition[] {
  const base: SeoRouteDefinition[] = [
    { path: '/', canonicalUrl: buildCanonicalUrl(origin, '/'), priority: 1, changeFrequency: 'daily' },
    { path: '/market', canonicalUrl: buildCanonicalUrl(origin, '/market'), priority: 0.8, changeFrequency: 'hourly' },
  ];

  const categoryEntries = categories.map(category => ({
    path: `/categories/${encodeURIComponent(category.toLowerCase())}`,
    canonicalUrl: buildCanonicalUrl(origin, `/categories/${encodeURIComponent(category.toLowerCase())}`),
    priority: 0.7,
    changeFrequency: 'daily' as const,
  }));

  const productEntries = products.map(product => ({
    path: `/products/${product.slug}`,
    canonicalUrl: buildCanonicalUrl(origin, `/products/${product.slug}`),
    priority: 0.75,
    changeFrequency: 'daily' as const,
    lastModified: product.updated_at,
  }));

  return [...base, ...categoryEntries, ...productEntries];
}
