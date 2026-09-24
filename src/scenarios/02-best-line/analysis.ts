import { overallFTest, type FTestResult } from '@/statistics/hypothesis/fTest'
import {
  empiricalPValueLessOrEqual,
  mean,
  shareOf,
  type EmpiricalPValue,
} from '@/statistics/monteCarlo'
import { assessFit, type FitQuality } from '@/statistics/regression/goodnessOfFit'
import {
  fitPolynomial,
  predictPolynomial,
  type DataPoint,
  type PolynomialModel,
} from '@/statistics/regression/leastSquares'
import {
  ALPHA,
  buildModel,
  isLeastSquares,
  maxDegreeFor,
  predictorsOf,
  PRE_REGISTERED_DEGREE,
  type ModelSpec,
} from '@/scenarios/02-best-line/model'
import { SEED_ROLE, generateReplicationSample } from '@/scenarios/02-best-line/simulation'

export interface ModelEvaluation {
  spec: ModelSpec
  model: PolynomialModel
  predictors: number
  training: FitQuality
  /** Overall F-test. Only meaningful for a least-squares fit; NaN otherwise. */
  test: FTestResult
  testable: boolean
}

export function evaluateSpec(points: readonly DataPoint[], spec: ModelSpec): ModelEvaluation {
  const model = buildModel(spec, points)
  const predictors = predictorsOf(spec)
  const training = assessFit(points, (x) => predictPolynomial(model, x))
  const testable = isLeastSquares(spec)
  return {
    spec,
    model,
    predictors,
    training,
    testable,
    test: testable
      ? overallFTest(training.rSquared, points.length, predictors)
      : { fStatistic: Number.NaN, df1: predictors, df2: Number.NaN, rSquared: training.rSquared, pValue: Number.NaN },
  }
}

export interface DegreeResult {
  degree: number
  rSquared: number
  pValue: number
}

/**
 * Fits every degree the search is allowed to try.
 *
 * R2 can only rise with degree - a more flexible model contains the simpler
 * one - so "best R2" always means "most flexible". The p-value does not
 * behave that way: the F-test charges for every parameter, so which degree
 * looks most convincing varies from sample to sample. That is what makes
 * shopping for a degree a genuine search.
 */
export function searchDegrees(points: readonly DataPoint[], maxDegree: number): DegreeResult[] {
  const results: DegreeResult[] = []
  for (let degree = 1; degree <= maxDegree; degree += 1) {
    const model = fitPolynomial(points, degree)
    const quality = assessFit(points, (x) => predictPolynomial(model, x))
    const test = overallFTest(quality.rSquared, points.length, degree)
    results.push({ degree, rSquared: quality.rSquared, pValue: test.pValue })
  }
  return results
}

/** The degree that came out looking most convincing: the smallest p-value. */
export function mostConvincingDegree(results: readonly DegreeResult[]): number {
  let best = results[0]
  for (const result of results) {
    if (result.pValue < best.pValue) best = result
  }
  return best?.degree ?? 1
}

/** One simulated run of the whole search procedure on data with no relationship. */
export interface SelectionSearchResult {
  index: number
  degree: number
  pValue: number
  rSquared: number
}

export const SELECTION_GALLERY_SIZE = 5

export function selectionNullSample(options: {
  pointCount: number
  baseSeed: number
  index: number
}): DataPoint[] {
  const { pointCount, baseSeed, index } = options
  return generateReplicationSample(pointCount, baseSeed, SEED_ROLE.selectionNull, index)
}

export function selectionNullReplication(options: {
  pointCount: number
  baseSeed: number
  index: number
}): SelectionSearchResult {
  const { pointCount, baseSeed, index } = options
  const sample = selectionNullSample({ pointCount, baseSeed, index })
  const results = searchDegrees(sample, maxDegreeFor(pointCount))
  const degree = mostConvincingDegree(results)
  const best = results.find((result) => result.degree === degree)
  return {
    index,
    degree,
    pValue: best ? best.pValue : Number.NaN,
    rSquared: best ? best.rSquared : Number.NaN,
  }
}

export interface SelectionNullResult {
  searches: SelectionSearchResult[]
  pValues: number[]
  /** How often the search alone produced a "significant" result in pure noise. */
  shareSignificant: number
  adjusted: EmpiricalPValue
  observedPValue: number
  topSearches: SelectionSearchResult[]
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
    shareSignificant: shareOf(pValues, (value) => value < ALPHA),
    // Small p-values are the extreme ones here.
    adjusted: empiricalPValueLessOrEqual(observedPValue, pValues),
    observedPValue,
    topSearches,
  }
}

