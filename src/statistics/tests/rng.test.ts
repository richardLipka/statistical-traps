import { describe, expect, it } from 'vitest'
import { createRng, deriveSeed, randomSeed } from '@/statistics/random/rng'

describe('createRng', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createRng(123)
    const b = createRng(123)
    const first = Array.from({ length: 20 }, () => a.next())
    const second = Array.from({ length: 20 }, () => b.next())
    expect(first).toEqual(second)
  })

  it('produces different sequences for different seeds', () => {
    const a = Array.from({ length: 20 }, createRng(1).next)
    const b = Array.from({ length: 20 }, createRng(2).next)
    expect(a).not.toEqual(b)
  })

  it('stays inside [0, 1)', () => {
    const rng = createRng(7)
    for (let i = 0; i < 1000; i += 1) {
      const value = rng.next()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('maps uniform() into the requested range', () => {
    const rng = createRng(11)
    for (let i = 0; i < 500; i += 1) {
      const value = rng.uniform(-2, 5)
      expect(value).toBeGreaterThanOrEqual(-2)
      expect(value).toBeLessThan(5)
    }
  })

  it('never returns a degenerate stream for seed 0', () => {
    const rng = createRng(0)
    const values = new Set(Array.from({ length: 10 }, () => rng.next()))
    expect(values.size).toBe(10)
  })

  it('has roughly the right mean and variance', () => {
    const rng = createRng(99)
    const samples = Array.from({ length: 20_000 }, () => rng.next())
    const mean = samples.reduce((total, value) => total + value, 0) / samples.length
    const variance =
      samples.reduce((total, value) => total + (value - mean) ** 2, 0) / samples.length
    expect(mean).toBeCloseTo(0.5, 2)
    expect(variance).toBeCloseTo(1 / 12, 2)
  })
})

describe('deriveSeed', () => {
  it('is deterministic', () => {
    expect(deriveSeed(42, 3)).toBe(deriveSeed(42, 3))
  })

  it('gives distinct seeds for neighbouring indexes', () => {
    const seeds = new Set(Array.from({ length: 500 }, (_, index) => deriveSeed(4242, index)))
    expect(seeds.size).toBe(500)
  })

  it('gives distinct streams for neighbouring base seeds', () => {
    expect(deriveSeed(1, 0)).not.toBe(deriveSeed(2, 0))
  })
})

describe('randomSeed', () => {
  it('returns a non-negative integer', () => {
    const seed = randomSeed()
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThanOrEqual(0)
  })
})
