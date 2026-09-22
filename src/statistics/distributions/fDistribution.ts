import { logGamma } from '@/statistics/distributions/gamma'

const MAX_ITERATIONS = 300
const EPSILON = 3e-14
const TINY = 1e-300

/** Continued fraction for the incomplete beta function (modified Lentz method). */
function betaContinuedFraction(x: number, a: number, b: number): number {
  const qab = a + b
  const qap = a + 1
  const qam = a - 1
  let c = 1
  let d = 1 - (qab * x) / qap
  if (Math.abs(d) < TINY) d = TINY
  d = 1 / d
  let h = d

  for (let m = 1; m <= MAX_ITERATIONS; m += 1) {
    const m2 = 2 * m
    let numerator = (m * (b - m) * x) / ((qam + m2) * (a + m2))
    d = 1 + numerator * d
    if (Math.abs(d) < TINY) d = TINY
    c = 1 + numerator / c
    if (Math.abs(c) < TINY) c = TINY
    d = 1 / d
    h *= d * c

    numerator = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2))
    d = 1 + numerator * d
    if (Math.abs(d) < TINY) d = TINY
    c = 1 + numerator / c
    if (Math.abs(c) < TINY) c = TINY
    d = 1 / d
    const step = d * c
    h *= step
    if (Math.abs(step - 1) < EPSILON) break
  }

  return h
}

/** Regularized incomplete beta function I_x(a, b). */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (!Number.isFinite(x) || x <= 0) return 0
  if (x >= 1) return 1
  const front = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log1p(-x),
  )
  // The continued fraction converges quickly only on one side of this point.
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaContinuedFraction(x, a, b)) / a
  }
  return 1 - (front * betaContinuedFraction(1 - x, b, a)) / b
}

/**
 * Upper tail of the F distribution: P(F >= value) with df1 and df2 degrees of
 * freedom. This is the p-value of the overall F-test of a regression.
 */
export function fDistributionTail(value: number, df1: number, df2: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  if (df1 <= 0 || df2 <= 0) return Number.NaN
  const x = df2 / (df2 + df1 * value)
  return regularizedIncompleteBeta(x, df2 / 2, df1 / 2)
}
