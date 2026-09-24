import { describe, expect, it } from 'vitest'
import { fitPolynomial, predictPolynomial } from '@/statistics/regression/leastSquares'
import {
  ALPHA,
  BESTLINE_DEFAULTS,
  PRE_REGISTERED_DEGREE,
  maxDegreeFor,
} from '@/scenarios/02-best-line/model'
import { SEED_ROLE, generateReplicationSample, generateSample } from '@/scenarios/02-best-line/simulation'
import { binValues } from '@/statistics/monteCarlo'
import {
  SELECTION_GALLERY_SIZE,
  collectNullEvidence,
  complexityCurve,
  evaluateOnSample,
  evaluateSpec,
  mostConvincingDegree,
  replicateOnFreshData,
  searchDegrees,
  selectionNullSample,
  simulateSelectionNull,
} from '@/scenarios/02-best-line/analysis'

const { pointCount, seed } = BESTLINE_DEFAULTS
const maxDegree = maxDegreeFor(pointCount)
const points = generateSample(pointCount, seed)
const degreeResults = searchDegrees(points, maxDegree)
const chosenDegree = mostConvincingDegree(degreeResults)

describe('evaluateSpec', () => {
  it('tests a least-squares fit and refuses to test a hand-drawn line', () => {
    const fitted = evaluateSpec(points, { kind: 'fitted', degree: 2 })
    expect(fitted.testable).toBe(true)
    expect(Number.isFinite(fitted.test.pValue)).toBe(true)

    const manual = evaluateSpec(points, { kind: 'manual', left: -1, right: 1 })
    expect(manual.testable).toBe(false)
    expect(Number.isNaN(manual.test.pValue)).toBe(true)
    expect(Number.isFinite(manual.training.rSquared)).toBe(true)
  })

  it('cannot be beaten by a hand-drawn line of the same shape', () => {
    // Least squares is by definition the best straight line for this sample.
    const fitted = evaluateSpec(points, { kind: 'fitted', degree: 1 })
    for (const [left, right] of [
      [-1, 1],
      [0.5, -0.5],
      [0, 0],
    ] as const) {
      const manual = evaluateSpec(points, { kind: 'manual', left, right })
      expect(manual.training.rSquared).toBeLessThanOrEqual(fitted.training.rSquared + 1e-9)
    }
  })
})

describe('searchDegrees', () => {
  it('offers every degree the search may try', () => {
    expect(degreeResults.map((result) => result.degree)).toEqual(
      Array.from({ length: maxDegree }, (_, index) => index + 1),
    )
  })

  it('shows R² rising with flexibility, mechanically', () => {
    let previous = -Infinity
    for (const result of degreeResults) {
      expect(result.rSquared).toBeGreaterThanOrEqual(previous - 1e-9)
      previous = result.rSquared
    }
  })

  it('shows the p-value not following R², which is what makes the search worthwhile', () => {
    const best = degreeResults.find((result) => result.degree === chosenDegree)
    const mostFlexible = degreeResults[degreeResults.length - 1]
    expect(best).toBeDefined()
    expect(best!.pValue).toBeLessThanOrEqual(mostFlexible.pValue)
    expect(best!.rSquared).toBeLessThanOrEqual(mostFlexible.rSquared + 1e-9)
  })

  it('picks the model that looks most convincing, not the most flexible one', () => {
    const smallest = Math.min(...degreeResults.map((result) => result.pValue))
    expect(degreeResults.find((r) => r.degree === chosenDegree)!.pValue).toBeCloseTo(smallest, 12)
  })
})

describe('the trap on the default sample', () => {
  const preRegistered = evaluateSpec(points, { kind: 'fitted', degree: PRE_REGISTERED_DEGREE })
  const chosen = evaluateSpec(points, { kind: 'fitted', degree: chosenDegree })

  it('finds nothing with the analysis fixed in advance', () => {
    expect(preRegistered.test.pValue).toBeGreaterThan(ALPHA)
  })

  it('finds something convincing once the model may be chosen', () => {
    expect(chosen.test.pValue).toBeLessThan(ALPHA)
    expect(chosen.training.rSquared).toBeGreaterThan(0.4)
  })
})

