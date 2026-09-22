/**
 * Deterministic pseudo-random number generation.
 *
 * Every simulation in this application is seeded: the same seed always
 * produces the same data set. This matters twice over here - for debugging,
 * and because the difference between "the same data" and "new, independent
 * data" is the subject being taught.
 */

export interface Rng {
  /** Uniform in [0, 1). */
  next(): number
  /** Uniform in [min, max). */
  uniform(min: number, max: number): number
  /** Integer in [0, maxExclusive). */
  int(maxExclusive: number): number
  /** Normal deviate (Box-Muller). */
  normal(mean?: number, standardDeviation?: number): number
}

/** mulberry32 - small, fast, and good enough for teaching simulations. */
export function createRng(seed: number): Rng {
  let state = Math.trunc(seed) >>> 0
  if (state === 0) state = 0x9e3779b9

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    uniform: (min, max) => min + (max - min) * next(),
    int: (maxExclusive) => Math.floor(next() * maxExclusive),
    normal: (mean = 0, standardDeviation = 1) => {
      // Box-Muller; u must be strictly positive.
      const u = 1 - next()
      const v = next()
      const magnitude = Math.sqrt(-2 * Math.log(u))
      return mean + standardDeviation * magnitude * Math.cos(2 * Math.PI * v)
    },
  }
}

/**
 * Derives an independent seed from a base seed and an index, so that a
 * scenario can produce a reproducible *sequence* of independent data sets
 * (replication 0, replication 1, ...) without reusing any sample.
 */
export function deriveSeed(baseSeed: number, index: number): number {
  let h = (Math.trunc(baseSeed) ^ 0x9e3779b9) >>> 0
  h = Math.imul(h ^ (Math.trunc(index) + 0x85ebca6b), 0xc2b2ae35) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 0x27d4eb2d) >>> 0
  h ^= h >>> 16
  return h >>> 0
}

/** A fresh, unpredictable seed for "run it again" buttons. */
export function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000) >>> 0
}
