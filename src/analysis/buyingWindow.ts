import { analyzeBuyingWindow, type BuyingWindowAnalysis, type PricePoint } from '../utils/marketAnalysis';
import { analyzeMomentum } from './momentumAnalysis';
import { analyzePriceHistory, isNearHistoricalLow, isUnusualDrop } from './priceAnalysis';

export type BuyingCondition = 'rare_opportunity' | 'favorable_window' | 'historically_average' | 'elevated_volatility' | 'unusually_expensive' | 'insufficient_data';

export interface BuyingWindowScore {
  condition: BuyingCondition;
  score: number;
  analysis: BuyingWindowAnalysis;
  summary: string;
  reasons: string[];
}

export function scoreBuyingWindow(points: PricePoint[]): BuyingWindowScore {
  const analysis = analyzeBuyingWindow(points);
  const price = analyzePriceHistory(points);
  const momentum = analyzeMomentum(points);
  const reasons = [...analysis.reasons];

  if (analysis.signal === 'insufficient_data') {
    return { condition: 'insufficient_data', score: 0, analysis, summary: analysis.summary, reasons };
  }

  let score = 50;
  if (price.currentVs90dAveragePercent !== null) score += Math.max(-25, Math.min(25, -price.currentVs90dAveragePercent * 1.6));
  if (isNearHistoricalLow(price)) score += 18;
  if (isUnusualDrop(price)) score += 14;
  if (momentum.state === 'cooling' || momentum.state === 'downward_trend') score += 8;
  if (momentum.state === 'recovering' || momentum.state === 'upward_trend') score -= 10;
  if (price.volatilityScore > 70) score -= 12;
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score >= 82 && isNearHistoricalLow(price)) return { condition: 'rare_opportunity', score, analysis, summary: 'Rare historical pricing opportunity based on recorded lows and recent averages.', reasons };
  if (score >= 68) return { condition: 'favorable_window', score, analysis, summary: 'Historically favorable buying window based on current position versus recorded history.', reasons };
  if (price.volatilityScore > 70) return { condition: 'elevated_volatility', score, analysis, summary: 'Elevated volatility period. Waiting may be reasonable for non-urgent purchases.', reasons };
  if (score <= 35) return { condition: 'unusually_expensive', score, analysis, summary: 'Current pricing appears weak relative to recent historical behavior.', reasons };
  return { condition: 'historically_average', score, analysis, summary: 'Current pricing is close to its normal historical range.', reasons };
}
