import type { Product } from './database.types';

export interface SeoMeta {
  title: string;
  description: string;
  canonicalPath: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string | null;
  twitterTitle: string;
  twitterDescription: string;
}

export function slugifyProductTitle(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function buildProductSeo(product: Product): SeoMeta {
  const slug = slugifyProductTitle(product.title);
  const price = product.current_price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.current_price) : 'latest price';
  const store = product.store ? ` at ${product.store}` : '';
  const description = `Track ${product.title}${store}, currently listed at ${price}. View price history, target alerts, historical lows, market trend signals, and buying guidance on PricePulse.`;

  return {
    title: `${product.title} Price History, Alerts & Market Trends | PricePulse`,
    description,
    canonicalPath: `/product/${slug}`,
    ogTitle: `${product.title} price tracking`,
    ogDescription: description,
    ogImage: product.image_url,
    twitterTitle: `${product.title} on PricePulse`,
    twitterDescription: description,
  };
}

export function applySeoMeta(meta: SeoMeta) {
  document.title = meta.title;
  setMeta('description', meta.description);
  setMeta('og:title', meta.ogTitle, 'property');
  setMeta('og:description', meta.ogDescription, 'property');
  setMeta('og:type', 'product', 'property');
  setMeta('og:url', `${window.location.origin}${meta.canonicalPath}`, 'property');
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', meta.twitterTitle);
  setMeta('twitter:description', meta.twitterDescription);
  if (meta.ogImage) {
    setMeta('og:image', meta.ogImage, 'property');
    setMeta('twitter:image', meta.ogImage);
  }
  setCanonical(meta.canonicalPath);
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let element = document.head.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setCanonical(path: string) {
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.rel = 'canonical';
    document.head.appendChild(element);
  }
  element.href = `${window.location.origin}${path}`;
}
