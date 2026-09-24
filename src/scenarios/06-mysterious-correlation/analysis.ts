import {
  correlationTest,
  criticalCorrelation,
  type CorrelationTestResult,
} from '@/statistics/hypothesis/correlationTest'
import { benjaminiHochberg, bonferroni } from '@/statistics/hypothesis/multiplicity'
import {
  empiricalPValueGreaterOrEqual,
  mean,
  shareOf,
  type EmpiricalPValue,
} from '@/statistics/monteCarlo'
import { assessFit } from '@/statistics/regression/goodnessOfFit'
import {
  fitPolynomial,
  predictPolynomial,
  type DataPoint,
} from '@/statistics/regression/leastSquares'
import {
  ALPHA,
  pairCount,
  pairsEqual,
  type VariablePair,
} from '@/scenarios/06-mysterious-correlation/model'
import {
  SEED_ROLE,
  generateReplicationDataset,
  type Dataset,
} from '@/scenarios/06-mysterious-correlation/simulation'

/**
 * Columns centred and scaled so that a correlation is a single dot product.
 *
 * The sweep computes every pair, so the cost of the whole analysis is the
 * cost of this preparation plus one pass over the pairs. That is what makes
 * "test everything" cheap enough to be the default, which is the practical
 * reason the trap is so common.
 */
export function standardizeColumns(dataset: Dataset): number[][] {
  return dataset.columns.map((values) => {
    const average = mean(values)
    let sumSquares = 0
    const centred = values.map((value) => {
      const deviation = value - average
      sumSquares += deviation * deviation
      return deviation
    })
    const norm = Math.sqrt(sumSquares)
    return norm > 0 ? centred.map((value) => value / norm) : centred.map(() => 0)
  })
}

export function correlationBetween(standardized: readonly number[][], pair: VariablePair): number {
  const a = standardized[pair.a]
  const b = standardized[pair.b]
  // A pair can outlive the table it was found in - the user may shrink the
  // number of variables. Report no correlation rather than crash.
  if (a === undefined || b === undefined) return Number.NaN
  let total = 0
  for (let i = 0; i < a.length; i += 1) total += a[i] * b[i]
  return total
}

export interface PairResult {
  pair: VariablePair
  test: CorrelationTestResult
}

export function evaluatePair(dataset: Dataset, pair: VariablePair): PairResult {
  const r = correlationBetween(standardizeColumns(dataset), pair)
  return { pair, test: correlationTest(r, dataset.observationCount) }
}

export interface SweepResult {
  /** Every pair the analyst tested, in the order it generated them. */
  pairs: PairResult[]
  pValues: number[]
  strongest: PairResult
  /** How many pairs cleared the threshold on their own. */
  significantCount: number
  /** Smallest false discovery rate at which anything at all is a discovery. */
  smallestFdr: number
  /** How many pairs survive at a 5% false discovery rate. */
  fdrDiscoveries: number
  /** Bonferroni-adjusted p-value of the strongest pair. */
  strongestBonferroni: number
  tested: number
}

/**
 * The automated analyst: every pair of variables, scored the same way, and
 * the strongest kept.
 *
 * Exhaustive rather than sampled, so "the most interesting relationship in
 * the data" really is the most interesting one.
 */
export function sweepAllPairs(dataset: Dataset): SweepResult {
  const standardized = standardizeColumns(dataset)
  const pairs: PairResult[] = []
  let strongest: PairResult | null = null

  for (let a = 0; a < dataset.variableCount; a += 1) {
    for (let b = a + 1; b < dataset.variableCount; b += 1) {
      const r = correlationBetween(standardized, { a, b })
      const result: PairResult = { pair: { a, b }, test: correlationTest(r, dataset.observationCount) }
      pairs.push(result)
      if (strongest === null || Math.abs(r) > Math.abs(strongest.test.r)) strongest = result
    }
  }

  const pValues = pairs.map((result) => result.test.pValue)
  const fdr = benjaminiHochberg(pValues)
  const fallback: PairResult = {
    pair: { a: 0, b: Math.min(1, dataset.variableCount - 1) },
    test: correlationTest(Number.NaN, dataset.observationCount),
  }
  const best = strongest ?? fallback

  return {
    pairs,
    pValues,
    strongest: best,
    significantCount: pValues.reduce((count, value) => (value < ALPHA ? count + 1 : count), 0),
    smallestFdr: fdr.length > 0 ? Math.min(...fdr) : Number.NaN,
    fdrDiscoveries: fdr.reduce((count, value) => (value < ALPHA ? count + 1 : count), 0),
    strongestBonferroni: bonferroni(best.test.pValue, pairs.length),
    tested: pairs.length,
  }
}

