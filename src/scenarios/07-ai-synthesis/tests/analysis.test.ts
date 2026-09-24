import { describe, expect, it } from 'vitest'
import {
  ALPHA,
  CONNECTED_FEATURE,
  STUDY_DEFAULTS,
  trueCorrelation,
} from '@/scenarios/07-ai-synthesis/model'
import { binValues } from '@/statistics/monteCarlo'
import { SEED_ROLE, generateStudy } from '@/scenarios/07-ai-synthesis/simulation'
import {
  candidatePoints,
  collectNullEvidence,
  countSignificant,
  evaluateCandidate,
  finalists,
  rankCandidates,
  replicateIntervention,
  replicateOnFreshData,
  selectionNullStudy,
  simulateSelectionNull,
} from '@/scenarios/07-ai-synthesis/analysis'

const { candidateCount, rowCount, seed } = STUDY_DEFAULTS
const study = generateStudy({ candidateCount, rowCount, seed })
const ranked = rankCandidates(study)
const pair = finalists(ranked)

describe('what the system returns', () => {
  it('scores and ranks every candidate', () => {
    expect(ranked).toHaveLength(candidateCount)
    const magnitudes = ranked.map((result) => Math.abs(result.test.r))
    expect(magnitudes).toEqual([...magnitudes].sort((a, b) => b - a))
    expect(new Set(ranked.map((result) => result.index)).size).toBe(candidateCount)
  })

  it('calls about as many candidates significant as the threshold predicts', () => {
    const expected = candidateCount * ALPHA
    expect(countSignificant(ranked)).toBeGreaterThan(expected * 0.5)
    expect(countSignificant(ranked)).toBeLessThan(expected * 2)
  })

  it('puts an unrelated candidate at the top, and the connected one just behind', () => {
    // The scenario depends on this: the search cannot be trusted to rank the
    // real one first, and on this table it does not.
    expect(ranked[0].connected).toBe(false)
    const connectedRank = ranked.findIndex((result) => result.connected)
    expect(connectedRank).toBeGreaterThan(0)
    expect(connectedRank).toBeLessThan(6)
  })

  it('follows one candidate of each kind, without ordering them by kind', () => {
    expect([pair.first.connected, pair.second.connected].sort()).toEqual([false, true])
    // Display order follows the search ranking, so it gives nothing away.
    expect(Math.abs(pair.first.test.r)).toBeGreaterThanOrEqual(Math.abs(pair.second.test.r))
  })

  it('leaves the two finalists indistinguishable in the data they were found in', () => {
    // Both significant, and close enough that no statistic here separates them.
    expect(pair.first.test.pValue).toBeLessThan(ALPHA)
    expect(pair.second.test.pValue).toBeLessThan(ALPHA)
    expect(
      Math.abs(Math.abs(pair.first.test.r) - Math.abs(pair.second.test.r)),
    ).toBeLessThan(0.1)
  })

  it('reads a candidate the same way whether ranked or evaluated alone', () => {
    const direct = evaluateCandidate(study, pair.second.index)
    expect(direct.test.r).toBeCloseTo(pair.second.test.r, 12)
    expect(candidatePoints(study, pair.second.index)).toHaveLength(rowCount)
  })
})

describe('pricing the search', () => {
  const selection = simulateSelectionNull({
    candidateCount,
    rowCount,
    baseSeed: seed,
    replications: 150,
    observedR: pair.first.test.r,
  })

  it('simulates a world where nothing at all is connected', () => {
    const nullStudy = selectionNullStudy({ candidateCount, rowCount, baseSeed: seed, index: 0 })
    const connected = evaluateCandidate(nullStudy, 0)
    // The connected column has been severed, so every candidate is unrelated.
    expect(Math.abs(connected.test.r)).toBeLessThan(0.5)
  })

  it('rejects the candidate the search liked best', () => {
    expect(selection.adjusted.pValue).toBeGreaterThan(ALPHA)
  })

  it('rejects the real one too, which is the point', () => {
    const second = simulateSelectionNull({
      candidateCount,
      rowCount,
      baseSeed: seed,
      replications: 150,
      observedR: pair.second.test.r,
    })
    expect(second.adjusted.pValue).toBeGreaterThan(ALPHA)
    // A correction for the search says "not established", not "false".
    const connected = pair.first.connected ? pair.first : pair.second
    expect(connected.connected).toBe(true)
  })

  it('collects a gallery of the strongest finds from empty worlds', () => {
    expect(selection.topSearches).toHaveLength(5)
    const magnitudes = selection.topSearches.map((search) => Math.abs(search.r))
    expect(magnitudes).toEqual([...magnitudes].sort((a, b) => b - a))
  })

  it('can redraw a simulated search from its replication index alone', () => {
    for (const search of selection.topSearches) {
      const redrawn = selectionNullStudy({ candidateCount, rowCount, baseSeed: seed, index: search.index })
      expect(evaluateCandidate(redrawn, search.candidate).test.r).toBeCloseTo(search.r, 12)
    }
  })
})

