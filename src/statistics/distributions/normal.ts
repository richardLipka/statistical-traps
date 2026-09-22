import { regularizedGammaP, regularizedGammaQ } from '@/statistics/distributions/gamma'

/**
 * The normal distribution, expressed through the incomplete gamma function:
 *
 *   erf(x)  = P(1/2, x²)   for x >= 0
 *   erfc(x) = Q(1/2, x²)   for x >= 0
 *
 * which shares its machinery with the other distributions here.
 */

export function erf(x: number): number {
  if (Number.isNaN(x)) return Number.NaN
  return x < 0 ? -regularizedGammaP(0.5, x * x) : regularizedGammaP(0.5, x * x)
}

export function erfc(x: number): number {
  if (Number.isNaN(x)) return Number.NaN
  return x < 0 ? 1 + regularizedGammaP(0.5, x * x) : regularizedGammaQ(0.5, x * x)
}

/** Φ(x): probability that a standard normal deviate is at most x. */
export function normalCdf(x: number, mean = 0, standardDeviation = 1): number {
  if (!(standardDeviation > 0)) return Number.NaN
  return 0.5 * erfc(-((x - mean) / standardDeviation) / Math.SQRT2)
}

/**
 * Two-sided tail: P(|Z| >= |z|) for a standard normal Z.
 *
 * Computed as erfc(|z|/√2) rather than as 2·(1 - Φ(|z|)): the second form
 * cancels away all its significant digits once |z| is above about 5, which
 * is exactly where a searched-for result tends to land.
 */
export function normalTwoSidedTail(z: number): number {
  if (!Number.isFinite(z)) return Number.NaN
  return erfc(Math.abs(z) / Math.SQRT2)
}

/** One-sided upper tail: P(Z >= z). */
export function normalUpperTail(z: number): number {
  if (!Number.isFinite(z)) return Number.NaN
  return 0.5 * erfc(z / Math.SQRT2)
}
