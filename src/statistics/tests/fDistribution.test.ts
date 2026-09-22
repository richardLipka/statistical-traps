import { describe, expect, it } from 'vitest'
import {
  fDistributionTail,
  regularizedIncompleteBeta,
} from '@/statistics/distributions/fDistribution'
import { overallFTest } from '@/statistics/hypothesis/fTest'

describe('regularizedIncompleteBeta', () => {
  it('matches values that can be checked by hand', () => {
    expect(regularizedIncompleteBeta(0.5, 1, 1)).toBeCloseTo(0.5, 10)
    // I_x(1, b) = 1 - (1 - x)^b
    expect(regularizedIncompleteBeta(0.3, 1, 3)).toBeCloseTo(1 - 0.7 ** 3, 10)
    // I_x(a, 1) = x^a
    expect(regularizedIncompleteBeta(0.4, 2.5, 1)).toBeCloseTo(0.4 ** 2.5, 10)
  })

  it('satisfies the symmetry I_x(a, b) = 1 - I_(1-x)(b, a)', () => {
    for (const [x, a, b] of [
      [0.2, 2, 5],
      [0.55, 4.5, 1.5],
      [0.9, 0.5, 3],
    ] as const) {
      expect(regularizedIncompleteBeta(x, a, b)).toBeCloseTo(
        1 - regularizedIncompleteBeta(1 - x, b, a),
        10,
      )
    }
  })

  it('is 0 and 1 at the ends', () => {
    expect(regularizedIncompleteBeta(0, 2, 3)).toBe(0)
    expect(regularizedIncompleteBeta(1, 2, 3)).toBe(1)
  })
})

describe('fDistributionTail', () => {
  // Critical values at the 5% level from standard F tables.
  it.each([
    [4.9646, 1, 10],
    [4.1028, 2, 10],
    [3.0984, 3, 20],
    [19.385, 9, 2],
  ])('gives p = 0.05 at the tabulated critical value F=%s (%s, %s)', (f, df1, df2) => {
    expect(fDistributionTail(f, df1, df2)).toBeCloseTo(0.05, 4)
  })

  it('agrees with a critical value tabulated to two decimals', () => {
    // F(0.05; 8, 30) = 2.27
    expect(fDistributionTail(2.27, 8, 30)).toBeCloseTo(0.05, 3)
  })

  it('is 1 at zero and decreasing', () => {
    expect(fDistributionTail(0, 3, 12)).toBe(1)
    let previous = 1
    for (const value of [0.5, 1, 2, 4, 8, 16]) {
      const tail = fDistributionTail(value, 3, 12)
      expect(tail).toBeLessThan(previous)
      previous = tail
    }
  })
})

describe('overallFTest', () => {
  it('reproduces the F statistic from R² and the degrees of freedom', () => {
    const result = overallFTest(0.5, 16, 3)
    expect(result.df1).toBe(3)
    expect(result.df2).toBe(12)
    expect(result.fStatistic).toBeCloseTo(0.5 / 3 / (0.5 / 12), 10)
    expect(result.pValue).toBeCloseTo(fDistributionTail(result.fStatistic, 3, 12), 12)
  })

  it('charges for every extra parameter', () => {
    // The same R² is less impressive when more parameters were used to get it.
    const fewer = overallFTest(0.5, 16, 2)
    const more = overallFTest(0.5, 16, 6)
    expect(more.pValue).toBeGreaterThan(fewer.pValue)
  })

  it('refuses to report a test without residual degrees of freedom', () => {
    expect(Number.isNaN(overallFTest(0.9, 10, 9).pValue)).toBe(true)
  })
})
