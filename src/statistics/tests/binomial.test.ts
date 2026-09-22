import { describe, expect, it } from 'vitest'
import {
  binomialMean,
  binomialPmf,
  binomialTailGreaterOrEqual,
  logBinomialCoefficient,
} from '@/statistics/distributions/binomial'
import { logGamma } from '@/statistics/distributions/gamma'
import { binomialTestGreater } from '@/statistics/hypothesis/binomialTest'

describe('logGamma', () => {
  it('reproduces factorials', () => {
    expect(Math.exp(logGamma(5))).toBeCloseTo(24, 6)
    expect(Math.exp(logGamma(11))).toBeCloseTo(3_628_800, 1)
  })
})

describe('logBinomialCoefficient', () => {
  it('matches known coefficients', () => {
    expect(Math.exp(logBinomialCoefficient(10, 5))).toBeCloseTo(252, 6)
    expect(Math.exp(logBinomialCoefficient(80, 2))).toBeCloseTo(3160, 6)
  })

  it('is -Infinity outside the support', () => {
    expect(logBinomialCoefficient(5, 6)).toBe(Number.NEGATIVE_INFINITY)
    expect(logBinomialCoefficient(5, -1)).toBe(Number.NEGATIVE_INFINITY)
  })
})

describe('binomialPmf', () => {
  it('matches an exactly known value', () => {
    expect(binomialPmf(5, 10, 0.5)).toBeCloseTo(252 / 1024, 12)
  })

  it('sums to one over the support', () => {
    let total = 0
    for (let k = 0; k <= 40; k += 1) total += binomialPmf(k, 40, 0.13)
    expect(total).toBeCloseTo(1, 10)
  })

  it('handles degenerate probabilities', () => {
    expect(binomialPmf(0, 10, 0)).toBe(1)
    expect(binomialPmf(3, 10, 0)).toBe(0)
    expect(binomialPmf(10, 10, 1)).toBe(1)
  })
})

describe('binomialTailGreaterOrEqual', () => {
  it('matches an exactly known tail', () => {
    expect(binomialTailGreaterOrEqual(6, 10, 0.5)).toBeCloseTo(386 / 1024, 12)
  })

  it('equals the direct sum of the upper tail', () => {
    const n = 60
    const p = 0.045
    for (const k of [0, 1, 3, 5, 9, 20]) {
      let direct = 0
      for (let i = k; i <= n; i += 1) direct += binomialPmf(i, n, p)
      expect(binomialTailGreaterOrEqual(k, n, p)).toBeCloseTo(direct, 10)
    }
  })

  it('is 1 below the support and 0 above it', () => {
    expect(binomialTailGreaterOrEqual(0, 10, 0.3)).toBe(1)
    expect(binomialTailGreaterOrEqual(11, 10, 0.3)).toBe(0)
  })

  it('decreases as the threshold grows', () => {
    let previous = 1
    for (let k = 0; k <= 30; k += 1) {
      const tail = binomialTailGreaterOrEqual(k, 30, 0.2)
      expect(tail).toBeLessThanOrEqual(previous + 1e-12)
      previous = tail
    }
  })
})

describe('binomialTestGreater', () => {
  it('reports the expected count and a matching p-value', () => {
    const result = binomialTestGreater(9, 80, 0.0452389342)
    expect(result.expected).toBeCloseTo(binomialMean(80, 0.0452389342), 12)
    expect(result.pValue).toBeCloseTo(binomialTailGreaterOrEqual(9, 80, 0.0452389342), 12)
    expect(result.pValue).toBeGreaterThan(0)
    expect(result.pValue).toBeLessThan(0.05)
  })

  it('gives an unremarkable p-value for a result near the expectation', () => {
    const result = binomialTestGreater(4, 80, 0.0452389342)
    expect(result.pValue).toBeGreaterThan(0.3)
  })
})