describe('simulateSelectionNull', () => {
  const chosen = evaluateSpec(points, { kind: 'fitted', degree: chosenDegree })
  const result = simulateSelectionNull({
    pointCount,
    baseSeed: seed,
    replications: 150,
    observedPValue: chosen.test.pValue,
  })

  it('shows the search finding "significance" in noise far more often than 5%', () => {
    expect(result.shareSignificant).toBeGreaterThan(0.1)
  })

  it('makes the apparently convincing result ordinary', () => {
    expect(result.adjusted.pValue).toBeGreaterThan(chosen.test.pValue * 2)
    expect(result.adjusted.pValue).toBeGreaterThan(ALPHA)
  })

  it('is reproducible', () => {
    const again = simulateSelectionNull({
      pointCount,
      baseSeed: seed,
      replications: 150,
      observedPValue: chosen.test.pValue,
    })
    expect(again.pValues).toEqual(result.pValues)
  })

  it('keeps the most convincing simulated searches, best first', () => {
    expect(result.topSearches).toHaveLength(SELECTION_GALLERY_SIZE)
    const pValues = result.topSearches.map((search) => search.pValue)
    expect(pValues).toEqual([...pValues].sort((a, b) => a - b))
    expect(pValues[0]).toBeCloseTo(Math.min(...result.pValues), 12)
  })

  it('can redraw a simulated search on the data it was found in', () => {
    for (const search of result.topSearches) {
      const sample = selectionNullSample({ pointCount, baseSeed: seed, index: search.index })
      const model = fitPolynomial(sample, search.degree)
      const quality = evaluateOnSample(model, sample)
      expect(quality.rSquared).toBeCloseTo(search.rSquared, 9)
      // Pure noise, and the naive test would report a discovery for each one.
      expect(search.pValue).toBeLessThan(ALPHA)
    }
  })
})

describe('validation on fresh data', () => {
  const fresh = generateReplicationSample(pointCount, seed, SEED_ROLE.freshSample, 0)
  const chosenModel = fitPolynomial(points, chosenDegree)

  it('turns an impressive fit into a bad prediction', () => {
    const training = evaluateOnSample(chosenModel, points)
    const prediction = evaluateOnSample(chosenModel, fresh)
    expect(training.rSquared).toBeGreaterThan(0.4)
    expect(prediction.rSquared).toBeLessThan(0)
  })

  it('draws the textbook complexity curve', () => {
    const curve = complexityCurve(points, fresh, maxDegree)
    expect(curve).toHaveLength(maxDegree + 1)
    let previous = -Infinity
    for (const entry of curve) {
      expect(entry.trainingRSquared).toBeGreaterThanOrEqual(previous - 1e-9)
      previous = entry.trainingRSquared
    }
    expect(curve[curve.length - 1].freshRSquared).toBeLessThan(curve[0].freshRSquared)
  })

  it('leaves the chosen model reliably worse than claiming nothing', () => {
    const summary = replicateOnFreshData({
      pointCount,
      baseSeed: seed,
      replications: 100,
      flat: fitPolynomial(points, 0),
      preRegistered: fitPolynomial(points, PRE_REGISTERED_DEGREE),
      chosen: chosenModel,
    })
    expect(summary.chosen.meanRSquared).toBeLessThan(summary.flat.meanRSquared)
    expect(summary.chosen.meanRmse).toBeGreaterThan(summary.flat.meanRmse)
    expect(summary.chosen.shareWorseThanFlat).toBeGreaterThan(0.75)
  })

  it('predicts with a model, not with the training sample', () => {
    // The frozen model must give the same prediction wherever it is applied.
    const model = fitPolynomial(points, chosenDegree)
    expect(predictPolynomial(model, 0.42)).toBeCloseTo(predictPolynomial(chosenModel, 0.42), 12)
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
      pointCount: BESTLINE_DEFAULTS.pointCount,
      baseSeed: BESTLINE_DEFAULTS.seed,
      replications: REPLICATIONS,
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
