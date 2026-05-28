import type { PlatformPriceHistory } from '../types/platform.types';

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

function history(productId: string, prices: number[]): PlatformPriceHistory[] {
  return prices.map((price, index) => ({
    id: `${productId}-history-${index + 1}`,
    product_id: productId,
    price,
    timestamp: daysAgo((prices.length - index - 1) * 7),
  }));
}

export const mockPriceHistory: PlatformPriceHistory[] = [
  ...history('prod-rtx-5090', [2299, 2249, 2199, 2260, 2139, 2079, 1998, 1899]),
  ...history('prod-iphone-16-pro', [1199, 1189, 1179, 1129, 1099, 1089, 1079, 1049]),
  ...history('prod-macbook-air-m4', [1399, 1379, 1349, 1329, 1299, 1249, 1219, 1199]),
  ...history('prod-ps5-slim', [549, 529, 519, 499, 509, 479, 459, 449]),
  ...history('prod-odyssey-oled-g9', [1499, 1449, 1399, 1329, 1279, 1199, 1149, 1099]),
  ...history('prod-sony-xm5', [399, 379, 369, 349, 329, 318, 309, 298]),
  ...history('prod-steam-deck-oled', [649, 639, 629, 619, 599, 589, 579, 589]),
  ...history('prod-lg-ultragear-4k', [899, 849, 829, 799, 749, 729, 699, 699]),
  ...history('prod-airpods-pro-2', [249, 239, 229, 219, 209, 199, 189, 189]),
  ...history('prod-mx-master-3s', [109, 104, 99, 94, 92, 89, 84, 84]),
];
