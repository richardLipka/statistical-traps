import { describe, expect, it } from 'vitest'
import {
  ALPHA,
  REGION_DEFAULTS,
  REGION_LIMITS,
  STEP_SD,
  preRegisteredWindow,
  windowsOverlap,
  type Window,
} from '@/scenarios/03-interesting-region/model'
import { generateSeries } from '@/scenarios/03-interesting-region/simulation'
import {
  evaluateWindow,
  replicateOnFreshData,
  scanWindows,
  selectionNullSeries,
  simulateSelectionNull,
} from '@/scenarios/03-interesting-region/analysis'

const { periodCount, seed } = REGION_DEFAULTS
const series = generateSeries(periodCount, seed)
const declared = preRegisteredWindow(periodCount)

describe('testing one stretch of the record', () => {
  it('measures the change as the sum of the steps inside the window', () => {
    const window: Window = { start: 12, end: 29 }
    const result = evaluateWindow(series, window)
    const sum = series.steps.slice(window.start, window.end).reduce((a, b) => a + b, 0)
    expect(result.length).toBe(17)
    expect(result.change).toBeCloseTo(sum, 12)
    expect(result.z).toBeCloseTo(sum / (STEP_SD * Math.sqrt(17)), 12)
  })

  it('finds nothing in the stretch that was fixed in advance', () => {
    const result = evaluateWindow(series, declared)
    expect(result.pValue).toBeGreaterThan(ALPHA)
  })
})

describe('searching for the most striking stretch', () => {
  const { best, candidates } = scanWindows(series)

  it('really does return the most extreme window, not merely a good one', () => {
    let bruteZ = 0
    for (let start = 0; start + REGION_LIMITS.minWindow <= periodCount; start += 1) {
      for (let end = start + REGION_LIMITS.minWindow; end <= periodCount; end += 1) {
        const z = evaluateWindow(series, { start, end }).z
        bruteZ = Math.max(bruteZ, Math.abs(z))
      }
    }
    expect(Math.abs(best.z)).toBeCloseTo(bruteZ, 12)
    expect(candidates).toBe(6786)
  })

  it('turns a record with nothing in it into a striking finding', () => {
    expect(best.pValue).toBeLessThan(0.001)
    expect(Math.abs(best.z)).toBeGreaterThan(Math.abs(evaluateWindow(series, declared).z))
  })

  it('finds something significant in almost every record, by construction', () => {
    let significant = 0
    const records = 40
    for (let index = 0; index < records; index += 1) {
      if (scanWindows(generateSeries(periodCount, 11_000 + index * 101)).best.pValue < ALPHA) {
        significant += 1
      }
    }
    // A single pre-specified test would be here about 5% of the time.
    expect(significant / records).toBeGreaterThan(0.9)
  })
})

describe('correcting for the search', () => {
  const observed = scanWindows(series).best
  const result = simulateSelectionNull({
    periodCount,
    baseSeed: seed,
    replications: 120,
    observedZ: observed.z,
    observedPValue: observed.pValue,
  })

  it('measures the observed result against the distribution of the whole search', () => {
    expect(result.adjusted.pValue).toBeGreaterThan(observed.pValue * 50)
    expect(result.adjusted.pValue).toBeGreaterThan(ALPHA)
  })

  it('shows that the search alone produces a finding almost every time', () => {
    expect(result.shareSignificant).toBeGreaterThan(0.9)
  })

  it('collects a gallery of the most striking finds, ordered by how striking they are', () => {
    expect(result.topSearches).toHaveLength(5)
    const magnitudes = result.topSearches.map((search) => Math.abs(search.z))
    expect(magnitudes).toEqual([...magnitudes].sort((a, b) => b - a))
    for (const search of result.topSearches) {
      expect(search.pValue).toBeLessThan(ALPHA)
    }
  })

  it('can redraw a simulated search from its replication index alone', () => {
    for (const search of result.topSearches) {
      const redrawn = selectionNullSeries({ periodCount, baseSeed: seed, index: search.index })
      const repeated = evaluateWindow(redrawn, search.window)
      expect(repeated.z).toBeCloseTo(search.z, 12)
      expect(repeated.change).toBeCloseTo(search.change, 12)
    }
  })
})

describe('validating on independent records', () => {
  const chosen = scanWindows(series).best.window
  const summary = replicateOnFreshData({
    periodCount,
    baseSeed: seed,
    replications: 200,
    preRegistered: declared,
    chosen,
  })

  it('leaves the searched-for stretch no better than the one fixed in advance', () => {
    expect(summary.chosen.shareSignificant).toBeLessThan(0.15)
    expect(Math.abs(summary.chosen.meanAbsZ - summary.preRegistered.meanAbsZ)).toBeLessThan(0.3)
  })

  it('keeps a window fixed in advance at about its nominal error rate', () => {
    expect(summary.preRegistered.shareSignificant).toBeGreaterThan(0.01)
    expect(summary.preRegistered.shareSignificant).toBeLessThan(0.12)
  })

  it('shows the search landing somewhere else on every new record', () => {
    expect(summary.shareDifferentWindow).toBeGreaterThan(0.5)
    // And still finding something striking there.
    expect(summary.meanSearchAbsZ).toBeGreaterThan(2.5)
  })

  it('validates on records that took no part in the search', () => {
    const chosenOnOriginal = evaluateWindow(series, chosen)
    expect(chosenOnOriginal.pValue).toBeLessThan(0.001)
    // The same window, measured on data the search never saw, is unremarkable.
    expect(summary.chosen.meanAbsZ).toBeLessThan(1.5)
    expect(windowsOverlap(chosen, chosen)).toBe(true)
  })
})
