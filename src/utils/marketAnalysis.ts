export interface PricePoint {
  price: number;
  recorded_at: string;
}

export interface HistoricalStats {
  currentPrice: number | null;
  lowestPrice: number | null;
  highestPrice: number | null;
  averagePrice: number | null;
  rollingAverage30: number | null;
  rollingAverage90: number | null;
  volatilityScore: number;
  momentumScore: number;
  confidenceScore: number;
  percentBelowAverage90: number | null;
}

export type BuyingWindowSignal = 'favorable' | 'neutral' | 'wait' | 'insufficient_data';

export interface BuyingWindowAnalysis {
  signal: BuyingWindowSignal;
  summary: string;
  confidence: number;
  reasons: string[];
}

export function calculatePercentChange(current: number, previous: number) {
  if (previous <= 0) return 0;
  return ((current - previous) / previous) * 100;
}

export function calculateRollingAverage(points: PricePoint[], days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const scoped = points.filter(point => new Date(point.recorded_at).getTime() >= cutoff);
  if (scoped.length === 0) return null;
  return scoped.reduce((sum, point) => sum + point.price, 0) / scoped.length;
}

export function calculateVolatilityScore(points: PricePoint[]) {
  if (points.length < 3) return 0;
  const average = points.reduce((sum, point) => sum + point.price, 0) / points.length;
  if (average <= 0) return 0;
  const variance = points.reduce((sum, point) => sum + Math.pow(point.price - average, 2), 0) / points.length;
  const standardDeviation = Math.sqrt(variance);
  return Math.min(100, Math.round((standardDeviation / average) * 400));
}

export function calculateMomentumScore(points: PricePoint[]) {
  if (points.length < 2) return 0;
  const sorted = [...points].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const recent = sorted.slice(-5);
  if (recent.length < 2) return 0;
  const first = recent[0].price;
  const last = recent[recent.length - 1].price;
  return Math.max(-100, Math.min(100, Math.round(calculatePercentChange(last, first) * 8)));
}

export function calculateHistoricalStats(points: PricePoint[]): HistoricalStats {
  const sorted = [...points].sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  const prices = sorted.map(point => point.price);
  const currentPrice = prices.length ? prices[prices.length - 1] : null;
  const averagePrice = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : null;
  const rollingAverage90 = calculateRollingAverage(sorted, 90);
  const percentBelowAverage90 = currentPrice && rollingAverage90 ? calculatePercentChange(currentPrice, rollingAverage90) : null;
  const volatilityScore = calculateVolatilityScore(sorted);
  const momentumScore = calculateMomentumScore(sorted);
  const confidenceScore = Math.min(100, Math.round((Math.min(points.length, 120) / 120) * 70 + (volatilityScore < 45 ? 20 : 10)));

  return {
    currentPrice,
    lowestPrice: prices.length ? Math.min(...prices) : null,
    highestPrice: prices.length ? Math.max(...prices) : null,
    averagePrice,
    rollingAverage30: calculateRollingAverage(sorted, 30),
    rollingAverage90,
    volatilityScore,
    momentumScore,
    confidenceScore,
    percentBelowAverage90,
  };
}

export function analyzeBuyingWindow(points: PricePoint[]): BuyingWindowAnalysis {
  const stats = calculateHistoricalStats(points);
  const reasons: string[] = [];

  if (!stats.currentPrice || points.length < 5) {
    return { signal: 'insufficient_data', summary: 'Not enough pricing history to evaluate a buying window reliably.', confidence: stats.confidenceScore, reasons: ['More historical price points are needed.'] };
  }

  if (stats.percentBelowAverage90 !== null && stats.percentBelowAverage90 <= -10) reasons.push('Current price is meaningfully below the 90-day average.');
  if (stats.lowestPrice !== null && stats.currentPrice <= stats.lowestPrice * 1.05) reasons.push('Current price is close to the recorded historical low.');
  if (stats.momentumScore < -15) reasons.push('Recent price momentum is moving downward.');
  if (stats.volatilityScore > 65) reasons.push('High volatility suggests waiting may reduce regret for non-urgent purchases.');

  if (reasons.length >= 2 && stats.volatilityScore <= 70) {
    return { signal: 'favorable', summary: 'Historically favorable pricing window detected based on recent averages and recorded lows.', confidence: stats.confidenceScore, reasons };
  }

  if (stats.momentumScore > 20 && stats.percentBelowAverage90 !== null && stats.percentBelowAverage90 > -3) {
    return { signal: 'wait', summary: 'Price appears to be recovering or above normal range. Waiting may be reasonable if the purchase is not urgent.', confidence: stats.confidenceScore, reasons: reasons.length ? reasons : ['Recent momentum is not currently favorable.'] };
  }

  return { signal: 'neutral', summary: 'Current price is within a normal historical range. Buy timing depends on urgency and target price.', confidence: stats.confidenceScore, reasons: reasons.length ? reasons : ['No unusual historical pricing signal detected.'] };
}
