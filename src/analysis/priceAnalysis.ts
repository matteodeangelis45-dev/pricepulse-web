import { calculateHistoricalStats, calculatePercentChange, calculateRollingAverage, calculateVolatilityScore, type PricePoint } from '../utils/marketAnalysis';

export interface PriceAnalysisSummary {
  currentPrice: number | null;
  historicalAverage: number | null;
  average7d: number | null;
  average30d: number | null;
  average90d: number | null;
  lowestPrice: number | null;
  highestPrice: number | null;
  currentVsAveragePercent: number | null;
  currentVs90dAveragePercent: number | null;
  dropFromHighestPercent: number | null;
  distanceFromLowestPercent: number | null;
  volatilityScore: number;
  confidenceScore: number;
}

export function analyzePriceHistory(points: PricePoint[]): PriceAnalysisSummary {
  const stats = calculateHistoricalStats(points);
  const average7d = calculateRollingAverage(points, 7);
  const dropFromHighestPercent = stats.currentPrice && stats.highestPrice ? calculatePercentChange(stats.currentPrice, stats.highestPrice) : null;
  const distanceFromLowestPercent = stats.currentPrice && stats.lowestPrice ? calculatePercentChange(stats.currentPrice, stats.lowestPrice) : null;

  return {
    currentPrice: stats.currentPrice,
    historicalAverage: stats.averagePrice,
    average7d,
    average30d: stats.rollingAverage30,
    average90d: stats.rollingAverage90,
    lowestPrice: stats.lowestPrice,
    highestPrice: stats.highestPrice,
    currentVsAveragePercent: stats.currentPrice && stats.averagePrice ? calculatePercentChange(stats.currentPrice, stats.averagePrice) : null,
    currentVs90dAveragePercent: stats.percentBelowAverage90,
    dropFromHighestPercent,
    distanceFromLowestPercent,
    volatilityScore: calculateVolatilityScore(points),
    confidenceScore: stats.confidenceScore,
  };
}

export function isUnusualDrop(summary: PriceAnalysisSummary, thresholdPercent = -12) {
  return summary.currentVs90dAveragePercent !== null && summary.currentVs90dAveragePercent <= thresholdPercent;
}

export function isNearHistoricalLow(summary: PriceAnalysisSummary, tolerancePercent = 5) {
  return summary.distanceFromLowestPercent !== null && summary.distanceFromLowestPercent <= tolerancePercent;
}
