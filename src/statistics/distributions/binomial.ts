/**
 * Binomial distribution helpers.
 *
 * Computed in log space so that tail probabilities stay accurate for the
 * small probabilities and moderate counts the scenarios produce.
 */

import { logGamma } from '@/statistics/distributions/gamma'

/** log(n choose k). */
export function logBinomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return Number.NEGATIVE_INFINITY
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1)
}

/** P(X = k) for X ~ Binomial(n, p). */
export function binomialPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0
  if (p <= 0) return k === 0 ? 1 : 0
  if (p >= 1) return k === n ? 1 : 0
  return Math.exp(logBinomialCoefficient(n, k) + k * Math.log(p) + (n - k) * Math.log1p(-p))
}

/** P(X >= k) for X ~ Binomial(n, p) - the upper tail used by all "at least this many" questions. */
export function binomialTailGreaterOrEqual(k: number, n: number, p: number): number {
  if (k <= 0) return 1
  if (k > n) return 0
  // Sum the shorter tail for numerical stability, then complement if needed.
  const expected = n * p
  if (k <= expected) {
    let lower = 0
    for (let i = 0; i < k; i += 1) lower += binomialPmf(i, n, p)
    return Math.min(1, Math.max(0, 1 - lower))
  }
  let upper = 0
  for (let i = k; i <= n; i += 1) upper += binomialPmf(i, n, p)
  return Math.min(1, Math.max(0, upper))
}

export function binomialMean(n: number, p: number): number {
  return n * p
}

export function binomialStandardDeviation(n: number, p: number): number {
  return Math.sqrt(n * p * (1 - p))
}