export interface SweepSummary {
  strongest: VariablePair
  r: number
  pValue: number
  significantCount: number
}

/**
 * The same sweep without keeping every pair.
 *
 * The full result is what the interface shows once; this is what the Monte
 * Carlo runs hundreds of times, so it allocates nothing per pair and skips
 * the false discovery rate, which only the observed table needs.
 */
export function sweepSummary(dataset: Dataset): SweepSummary {
  const standardized = standardizeColumns(dataset)
  const threshold = criticalCorrelation(dataset.observationCount, ALPHA)
  let strongest: VariablePair = { a: 0, b: Math.min(1, dataset.variableCount - 1) }
  let best = 0
  let significantCount = 0

  for (let a = 0; a < dataset.variableCount; a += 1) {
    for (let b = a + 1; b < dataset.variableCount; b += 1) {
      const r = correlationBetween(standardized, { a, b })
      const magnitude = Math.abs(r)
      if (magnitude >= threshold) significantCount += 1
      if (magnitude > Math.abs(best)) {
        best = r
        strongest = { a, b }
      }
    }
  }

  return {
    strongest,
    r: best,
    pValue: correlationTest(best, dataset.observationCount).pValue,
    significantCount,
  }
}

/** The points of one pair, for drawing and for fitting. */
export function pairPoints(dataset: Dataset, pair: VariablePair): DataPoint[] {
  return dataset.columns[pair.a].map((value, index) => ({
    x: value,
    y: dataset.columns[pair.b][index],
  }))
}

/** One simulated run of the whole sweep on a table where nothing is related. */
export interface SelectionSearchResult {
  index: number
  pair: VariablePair
  r: number
  pValue: number
  significantCount: number
}

export const SELECTION_GALLERY_SIZE = 5


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
  variableCount: number
  observationCount: number
  baseSeed: number
  replications: number
  pair: VariablePair
  alpha?: number
}): NullEvidenceResult {
  const { variableCount, observationCount, baseSeed, replications, pair, alpha = ALPHA } = options
  const pValues: number[] = []
  for (let index = 0; index < replications; index += 1) {
    const dataset = generateReplicationDataset({
      variableCount,
      observationCount,
      baseSeed,
      role: SEED_ROLE.nullEvidence,
      index,
    })
    pValues.push(evaluatePair(dataset, pair).test.pValue)
  }
  return {
    replications,
    pValues,
    shareSignificant: shareOf(pValues, (value) => value < alpha),
  }
}

export function selectionNullDataset(options: {
  variableCount: number
  observationCount: number
  baseSeed: number
  index: number
}): Dataset {
  const { variableCount, observationCount, baseSeed, index } = options
  return generateReplicationDataset({
    variableCount,
    observationCount,
    baseSeed,
    role: SEED_ROLE.selectionNull,
    index,
  })
}

export function selectionNullReplication(options: {
  variableCount: number
  observationCount: number
  baseSeed: number
  index: number
}): SelectionSearchResult {
  const { index } = options
  const sweep = sweepSummary(selectionNullDataset(options))
  return {
    index,
    pair: sweep.strongest,
    r: sweep.r,
    pValue: sweep.pValue,
    significantCount: sweep.significantCount,
  }
}

export interface SelectionNullResult {
  searches: SelectionSearchResult[]
  /** |r| of the strongest pair each simulated sweep found. */
  absR: number[]
  observedAbsR: number
  /** Average number of pairs the sweep calls significant when nothing is related. */
  meanSignificantCount: number
  adjusted: EmpiricalPValue
  observedPValue: number
  topSearches: SelectionSearchResult[]
}

export function summarizeSelectionNull(
  searches: SelectionSearchResult[],
  observedR: number,
  observedPValue: number,
): SelectionNullResult {
  const absR = searches.map((search) => Math.abs(search.r))
  const topSearches = [...searches]
    .sort((a, b) => a.pValue - b.pValue || a.index - b.index)
    .slice(0, SELECTION_GALLERY_SIZE)
  const observedAbsR = Math.abs(observedR)
  return {
    searches,
    absR,
    observedAbsR,
    meanSignificantCount: mean(searches.map((search) => search.significantCount)),
    // Every simulated sweep has the same number of rows, so a larger |r| is
    // exactly a smaller p-value: this is the p-value correction, binned on a
    // scale whose labels can be told apart.
    adjusted: empiricalPValueGreaterOrEqual(observedAbsR, absR),
    observedPValue,
    topSearches,
  }
}

