import { createRng, deriveSeed } from '@/statistics/random/rng'
import { STEP_SD } from '@/scenarios/03-interesting-region/model'

export interface Series {
  /**
   * The independent moves: steps[i] is the change from period i to i + 1.
   * These are what the analysis tests.
   */
  steps: number[]
  /**
   * The running total, levels[i] = sum of the first i steps, starting at
   * zero. This is what the user sees, and the reason the picture is
   * persuasive: neighbouring levels share almost all of their history, so
   * the curve trends and turns even though nothing drives it.
   */
  levels: number[]
}

/**
 * True data-generating process of this scenario: a random walk with no
 * drift.
 *
 *   step_i ~ Normal(0, STEP_SD), independent of every other step
 *   level_i = step_1 + ... + step_i
 *
 * There is no trend, no regime, no turning point and no interesting period.
 * Every stretch of the record has exactly the same expected behaviour as
 * every other, so any stretch that looks special is noise.
 */
export function generateSeries(periodCount: number, seed: number): Series {
  const rng = createRng(seed)
  const steps: number[] = new Array(periodCount)
  const levels: number[] = new Array(periodCount + 1)
  levels[0] = 0
  for (let i = 0; i < periodCount; i += 1) {
    steps[i] = rng.normal(0, STEP_SD)
    levels[i + 1] = levels[i] + steps[i]
  }
  return { steps, levels }
}

/** Seed roles, kept apart so exploration data is never reused for validation. */
export const SEED_ROLE = {
  observed: 0,
  selectionNull: 3_000_017,
  validation: 9_000_017,
  freshSeries: 5_000_023,
  /** Closing evidence that the walk holds no trend anywhere. */
  nullEvidence: 4_300_031,
} as const

export function replicationSeed(baseSeed: number, role: number, index: number): number {
  return deriveSeed(baseSeed + role, index + 1)
}

export function generateReplicationSeries(
  periodCount: number,
  baseSeed: number,
  role: number,
  index: number,
): Series {
  return generateSeries(periodCount, replicationSeed(baseSeed, role, index))
}
