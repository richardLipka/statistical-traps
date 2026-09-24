import { createRng, deriveSeed } from '@/statistics/random/rng'
import type { DataPoint } from '@/statistics/regression/leastSquares'
import { NOISE_SD, X_RANGE } from '@/scenarios/02-best-line/model'

/**
 * True data-generating process of this scenario.
 *
 * x and y are drawn independently: x uniformly across the range, y as pure
 * noise around zero. No relationship of any kind exists between them, linear
 * or otherwise, so every curve the user finds describes noise.
 */
export function generateSample(count: number, seed: number): DataPoint[] {
  const rng = createRng(seed)
  const points: DataPoint[] = new Array(count)
  for (let i = 0; i < count; i += 1) {
    points[i] = {
      x: rng.uniform(X_RANGE.min, X_RANGE.max),
      y: rng.normal(0, NOISE_SD),
    }
  }
  return points.sort((a, b) => a.x - b.x)
}

/** Seed roles, kept apart so exploration data is never reused for validation. */
export const SEED_ROLE = {
  observed: 0,
  selectionNull: 2_000_011,
  validation: 8_000_011,
  freshSample: 4_000_019,
  /** Closing evidence that the generator holds no relationship at all. */
  nullEvidence: 4_200_023,
} as const

export function replicationSeed(baseSeed: number, role: number, index: number): number {
  return deriveSeed(baseSeed + role, index + 1)
}

export function generateReplicationSample(
  count: number,
  baseSeed: number,
  role: number,
  index: number,
): DataPoint[] {
  return generateSample(count, replicationSeed(baseSeed, role, index))
}