export function simulateSelectionNull(options: {
  variableCount: number
  observationCount: number
  baseSeed: number
  replications: number
  observedR: number
  observedPValue: number
}): SelectionNullResult {
  const { replications, observedR, observedPValue, ...rest } = options
  const searches: SelectionSearchResult[] = []
  for (let index = 0; index < replications; index += 1) {
    searches.push(selectionNullReplication({ ...rest, index }))
  }
  return summarizeSelectionNull(searches, observedR, observedPValue)
}

export interface PairReplicationStats {
  /** Average correlation of this pair across independent batches. */
  meanR: number
  shareSignificant: number
  shareSameDirection: number
  /**
   * Average R² of the line fitted on the original data, applied to new rows.
   *
   * This is the question the correlation was supposed to be about: does
   * knowing one variable help predict the other in data nobody has seen?
   */
  meanFreshRSquared: number
}

export interface ReplicationSummary {
  replications: number
  preRegistered: PairReplicationStats
  discovered: PairReplicationStats
  /** How often a fresh sweep of fresh rows reports a completely different pair. */
  shareDifferentPair: number
}

function summarize(
  rValues: number[],
  pValues: number[],
  rSquared: number[],
  observedDirection: number,
): PairReplicationStats {
  return {
    meanR: mean(rValues),
    shareSignificant: shareOf(pValues, (value) => value < ALPHA),
    shareSameDirection: shareOf(
      rValues,
      (value) => Math.sign(value) === Math.sign(observedDirection),
    ),
    meanFreshRSquared: mean(rSquared),
  }
}

/**
 * Validation: both pairs are frozen and measured on rows that took no part
 * in choosing either of them.
 *
 * The line fitted on the original data is carried over unchanged, so the
 * out-of-sample R² answers the question the report was really making - that
 * one variable tells you something about the other.
 */
export function replicateOnFreshData(options: {
  variableCount: number
  observationCount: number
  baseSeed: number
  replications: number
  preRegistered: VariablePair
  discovered: VariablePair
  observed: Dataset
}): ReplicationSummary {
  const {
    variableCount,
    observationCount,
    baseSeed,
    replications,
    preRegistered,
    discovered,
    observed,
  } = options

  const frozen = {
    preRegistered: fitPolynomial(pairPoints(observed, preRegistered), 1),
    discovered: fitPolynomial(pairPoints(observed, discovered), 1),
  }
  const directions = {
    preRegistered: evaluatePair(observed, preRegistered).test.r,
    discovered: evaluatePair(observed, discovered).test.r,
  }
  const collected = {
    preRegistered: { r: [] as number[], p: [] as number[], rSquared: [] as number[] },
    discovered: { r: [] as number[], p: [] as number[], rSquared: [] as number[] },
  }
  let differentPair = 0

  for (let index = 0; index < replications; index += 1) {
    const batch = generateReplicationDataset({
      variableCount,
      observationCount,
      baseSeed,
      role: SEED_ROLE.validation,
      index,
    })
    const standardized = standardizeColumns(batch)
    for (const [key, pair] of [
      ['preRegistered', preRegistered],
      ['discovered', discovered],
    ] as const) {
      const r = correlationBetween(standardized, pair)
      collected[key].r.push(r)
      collected[key].p.push(correlationTest(r, observationCount).pValue)
      collected[key].rSquared.push(
        assessFit(pairPoints(batch, pair), (x) => predictPolynomial(frozen[key], x)).rSquared,
      )
    }
    if (!pairsEqual(sweepSummary(batch).strongest, discovered)) differentPair += 1
  }

  return {
    replications,
    preRegistered: summarize(
      collected.preRegistered.r,
      collected.preRegistered.p,
      collected.preRegistered.rSquared,
      directions.preRegistered,
    ),
    discovered: summarize(
      collected.discovered.r,
      collected.discovered.p,
      collected.discovered.rSquared,
      directions.discovered,
    ),
    shareDifferentPair: replications > 0 ? differentPair / replications : Number.NaN,
  }
}

/** Convenience for the interface: how many pairs a sweep of this table tests. */
export function testedPairs(variableCount: number): number {
  return pairCount(variableCount)
}
