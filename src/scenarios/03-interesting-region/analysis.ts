import { meanZTest } from '@/statistics/hypothesis/zTest'
import {
  empiricalPValueGreaterOrEqual,
  mean,
  shareOf,
  type EmpiricalPValue,
} from '@/statistics/monteCarlo'
import {
  ALPHA,
  REGION_LIMITS,
  STEP_SD,
  candidateWindowCount,
  windowLength,
  windowsOverlap,
  type Window,
} from '@/scenarios/03-interesting-region/model'
import {
  SEED_ROLE,
  generateReplicationSeries,
  type Series,
} from '@/scenarios/03-interesting-region/simulation'

export interface WindowResult {
  window: Window
  /** Number of steps the window covers. */
  length: number
  /** Total change in the level across the window. */
  change: number
  z: number
  pValue: number
}

/**
 * Tests one stretch of the record: did the value change over it by more than
 * independent steps would plausibly produce?
 *
 * The change across a window is the sum of its steps, which is also the
 * difference of the two levels at its ends - so the statistic is exactly the
 * quantity the eye reads off the chart.
 */
export function evaluateWindow(series: Series, window: Window): WindowResult {
  const length = windowLength(window)
  const change = series.levels[window.end] - series.levels[window.start]
  const test = meanZTest(change, length, STEP_SD)
  return { window, length, change, z: test.z, pValue: test.pValue }
}

export interface ScanResult {
  best: WindowResult
  /** Size of the family of windows the best one was picked out of. */
  candidates: number
}

/**
 * The search: every stretch of at least `minWindow` steps, scored by the
 * same test, and the most striking one kept.
 *
 * Exhaustive rather than sampled, so "the most interesting period" really is
 * the most interesting one. Running totals make each window O(1), so the
 * whole scan costs one pass over the pairs of endpoints.
 */
export function scanWindows(
  series: Series,
  minWindow: number = REGION_LIMITS.minWindow,
): ScanResult {
  const periodCount = series.steps.length
  let best: WindowResult | null = null

  for (let start = 0; start + minWindow <= periodCount; start += 1) {
    for (let end = start + minWindow; end <= periodCount; end += 1) {
      const length = end - start
      const change = series.levels[end] - series.levels[start]
      const z = change / (STEP_SD * Math.sqrt(length))
      if (best === null || Math.abs(z) > Math.abs(best.z)) {
        best = evaluateWindow(series, { start, end })
      }
    }
  }

  return {
    best: best ?? evaluateWindow(series, { start: 0, end: periodCount }),
    candidates: candidateWindowCount(periodCount, minWindow),
  }
}

/** One simulated run of the whole search on a record with nothing in it. */
export interface SelectionSearchResult {
  index: number
  window: Window
  length: number
  change: number
  z: number
  pValue: number
}

export const SELECTION_GALLERY_SIZE = 5

export function selectionNullSeries(options: {
  periodCount: number
  baseSeed: number
  index: number
}): Series {
  const { periodCount, baseSeed, index } = options
  return generateReplicationSeries(periodCount, baseSeed, SEED_ROLE.selectionNull, index)
}

export function selectionNullReplication(options: {
  periodCount: number
  baseSeed: number
  index: number
}): SelectionSearchResult {
  const { periodCount, baseSeed, index } = options
  const series = selectionNullSeries({ periodCount, baseSeed, index })
  const { best } = scanWindows(series)
  return {
    index,
    window: best.window,
    length: best.length,
    change: best.change,
    z: best.z,
    pValue: best.pValue,
  }
}

export interface SelectionNullResult {
  searches: SelectionSearchResult[]
  /** |z| of the most striking window each simulated search found. */
  absZValues: number[]
  /** How often the search alone produced a "significant" period in pure noise. */
  shareSignificant: number
  adjusted: EmpiricalPValue
  observedAbsZ: number
  observedPValue: number
  topSearches: SelectionSearchResult[]
}

