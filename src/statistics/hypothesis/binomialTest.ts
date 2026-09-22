import { binomialMean, binomialTailGreaterOrEqual } from '@/statistics/distributions/binomial'

export interface BinomialTestResult {
  successes: number
  trials: number
  /** Success probability under the null hypothesis. */
  nullProbability: number
  /** Expected number of successes if the null hypothesis holds. */
  expected: number
  /** One-sided p-value: P(X >= successes) under the null hypothesis. */
  pValue: number
}

/**
 * One-sided exact binomial test ("is this many hits more than chance?").
 *
 * The p-value is only a valid error rate for a hypothesis that was fixed
 * BEFORE the data were seen. Applying it to a region selected from the data
 * is precisely the mistake the scenarios demonstrate - the function does not
 * know the difference, which is the whole point.
 */
export function binomialTestGreater(
  successes: number,
  trials: number,
  nullProbability: number,
): BinomialTestResult {
  return {
    successes,
    trials,
    nullProbability,
    expected: binomialMean(trials, nullProbability),
    pValue: binomialTailGreaterOrEqual(successes, trials, nullProbability),
  }
}
