import { createRng, deriveSeed } from '@/statistics/random/rng'

export interface Dataset {
  variableCount: number
  observationCount: number
  /** columns[variable][observation] — one measurement per variable per row. */
  columns: number[][]
}

/**
 * True data-generating process of this scenario.
 *
 *   value_vi ~ Normal(0, 1), independently for every variable and every row
 *
 * Every variable is independent of every other one. There is no shared
 * factor, no causal chain, no lurking third variable: the true correlation
 * between every pair is exactly zero.
 *
 * That independence is deliberate and is what makes the centrepiece of the
 * scenario work. When nothing is related to anything, the p-values of all
 * the pairs are uniformly distributed between 0 and 1 - so the histogram of
 * them is flat, and the "discoveries" are just the left-hand end of a flat
 * distribution.
 */
export function generateDataset(options: {
  variableCount: number
  observationCount: number
  seed: number
}): Dataset {
  const { variableCount, observationCount, seed } = options
  const rng = createRng(seed)
  const columns: number[][] = Array.from({ length: variableCount }, () =>
    new Array<number>(observationCount),
  )
  for (let observation = 0; observation < observationCount; observation += 1) {
    for (let variable = 0; variable < variableCount; variable += 1) {
      columns[variable][observation] = rng.normal(0, 1)
    }
  }
  return { variableCount, observationCount, columns }
}

/** Seed roles, kept apart so exploration data is never reused for validation. */
export const SEED_ROLE = {
  observed: 0,
  selectionNull: 8_000_011,
  validation: 2_000_093,
  freshBatch: 4_000_087,
} as const

export function replicationSeed(baseSeed: number, role: number, index: number): number {
  return deriveSeed(baseSeed + role, index + 1)
}

/** Another batch of rows for the same variables: new observations, same table. */
export function generateReplicationDataset(options: {
  variableCount: number
  observationCount: number
  baseSeed: number
  role: number
  index: number
}): Dataset {
  const { variableCount, observationCount, baseSeed, role, index } = options
  return generateDataset({
    variableCount,
    observationCount,
    seed: replicationSeed(baseSeed, role, index),
  })
}
