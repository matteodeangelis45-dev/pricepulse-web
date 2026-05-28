import { calculateMomentumScore, calculateVolatilityScore, type PricePoint } from '../utils/marketAnalysis';

export type MarketMomentumState = 'upward_trend' | 'downward_trend' | 'stable' | 'volatile' | 'cooling' | 'recovering' | 'insufficient_data';

export interface MomentumAnalysis {
  state: MarketMomentumState;
  score: number;
  volatilityScore: number;
  confidence: number;
  summary: string;
}

export function analyzeMomentum(points: PricePoint[]): MomentumAnalysis {
  if (points.length < 4) {
    return { state: 'insufficient_data', score: 0, volatilityScore: 0, confidence: 0, summary: 'More historical price data is needed before evaluating market momentum.' };
  }

  const score = calculateMomentumScore(points);
  const volatilityScore = calculateVolatilityScore(points);
  const confidence = Math.min(100, Math.round((Math.min(points.length, 90) / 90) * 75 + (volatilityScore < 55 ? 15 : 5)));

  if (volatilityScore >= 72) return { state: 'volatile', score, volatilityScore, confidence, summary: 'Price behavior is currently volatile compared with its historical range.' };
  if (score <= -35) return { state: 'cooling', score, volatilityScore, confidence, summary: 'Recent prices are cooling quickly relative to the recent history window.' };
  if (score < -12) return { state: 'downward_trend', score, volatilityScore, confidence, summary: 'Recent price momentum is moving downward.' };
  if (score >= 35) return { state: 'recovering', score, volatilityScore, confidence, summary: 'Price appears to be recovering from a lower recent range.' };
  if (score > 12) return { state: 'upward_trend', score, volatilityScore, confidence, summary: 'Recent price momentum is moving upward.' };
  return { state: 'stable', score, volatilityScore, confidence, summary: 'Pricing is broadly stable across the recent history window.' };
}
