import { correlationTest, type CorrelationTestResult } from '@/statistics/hypothesis/correlationTest'
import { welchTTest } from '@/statistics/hypothesis/tTest'
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
import { ALPHA, CONNECTED_FEATURE, isConnected } from '@/scenarios/07-ai-synthesis/model'
import {
  SEED_ROLE,
  generateReplicationStudy,
  interveneOnFeature,
  replicationSeed,
  type Study,
} from '@/scenarios/07-ai-synthesis/simulation'

/** Pearson correlation of two raw series, without allocating a point per row. */
function correlationOf(xs: readonly number[], ys: readonly number[]): number {
  const n = xs.length
  if (n < 2 || ys.length !== n) return Number.NaN
  const meanX = mean(xs)
  const meanY = mean(ys)
  let covariance = 0
  let varianceX = 0
  let varianceY = 0
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    covariance += dx * dy
    varianceX += dx * dx
    varianceY += dy * dy
  }
  if (varianceX <= 0 || varianceY <= 0) return Number.NaN
  return covariance / Math.sqrt(varianceX * varianceY)
}

export interface CandidateResult {
  index: number
  test: CorrelationTestResult
  /** True for the one feature that shares a cause with the outcome. */
  connected: boolean
}

export function evaluateCandidate(study: Study, index: number): CandidateResult {
  const values = study.features[index]
  const r = values === undefined ? Number.NaN : correlationOf(values, study.outcome)
  return { index, test: correlationTest(r, study.rowCount), connected: isConnected(index) }
}

/** The points of one candidate against the outcome, for drawing and fitting. */
export function candidatePoints(study: Study, index: number): DataPoint[] {
  const values = study.features[index] ?? []
  return values.map((value, row) => ({ x: value, y: study.outcome[row] }))
}

/**
 * What the system does: score every candidate against the outcome and rank
 * them.
 *
 * The search itself is performed correctly. Nothing here is a mistake, and
 * the ranking is exactly what the data support - which is the point.
 */
export function rankCandidates(study: Study): CandidateResult[] {
  const results: CandidateResult[] = []
  for (let index = 0; index < study.candidateCount; index += 1) {
    results.push(evaluateCandidate(study, index))
  }
  return results.sort((a, b) => Math.abs(b.test.r) - Math.abs(a.test.r))
}

export interface Finalists {
  /** The two the scenario follows, in the order the search ranked them. */
  first: CandidateResult
  second: CandidateResult
}

/**
 * The two candidates carried forward: the one the search liked best, and
 * the one that is really connected to the outcome.
 *
 * They are returned in rank order, so the interface gives away nothing
 * about which is which - the whole exercise is that the data cannot say.
 */
export function finalists(ranked: readonly CandidateResult[]): Finalists {
  const best = ranked[0]
  const connected = ranked.find((result) => result.connected) ?? ranked[1]
  const pair =
    best.index === connected.index
      ? [best, ranked.find((result) => !result.connected) ?? ranked[1]]
      : [best, connected]
  const ordered = [...pair].sort((a, b) => Math.abs(b.test.r) - Math.abs(a.test.r))
  return { first: ordered[0], second: ordered[1] }
}

/** How many candidates cleared the threshold on their own. */
export function countSignificant(ranked: readonly CandidateResult[]): number {
  let count = 0
  for (const result of ranked) {
    if (result.test.pValue < ALPHA) count += 1
  }
  return count
}

/** One simulated run of the search on a study where no feature is connected. */
export interface SelectionSearchResult {
  index: number
  candidate: number
  r: number
  pValue: number
}

export const SELECTION_GALLERY_SIZE = 5

/**
 * A world with nothing to find: the same study with the link between the
 * connected feature and the hidden cause severed, which is exactly what
 * intervening on it does.
 */
export function selectionNullStudy(options: {
  candidateCount: number
  rowCount: number
  baseSeed: number
  index: number
}): Study {
  const { candidateCount, rowCount, baseSeed, index } = options
  const study = generateReplicationStudy({
    candidateCount,
    rowCount,
    baseSeed,
    role: SEED_ROLE.selectionNull,
    index,
  })
  return interveneOnFeature(
    study,
    CONNECTED_FEATURE,
    replicationSeed(baseSeed, SEED_ROLE.selectionNull + 1, index),
  )
}

export function selectionNullReplication(options: {
  candidateCount: number
  rowCount: number
  baseSeed: number
  index: number
}): SelectionSearchResult {
  const { index } = options
  const best = rankCandidates(selectionNullStudy(options))[0]
  return { index, candidate: best.index, r: best.test.r, pValue: best.test.pValue }
}

export interface SelectionNullResult {
  searches: SelectionSearchResult[]
  absR: number[]
  observedAbsR: number
  adjusted: EmpiricalPValue
  topSearches: SelectionSearchResult[]
}

export function summarizeSelectionNull(
  searches: SelectionSearchResult[],
  observedR: number,
): SelectionNullResult {
  const absR = searches.map((search) => Math.abs(search.r))
  const observedAbsR = Math.abs(observedR)
  return {
    searches,
    absR,
    observedAbsR,
    adjusted: empiricalPValueGreaterOrEqual(observedAbsR, absR),
    topSearches: [...searches]
      .sort((a, b) => Math.abs(b.r) - Math.abs(a.r) || a.index - b.index)
      .slice(0, SELECTION_GALLERY_SIZE),
  }
}

