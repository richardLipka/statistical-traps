import { describe, expect, it } from 'vitest'
import { createRng } from '@/statistics/random/rng'
import { assessFit, correlation } from '@/statistics/regression/goodnessOfFit'
import {
  fitPolynomial,
  lineThroughPoints,
  predictPolynomial,
  solveLeastSquares,
  type DataPoint,
} from '@/statistics/regression/leastSquares'

const line: DataPoint[] = [0, 0.25, 0.5, 0.75, 1].map((x) => ({ x, y: 3 - 2 * x }))

describe('solveLeastSquares', () => {
  it('solves an exactly determined system', () => {
    const solution = solveLeastSquares(
      [
        [1, 1],
        [1, 2],
        [1, 3],
      ],
      [2, 4, 6],
    )
    expect(solution[0]).toBeCloseTo(0, 8)
    expect(solution[1]).toBeCloseTo(2, 8)
  })

  it('minimises the residuals of an inconsistent system', () => {
    // Three points that are not collinear: the fit must sit between them.
    const solution = solveLeastSquares(
      [
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [1, 0, 1],
    )
    expect(solution[0]).toBeCloseTo(2 / 3, 8)
    expect(solution[1]).toBeCloseTo(0, 8)
  })
})

describe('fitPolynomial', () => {
  it('recovers a straight line exactly', () => {
    const model = fitPolynomial(line, 1)
    for (const point of line) {
      expect(predictPolynomial(model, point.x)).toBeCloseTo(point.y, 8)
    }
  })

  it('recovers a quadratic exactly', () => {
    const quadratic = [0, 0.2, 0.4, 0.6, 0.8, 1].map((x) => ({ x, y: 1 - 3 * x + 2 * x * x }))
    const model = fitPolynomial(quadratic, 2)
    for (const point of quadratic) {
      expect(predictPolynomial(model, point.x)).toBeCloseTo(point.y, 8)
    }
  })

  it('reduces to the mean at degree 0', () => {
    const model = fitPolynomial(line, 0)
    const mean = line.reduce((total, point) => total + point.y, 0) / line.length
    expect(predictPolynomial(model, 0.37)).toBeCloseTo(mean, 8)
  })

  it('stays accurate at high degree, where the normal equations would not', () => {
    // Ten points and nine degrees: the fit must interpolate them exactly, which
    // is the case an ill-conditioned solver visibly fails.
    const rng = createRng(5)
    const points = Array.from({ length: 10 }, (_, index) => ({
      x: index / 9,
      y: rng.normal(0, 1),
    }))
    const model = fitPolynomial(points, 9)
    for (const point of points) {
      expect(predictPolynomial(model, point.x)).toBeCloseTo(point.y, 6)
    }
    expect(assessFit(points, (x) => predictPolynomial(model, x)).rSquared).toBeCloseTo(1, 6)
  })

  it('never fits worse as the degree grows', () => {
    const rng = createRng(11)
    const points = Array.from({ length: 20 }, () => ({ x: rng.next(), y: rng.normal(0, 1) }))
    let previous = -Infinity
    for (let degree = 0; degree <= 9; degree += 1) {
      const model = fitPolynomial(points, degree)
      const rSquared = assessFit(points, (x) => predictPolynomial(model, x)).rSquared
      expect(rSquared).toBeGreaterThanOrEqual(previous - 1e-9)
      previous = rSquared
    }
  })
})

describe('lineThroughPoints', () => {
  it('passes through both given points', () => {
    const model = lineThroughPoints({ x: 0, y: -1 }, { x: 1, y: 2 })
    expect(predictPolynomial(model, 0)).toBeCloseTo(-1, 10)
    expect(predictPolynomial(model, 1)).toBeCloseTo(2, 10)
    expect(predictPolynomial(model, 0.5)).toBeCloseTo(0.5, 10)
  })
})

describe('assessFit', () => {
  it('reports a perfect fit', () => {
    const quality = assessFit(line, (x) => 3 - 2 * x)
    expect(quality.rSquared).toBeCloseTo(1, 10)
    expect(quality.rmse).toBeCloseTo(0, 10)
  })

  it('reports zero for the mean of the same points', () => {
    const mean = line.reduce((total, point) => total + point.y, 0) / line.length
    expect(assessFit(line, () => mean).rSquared).toBeCloseTo(0, 10)
  })

  it('goes negative for a predictor that is worse than the mean', () => {
    expect(assessFit(line, () => 10).rSquared).toBeLessThan(0)
  })
})

describe('correlation', () => {
  it('is 1 and -1 for exact relationships', () => {
    expect(correlation(line)).toBeCloseTo(-1, 10)
    expect(correlation(line.map((point) => ({ x: point.x, y: -point.y })))).toBeCloseTo(1, 10)
  })
})
