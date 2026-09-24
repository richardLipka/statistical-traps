import { bonferroni, holmAdjusted } from '@/statistics/hypothesis/multiplicity'
import { welchTTest, type TTestResult } from '@/statistics/hypothesis/tTest'
import {
  empiricalPValueLessOrEqual,
  mean,
  shareOf,
  type EmpiricalPValue,
} from '@/statistics/monteCarlo'
import { ALPHA } from '@/scenarios/05-miracle-drug/model'
import {
  SEED_ROLE,
  generateReplicationTrial,
  type Trial,
} from '@/scenarios/05-miracle-drug/simulation'

export interface OutcomeResult {
  index: number
  test: TTestResult
  /** Bonferroni-adjusted p-value: this p-value times the number of outcomes. */
  bonferroni: number
  /** Holm-adjusted p-value, which is never more severe than Bonferroni. */
  holm: number
}

export function evaluateTrial(trial: Trial): OutcomeResult[] {
  const tests = trial.treatment.map((values, index) =>
    welchTTest(values, trial.control[index]),
  )
  const holm = holmAdjusted(tests.map((test) => test.pValue))
  return tests.map((test, index) => ({
    index,
    test,
    bonferroni: bonferroni(test.pValue, tests.length),
    holm: holm[index],
  }))
}

/** The outcome that came out looking most impressive: the smallest p-value. */
export function mostImpressiveOutcome(results: readonly OutcomeResult[]): number {
  let best = results[0]
  for (const result of results) {
    if (result.test.pValue < best.test.pValue) best = result
  }
  return best?.index ?? 0
}

/** How many outcomes would be reported as significant on their own. */
export function countSignificant(results: readonly OutcomeResult[]): number {
  let count = 0
  for (const result of results) {
    if (result.test.pValue < ALPHA) count += 1
  }
  return count
}

/**
 * The correlation actually realized between the outcomes in this trial,
 * averaged over every pair.
 *
 * Reported rather than assumed: it is the reason Bonferroni and the
 * simulated correction disagree, so the scenario shows the number instead of
 * asserting it.
 */
export function averageOutcomeCorrelation(trial: Trial): number {
  const outcomes = trial.outcomeCount
  const arms = [trial.treatment, trial.control]
  const correlations: number[] = []

  for (const arm of arms) {
    const centred = arm.map((values) => {
      const average = mean(values)
      return values.map((value) => value - average)
    })
    for (let a = 0; a < outcomes; a += 1) {
      for (let b = a + 1; b < outcomes; b += 1) {
        let covariance = 0
        let varianceA = 0
        let varianceB = 0
        for (let i = 0; i < centred[a].length; i += 1) {
          covariance += centred[a][i] * centred[b][i]
          varianceA += centred[a][i] ** 2
          varianceB += centred[b][i] ** 2
        }
        if (varianceA > 0 && varianceB > 0) {
          correlations.push(covariance / Math.sqrt(varianceA * varianceB))
        }
      }
    }
  }
  return mean(correlations)
}

/** One simulated run of the whole procedure on a trial of a treatment that does nothing. */
export interface SelectionSearchResult {
  index: number
  outcomeIndex: number
  difference: number
  pValue: number
  /** How many of that trial's outcomes reached 0.05 on their own. */
  significantCount: number
}

export const SELECTION_GALLERY_SIZE = 5

export function selectionNullTrial(options: {
  patientsPerArm: number
  outcomeCount: number
  baseSeed: number
  index: number
}): Trial {
  const { patientsPerArm, outcomeCount, baseSeed, index } = options
  return generateReplicationTrial({
    patientsPerArm,
    outcomeCount,
    baseSeed,
    role: SEED_ROLE.selectionNull,
    index,
  })
}

export function selectionNullReplication(options: {
  patientsPerArm: number
  outcomeCount: number
  baseSeed: number
  index: number
}): SelectionSearchResult {
  const { index } = options
  const results = evaluateTrial(selectionNullTrial(options))
  const best = results[mostImpressiveOutcome(results)]
  return {
    index,
    outcomeIndex: best.index,
    difference: best.test.difference,
    pValue: best.test.pValue,
    significantCount: countSignificant(results),
  }
}

export interface SelectionNullResult {
  searches: SelectionSearchResult[]
  pValues: number[]
  /** How often the search alone produced at least one "significant" outcome. */
  shareSignificant: number
  /** Average number of outcomes reaching 0.05 in a trial of a treatment that does nothing. */
  meanSignificantCount: number
  adjusted: EmpiricalPValue
  observedPValue: number
  topSearches: SelectionSearchResult[]
}


export interface NullEvidenceResult {
  replications: number
  /** One p-value of the pre-registered test per independent data set. */
  pValues: number[]
  shareSignificant: number
}

