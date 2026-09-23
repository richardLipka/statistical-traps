import { describe, expect, it } from 'vitest'
import { welchTTest } from '@/statistics/hypothesis/tTest'
import { ALPHA, PRIMARY_OUTCOME, TRIAL_DEFAULTS } from '@/scenarios/05-miracle-drug/model'
import { generateTrial } from '@/scenarios/05-miracle-drug/simulation'
import {
  averageOutcomeCorrelation,
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
