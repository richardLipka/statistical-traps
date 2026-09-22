import { describe, expect, it } from 'vitest'
import { BOARD } from '@/scenarios/01-dartboard/model'
import {
  SEED_ROLE,
  generateDarts,
  generateReplicationDarts,
  replicationSeed,
} from '@/scenarios/01-dartboard/simulation'

describe('generateDarts', () => {
  it('is reproducible for a given seed', () => {
    expect(generateDarts(30, 4242)).toEqual(generateDarts(30, 4242))
  })

  it('changes with the seed', () => {
    expect(generateDarts(30, 1)).not.toEqual(generateDarts(30, 2))
  })

  it('places every dart inside the board', () => {
    for (const dart of generateDarts(500, 17)) {
      expect(dart.x).toBeGreaterThanOrEqual(BOARD.min)
      expect(dart.x).toBeLessThan(BOARD.max)
      expect(dart.y).toBeGreaterThanOrEqual(BOARD.min)
      expect(dart.y).toBeLessThan(BOARD.max)
    }
  })

  it('is uniform: each quadrant holds roughly a quarter of the darts', () => {
    const darts = generateDarts(8000, 2024)
    const quadrants = [0, 0, 0, 0]
    for (const dart of darts) {
      quadrants[(dart.x < 0.5 ? 0 : 1) + (dart.y < 0.5 ? 0 : 2)] += 1
    }
    for (const count of quadrants) {
      expect(count / darts.length).toBeCloseTo(0.25, 1)
    }
  })

  it('returns the requested number of darts', () => {
    expect(generateDarts(0, 1)).toHaveLength(0)
    expect(generateDarts(123, 1)).toHaveLength(123)
  })
})

describe('replication seeds', () => {
  it('never reuses a sample across roles', () => {
    const exploration = replicationSeed(4242, SEED_ROLE.observed, 0)
    const selection = replicationSeed(4242, SEED_ROLE.selectionNull, 0)
    const validation = replicationSeed(4242, SEED_ROLE.validation, 0)
    expect(new Set([exploration, selection, validation]).size).toBe(3)
  })

  it('produces different data for every replication index', () => {
    const first = generateReplicationDarts(20, 4242, SEED_ROLE.validation, 0)
    const second = generateReplicationDarts(20, 4242, SEED_ROLE.validation, 1)
    expect(first).not.toEqual(second)
  })

  it('produces data independent of the darts shown on screen', () => {
    const observed = generateDarts(20, 4242)
    const validation = generateReplicationDarts(20, 4242, SEED_ROLE.validation, 0)
    expect(validation).not.toEqual(observed)
  })
})