/**
 * Closing evidence that the generator really does contain nothing to find.
 *
 * The analysis fixed before the data is run on many independent data sets,
 * none of which took part in choosing anything. A valid test of a true null
 * spreads its p-values evenly over the whole interval, so the histogram is
 * flat and the share below alpha lands near alpha. That flat picture is the
 * scenario's opening claim made checkable.
 */
export function collectNullEvidence(options: {
  patientsPerArm: number
  outcomeCount: number
  baseSeed: number
  replications: number
  outcome: number
  alpha?: number
}): NullEvidenceResult {
  const { patientsPerArm, outcomeCount, baseSeed, replications, outcome, alpha = ALPHA } = options
  const pValues: number[] = []
  for (let index = 0; index < replications; index += 1) {
    const trial = generateReplicationTrial({
      patientsPerArm,
      outcomeCount,
      baseSeed,
      role: SEED_ROLE.nullEvidence,
      index,
    })
    pValues.push(evaluateTrial(trial)[outcome].test.pValue)
  }
  return {
    replications,
    pValues,
    shareSignificant: shareOf(pValues, (value) => value < alpha),
  }
}

export function summarizeSelectionNull(
  searches: SelectionSearchResult[],
  observedPValue: number,
): SelectionNullResult {
  const pValues = searches.map((search) => search.pValue)
  const topSearches = [...searches]
    .sort((a, b) => a.pValue - b.pValue || a.index - b.index)
    .slice(0, SELECTION_GALLERY_SIZE)
  return {
    searches,
    pValues,
    shareSignificant: shareOf(searches, (search) => search.significantCount > 0),
    meanSignificantCount: mean(searches.map((search) => search.significantCount)),
    // Small p-values are the extreme ones here.
    adjusted: empiricalPValueLessOrEqual(observedPValue, pValues),
    observedPValue,
    topSearches,
  }
}

export function simulateSelectionNull(options: {
  patientsPerArm: number
  outcomeCount: number
  baseSeed: number
  replications: number
  observedPValue: number
}): SelectionNullResult {
  const { replications, observedPValue, ...rest } = options
  const searches: SelectionSearchResult[] = []
  for (let index = 0; index < replications; index += 1) {
    searches.push(selectionNullReplication({ ...rest, index }))
  }
  return summarizeSelectionNull(searches, observedPValue)
}

export interface OutcomeReplicationStats {
  /** Average treatment-minus-control difference across independent trials. */
  meanDifference: number
  /** Share of trials in which this outcome would be reported as significant. */
  shareSignificant: number
  /** Share of trials in which the difference even points the same way again. */
  shareSameDirection: number
}

export interface ReplicationSummary {
  replications: number
  primary: OutcomeReplicationStats
  chosen: OutcomeReplicationStats
  /** How often a fresh search of a fresh trial lands on a different outcome. */
  shareDifferentOutcome: number
}

function summarize(
  differences: number[],
  pValues: number[],
  observedDirection: number,
): OutcomeReplicationStats {
  return {
    meanDifference: mean(differences),
    shareSignificant: shareOf(pValues, (value) => value < ALPHA),
    shareSameDirection: shareOf(
      differences,
      (value) => Math.sign(value) === Math.sign(observedDirection),
    ),
  }
}

/**
 * Validation: the replication trial that a finding is supposed to survive.
 *
 * Both outcomes are frozen - one was registered before the first trial, the
 * other named by the first trial's results - and new patients are enrolled.
 * Both are then in the same position, and both behave accordingly.
 */
export function replicateOnFreshData(options: {
  patientsPerArm: number
  outcomeCount: number
  baseSeed: number
  replications: number
  primary: number
  chosen: number
  primaryDirection: number
  chosenDirection: number
}): ReplicationSummary {
  const {
    patientsPerArm,
    outcomeCount,
    baseSeed,
    replications,
    primary,
    chosen,
    primaryDirection,
    chosenDirection,
  } = options
  const collected = {
    primary: { differences: [] as number[], pValues: [] as number[] },
    chosen: { differences: [] as number[], pValues: [] as number[] },
  }
  let differentOutcome = 0

  for (let index = 0; index < replications; index += 1) {
    const trial = generateReplicationTrial({
      patientsPerArm,
      outcomeCount,
      baseSeed,
      role: SEED_ROLE.validation,
      index,
    })
    const results = evaluateTrial(trial)
    for (const [key, outcomeIndex] of [
      ['primary', primary],
      ['chosen', chosen],
    ] as const) {
      collected[key].differences.push(results[outcomeIndex].test.difference)
      collected[key].pValues.push(results[outcomeIndex].test.pValue)
    }
    if (mostImpressiveOutcome(results) !== chosen) differentOutcome += 1
  }

  return {
    replications,
    primary: summarize(
      collected.primary.differences,
      collected.primary.pValues,
      primaryDirection,
    ),
    chosen: summarize(collected.chosen.differences, collected.chosen.pValues, chosenDirection),
    shareDifferentOutcome: replications > 0 ? differentOutcome / replications : Number.NaN,
  }
}
