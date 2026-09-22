import type { DataPoint } from '@/statistics/regression/leastSquares'

export interface FitQuality {
  observations: number
  residualSumOfSquares: number
  totalSumOfSquares: number
  /**
   * 1 - SSE / SST, measured against the mean of the points being evaluated.
   *
   * On the sample a model was fitted to this cannot be negative. On new data
   * it can be, and a negative value is the honest report: the model predicts
   * worse than the mean of those data would.
   */
  rSquared: number
  /** Root mean squared prediction error, in the units of y. */
  rmse: number
}

export function assessFit(
  points: readonly DataPoint[],
  predict: (x: number) => number,
): FitQuality {
  const observations = points.length
  if (observations === 0) {
    return {
      observations: 0,
      residualSumOfSquares: Number.NaN,
      totalSumOfSquares: Number.NaN,
      rSquared: Number.NaN,
      rmse: Number.NaN,
    }
  }

  let meanY = 0
  for (const point of points) meanY += point.y
  meanY /= observations

  let residualSumOfSquares = 0
  let totalSumOfSquares = 0
  for (const point of points) {
    const residual = point.y - predict(point.x)
    residualSumOfSquares += residual * residual
    totalSumOfSquares += (point.y - meanY) * (point.y - meanY)
  }

  return {
    observations,
    residualSumOfSquares,
    totalSumOfSquares,
    rSquared: totalSumOfSquares === 0 ? Number.NaN : 1 - residualSumOfSquares / totalSumOfSquares,
    rmse: Math.sqrt(residualSumOfSquares / observations),
  }
}

/** Pearson correlation of the two coordinates. */
export function correlation(points: readonly DataPoint[]): number {
  const n = points.length
  if (n < 2) return Number.NaN
  let meanX = 0
  let meanY = 0
  for (const point of points) {
    meanX += point.x
    meanY += point.y
  }
  meanX /= n
  meanY /= n

  let covariance = 0
  let varianceX = 0
  let varianceY = 0
  for (const point of points) {
    const dx = point.x - meanX
    const dy = point.y - meanY
    covariance += dx * dy
    varianceX += dx * dx
    varianceY += dy * dy
  }
  if (varianceX === 0 || varianceY === 0) return Number.NaN
  return covariance / Math.sqrt(varianceX * varianceY)
}
