import { describe, expect, it } from 'vitest'
import {
  studentTCdf,
  studentTTwoSidedTail,
  studentTUpperTail,
} from '@/statistics/distributions/studentT'
import { summarizeGroup, welchTTest } from '@/statistics/hypothesis/tTest'
import { bonferroni, holmAdjusted } from '@/statistics/hypothesis/multiplicity'

describe("Student's t distribution", () => {
  it('matches tabulated two-sided critical values', () => {
    // t(0.975) for 1, 5, 10, 30 and 120 degrees of freedom.
    expect(studentTTwoSidedTail(12.7062047364, 1)).toBeCloseTo(0.05, 9)
    expect(studentTTwoSidedTail(2.5705818366, 5)).toBeCloseTo(0.05, 9)
    expect(studentTTwoSidedTail(2.2281388519, 10)).toBeCloseTo(0.05, 9)
    expect(studentTTwoSidedTail(2.0422724563, 30)).toBeCloseTo(0.05, 9)
    // The published critical value for 120 df carries fewer digits than the rest.
    expect(studentTTwoSidedTail(1.9799304815, 120)).toBeCloseTo(0.05, 7)
    // And a 1% value.
    expect(studentTTwoSidedTail(3.1692726726, 10)).toBeCloseTo(0.01, 9)
  })

  it('is symmetric, and its halves agree with the two-sided tail', () => {
    expect(studentTTwoSidedTail(-2.3, 9)).toBeCloseTo(studentTTwoSidedTail(2.3, 9), 14)
    expect(studentTUpperTail(0, 7)).toBeCloseTo(0.5, 12)
    expect(studentTUpperTail(1.8, 7)).toBeCloseTo(studentTTwoSidedTail(1.8, 7) / 2, 12)
    expect(studentTUpperTail(-1.8, 7)).toBeCloseTo(1 - studentTTwoSidedTail(1.8, 7) / 2, 12)
    expect(studentTCdf(1.8, 7)).toBeCloseTo(1 - studentTUpperTail(1.8, 7), 14)
  })

  it('approaches the normal distribution as the degrees of freedom grow', () => {
    // The two-sided normal tail at 1.96 is 0.05.
    expect(studentTTwoSidedTail(1.959963984540054, 100_000)).toBeCloseTo(0.05, 4)
  })
})

describe('the two-sample t-test', () => {
  it('summarizes a group the way the test needs', () => {
    const summary = summarizeGroup([2, 4, 4, 4, 5, 5, 7, 9])
    expect(summary.count).toBe(8)
    expect(summary.mean).toBeCloseTo(5, 12)
    // Sample variance with the n - 1 denominator.
    expect(summary.variance).toBeCloseTo(32 / 7, 12)
  })

  it('reproduces a worked Welch example', () => {
    const treatment = [27.5, 21, 19, 23.6, 17, 17.9, 16.9, 20.1, 21.9, 22.6]
    const control = [27.1, 22, 20.8, 23.4, 23.4, 23.5, 25.8, 22, 24.8, 20.2]
    const result = welchTTest(treatment, control)
    expect(result.difference).toBeCloseTo(-2.55, 10)
    expect(result.t).toBeCloseTo(-2.0356618771, 9)
    expect(result.df).toBeCloseTo(15.4978988826, 9)
    expect(result.pValue).toBeCloseTo(0.0592537370, 9)
  })

  it('finds nothing between two identical groups', () => {
    const values = [1, 2, 3, 4, 5, 6]
    const result = welchTTest(values, values)
    expect(result.difference).toBe(0)
    expect(result.t).toBe(0)
    expect(result.pValue).toBeCloseTo(1, 12)
  })

  it('brackets the difference with a confidence interval that covers zero when the test does not reject', () => {
    const result = welchTTest([5, 6, 7, 8, 9], [4, 6, 8, 7, 5])
    expect(result.pValue).toBeGreaterThan(0.05)
    expect(Math.abs(result.difference)).toBeLessThan(result.marginOfError)
  })

  it('reports nothing rather than a meaningless number for groups too small to test', () => {
    expect(welchTTest([1], [2, 3]).pValue).toBeNaN()
    expect(welchTTest([2, 2, 2], [2, 2, 2]).pValue).toBeNaN()
  })
})

describe('corrections for testing many hypotheses', () => {
  it('multiplies by the number of tests, and never exceeds one', () => {
    expect(bonferroni(0.004, 20)).toBeCloseTo(0.08, 12)
    expect(bonferroni(0.3, 20)).toBe(1)
    expect(bonferroni(0.05, 1)).toBeCloseTo(0.05, 12)
  })

  it('applies Holm step by step, and never below an earlier value', () => {
    const adjusted = holmAdjusted([0.001, 0.008, 0.039, 0.041, 0.9])
    expect(adjusted[0]).toBeCloseTo(0.005, 12)
    expect(adjusted[1]).toBeCloseTo(0.032, 12)
    expect(adjusted[2]).toBeCloseTo(0.117, 12)
    expect(adjusted[3]).toBeCloseTo(0.117, 12)
    expect(adjusted[4]).toBeCloseTo(0.9, 12)
    // Monotone, in the order given.
    const sorted = [...adjusted].sort((a, b) => a - b)
    expect(adjusted).toEqual(sorted)
  })

  it('is never more severe than Bonferroni', () => {
    const pValues = [0.002, 0.03, 0.2, 0.44, 0.61]
    const holm = holmAdjusted(pValues)
    pValues.forEach((pValue, index) => {
      expect(holm[index]).toBeLessThanOrEqual(bonferroni(pValue, pValues.length) + 1e-12)
    })
  })
})
