import { describe, expect, it } from 'vitest'
import { welchTTest } from '@/statistics/hypothesis/tTest'
import { binValues } from '@/statistics/monteCarlo'
import { ALPHA, PRIMARY_OUTCOME, TRIAL_DEFAULTS } from '@/scenarios/05-miracle-drug/model'
import { SEED_ROLE, generateTrial } from '@/scenarios/05-miracle-drug/simulation'
import {
  averageOutcomeCorrelation,
  collectNullEvidence,
  countSignificant,
  evaluateTrial,
  mostImpressiveOutcome,
  replicateOnFreshData,
  selectionNullTrial,
  simulateSelectionNull,
} from '@/scenarios/05-miracle-drug/analysis'

const { patientsPerArm, outcomeCount, seed } = TRIAL_DEFAULTS
const trial = generateTrial({ patientsPerArm, outcomeCount, seed })
const results = evaluateTrial(trial)
const chosenIndex = mostImpressiveOutcome(results)
const chosen = results[chosenIndex]
const primary = results[PRIMARY_OUTCOME]

describe('testing one outcome', () => {
  it('tests every outcome the same way, treated against untreated', () => {
    expect(results).toHaveLength(outcomeCount)
    for (const result of results) {
      const direct = welchTTest(trial.treatment[result.index], trial.control[result.index])
      expect(result.test.pValue).toBeCloseTo(direct.pValue, 12)
      expect(result.test.difference).toBeCloseTo(direct.difference, 12)
    }
  })

  it('finds nothing in the outcome that was registered in advance', () => {
    expect(primary.test.pValue).toBeGreaterThan(ALPHA)
  })
})

describe('searching the panel', () => {
  it('turns a treatment that does nothing into a striking finding', () => {
    expect(chosen.test.pValue).toBeLessThan(0.01)
    expect(chosen.test.pValue).toBeLessThan(primary.test.pValue)
  })

  it('returns the smallest p-value in the panel', () => {
    for (const result of results) {
      expect(result.test.pValue).toBeGreaterThanOrEqual(chosen.test.pValue)
    }
  })

  it('produces several apparently significant outcomes from nothing at all', () => {
    expect(countSignificant(results)).toBeGreaterThan(1)
  })

  it('measures the correlation the outcomes actually have', () => {
    const observed = averageOutcomeCorrelation(trial)
    expect(observed).toBeGreaterThan(0.2)
    expect(observed).toBeLessThan(0.5)
  })
})

describe('the textbook correction', () => {
  it('multiplies by the size of the panel', () => {
    expect(chosen.bonferroni).toBeCloseTo(
      Math.min(1, chosen.test.pValue * outcomeCount),
      12,
    )
  })

  it('is enough to withdraw the finding on its own', () => {
    expect(chosen.bonferroni).toBeGreaterThan(ALPHA)
    expect(chosen.holm).toBeGreaterThan(ALPHA)
  })

  it('never makes Holm more severe than Bonferroni', () => {
    for (const result of results) {
      expect(result.holm).toBeLessThanOrEqual(result.bonferroni + 1e-12)
    }
  })
})

describe('correcting for the search by simulation', () => {
  const selection = simulateSelectionNull({
    patientsPerArm,
    outcomeCount,
    baseSeed: seed,
    replications: 200,
    observedPValue: chosen.test.pValue,
  })

  it('measures the result against the distribution of the whole search', () => {
    expect(selection.adjusted.pValue).toBeGreaterThan(chosen.test.pValue * 5)
    expect(selection.adjusted.pValue).toBeGreaterThan(ALPHA)
  })

  it('is milder than Bonferroni, because the outcomes are correlated', () => {
    // Bonferroni charges for 20 independent chances; the search did not have
    // 20 independent chances, and simulating the procedure prices it right.
    expect(selection.adjusted.pValue).toBeLessThan(chosen.bonferroni)
  })

  it('shows how often the search alone produces a positive trial', () => {
    expect(selection.shareSignificant).toBeGreaterThan(0.3)
    expect(selection.meanSignificantCount).toBeGreaterThan(0.5)
  })

  it('collects a gallery of the most impressive finds, ordered by how impressive they are', () => {
    expect(selection.topSearches).toHaveLength(5)
    const pValues = selection.topSearches.map((search) => search.pValue)
    expect(pValues).toEqual([...pValues].sort((a, b) => a - b))
    for (const search of selection.topSearches) {
      expect(search.pValue).toBeLessThan(ALPHA)
    }
  })

  it('can redraw a simulated trial from its replication index alone', () => {
    for (const search of selection.topSearches) {
      const redrawn = evaluateTrial(
        selectionNullTrial({ patientsPerArm, outcomeCount, baseSeed: seed, index: search.index }),
      )
      const repeated = redrawn[search.outcomeIndex]
      expect(repeated.test.pValue).toBeCloseTo(search.pValue, 12)
      expect(repeated.test.difference).toBeCloseTo(search.difference, 12)
    }
  })
})

describe('validating in new trials', () => {
  const summary = replicateOnFreshData({
    patientsPerArm,
    outcomeCount,
    baseSeed: seed,
    replications: 200,
    primary: PRIMARY_OUTCOME,
    chosen: chosenIndex,
    primaryDirection: primary.test.difference,
    chosenDirection: chosen.test.difference,
  })

  it('brings the chosen outcome back to no difference at all', () => {
    expect(Math.abs(summary.chosen.meanDifference)).toBeLessThan(0.1)
    expect(Math.abs(chosen.test.difference)).toBeGreaterThan(0.3)
  })

  it('puts both outcomes at about the nominal error rate', () => {
    for (const stats of [summary.primary, summary.chosen]) {
      expect(stats.shareSignificant).toBeGreaterThan(0.005)
      expect(stats.shareSignificant).toBeLessThan(0.12)
    }
  })

  it('does not even keep the direction of the original difference', () => {
    // A real effect would repeat its sign; a selected one is a coin flip.
    expect(summary.chosen.shareSameDirection).toBeGreaterThan(0.35)
    expect(summary.chosen.shareSameDirection).toBeLessThan(0.65)
  })

  it('shows the search landing on a different outcome next time', () => {
    expect(summary.shareDifferentOutcome).toBeGreaterThan(0.7)
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
      patientsPerArm: TRIAL_DEFAULTS.patientsPerArm,
      outcomeCount: TRIAL_DEFAULTS.outcomeCount,
      baseSeed: TRIAL_DEFAULTS.seed,
      replications: REPLICATIONS,
      outcome: PRIMARY_OUTCOME,
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
