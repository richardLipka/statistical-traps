import { studentTTwoSidedTail } from '@/statistics/distributions/studentT'

export interface GroupSummary {
  count: number
  mean: number
  /** Sample variance, with the usual n - 1 denominator. */
  variance: number
}

export function summarizeGroup(values: readonly number[]): GroupSummary {
  const count = values.length
  if (count === 0) return { count: 0, mean: Number.NaN, variance: Number.NaN }
  let mean = 0
  for (const value of values) mean += value
  mean /= count
  if (count === 1) return { count, mean, variance: Number.NaN }
  let sum = 0
  for (const value of values) sum += (value - mean) ** 2
  return { count, mean, variance: sum / (count - 1) }
}

export interface TTestResult {
  /** Treatment mean minus control mean. */
  difference: number
  standardError: number
  t: number
  df: number
  pValue: number
  /** Half-width of the 95% confidence interval for the difference. */
  marginOfError: number
}

/** Two-sided critical value of t at 95%, close enough for a drawn interval. */
function criticalT(df: number): number {
  // Approximation of the 0.975 quantile, accurate to about 0.3% for df >= 4.
  const z = 1.959963984540054
  return z + (z ** 3 + z) / (4 * df) + (5 * z ** 5 + 16 * z ** 3 + 3 * z) / (96 * df * df)
}

/**
 * Welch's two-sample t-test: does the treatment group differ from the control
 * group on this outcome?
 *
 * Welch rather than the pooled version because it does not assume the two
 * groups have equal variances, and costs nothing when they do.
 *
 * Valid for one outcome specified before the data were seen. Applied to the
 * most impressive of many outcomes it is not, and the arithmetic cannot tell
 * the difference - which is what the scenario using it demonstrates.
 */
export function welchTTest(
  treatment: readonly number[],
  control: readonly number[],
): TTestResult {
  const a = summarizeGroup(treatment)
  const b = summarizeGroup(control)
  const invalid = {
    difference: Number.NaN,
    standardError: Number.NaN,
    t: Number.NaN,
    df: Number.NaN,
    pValue: Number.NaN,
    marginOfError: Number.NaN,
  }
  if (a.count < 2 || b.count < 2) return invalid

  const varA = a.variance / a.count
  const varB = b.variance / b.count
  const standardError = Math.sqrt(varA + varB)
  if (!(standardError > 0)) return invalid

  // Welch-Satterthwaite degrees of freedom.
  const df =
    (varA + varB) ** 2 /
    (varA ** 2 / (a.count - 1) + varB ** 2 / (b.count - 1))
  const difference = a.mean - b.mean
  const t = difference / standardError

  return {
    difference,
    standardError,
    t,
    df,
    pValue: studentTTwoSidedTail(t, df),
    marginOfError: criticalT(df) * standardError,
  }
}
