import { describe, expect, it } from 'vitest'
import { createRng } from '@/statistics/random/rng'
import {
  DARTBOARD_DEFAULTS,
  countHits,
  hitProbability,
  makeTarget,
  preRegisteredTarget,
  type Dart,
} from '@/scenarios/01-dartboard/model'
import { SEED_ROLE, generateDarts } from '@/scenarios/01-dartboard/simulation'
import {
  SELECTION_GALLERY_SIZE,
  collectNullEvidence,
  evaluateTarget,
  findBestTarget,
  replicateOnFreshData,
  selectionNullDarts,
  simulateSelectionNull,
} from '@/scenarios/01-dartboard/analysis'

const { dartCount, radius, seed } = DARTBOARD_DEFAULTS
const darts = generateDarts(dartCount, seed)

describe('evaluateTarget', () => {
  it('reports the hits and the matching binomial test', () => {
    const target = preRegisteredTarget(radius)
    const evaluation = evaluateTarget(darts, target)
    expect(evaluation.hits).toBe(countHits(darts, target))
    expect(evaluation.test.trials).toBe(dartCount)
    expect(evaluation.test.nullProbability).toBeCloseTo(hitProbability(radius), 12)
    expect(evaluation.test.expected).toBeCloseTo(dartCount * hitProbability(radius), 12)
  })
})

describe('findBestTarget', () => {
  it('finds a cluster that fits inside one circle', () => {
    const clustered: Dart[] = [
      { x: 0.5, y: 0.5 },
      { x: 0.52, y: 0.5 },
      { x: 0.5, y: 0.52 },
      { x: 0.1, y: 0.1 },
      { x: 0.9, y: 0.9 },
    ]
    const best = findBestTarget(clustered, 0.05)
    expect(best.hits).toBe(3)
    expect(countHits(clustered, best.target)).toBe(3)
  })

  it('keeps the target inside the board', () => {
    const corner: Dart[] = [
      { x: 0.01, y: 0.01 },
      { x: 0.02, y: 0.02 },
    ]
    const best = findBestTarget(corner, 0.2)
    expect(best.target.x).toBeGreaterThanOrEqual(0.2 - 1e-9)
    expect(best.target.y).toBeGreaterThanOrEqual(0.2 - 1e-9)
    expect(best.target.x).toBeLessThanOrEqual(0.8 + 1e-9)
  })

  it('handles an empty board', () => {
    expect(findBestTarget([], 0.1).hits).toBe(0)
  })

  it('is at least as good as any randomly placed target', () => {
    const best = findBestTarget(darts, radius)
    const rng = createRng(31)
    for (let attempt = 0; attempt < 400; attempt += 1) {
      const candidate = makeTarget({ x: rng.next(), y: rng.next() }, radius)
      expect(countHits(darts, candidate)).toBeLessThanOrEqual(best.hits)
    }
  })

  it('is at least as good as a fine grid search', () => {
    const best = findBestTarget(darts, radius)
    const steps = 150
    let gridBest = 0
    for (let i = 0; i <= steps; i += 1) {
      for (let j = 0; j <= steps; j += 1) {
        const target = makeTarget({ x: i / steps, y: j / steps }, radius)
        const hits = countHits(darts, target)
        if (hits > gridBest) gridBest = hits
      }
    }
    expect(best.hits).toBeGreaterThanOrEqual(gridBest)
  })

  it('beats the target that was fixed in advance', () => {
    const best = findBestTarget(darts, radius)
    const preset = evaluateTarget(darts, preRegisteredTarget(radius))
    expect(best.hits).toBeGreaterThan(preset.hits)
  })
})

