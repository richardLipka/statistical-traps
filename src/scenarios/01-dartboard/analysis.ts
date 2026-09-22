import { binomialTestGreater, type BinomialTestResult } from '@/statistics/hypothesis/binomialTest'
import {
  empiricalPValueGreaterOrEqual,
  mean,
  shareOf,
  type EmpiricalPValue,
} from '@/statistics/monteCarlo'
import { clamp, squaredDistance, type Point } from '@/utils/geometry'
import {
  ALPHA,
  BOARD,
  countHits,
  hitProbability,
  makeTarget,
  type Dart,
  type Target,
} from '@/scenarios/01-dartboard/model'
import {
  SEED_ROLE,
  generateReplicationDarts,
} from '@/scenarios/01-dartboard/simulation'

const EPSILON = 1e-9

export interface TargetEvaluation {
  target: Target
  hits: number
  test: BinomialTestResult
}

/**
 * Applies the same one-sided binomial test to any target.
 *
 * The test is only a valid error rate for a target fixed before the data were
 * seen. Running the identical computation on a target chosen from the data is
 * exactly the mistake this scenario exposes, so the function deliberately
 * treats both the same way.
 */
export function evaluateTarget(darts: readonly Dart[], target: Target): TargetEvaluation {
  const hits = countHits(darts, target)
  return {
    target,
    hits,
    test: binomialTestGreater(hits, darts.length, hitProbability(target.radius)),
  }
}

/** Spatial hash so that counting darts inside a candidate circle stays cheap. */
interface PointGrid {
  countWithin: (centre: Point, radius: number) => number
}

function createPointGrid(points: readonly Point[], cellSize: number): PointGrid {
  const cell = Math.max(cellSize, 1e-3)
  const columns = Math.max(1, Math.ceil((BOARD.max - BOARD.min) / cell))
  const buckets: Point[][] = Array.from({ length: columns * columns }, () => [])
  const indexOf = (value: number) => clamp(Math.floor((value - BOARD.min) / cell), 0, columns - 1)

  for (const point of points) {
    buckets[indexOf(point.y) * columns + indexOf(point.x)].push(point)
  }

  return {
    countWithin(centre, radius) {
      const limit = radius * radius + 1e-12
      const firstColumn = indexOf(centre.x - radius)
      const lastColumn = indexOf(centre.x + radius)
      const firstRow = indexOf(centre.y - radius)
      const lastRow = indexOf(centre.y + radius)
      let count = 0
      for (let row = firstRow; row <= lastRow; row += 1) {
        for (let column = firstColumn; column <= lastColumn; column += 1) {
          for (const point of buckets[row * columns + column]) {
            if (squaredDistance(point, centre) <= limit) count += 1
          }
        }
      }
      return count
    },
  }
}

/**
 * Every centre position that could possibly be optimal.
 *
 * Moving an optimal circle until it is blocked shows that some optimum always
 * sits either on two darts' distance-r circles, on one dart's circle pressed
 * against the edge of the allowed area, at a corner of that area, or on a
 * single dart. Enumerating those cases makes the search exhaustive rather
 * than a grid approximation.
 */