export function summarizeSelectionNull(
  searches: SelectionSearchResult[],
  observedZ: number,
  observedPValue: number,
): SelectionNullResult {
  const absZValues = searches.map((search) => Math.abs(search.z))
  const topSearches = [...searches]
    .sort((a, b) => Math.abs(b.z) - Math.abs(a.z) || a.index - b.index)
    .slice(0, SELECTION_GALLERY_SIZE)
  const observedAbsZ = Math.abs(observedZ)
  return {
    searches,
    absZValues,
    shareSignificant: shareOf(searches, (search) => search.pValue < ALPHA),
    // Large values of |z| are the extreme ones here.
    adjusted: empiricalPValueGreaterOrEqual(observedAbsZ, absZValues),
    observedAbsZ,
    observedPValue,
    topSearches,
  }
}

export function simulateSelectionNull(options: {
  periodCount: number
  baseSeed: number
  replications: number
  observedZ: number
  observedPValue: number
}): SelectionNullResult {
  const { periodCount, baseSeed, replications, observedZ, observedPValue } = options
  const searches: SelectionSearchResult[] = []
  for (let index = 0; index < replications; index += 1) {
    searches.push(selectionNullReplication({ periodCount, baseSeed, index }))
  }
  return summarizeSelectionNull(searches, observedZ, observedPValue)
}

export interface WindowReplicationStats {
  /** Average absolute z of this window across independent records. */
  meanAbsZ: number
  meanAbsChange: number
  /** Share of independent records in which this window looks significant. */
  shareSignificant: number
}

export interface ReplicationSummary {
  replications: number
  preRegistered: WindowReplicationStats
  chosen: WindowReplicationStats
  /**
   * How often a fresh search of a fresh record picks a period that does not
   * even overlap the one found here.
   */
  shareDifferentWindow: number
  /** Average |z| of the winner of a fresh search: the search statistic itself. */
  meanSearchAbsZ: number
}

function summarize(absZ: number[], absChange: number[], pValues: number[]): WindowReplicationStats {
  return {
    meanAbsZ: mean(absZ),
    meanAbsChange: mean(absChange),
    shareSignificant: shareOf(pValues, (value) => value < ALPHA),
  }
}

/**
 * Validation: the two windows are frozen as dates, and the machine produces
 * completely new records that took no part in choosing them.
 *
 * Both are then in the same position - a stretch fixed before these data
 * existed - and both behave accordingly. The searched-for window keeps
 * nothing of what made it look remarkable.
 */
export function replicateOnFreshData(options: {
  periodCount: number
  baseSeed: number
  replications: number
  preRegistered: Window
  chosen: Window
}): ReplicationSummary {
  const { periodCount, baseSeed, replications, preRegistered, chosen } = options
  const collected = {
    preRegistered: { absZ: [] as number[], absChange: [] as number[], pValues: [] as number[] },
    chosen: { absZ: [] as number[], absChange: [] as number[], pValues: [] as number[] },
  }
  const searchAbsZ: number[] = []
  let differentWindow = 0

  for (let index = 0; index < replications; index += 1) {
    const series = generateReplicationSeries(periodCount, baseSeed, SEED_ROLE.validation, index)
    for (const [key, window] of [
      ['preRegistered', preRegistered],
      ['chosen', chosen],
    ] as const) {
      const result = evaluateWindow(series, window)
      collected[key].absZ.push(Math.abs(result.z))
      collected[key].absChange.push(Math.abs(result.change))
      collected[key].pValues.push(result.pValue)
    }
    const fresh = scanWindows(series).best
    searchAbsZ.push(Math.abs(fresh.z))
    if (!windowsOverlap(fresh.window, chosen)) differentWindow += 1
  }

  return {
    replications,
    preRegistered: summarize(
      collected.preRegistered.absZ,
      collected.preRegistered.absChange,
      collected.preRegistered.pValues,
    ),
    chosen: summarize(collected.chosen.absZ, collected.chosen.absChange, collected.chosen.pValues),
    shareDifferentWindow: replications > 0 ? differentWindow / replications : Number.NaN,
    meanSearchAbsZ: mean(searchAbsZ),
  }
}
