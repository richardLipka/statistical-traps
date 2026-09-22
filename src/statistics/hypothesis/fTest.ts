import { fDistributionTail } from '@/statistics/distributions/fDistribution'

export interface FTestResult {
  fStatistic: number
  /** Numerator degrees of freedom: number of fitted predictors. */
  df1: number
  /** Denominator degrees of freedom: observations - predictors - 1. */
  df2: number
  rSquared: number
  pValue: number
}

/**
 * Overall F-test of a least-squares regression: "does this model explain more
 * than an intercept alone?"
 *
 *   F = (R2 / p) / ((1 - R2) / (n - p - 1))
 *
 * The test already accounts for the number of fitted parameters, so adding
 * flexibility does not fool it on its own. It is only valid for a model
 * specified before the data were seen - choosing the model that produced the
 * smallest p-value is exactly what invalidates it.
 *
 * Requires a least-squares fit: R2 is assumed to be the maximum achievable for
 * that model, and the residuals orthogonal to the fitted values.
 */
export function overallFTest(
  rSquared: number,
  observations: number,
  predictors: number,
): FTestResult {
  const df1 = predictors
  const df2 = observations - predictors - 1
  if (df1 <= 0 || df2 <= 0) {
    return { fStatistic: Number.NaN, df1, df2, rSquared, pValue: Number.NaN }
  }
  if (rSquared >= 1) {
    return { fStatistic: Number.POSITIVE_INFINITY, df1, df2, rSquared, pValue: 0 }
  }
  const bounded = Math.max(0, rSquared)
  const fStatistic = bounded / df1 / ((1 - bounded) / df2)
  return {
    fStatistic,
    df1,
    df2,
    rSquared: bounded,
    pValue: fDistributionTail(fStatistic, df1, df2),
  }
}
