import { describe, expect, it } from 'vitest'
import { correlation } from '@/statistics/regression/goodnessOfFit'
import { binValues, mean } from '@/statistics/monteCarlo'
import {
  ALPHA,
  DATASET_DEFAULTS,
  PRE_REGISTERED_PAIR,
  expectedFalsePositives,
  pairsEqual,
} from '@/scenarios/06-mysterious-correlation/model'
import { SEED_ROLE, generateDataset } from '@/scenarios/06-mysterious-correlation/simulation'
import {
  collectNullEvidence,
  evaluatePair,
  pairPoints,
  replicateOnFreshData,
  selectionNullDataset,
  simulateSelectionNull,
  sweepAllPairs,
  sweepSummary,
} from '@/scenarios/06-mysterious-correlation/analysis'

const { variableCount, observationCount, seed } = DATASET_DEFAULTS
const dataset = generateDataset({ variableCount, observationCount, seed })
const sweep = sweepAllPairs(dataset)
const preRegistered = evaluatePair(dataset, PRE_REGISTERED_PAIR)

describe('measuring one pair', () => {
  it('agrees with the plain correlation of the two columns', () => {
    const pair = { a: 5, b: 17 }
    const direct = correlation(pairPoints(dataset, pair))
    expect(evaluatePair(dataset, pair).test.r).toBeCloseTo(direct, 12)
  })

  it('reports nothing for a pair the table does not contain', () => {
    // The interface lets the table shrink under a pair chosen from a larger one.
    const small = generateDataset({ variableCount: 4, observationCount: 20, seed: 1 })
    expect(evaluatePair(small, { a: 0, b: 30 }).test.r).toBeNaN()
    expect(evaluatePair(small, { a: 0, b: 30 }).test.pValue).toBeNaN()
  })

  it('finds nothing in the pair that was named in advance', () => {
    expect(preRegistered.test.pValue).toBeGreaterThan(ALPHA)
  })
})

describe('sweeping every pair', () => {
  it('tests every combination of two variables', () => {
    expect(sweep.tested).toBe((variableCount * (variableCount - 1)) / 2)
    expect(sweep.pairs).toHaveLength(sweep.tested)
    const seen = new Set(sweep.pairs.map((result) => `${result.pair.a}-${result.pair.b}`))
    expect(seen.size).toBe(sweep.tested)
  })

  it('returns the strongest pair, not merely a strong one', () => {
    for (const result of sweep.pairs) {
      expect(Math.abs(result.test.r)).toBeLessThanOrEqual(Math.abs(sweep.strongest.test.r))
    }
    expect(Math.abs(sweep.strongest.test.r)).toBeGreaterThan(0.5)
    expect(sweep.strongest.test.pValue).toBeLessThan(0.001)
  })

  it('finds about as many significant pairs as the threshold promises', () => {
    const expected = expectedFalsePositives(variableCount)
    // Sampling noise around the expectation is a few per cent of it.
    expect(sweep.significantCount).toBeGreaterThan(expected * 0.7)
    expect(sweep.significantCount).toBeLessThan(expected * 1.3)
  })

  it('leaves the p-values of the whole sweep flat, which is the scenario in one picture', () => {
    const bins = binValues(sweep.pValues, 10, { min: 0, max: 1 })
    const counts = bins.map((bin) => bin.count)
    const expectedPerBin = sweep.tested / 10
    for (const count of counts) {
      expect(count).toBeGreaterThan(expectedPerBin * 0.7)
      expect(count).toBeLessThan(expectedPerBin * 1.3)
    }
  })

  it('reports nothing as a discovery once the false discovery rate is controlled', () => {
    expect(sweep.fdrDiscoveries).toBe(0)
    expect(sweep.smallestFdr).toBeGreaterThan(ALPHA)
    expect(sweep.strongestBonferroni).toBeGreaterThan(ALPHA)
  })

  it('agrees with the lean sweep the simulations use', () => {
    const lean = sweepSummary(dataset)
    expect(pairsEqual(lean.strongest, sweep.strongest.pair)).toBe(true)
    expect(lean.r).toBeCloseTo(sweep.strongest.test.r, 12)
    expect(lean.pValue).toBeCloseTo(sweep.strongest.test.pValue, 12)
    expect(lean.significantCount).toBe(sweep.significantCount)
  })
})

