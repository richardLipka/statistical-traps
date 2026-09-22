import { describe, expect, it } from 'vitest'
import {
  empiricalPValueGreaterOrEqual,
  integerHistogram,
  mean,
  shareOf,
} from '@/statistics/monteCarlo'

describe('empiricalPValueGreaterOrEqual', () => {
  it('uses the (1 + count) / (1 + replications) correction', () => {
    const result = empiricalPValueGreaterOrEqual(5, [1, 2, 3, 5, 9])
    expect(result.atLeastObserved).toBe(2)
    expect(result.replications).toBe(5)
    expect(result.pValue).toBeCloseTo(3 / 6, 12)
  })

  it('never returns exactly zero', () => {
    const result = empiricalPValueGreaterOrEqual(100, [1, 2, 3])
    expect(result.pValue).toBeGreaterThan(0)
    expect(result.pValue).toBeCloseTo(1 / 4, 12)
  })

  it('returns 1 when every sample is at least as extreme', () => {
    const result = empiricalPValueGreaterOrEqual(0, [0, 1, 2])
    expect(result.pValue).toBe(1)
  })
})

describe('integerHistogram', () => {
  it('counts values and keeps empty bins in between', () => {
    expect(integerHistogram([2, 4, 4, 5])).toEqual([
      { value: 2, count: 1 },
      { value: 3, count: 0 },
      { value: 4, count: 2 },
      { value: 5, count: 1 },
    ])
  })

  it('returns nothing for no samples', () => {
    expect(integerHistogram([])).toEqual([])
  })
})

describe('mean and shareOf', () => {
  it('computes the arithmetic mean', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5)
    expect(Number.isNaN(mean([]))).toBe(true)
  })

  it('computes the share satisfying a predicate', () => {
    expect(shareOf([0.01, 0.2, 0.04, 0.9], (value) => value < 0.05)).toBeCloseTo(0.5, 12)
  })
})
