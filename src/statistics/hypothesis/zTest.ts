import { normalTwoSidedTail } from '@/statistics/distributions/normal'

export interface ZTestResult {
  /** Sum of the observed values. */
  sum: number
  count: number
  mean: number
  /** Standardized sum: sum / (sd · √count). */
  z: number
  /** Two-sided p-value. */
  pValue: number
}

/**
 * Two-sided test that `count` independent draws from Normal(0, sd) sum to
 * zero, for a standard deviation that is known rather than estimated.
 *
 *   z = sum / (sd · √count)
 *
 * The null distribution of z is then exactly standard normal - no large
 * sample argument is involved. That holds here because the data are
 * simulated: we know the standard deviation because we chose it.
 *
 * The test is valid for one window fixed in advance. Applied to the most
 * extreme of many windows it is not, and nothing in the arithmetic can tell
 * the difference - which is the point of the scenario that uses it.
 */
export function meanZTest(sum: number, count: number, standardDeviation: number): ZTestResult {
  if (!(count > 0) || !(standardDeviation > 0) || !Number.isFinite(sum)) {
    return { sum, count, mean: Number.NaN, z: Number.NaN, pValue: Number.NaN }
  }
  const z = sum / (standardDeviation * Math.sqrt(count))
  return {
    sum,
    count,
    mean: sum / count,
    z,
    pValue: normalTwoSidedTail(z),
  }
}
