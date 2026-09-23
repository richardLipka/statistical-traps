import { regularizedIncompleteBeta } from '@/statistics/distributions/fDistribution'

/**
 * Student's t distribution, expressed through the regularized incomplete beta
 * function that the F distribution already uses:
 *
 *   P(|T| >= |t|) = I_{df/(df + t²)}(df/2, 1/2)
 *
 * Exact rather than approximated, and shared rather than reimplemented.
 */

/** Two-sided tail: P(|T| >= |t|) with df degrees of freedom. */
export function studentTTwoSidedTail(t: number, df: number): number {
  if (!Number.isFinite(t) || !(df > 0)) return Number.NaN
  const x = df / (df + t * t)
  return regularizedIncompleteBeta(x, df / 2, 0.5)
}

/** One-sided upper tail: P(T >= t). */
export function studentTUpperTail(t: number, df: number): number {
  if (!Number.isFinite(t) || !(df > 0)) return Number.NaN
  const half = studentTTwoSidedTail(t, df) / 2
  return t >= 0 ? half : 1 - half
}

/** P(T <= t): the distribution function. */
export function studentTCdf(t: number, df: number): number {
  return 1 - studentTUpperTail(t, df)
}