describe('simulateSelectionNull', () => {
  const best = findBestTarget(darts, radius)
  const result = simulateSelectionNull({
    dartCount,
    radius,
    baseSeed: seed,
    replications: 120,
    observedHits: best.hits,
  })

  it('shows that searching inflates the statistic', () => {
    // The best circle found by searching random data captures far more darts
    // than a circle fixed in advance is expected to.
    expect(result.meanMaxHits).toBeGreaterThan(dartCount * hitProbability(radius) + 2)
  })

  it('makes the apparently striking result unremarkable', () => {
    const naive = evaluateTarget(darts, best.target).test.pValue
    expect(naive).toBeLessThan(0.01)
    expect(result.adjusted.pValue).toBeGreaterThan(naive * 10)
    expect(result.adjusted.pValue).toBeGreaterThan(0.05)
  })

  it('is reproducible', () => {
    const again = simulateSelectionNull({
      dartCount,
      radius,
      baseSeed: seed,
      replications: 120,
      observedHits: best.hits,
    })
    expect(again.maxHits).toEqual(result.maxHits)
  })

  it('keeps the best simulated searches, best first', () => {
    expect(result.topSearches).toHaveLength(SELECTION_GALLERY_SIZE)
    const hits = result.topSearches.map((search) => search.hits)
    expect(hits).toEqual([...hits].sort((a, b) => b - a))
    expect(hits[0]).toBe(Math.max(...result.maxHits))
  })

  it('can redraw a simulated search on the data it was found in', () => {
    for (const search of result.topSearches) {
      const simulatedDarts = selectionNullDarts({ dartCount, baseSeed: seed, index: search.index })
      expect(simulatedDarts).toHaveLength(dartCount)
      // The recorded circle really does capture the recorded number of darts.
      expect(countHits(simulatedDarts, search.target)).toBe(search.hits)
    }
  })

  it('shows that the naive test calls every one of those a discovery', () => {
    for (const search of result.topSearches) {
      const simulatedDarts = selectionNullDarts({ dartCount, baseSeed: seed, index: search.index })
      // Data generated with true effect = 0, yet each would be reported as significant.
      expect(evaluateTarget(simulatedDarts, search.target).test.pValue).toBeLessThan(0.05)
    }
  })
})

describe('replicateOnFreshData', () => {
  const best = findBestTarget(darts, radius)
  const summary = replicateOnFreshData({
    dartCount,
    baseSeed: seed,
    replications: 200,
    preRegistered: preRegisteredTarget(radius),
    postHoc: best.target,
  })

  it('makes both targets behave identically on independent data', () => {
    const expected = dartCount * hitProbability(radius)
    expect(summary.preRegistered.meanHits).toBeCloseTo(expected, 0)
    expect(summary.postHoc.meanHits).toBeCloseTo(expected, 0)
  })

  it('removes the advantage the post-hoc target had on the original data', () => {
    expect(summary.postHoc.meanHits).toBeLessThan(best.hits - 2)
  })

  it('keeps the false positive rate near the nominal level for both targets', () => {
    expect(summary.preRegistered.significantShare).toBeLessThan(0.12)
    expect(summary.postHoc.significantShare).toBeLessThan(0.12)
  })
})

/**
 * The closing panel claims the machine has no favourite place. What carries
 * that claim is the count of hits matching the circle's area, so these
 * assert the property rather than one seed's exact number.
 */
describe('null evidence', () => {
  const REPLICATIONS = 400

  it('lands on the count the area predicts', () => {
    const result = collectNullEvidence({
      dartCount: DARTBOARD_DEFAULTS.dartCount,
      baseSeed: DARTBOARD_DEFAULTS.seed,
      replications: REPLICATIONS,
      target: preRegisteredTarget(DARTBOARD_DEFAULTS.radius),
    })

    expect(result.hits).toHaveLength(REPLICATIONS)
    expect(result.expectedHits).toBeCloseTo(
      DARTBOARD_DEFAULTS.dartCount * hitProbability(DARTBOARD_DEFAULTS.radius),
      12,
    )
    expect(Math.abs(result.meanHits - result.expectedHits)).toBeLessThan(0.5)
    // An exact test on counts is conservative: it never exceeds its level.
    expect(result.shareSignificant).toBeGreaterThan(0)
    expect(result.shareSignificant).toBeLessThanOrEqual(0.05)
  })

  it('draws data no other role has used', () => {
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.validation)
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.selectionNull)
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.observed)
  })
})
