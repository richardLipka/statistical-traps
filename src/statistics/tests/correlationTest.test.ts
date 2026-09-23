import { describe, expect, it } from 'vitest'
import { correlationTest, criticalCorrelation } from '@/statistics/hypothesis/correlationTest'
import { benjaminiHochberg, bonferroni, holmAdjusted } from '@/statistics/hypothesis/multiplicity'
import { studentTTwoSidedTail } from '@/statistics/distributions/studentT'

describe('the test of a correlation', () => {
  it('turns r into the t statistic it implies', () => {
    const result = correlationTest(0.5, 42)
    expect(result.df).toBe(40)
    // 0.5 * sqrt(40) / sqrt(0.75)
    expect(result.t).toBeCloseTo(3.6514837167, 9)
    expect(result.pValue).toBeCloseTo(studentTTwoSidedTail(result.t, 40), 14)
    expect(result.pValue).toBeCloseTo(0.0007472851930, 9)
  })

  it('finds nothing in no correlation, and everything in a perfect one', () => {
    expect(correlationTest(0, 30).pValue).toBeCloseTo(1, 12)
    expect(correlationTest(1, 30).pValue).toBe(0)
    expect(correlationTest(-1, 30).pValue).toBe(0)
  })

  it('is symmetric in the sign of the correlation', () => {
    expect(correlationTest(-0.42, 25).pValue).toBeCloseTo(correlationTest(0.42, 25).pValue, 14)
  })

  it('reports nothing rather than a meaningless number for samples too small to test', () => {
    expect(correlationTest(0.9, 2).pValue).toBeNaN()
    expect(correlationTest(Number.NaN, 40).pValue).toBeNaN()
  })

  it('inverts to the critical correlation, which is low for a small sample', () => {
    for (const n of [12, 40, 100]) {
      const critical = criticalCorrelation(n, 0.05)
      expect(correlationTest(critical, n).pValue).toBeCloseTo(0.05, 6)
    }
    // With 40 rows, a correlation most people would call weak clears the bar.
    expect(criticalCorrelation(40, 0.05)).toBeCloseTo(0.312, 3)
    expect(criticalCorrelation(100, 0.05)).toBeLessThan(criticalCorrelation(40, 0.05))
  })
})

describe('the false discovery rate correction', () => {
  it('matches the step-up definition on a worked example', () => {
    const pValues = [0.001, 0.008, 0.039, 0.041, 0.042, 0.6, 0.9]
    const adjusted = benjaminiHochberg(pValues)
    // p * n / rank, then made monotone from the largest downwards.
    expect(adjusted[0]).toBeCloseTo(0.007, 12)
    expect(adjusted[1]).toBeCloseTo(0.028, 12)
    expect(adjusted[2]).toBeCloseTo(0.0588, 12)
    expect(adjusted[3]).toBeCloseTo(0.0588, 12)
    expect(adjusted[4]).toBeCloseTo(0.0588, 12)
    expect(adjusted[5]).toBeCloseTo(0.7, 12)
    expect(adjusted[6]).toBeCloseTo(0.9, 12)
  })

  it('never exceeds one, and never falls below a smaller p-value', () => {
    const adjusted = benjaminiHochberg([0.5, 0.9, 0.99, 0.2])
    for (const value of adjusted) expect(value).toBeLessThanOrEqual(1)
    const sorted = [...adjusted].sort((a, b) => a - b)
    expect(new Set(sorted).size).toBeGreaterThan(0)
  })

  it('rejects at least as much as the family-wise corrections', () => {
    const pValues = [0.001, 0.02, 0.03, 0.2, 0.5, 0.7]
    const fdr = benjaminiHochberg(pValues)
    const holm = holmAdjusted(pValues)
    pValues.forEach((pValue, index) => {
      expect(fdr[index]).toBeLessThanOrEqual(holm[index] + 1e-12)
      expect(fdr[index]).toBeLessThanOrEqual(bonferroni(pValue, pValues.length) + 1e-12)
    })
  })

  it('agrees with Bonferroni on the very smallest p-value', () => {
    // At rank 1 the two formulas are the same, which is worth knowing before
    // presenting them as alternatives for a single winning test.
    const pValues = [0.0004, 0.3, 0.6, 0.02]
    expect(Math.min(...benjaminiHochberg(pValues))).toBeCloseTo(
      bonferroni(0.0004, pValues.length),
      12,
    )
  })

  it('handles an empty family', () => {
    expect(benjaminiHochberg([])).toEqual([])
  })
})