describe('correcting for the sweep', () => {
  const selection = simulateSelectionNull({
    variableCount,
    observationCount,
    baseSeed: seed,
    replications: 150,
    observedR: sweep.strongest.test.r,
    observedPValue: sweep.strongest.test.pValue,
  })

  it('measures the result against the distribution of the whole sweep', () => {
    expect(selection.adjusted.pValue).toBeGreaterThan(sweep.strongest.test.pValue * 100)
    expect(selection.adjusted.pValue).toBeGreaterThan(ALPHA)
  })

  it('finds the same number of false positives the threshold predicts, every time', () => {
    expect(selection.meanSignificantCount).toBeGreaterThan(
      expectedFalsePositives(variableCount) * 0.85,
    )
    expect(selection.meanSignificantCount).toBeLessThan(
      expectedFalsePositives(variableCount) * 1.15,
    )
  })

  it('collects a gallery of the strongest finds, ordered by how impressive they are', () => {
    expect(selection.topSearches).toHaveLength(5)
    const pValues = selection.topSearches.map((search) => search.pValue)
    expect(pValues).toEqual([...pValues].sort((a, b) => a - b))
    for (const search of selection.topSearches) {
      expect(Math.abs(search.r)).toBeGreaterThan(0.5)
    }
  })

  it('can redraw a simulated sweep from its replication index alone', () => {
    for (const search of selection.topSearches) {
      const redrawn = selectionNullDataset({
        variableCount,
        observationCount,
        baseSeed: seed,
        index: search.index,
      })
      expect(evaluatePair(redrawn, search.pair).test.r).toBeCloseTo(search.r, 12)
    }
  })
})

describe('validating on new rows', () => {
  const discovered = sweep.strongest.pair
  const summary = replicateOnFreshData({
    variableCount,
    observationCount,
    baseSeed: seed,
    replications: 150,
    preRegistered: PRE_REGISTERED_PAIR,
    discovered,
    observed: dataset,
  })

  it('brings the discovered correlation back to zero', () => {
    expect(Math.abs(summary.discovered.meanR)).toBeLessThan(0.1)
    expect(Math.abs(sweep.strongest.test.r)).toBeGreaterThan(0.5)
  })

  it('puts both pairs at about the nominal error rate', () => {
    for (const stats of [summary.preRegistered, summary.discovered]) {
      expect(stats.shareSignificant).toBeGreaterThan(0.005)
      expect(stats.shareSignificant).toBeLessThan(0.12)
    }
  })

  it('fails to predict new rows, which is what the discovery claimed', () => {
    // Negative R²: the fitted line does worse than ignoring the relationship.
    expect(summary.discovered.meanFreshRSquared).toBeLessThan(0)
    expect(summary.discovered.meanFreshRSquared).toBeLessThan(
      summary.preRegistered.meanFreshRSquared,
    )
  })

  it('does not even keep the direction of the original correlation', () => {
    expect(summary.discovered.shareSameDirection).toBeGreaterThan(0.3)
    expect(summary.discovered.shareSameDirection).toBeLessThan(0.7)
  })

  it('reports a different strongest pair on almost every new batch', () => {
    expect(summary.shareDifferentPair).toBeGreaterThan(0.9)
  })

  it('never validates on the rows that produced the discovery', () => {
    const batch = selectionNullDataset({ variableCount, observationCount, baseSeed: seed, index: 0 })
    expect(mean(batch.columns[0])).not.toBe(mean(dataset.columns[0]))
  })
})

/**
 * The closing panel claims the generator holds nothing. These assert the
 * property the claim rests on rather than one seed's exact number: a valid
 * test of a true null spreads its p-values evenly, so no tenth of the range
 * is favoured and the share below alpha sits near alpha.
 */
describe('null evidence', () => {
  const REPLICATIONS = 400

  it('produces p-values that are spread evenly', () => {
    const result = collectNullEvidence({
      variableCount: DATASET_DEFAULTS.variableCount,
      observationCount: DATASET_DEFAULTS.observationCount,
      baseSeed: DATASET_DEFAULTS.seed,
      replications: REPLICATIONS,
      pair: PRE_REGISTERED_PAIR,
    })

    expect(result.pValues).toHaveLength(REPLICATIONS)
    for (const pValue of result.pValues) {
      expect(pValue).toBeGreaterThanOrEqual(0)
      expect(pValue).toBeLessThanOrEqual(1)
    }
    expect(result.shareSignificant).toBeGreaterThan(0.01)
    expect(result.shareSignificant).toBeLessThan(0.1)

    const bins = binValues(result.pValues, 10, { min: 0, max: 1 })
    const counts = bins.map((bin) => bin.count)
    // Even coverage: no tenth of the range is empty, and none holds a fifth
    // of everything. Both would show up long before the histogram looked flat.
    for (const count of counts) {
      expect(count).toBeGreaterThan(0)
      expect(count).toBeLessThan(REPLICATIONS / 5)
    }
  })

  it('draws data no other role has used', () => {
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.validation)
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.selectionNull)
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.observed)
  })
})