describe('question three: prediction on new cases', () => {
  const summary = replicateOnFreshData({
    candidateCount,
    rowCount,
    baseSeed: seed,
    replications: 150,
    candidates: [pair.first.index, pair.second.index],
    observed: study,
  })

  it('separates the two finalists, which nothing before it could', () => {
    const connected = summary.candidates.find((stats) => stats.connected)
    const unconnected = summary.candidates.find((stats) => !stats.connected)
    expect(connected).toBeDefined()
    expect(unconnected).toBeDefined()

    // The real one holds its correlation and predicts new cases.
    expect(connected!.meanR).toBeCloseTo(trueCorrelation(), 1)
    expect(connected!.shareSignificant).toBeGreaterThan(0.8)
    expect(connected!.meanFreshRSquared).toBeGreaterThan(0)

    // The other collapses to nothing and predicts worse than the mean would.
    expect(Math.abs(unconnected!.meanR)).toBeLessThan(0.1)
    expect(unconnected!.shareSignificant).toBeLessThan(0.12)
    expect(unconnected!.meanFreshRSquared).toBeLessThan(0)
  })
})

describe('question four: intervention', () => {
  const summary = replicateIntervention({
    candidateCount,
    rowCount,
    baseSeed: seed,
    replications: 150,
    candidates: [pair.first.index, pair.second.index],
  })

  it('shows the real predictor moving with the outcome as the world produces it', () => {
    const connected = summary.candidates.find((stats) => stats.connected)!
    expect(connected.observedDifference).toBeGreaterThan(0.4)
    expect(connected.observedShareSignificant).toBeGreaterThan(0.6)
  })

  it('shows the outcome not following when the feature is set instead', () => {
    for (const stats of summary.candidates) {
      expect(Math.abs(stats.interventionDifference)).toBeLessThan(0.15)
      expect(stats.interventionShareSignificant).toBeLessThan(0.12)
    }
  })

  it('leaves the unrelated candidate flat in both columns', () => {
    const unconnected = summary.candidates.find((stats) => !stats.connected)!
    expect(Math.abs(unconnected.observedDifference)).toBeLessThan(0.15)
    expect(Math.abs(unconnected.interventionDifference)).toBeLessThan(0.15)
  })
})

/**
 * This scenario is the one that does hold a real relationship, so the
 * closing panel has to show a contrast rather than a single flat picture.
 */
describe('null evidence', () => {
  const REPLICATIONS = 400

  it('separates the connected feature from an unconnected one', () => {
    const result = collectNullEvidence({
      candidateCount,
      rowCount,
      baseSeed: seed,
      replications: REPLICATIONS,
      unconnected: CONNECTED_FEATURE + 1,
    })

    expect(result.connectedPValues).toHaveLength(REPLICATIONS)
    expect(result.unconnectedPValues).toHaveLength(REPLICATIONS)

    // The real relationship is strong enough to be found nearly every time.
    expect(result.shareConnectedSignificant).toBeGreaterThan(0.9)
    // The other feature behaves like any true null.
    expect(result.shareUnconnectedSignificant).toBeGreaterThan(0.01)
    expect(result.shareUnconnectedSignificant).toBeLessThan(0.1)

    const bins = binValues(result.unconnectedPValues, 10, { min: 0, max: 1 })
    for (const bin of bins) {
      expect(bin.count).toBeGreaterThan(0)
      expect(bin.count).toBeLessThan(REPLICATIONS / 5)
    }
  })

  it('draws data no other role has used', () => {
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.validation)
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.selectionNull)
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.freshStudy)
  })
})
