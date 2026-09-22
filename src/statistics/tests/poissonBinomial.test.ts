import { describe, expect, it } from 'vitest'
import { binomialPmf, binomialTailGreaterOrEqual } from '@/statistics/distributions/binomial'
import {
  poissonBinomialMean,
  poissonBinomialPmf,
  poissonBinomialTailGreaterOrEqual,
  poissonBinomialVariance,
} from '@/statistics/distributions/poissonBinomial'
import { riskAdjustedTest } from '@/statistics/hypothesis/riskAdjustedTest'

describe('the Poisson-binomial distribution', () => {
  it('is a proper distribution', () => {
    const pmf = poissonBinomialPmf([0.1, 0.4, 0.25, 0.9, 0.05, 0.6])
    expect(pmf).toHaveLength(7)
    expect(pmf.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    for (const value of pmf) expect(value).toBeGreaterThanOrEqual(0)
  })

  it('reduces to the binomial when every trial carries the same risk', () => {
    const p = 0.13
    const n = 40
    const pmf = poissonBinomialPmf(new Array(n).fill(p))
    for (let k = 0; k <= n; k += 1) {
      expect(pmf[k]).toBeCloseTo(binomialPmf(k, n, p), 12)
    }
    expect(poissonBinomialTailGreaterOrEqual(9, new Array(n).fill(p))).toBeCloseTo(
      binomialTailGreaterOrEqual(9, n, p),
      12,
    )
  })

  it('matches an exhaustive enumeration of every possible outcome', () => {
    const risks = [0.2, 0.55, 0.8, 0.05, 0.35]
    const exact = new Array(risks.length + 1).fill(0)
    for (let mask = 0; mask < 1 << risks.length; mask += 1) {
      let probability = 1
      let successes = 0
      for (let i = 0; i < risks.length; i += 1) {
        const happened = (mask >> i) & 1
        probability *= happened ? risks[i] : 1 - risks[i]
        successes += happened
      }
      exact[successes] += probability
    }
    const pmf = poissonBinomialPmf(risks)
    for (let k = 0; k <= risks.length; k += 1) expect(pmf[k]).toBeCloseTo(exact[k], 12)
  })

  it('has the mean and variance of a sum of independent indicators', () => {
    const risks = [0.1, 0.7, 0.45, 0.3]
    const pmf = poissonBinomialPmf(risks)
    const mean = pmf.reduce((sum, value, k) => sum + k * value, 0)
    const variance = pmf.reduce((sum, value, k) => sum + (k - mean) ** 2 * value, 0)
    expect(poissonBinomialMean(risks)).toBeCloseTo(mean, 12)
    expect(poissonBinomialVariance(risks)).toBeCloseTo(variance, 12)
  })

  it('is less variable than a binomial with the same mean', () => {
    // Spreading the risks out moves probability towards the middle.
    const risks = [0.02, 0.05, 0.4, 0.93]
    const mean = poissonBinomialMean(risks)
    const equivalent = mean / risks.length
    expect(poissonBinomialVariance(risks)).toBeLessThan(
      risks.length * equivalent * (1 - equivalent),
    )
  })

  it('handles the degenerate ends without producing nonsense', () => {
    expect(poissonBinomialPmf([])).toEqual([1])
    expect(poissonBinomialTailGreaterOrEqual(0, [0.3, 0.4])).toBe(1)
    expect(poissonBinomialTailGreaterOrEqual(3, [0.3, 0.4])).toBe(0)
    expect(poissonBinomialPmf([1, 1, 0])[2]).toBeCloseTo(1, 12)
  })
})

describe('the risk-adjusted test', () => {
  const risks = [0.02, 0.04, 0.3, 0.25, 0.09, 0.4, 0.15, 0.02]

  it('measures the count against what these individuals were expected to have', () => {
    const result = riskAdjustedTest(5, risks)
    expect(result.expected).toBeCloseTo(1.27, 12)
    expect(result.ratio).toBeCloseTo(5 / 1.27, 12)
    expect(result.pValue).toBeCloseTo(poissonBinomialTailGreaterOrEqual(5, risks), 12)
    expect(result.pValue).toBeLessThan(0.05)
  })

  it('finds nothing when the count is what the risks predicted', () => {
    expect(riskAdjustedTest(1, risks).ratio).toBeLessThan(1)
    expect(riskAdjustedTest(1, risks).pValue).toBeGreaterThan(0.5)
  })

  it('standardizes the excess by the variance of the risks, not of an average rate', () => {
    const result = riskAdjustedTest(5, risks)
    expect(result.z).toBeCloseTo(
      (5 - poissonBinomialMean(risks)) / Math.sqrt(poissonBinomialVariance(risks)),
      12,
    )
  })
})
