import { describe, expect, it } from 'vitest'
import { correlation } from '@/statistics/regression/goodnessOfFit'
import { X_RANGE } from '@/scenarios/02-best-line/model'
import {
  SEED_ROLE,
  generateReplicationSample,
  generateSample,
  replicationSeed,
} from '@/scenarios/02-best-line/simulation'

describe('generateSample', () => {
  it('is reproducible for a given seed', () => {
    expect(generateSample(16, 4242)).toEqual(generateSample(16, 4242))
  })

  it('changes with the seed', () => {
    expect(generateSample(16, 1)).not.toEqual(generateSample(16, 2))
  })

  it('returns the requested number of points, ordered by x', () => {
    const points = generateSample(24, 7)
    expect(points).toHaveLength(24)
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].x).toBeGreaterThanOrEqual(points[i - 1].x)
    }
  })

  it('draws x across the whole range', () => {
    for (const point of generateSample(500, 3)) {
      expect(point.x).toBeGreaterThanOrEqual(X_RANGE.min)
      expect(point.x).toBeLessThan(X_RANGE.max)
    }
  })

  it('draws y as noise centred on zero with the declared spread', () => {
    const points = generateSample(5000, 99)
    const meanY = points.reduce((total, point) => total + point.y, 0) / points.length
    const variance =
      points.reduce((total, point) => total + (point.y - meanY) ** 2, 0) / points.length
    expect(meanY).toBeCloseTo(0, 1)
    expect(Math.sqrt(variance)).toBeCloseTo(1, 1)
  })

  it('leaves x and y unrelated, as the scenario claims', () => {
    // The true correlation is zero; a large sample must show nothing much.
    expect(Math.abs(correlation(generateSample(5000, 2024)))).toBeLessThan(0.05)
  })
})

describe('replication samples', () => {
  it('never reuses a sample across roles', () => {
    const seeds = new Set([
      replicationSeed(4242, SEED_ROLE.observed, 0),
      replicationSeed(4242, SEED_ROLE.selectionNull, 0),
      replicationSeed(4242, SEED_ROLE.validation, 0),
      replicationSeed(4242, SEED_ROLE.freshSample, 0),
    ])
    expect(seeds.size).toBe(4)
  })

  it('produces different data for every replication index', () => {
    const first = generateReplicationSample(16, 4242, SEED_ROLE.validation, 0)
    const second = generateReplicationSample(16, 4242, SEED_ROLE.validation, 1)
    expect(first).not.toEqual(second)
  })

  it('produces data independent of the sample on screen', () => {
    expect(generateReplicationSample(16, 4242, SEED_ROLE.validation, 0)).not.toEqual(
      generateSample(16, 4242),
    )
  })
})
