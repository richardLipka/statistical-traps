import {
  poissonBinomialMean,
  poissonBinomialTailGreaterOrEqual,
  poissonBinomialVariance,
} from '@/statistics/distributions/poissonBinomial'

export interface RiskAdjustedTestResult {
  observed: number
  /** Expected number of events for these particular individuals. */
  expected: number
  /** Observed over expected. Above 1 means more events than the risks predict. */
  ratio: number
  /** Standardized excess, used as the search statistic when many units are compared. */
  z: number
  /** One-sided exact p-value: P(X >= observed) under the individual risks. */
  pValue: number
}

/**
 * Compares a count of events against what the individuals' own risks predict.
 *
 * This is the risk adjustment a comparison of raw rates is missing: it asks
 * "more events than THESE people were expected to have", not "more events
 * than average". The null distribution is Poisson-binomial rather than
 * binomial, and the p-value is exact.
 *
 * Two things the test still cannot do, and the scenarios must say so:
 * it cannot correct for risks that were not measured, and it cannot know
 * that this unit was selected for being the most extreme of many.
 */
export function riskAdjustedTest(
  observed: number,
  risks: readonly number[],
): RiskAdjustedTestResult {
  const expected = poissonBinomialMean(risks)
  const variance = poissonBinomialVariance(risks)
  return {
    observed,
    expected,
    ratio: expected > 0 ? observed / expected : Number.NaN,
    z: variance > 0 ? (observed - expected) / Math.sqrt(variance) : Number.NaN,
    pValue: poissonBinomialTailGreaterOrEqual(observed, risks),
  }
}
