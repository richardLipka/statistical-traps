import { describe, expect, it } from 'vitest'
import { predictPolynomial } from '@/statistics/regression/leastSquares'
import {
  BESTLINE_DEFAULTS,
  BESTLINE_LIMITS,
  X_RANGE,
  Y_VIEW,
  buildModel,
  clampY,
  isLeastSquares,
  maxDegreeFor,
  predictorsOf,
} from '@/scenarios/02-best-line/model'
import { generateSample } from '@/scenarios/02-best-line/simulation'

describe('maxDegreeFor', () => {
  it('always leaves residual degrees of freedom for the F-test', () => {
    for (let count = BESTLINE_LIMITS.minPoints; count <= BESTLINE_LIMITS.maxPoints; count += 1) {
      const degree = maxDegreeFor(count)
      expect(count - degree - 1).toBeGreaterThanOrEqual(2)
      expect(degree).toBeGreaterThanOrEqual(1)
      expect(degree).toBeLessThanOrEqual(BESTLINE_LIMITS.maxDegree)
    }
  })

  it('reaches the cap for the default sample', () => {
    expect(maxDegreeFor(BESTLINE_DEFAULTS.pointCount)).toBe(BESTLINE_LIMITS.maxDegree)
  })
})

describe('buildModel', () => {
  const points = generateSample(BESTLINE_DEFAULTS.pointCount, BESTLINE_DEFAULTS.seed)

  it('puts a hand-drawn line through both handles', () => {
    const model = buildModel({ kind: 'manual', left: -1.5, right: 2 }, points)
    expect(predictPolynomial(model, X_RANGE.min)).toBeCloseTo(-1.5, 10)
    expect(predictPolynomial(model, X_RANGE.max)).toBeCloseTo(2, 10)
  })

  it('fits the requested degree to the data', () => {
    const model = buildModel({ kind: 'fitted', degree: 3 }, points)
    expect(model.degree).toBe(3)
  })
})

describe('model bookkeeping', () => {
  it('counts predictors for the degrees of freedom', () => {
    expect(predictorsOf({ kind: 'manual', left: 0, right: 1 })).toBe(1)
    expect(predictorsOf({ kind: 'fitted', degree: 4 })).toBe(4)
  })

  it('marks only least-squares fits as testable', () => {
    expect(isLeastSquares({ kind: 'fitted', degree: 2 })).toBe(true)
    expect(isLeastSquares({ kind: 'manual', left: 0, right: 0 })).toBe(false)
  })

  it('keeps hand-drawn handles inside the visible range', () => {
    expect(clampY(99)).toBe(Y_VIEW.max)
    expect(clampY(-99)).toBe(Y_VIEW.min)
    expect(clampY(0.5)).toBe(0.5)
  })
})
