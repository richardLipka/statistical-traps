const LANCZOS_COEFFICIENTS = [
  676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905,
  -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
]

/** Log of the gamma function (Lanczos approximation). */
export function logGamma(x: number): number {
  if (x < 0.5) {
    // Reflection formula.
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x)
  }
  const z = x - 1
  let a = 0.99999999999980993
  const t = z + 7.5
  for (let i = 0; i < LANCZOS_COEFFICIENTS.length; i += 1) {
    a += LANCZOS_COEFFICIENTS[i] / (z + i + 1)
  }
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(a)
}

/** Log of the beta function. */
export function logBeta(a: number, b: number): number {
  return logGamma(a) + logGamma(b) - logGamma(a + b)
}

const MAX_ITERATIONS = 300
const EPSILON = 1e-15
/** Smaller than any meaningful intermediate value; guards division by zero. */
const TINY = 1e-300

/**
 * Regularized lower incomplete gamma P(a, x).
 *
 * Series expansion where it converges quickly (x < a + 1), and the
 * complement of the continued fraction elsewhere.
 */
export function regularizedGammaP(a: number, x: number): number {
  if (!(a > 0) || x < 0 || Number.isNaN(x)) return Number.NaN
  if (x === 0) return 0
  if (x >= a + 1) return 1 - regularizedGammaQ(a, x)

  let term = 1 / a
  let sum = term
  for (let n = 1; n <= MAX_ITERATIONS; n += 1) {
    term *= x / (a + n)
    sum += term
    if (Math.abs(term) < Math.abs(sum) * EPSILON) break
  }
  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a))
}

/**
 * Regularized upper incomplete gamma Q(a, x) = 1 - P(a, x), by Lentz's
 * continued fraction.
 *
 * Computed directly rather than as 1 - P: in the far tail P is within
 * rounding distance of 1, and subtracting would throw the answer away.
 */
export function regularizedGammaQ(a: number, x: number): number {
  if (!(a > 0) || x < 0 || Number.isNaN(x)) return Number.NaN
  if (x === 0) return 1
  if (x < a + 1) return 1 - regularizedGammaP(a, x)

  let b = x + 1 - a
  let c = 1 / TINY
  let d = 1 / b
  let h = d
  for (let i = 1; i <= MAX_ITERATIONS; i += 1) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < TINY) d = TINY
    c = b + an / c
    if (Math.abs(c) < TINY) c = TINY
    d = 1 / d
    const delta = d * c
    h *= delta
    if (Math.abs(delta - 1) < EPSILON) break
  }
  return h * Math.exp(-x + a * Math.log(x) - logGamma(a))
}
