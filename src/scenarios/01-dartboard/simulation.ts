import { createRng, deriveSeed } from '@/statistics/random/rng'
import { BOARD, type Dart } from '@/scenarios/01-dartboard/model'

/**
 * True data-generating process of this scenario.
 *
 * Every dart is an independent uniform draw over the whole board. There is no
 * aim, no cluster and no preferred region: the true effect is exactly zero.
 */
export function generateDarts(count: number, seed: number): Dart[] {
  const rng = createRng(seed)
  const darts: Dart[] = new Array(count)
  for (let i = 0; i < count; i += 1) {
    darts[i] = {
      x: rng.uniform(BOARD.min, BOARD.max),
      y: rng.uniform(BOARD.min, BOARD.max),
    }
  }
  return darts
}

/**
 * Seed offsets for the three roles data can play here. They are kept apart on
 * purpose: the sample used to *find* a target must never be reused as the
 * sample that *validates* it.
 */
export const SEED_ROLE = {
  /** The darts shown on screen. */
  observed: 0,
  /** Simulating the search procedure itself under the null hypothesis. */
  selectionNull: 1_000_003,
  /** Independent replications used for validation. */
  validation: 7_000_003,
  /** Single fresh throws requested by the user. */
  freshThrow: 3_000_017,
} as const

export function replicationSeed(baseSeed: number, role: number, index: number): number {
  return deriveSeed(baseSeed + role, index + 1)
}

export function generateReplicationDarts(
  count: number,
  baseSeed: number,
  role: number,
  index: number,
): Dart[] {
  return generateDarts(count, replicationSeed(baseSeed, role, index))
}
