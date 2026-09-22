import { describe, expect, it } from 'vitest'
import { erf, erfc, normalCdf, normalTwoSidedTail, normalUpperTail } from '@/statistics/distributions/normal'
import { meanZTest } from '@/statistics/hypothesis/zTest'

describe('the normal distribution', () => {
  it('matches known values of the error function', () => {
    expect(erf(0)).toBe(0)
    expect(erf(0.5)).toBeCloseTo(0.5204998778, 9)
    expect(erf(1)).toBeCloseTo(0.8427007929, 9)
    expect(erf(2)).toBeCloseTo(0.995322265, 9)
    expect(erf(-1.3)).toBeCloseTo(-0.9340079449, 9)
  })

  it('keeps erfc accurate far into the tail, where 1 - erf would be empty', () => {
    // 1 - erf(x) has no significant digits left once erf(x) rounds to 1.
    expect(1 - erf(9)).toBe(0)
    expect(erfc(9)).toBeCloseTo(4.1370317465e-37, 45)
    expect(erfc(5)).toBeCloseTo(1.5374597944e-12, 20)
    expect(erfc(-0.7)).toBeCloseTo(1.6778011938, 9)
  })

  it('matches tabulated values of the standard normal distribution function', () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 12)
    expect(normalCdf(1)).toBeCloseTo(0.8413447461, 10)
    expect(normalCdf(-1)).toBeCloseTo(0.1586552539, 10)
    expect(normalCdf(1.959963984540054)).toBeCloseTo(0.975, 12)
    expect(normalCdf(110, 100, 15)).toBeCloseTo(0.7475074625, 9)
  })

  it('gives the two-sided tail its textbook critical values', () => {
    expect(normalTwoSidedTail(1.959963984540054)).toBeCloseTo(0.05, 12)
    expect(normalTwoSidedTail(2.5758293035489)).toBeCloseTo(0.01, 12)
    expect(normalTwoSidedTail(3.2905267314919)).toBeCloseTo(0.001, 12)
    // Symmetric in the sign of z.
    expect(normalTwoSidedTail(-2.5)).toBe(normalTwoSidedTail(2.5))
  })

  it('agrees with the distribution function where both are accurate', () => {
    for (const z of [0.25, 1, 2, 3, 4]) {
      expect(normalUpperTail(z)).toBeCloseTo(1 - normalCdf(z), 12)
      expect(normalTwoSidedTail(z)).toBeCloseTo(2 * normalUpperTail(z), 12)
    }
  })
})

describe('the z-test for a known standard deviation', () => {
  it('standardizes the sum by the standard deviation of the sum', () => {
    const result = meanZTest(10, 25, 2)
    expect(result.mean).toBeCloseTo(0.4, 12)
    // 10 / (2 * 5)
    expect(result.z).toBeCloseTo(1, 12)
    expect(result.pValue).toBeCloseTo(0.3173105078, 9)
  })

  it('reports a critical result at the conventional threshold', () => {
    const result = meanZTest(1.959963984540054 * 3, 9, 1)
    expect(result.pValue).toBeCloseTo(0.05, 12)
  })

  it('reports nothing rather than a meaningless number for impossible inputs', () => {
    expect(meanZTest(1, 0, 1).pValue).toBeNaN()
    expect(meanZTest(1, 10, 0).pValue).toBeNaN()
    expect(meanZTest(Number.NaN, 10, 1).pValue).toBeNaN()
  })
})