export function simulateSelectionNull(options: {
  pointCount: number
  baseSeed: number
  replications: number
  observedPValue: number
}): SelectionNullResult {
  const { pointCount, baseSeed, replications, observedPValue } = options
  const searches: SelectionSearchResult[] = []
  for (let index = 0; index < replications; index += 1) {
    searches.push(selectionNullReplication({ pointCount, baseSeed, index }))
  }
  return summarizeSelectionNull(searches, observedPValue)
}

/** How a frozen model does on data it has never seen. */

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
  pointCount: number
  baseSeed: number
  replications: number
  alpha?: number
}): NullEvidenceResult {
  const { pointCount, baseSeed, replications, alpha = ALPHA } = options
  const pValues: number[] = []
  for (let index = 0; index < replications; index += 1) {
    const points = generateReplicationSample(
      pointCount,
      baseSeed,
      SEED_ROLE.nullEvidence,
      index,
    )
    pValues.push(
      evaluateSpec(points, { kind: 'fitted', degree: PRE_REGISTERED_DEGREE }).test.pValue,
    )
  }
  return {
    replications,
    pValues,
    shareSignificant: shareOf(pValues, (value) => value < alpha),
  }
}

export function evaluateOnSample(model: PolynomialModel, points: readonly DataPoint[]): FitQuality {
  return assessFit(points, (x) => predictPolynomial(model, x))
}

export interface ComplexityPoint {
  degree: number
  trainingRSquared: number
  freshRSquared: number
}

/**
 * The classic picture: fit quality on the sample the model was built from
 * against fit quality on a new sample, as flexibility grows.
 */
export function complexityCurve(
  training: readonly DataPoint[],
  fresh: readonly DataPoint[],
  maxDegree: number,
): ComplexityPoint[] {
  const curve: ComplexityPoint[] = []
  for (let degree = 0; degree <= maxDegree; degree += 1) {
    const model = fitPolynomial(training, degree)
    curve.push({
      degree,
      trainingRSquared: assessFit(training, (x) => predictPolynomial(model, x)).rSquared,
      freshRSquared: assessFit(fresh, (x) => predictPolynomial(model, x)).rSquared,
    })
  }
  return curve
}

export interface ReplicationStats {
  meanRSquared: number
  meanRmse: number
  shareWorseThanFlat: number
}

export interface ReplicationSummary {
  replications: number
  flat: ReplicationStats
  preRegistered: ReplicationStats
  chosen: ReplicationStats
}

function summarize(
  rSquared: number[],
  rmse: number[],
  flatRmse: number[],
): ReplicationStats {
  return {
    meanRSquared: mean(rSquared),
    meanRmse: mean(rmse),
    shareWorseThanFlat: shareOf(
      rmse.map((value, index) => value - flatRmse[index]),
      (difference) => difference > 0,
    ),
  }
}

/**
 * Validation: the models are frozen and applied to independent samples that
 * were never used to choose or fit anything.
 */
export function replicateOnFreshData(options: {
  pointCount: number
  baseSeed: number
  replications: number
  flat: PolynomialModel
  preRegistered: PolynomialModel
  chosen: PolynomialModel
}): ReplicationSummary {
  const { pointCount, baseSeed, replications, flat, preRegistered, chosen } = options
  const collected = {
    flat: { rSquared: [] as number[], rmse: [] as number[] },
    preRegistered: { rSquared: [] as number[], rmse: [] as number[] },
    chosen: { rSquared: [] as number[], rmse: [] as number[] },
  }

  for (let index = 0; index < replications; index += 1) {
    const sample = generateReplicationSample(pointCount, baseSeed, SEED_ROLE.validation, index)
    for (const [key, model] of [
      ['flat', flat],
      ['preRegistered', preRegistered],
      ['chosen', chosen],
    ] as const) {
      const quality = evaluateOnSample(model, sample)
      collected[key].rSquared.push(quality.rSquared)
      collected[key].rmse.push(quality.rmse)
    }
  }

  return {
    replications,
    flat: summarize(collected.flat.rSquared, collected.flat.rmse, collected.flat.rmse),
    preRegistered: summarize(
      collected.preRegistered.rSquared,
      collected.preRegistered.rmse,
      collected.flat.rmse,
    ),
    chosen: summarize(collected.chosen.rSquared, collected.chosen.rmse, collected.flat.rmse),
  }
}
