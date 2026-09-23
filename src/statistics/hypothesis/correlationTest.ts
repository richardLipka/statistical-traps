import { studentTTwoSidedTail } from '@/statistics/distributions/studentT'

export interface CorrelationTestResult {
  r: number
  observations: number
  t: number
  df: number
  /** Two-sided p-value for the hypothesis that the true correlation is zero. */
  pValue: number
}

/**
 * Exact test that a Pearson correlation is zero.
 *
 *   t = r · sqrt(n - 2) / sqrt(1 - r²)   with n - 2 degrees of freedom
 *
 * Exact for normally distributed variables, which is what the simulation
 * generates. Valid for one pair of variables chosen before the data were
 * seen; applied to the strongest of thousands of pairs it is not, and the
 * formula cannot tell the difference.
 */
export function correlationTest(r: number, observations: number): CorrelationTestResult {
  const df = observations - 2
  if (!Number.isFinite(r) || df <= 0) {
    return { r, observations, t: Number.NaN, df, pValue: Number.NaN }
  }
  if (Math.abs(r) >= 1) {
    return { r, observations, t: Number.POSITIVE_INFINITY * Math.sign(r), df, pValue: 0 }
  }
  const t = (r * Math.sqrt(df)) / Math.sqrt(1 - r * r)
  return { r, observations, t, df, pValue: studentTTwoSidedTail(t, df) }
}

/**
 * The smallest correlation that would be called significant at this level,
 * for this many observations.
 *
 * Useful for saying out loud how low the bar is: with a few dozen
 * observations, a correlation most people would call weak clears it.
 */
export function criticalCorrelation(observations: number, alpha: number): number {
  const df = observations - 2
  if (df <= 0) return Number.NaN
  // Invert the t-test by bisection; the tail is monotone in |r|.
  let low = 0
  let high = 1 - 1e-12
  for (let step = 0; step < 200; step += 1) {
    const middle = (low + high) / 2
    if (correlationTest(middle, observations).pValue > alpha) low = middle
    else high = middle
  }
  return (low + high) / 2
}
