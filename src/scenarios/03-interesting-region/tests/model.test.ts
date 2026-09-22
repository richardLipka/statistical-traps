import { describe, expect, it } from 'vitest'
import {
  REGION_DEFAULTS,
  REGION_LIMITS,
  candidateWindowCount,
  clampWindow,
  preRegisteredWindow,
  windowLength,
  windowsEqual,
  windowsOverlap,
} from '@/scenarios/03-interesting-region/model'

describe('the region model', () => {
  it('fixes the declared window on the middle third of the record', () => {
    const window = preRegisteredWindow(120)
    expect(window).toEqual({ start: 40, end: 80 })
    expect(windowLength(window)).toBe(40)
  })

  it('places the declared window without knowing anything about the data', () => {
    // It depends on the length of the record and on nothing else.
    for (const periodCount of [60, 61, 100, 200]) {
      const window = preRegisteredWindow(periodCount)
      expect(preRegisteredWindow(periodCount)).toEqual(window)
      expect(window.start).toBeGreaterThanOrEqual(0)
      expect(window.end).toBeLessThanOrEqual(periodCount)
      expect(windowLength(window)).toBeGreaterThanOrEqual(REGION_LIMITS.minWindow)
    }
  })

  it('keeps a dragged window inside the record and long enough to test', () => {
    const periodCount = 120
    expect(clampWindow({ start: -20, end: 3 }, periodCount)).toEqual({
      start: 0,
      end: REGION_LIMITS.minWindow,
    })
    expect(clampWindow({ start: 118, end: 400 }, periodCount)).toEqual({
      start: 115,
      end: 120,
    })
    expect(clampWindow({ start: 10.4, end: 30.6 }, periodCount)).toEqual({ start: 10, end: 31 })
  })

  it('compares windows by position', () => {
    expect(windowsEqual({ start: 3, end: 9 }, { start: 3, end: 9 })).toBe(true)
    expect(windowsEqual({ start: 3, end: 9 }, { start: 3, end: 10 })).toBe(false)
    expect(windowsOverlap({ start: 0, end: 10 }, { start: 9, end: 20 })).toBe(true)
    // Half-open ranges: touching end to start is not an overlap.
    expect(windowsOverlap({ start: 0, end: 10 }, { start: 10, end: 20 })).toBe(false)
    expect(windowsOverlap({ start: 30, end: 40 }, { start: 0, end: 10 })).toBe(false)
  })

  it('counts the windows the search may choose between', () => {
    const brute = (periodCount: number, minWindow: number) => {
      let total = 0
      for (let start = 0; start < periodCount; start += 1) {
        for (let end = start + minWindow; end <= periodCount; end += 1) total += 1
      }
      return total
    }
    for (const periodCount of [10, 37, 120]) {
      expect(candidateWindowCount(periodCount, REGION_LIMITS.minWindow)).toBe(
        brute(periodCount, REGION_LIMITS.minWindow),
      )
    }
    expect(candidateWindowCount(120, 5)).toBe(6786)
  })

  it('offers a search space far larger than a single test, by default', () => {
    expect(candidateWindowCount(REGION_DEFAULTS.periodCount, REGION_LIMITS.minWindow))
      .toBeGreaterThan(1000)
  })
})