export function candidateCentres(darts: readonly Dart[], radius: number): Point[] {
  const min = BOARD.min + radius
  const max = BOARD.max - radius
  const candidates: Point[] = []

  const push = (x: number, y: number) => {
    if (x < min - EPSILON || x > max + EPSILON || y < min - EPSILON || y > max + EPSILON) return
    candidates.push({ x: clamp(x, min, max), y: clamp(y, min, max) })
  }

  candidates.push({ x: min, y: min }, { x: min, y: max }, { x: max, y: min }, { x: max, y: max })

  for (const dart of darts) {
    candidates.push({ x: clamp(dart.x, min, max), y: clamp(dart.y, min, max) })

    // Circle around one dart, pushed against an edge of the allowed area.
    for (const edge of [min, max]) {
      const dy = radius * radius - (dart.x - edge) * (dart.x - edge)
      if (dy >= 0) {
        const offset = Math.sqrt(dy)
        candidates.push({ x: edge, y: clamp(dart.y + offset, min, max) })
        candidates.push({ x: edge, y: clamp(dart.y - offset, min, max) })
      }
      const dx = radius * radius - (dart.y - edge) * (dart.y - edge)
      if (dx >= 0) {
        const offset = Math.sqrt(dx)
        candidates.push({ x: clamp(dart.x + offset, min, max), y: edge })
        candidates.push({ x: clamp(dart.x - offset, min, max), y: edge })
      }
    }
  }

  // Circles touching two darts at once.
  for (let i = 0; i < darts.length; i += 1) {
    for (let j = i + 1; j < darts.length; j += 1) {
      const a = darts[i]
      const b = darts[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const squared = dx * dx + dy * dy
      if (squared <= EPSILON || squared > 4 * radius * radius) continue
      const distance = Math.sqrt(squared)
      const height = Math.sqrt(Math.max(0, radius * radius - squared / 4))
      const midX = (a.x + b.x) / 2
      const midY = (a.y + b.y) / 2
      const unitX = -dy / distance
      const unitY = dx / distance
      push(midX + height * unitX, midY + height * unitY)
      push(midX - height * unitX, midY - height * unitY)
    }
  }

  return candidates
}

export interface BestTargetResult {
  target: Target
  hits: number
  candidatesExamined: number
}

/** The best target that could be drawn around these darts. */
export function findBestTarget(darts: readonly Dart[], radius: number): BestTargetResult {
  const candidates = candidateCentres(darts, radius)
  const grid = createPointGrid(darts, radius)

  let bestCentre: Point = { x: 0.5, y: 0.5 }
  let bestHits = -1
  for (const candidate of candidates) {
    const hits = grid.countWithin(candidate, radius)
    if (hits > bestHits) {
      bestHits = hits
      bestCentre = candidate
    }
  }

  return {
    target: makeTarget(bestCentre, radius),
    hits: Math.max(0, bestHits),
    candidatesExamined: candidates.length,
  }
}

/** One simulated search: which data set it ran on, what it found, and how good it was. */
export interface SelectionSearchResult {
  /** Replication index; the data set can be regenerated from it. */
  index: number
  hits: number
  target: Target
}

/** How many of the best simulated searches are drawn back to the user. */
export const SELECTION_GALLERY_SIZE = 5

export interface SelectionNullResult {
  searches: SelectionSearchResult[]
  /** Hits of the best possible target in each simulated purely random data set. */
  maxHits: number[]
  meanMaxHits: number
  adjusted: EmpiricalPValue
  observedHits: number
  /** The most extreme simulated searches, best first. */
  topSearches: SelectionSearchResult[]
}

/**
 * Null distribution of the *search*, not of a single target.
 *
 * Each replication generates new random darts, searches them exhaustively and
 * records how many darts the best circle captures. Comparing the user's
 * result with this distribution gives a p-value that accounts for the freedom
 * used to choose the target. It is conservative for a user whose own search
 * was less thorough than the simulated one.
 */
export function simulateSelectionNull(options: {
  dartCount: number
  radius: number
  baseSeed: number
  replications: number
  observedHits: number
}): SelectionNullResult {
  const { dartCount, radius, baseSeed, replications, observedHits } = options
  const searches: SelectionSearchResult[] = []
  for (let index = 0; index < replications; index += 1) {
    searches.push(selectionNullReplication({ dartCount, radius, baseSeed, index }))
  }
  return summarizeSelectionNull(searches, observedHits)
}

/** One replication of the search procedure under the null hypothesis. */
export function selectionNullReplication(options: {
  dartCount: number
  radius: number
  baseSeed: number
  index: number
}): SelectionSearchResult {
  const { dartCount, radius, baseSeed, index } = options
  const best = findBestTarget(selectionNullDarts({ dartCount, baseSeed, index }), radius)
  return { index, hits: best.hits, target: best.target }
}

/**
 * Regenerates the darts a simulated search ran on. Seeding makes this exact,
 * so a search can be drawn back to the user without storing its data set.
 */
export function selectionNullDarts(options: {
  dartCount: number
  baseSeed: number
  index: number
}): Dart[] {
  const { dartCount, baseSeed, index } = options
  return generateReplicationDarts(dartCount, baseSeed, SEED_ROLE.selectionNull, index)
}

export function summarizeSelectionNull(
  searches: SelectionSearchResult[],
  observedHits: number,
): SelectionNullResult {
  const maxHits = searches.map((search) => search.hits)
  const topSearches = [...searches]
    .sort((a, b) => b.hits - a.hits || a.index - b.index)
    .slice(0, SELECTION_GALLERY_SIZE)
  return {
    searches,
    maxHits,
    meanMaxHits: mean(maxHits),
    adjusted: empiricalPValueGreaterOrEqual(observedHits, maxHits),
    observedHits,
    topSearches,
  }
}

export interface ReplicationStats {
  hits: number[]
  pValues: number[]
  meanHits: number
  significantShare: number
}

export interface ReplicationSummary {
  replications: number
  alpha: number
  preRegistered: ReplicationStats
  postHoc: ReplicationStats
}

function summarize(hits: number[], pValues: number[], alpha: number): ReplicationStats {
  return {
    hits,
    pValues,
    meanHits: mean(hits),
    significantShare: shareOf(pValues, (value) => value < alpha),
  }
}

/**
 * Validation: both targets are frozen and evaluated on independent data sets
 * that were never used to choose anything.
 */
export function replicateOnFreshData(options: {
  dartCount: number
  baseSeed: number
  replications: number
  preRegistered: Target
  postHoc: Target
  alpha?: number
}): ReplicationSummary {
  const { dartCount, baseSeed, replications, preRegistered, postHoc, alpha = ALPHA } = options
  const preHits: number[] = []
  const prePValues: number[] = []
  const postHits: number[] = []
  const postPValues: number[] = []

  for (let index = 0; index < replications; index += 1) {
    const darts = generateReplicationDarts(dartCount, baseSeed, SEED_ROLE.validation, index)
    const pre = evaluateTarget(darts, preRegistered)
    const post = evaluateTarget(darts, postHoc)
    preHits.push(pre.hits)
    prePValues.push(pre.test.pValue)
    postHits.push(post.hits)
    postPValues.push(post.test.pValue)
  }

  return {
    replications,
    alpha,
    preRegistered: summarize(preHits, prePValues, alpha),
    postHoc: summarize(postHits, postPValues, alpha),
  }
}
