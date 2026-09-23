import { describe, expect, it } from 'vitest'
import {
  ALPHA,
  DATASET_DEFAULTS,
  DATASET_LIMITS,
  PRE_REGISTERED_PAIR,
  expectedFalsePositives,
  pairCount,
  pairsEqual,
  variableNumber,
} from '@/scenarios/06-mysterious-correlation/model'

describe('the data-mining model', () => {
  it('counts every unordered pair of distinct variables', () => {
    const brute = (count: number) => {
      let total = 0
      for (let a = 0; a < count; a += 1) for (let b = a + 1; b < count; b += 1) total += 1
      return total
    }
    for (const count of [2, 10, 37, 60, 80]) {
      expect(pairCount(count)).toBe(brute(count))
    }
    expect(pairCount(60)).toBe(1770)
  })

  it('grows roughly as the square of the variables', () => {
    // Doubling the variables roughly quadruples the family of tests.
    const ratio = pairCount(80) / pairCount(40)
    expect(ratio).toBeGreaterThan(3.5)
    expect(ratio).toBeLessThan(4.5)
  })

  it('says how many false positives to expect from the threshold alone', () => {
    expect(expectedFalsePositives(60)).toBeCloseTo(88.5, 12)
    expect(expectedFalsePositives(60, 0.01)).toBeCloseTo(17.7, 12)
  })

  it('names a pair in advance, out of the variables that exist', () => {
    expect(PRE_REGISTERED_PAIR.a).not.toBe(PRE_REGISTERED_PAIR.b)
    expect(PRE_REGISTERED_PAIR.a).toBeLessThan(DATASET_LIMITS.minVariables)
    expect(PRE_REGISTERED_PAIR.b).toBeLessThan(DATASET_LIMITS.minVariables)
  })

  it('compares pairs without caring which variable is named first', () => {
    expect(pairsEqual({ a: 3, b: 9 }, { a: 9, b: 3 })).toBe(true)
    expect(pairsEqual({ a: 3, b: 9 }, { a: 3, b: 10 })).toBe(false)
  })

  it('numbers variables from one, and gives them nothing else', () => {
    expect(variableNumber(0)).toBe(1)
    expect(variableNumber(27)).toBe(28)
  })

  it('defaults to a table where the sweep is far larger than the sample', () => {
    expect(pairCount(DATASET_DEFAULTS.variableCount)).toBeGreaterThan(
      DATASET_DEFAULTS.observationCount * 10,
    )
    expect(ALPHA).toBe(0.05)
  })
})
