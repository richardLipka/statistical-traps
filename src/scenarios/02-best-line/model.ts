import {
  fitPolynomial,
  lineThroughPoints,
  type DataPoint,
  type PolynomialModel,
} from '@/statistics/regression/leastSquares'
import { clamp } from '@/utils/geometry'

/** Observations live in x ∈ [0, 1]; y is pure noise with this spread. */
export const X_RANGE = { min: 0, max: 1 } as const
export const NOISE_SD = 1
/** Plotting window for y; wide enough for ~3 standard deviations. */
export const Y_VIEW = { min: -3.2, max: 3.2 } as const

export const BESTLINE_LIMITS = {
  minPoints: 8,
  maxPoints: 30,
  pointsStep: 2,
  maxDegree: 9,
} as const

export const BESTLINE_DEFAULTS = {
  pointCount: 16,
  seed: 4242,
} as const

/** The analysis committed to before the data exist: one straight line. */
export const PRE_REGISTERED_DEGREE = 1

/** The model that claims nothing at all: a flat line at the mean. */
export const FLAT_DEGREE = 0

export const ALPHA = 0.05

/**
 * Highest degree the search may offer.
 *
 * The F-test needs residual degrees of freedom (n - degree - 1 >= 2), and a
 * polynomial of degree n-1 would pass exactly through every point, which is
 * a degenerate rather than an instructive fit.
 */
export function maxDegreeFor(pointCount: number): number {
  return Math.max(1, Math.min(BESTLINE_LIMITS.maxDegree, pointCount - 3))
}

export type ModelSpec =
  /** A line the user positioned by hand: y at the left and right edge. */
  | { kind: 'manual'; left: number; right: number }
  /** A least-squares polynomial of this degree. */
  | { kind: 'fitted'; degree: number }

export const MANUAL_START: ModelSpec = { kind: 'manual', left: -0.8, right: 0.8 }

export function clampY(value: number): number {
  return clamp(value, Y_VIEW.min, Y_VIEW.max)
}

export function buildModel(spec: ModelSpec, points: readonly DataPoint[]): PolynomialModel {
  if (spec.kind === 'manual') {
    return lineThroughPoints(
      { x: X_RANGE.min, y: spec.left },
      { x: X_RANGE.max, y: spec.right },
    )
  }
  return fitPolynomial(points, spec.degree)
}

/** Number of fitted predictors, i.e. the numerator degrees of freedom of the F-test. */
export function predictorsOf(spec: ModelSpec): number {
  return spec.kind === 'manual' ? 1 : spec.degree
}

/**
 * Only a least-squares fit may be judged with the overall F-test: the test
 * assumes the residuals are orthogonal to the fitted values, which a line
 * dragged by hand does not satisfy.
 */
export function isLeastSquares(spec: ModelSpec): boolean {
  return spec.kind === 'fitted'
}