export function simulateSelectionNull(options: {
  candidateCount: number
  rowCount: number
  baseSeed: number
  replications: number
  observedR: number
}): SelectionNullResult {
  const { replications, observedR, ...rest } = options
  const searches: SelectionSearchResult[] = []
  for (let index = 0; index < replications; index += 1) {
    searches.push(selectionNullReplication({ ...rest, index }))
  }
  return summarizeSelectionNull(searches, observedR)
}

export interface CandidateReplicationStats {
  candidate: number
  connected: boolean
  /** Average correlation with the outcome across independent studies. */
  meanR: number
  shareSignificant: number
  /** Average R² of the line fitted on the original study, applied to new cases. */
  meanFreshRSquared: number
}

export interface ReplicationSummary {
  replications: number
  candidates: CandidateReplicationStats[]
}

/**
 * Question three: does it predict cases nobody has seen?
 *
 * The line fitted on the original study is carried over unchanged, so this
 * asks for prediction rather than description. This is the stage that
 * separates the two finalists, and nothing before it can.
 */
export function replicateOnFreshData(options: {
  candidateCount: number
  rowCount: number
  baseSeed: number
  replications: number
  candidates: readonly number[]
  observed: Study
}): ReplicationSummary {
  const { candidateCount, rowCount, baseSeed, replications, candidates, observed } = options
  const frozen = candidates.map((candidate) =>
    fitPolynomial(candidatePoints(observed, candidate), 1),
  )
  const collected = candidates.map(() => ({
    r: [] as number[],
    p: [] as number[],
    rSquared: [] as number[],
  }))

  for (let index = 0; index < replications; index += 1) {
    const study = generateReplicationStudy({
      candidateCount,
      rowCount,
      baseSeed,
      role: SEED_ROLE.validation,
      index,
    })
    candidates.forEach((candidate, slot) => {
      const result = evaluateCandidate(study, candidate)
      collected[slot].r.push(result.test.r)
      collected[slot].p.push(result.test.pValue)
      collected[slot].rSquared.push(
        assessFit(candidatePoints(study, candidate), (x) =>
          predictPolynomial(frozen[slot], x),
        ).rSquared,
      )
    })
  }

  return {
    replications,
    candidates: candidates.map((candidate, slot) => ({
      candidate,
      connected: isConnected(candidate),
      meanR: mean(collected[slot].r),
      shareSignificant: shareOf(collected[slot].p, (value) => value < ALPHA),
      meanFreshRSquared: mean(collected[slot].rSquared),
    })),
  }
}

export interface InterventionStats {
  candidate: number
  connected: boolean
  /**
   * Difference in the outcome between cases high and low on this feature,
   * as the world produces them.
   */
  observedDifference: number
  observedShareSignificant: number
  /** The same difference when we set the feature ourselves. */
  interventionDifference: number
  interventionShareSignificant: number
}

export interface InterventionSummary {
  replications: number
  candidates: InterventionStats[]
}

/** Mean outcome above minus below the median of this feature. */
function splitDifference(study: Study, candidate: number) {
  const values = study.features[candidate]
  if (values === undefined) return { difference: Number.NaN, pValue: Number.NaN }
  const sorted = [...values].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const high: number[] = []
  const low: number[] = []
  values.forEach((value, row) => {
    ;(value >= median ? high : low).push(study.outcome[row])
  })
  const test = welchTTest(high, low)
  return { difference: test.difference, pValue: test.pValue }
}

/**
 * Question four: does changing it change anything?
 *
 * Each replication is measured twice on the same world - once as it comes,
 * and once with the feature set by us rather than caused by anything. The
 * outcome is generated from the hidden cause either way, so the second
 * column is the causal claim and the first one is not.
 */
export function replicateIntervention(options: {
  candidateCount: number
  rowCount: number
  baseSeed: number
  replications: number
  candidates: readonly number[]
}): InterventionSummary {
  const { candidateCount, rowCount, baseSeed, replications, candidates } = options
  const collected = candidates.map(() => ({
    observed: [] as number[],
    observedP: [] as number[],
    intervened: [] as number[],
    intervenedP: [] as number[],
  }))

  for (let index = 0; index < replications; index += 1) {
    const study = generateReplicationStudy({
      candidateCount,
      rowCount,
      baseSeed,
      role: SEED_ROLE.intervention,
      index,
    })
    candidates.forEach((candidate, slot) => {
      const asFound = splitDifference(study, candidate)
      const asSet = splitDifference(
        interveneOnFeature(
          study,
          candidate,
          replicationSeed(baseSeed, SEED_ROLE.intervention + 1, index),
        ),
        candidate,
      )
      collected[slot].observed.push(asFound.difference)
      collected[slot].observedP.push(asFound.pValue)
      collected[slot].intervened.push(asSet.difference)
      collected[slot].intervenedP.push(asSet.pValue)
    })
  }

  return {
    replications,
    candidates: candidates.map((candidate, slot) => ({
      candidate,
      connected: isConnected(candidate),
      observedDifference: mean(collected[slot].observed),
      observedShareSignificant: shareOf(collected[slot].observedP, (value) => value < ALPHA),
      interventionDifference: mean(collected[slot].intervened),
      interventionShareSignificant: shareOf(
        collected[slot].intervenedP,
        (value) => value < ALPHA,
      ),
    })),
  }
}
