import { describe, expect, it } from 'vitest'
import { mean } from '@/statistics/monteCarlo'
import { correlation } from '@/statistics/regression/goodnessOfFit'
import {
  SEED_ROLE,
  generateDataset,
  generateReplicationDataset,
  replicationSeed,
} from '@/scenarios/06-mysterious-correlation/simulation'

const dataset = generateDataset({ variableCount: 60, observationCount: 40, seed: 1_885_122 })

describe('the table-generating process', () => {
  it('is reproducible from its seed', () => {
    const again = generateDataset({ variableCount: 60, observationCount: 40, seed: 1_885_122 })
    expect(again.columns[0]).toEqual(dataset.columns[0])
    expect(again.columns[41]).toEqual(dataset.columns[41])
    const other = generateDataset({ variableCount: 60, observationCount: 40, seed: 1_885_123 })
    expect(other.columns[0]).toEqual(other.columns[0])
    expect(other.columns[0]).not.toEqual(dataset.columns[0])
  })

  it('fills the table with the requested shape', () => {
    expect(dataset.columns).toHaveLength(60)
    for (const column of dataset.columns) {
      expect(column).toHaveLength(40)
      for (const value of column) expect(Number.isFinite(value)).toBe(true)
    }
  })

  it('draws every value from the same distribution', () => {
    const big = generateDataset({ variableCount: 4, observationCount: 20_000, seed: 99 })
    for (const column of big.columns) {
      const average = mean(column)
      const variance = mean(column.map((value) => (value - average) ** 2))
      expect(Math.abs(average)).toBeLessThan(0.05)
      expect(variance).toBeCloseTo(1, 1)
    }
  })

  it('leaves every pair of variables genuinely independent', () => {
    const big = generateDataset({ variableCount: 6, observationCount: 20_000, seed: 4242 })
    for (let a = 0; a < 6; a += 1) {
      for (let b = a + 1; b < 6; b += 1) {
        const r = correlation(
          big.columns[a].map((value, index) => ({ x: value, y: big.columns[b][index] })),
        )
        // The standard error of r at n = 20 000 is about 0.007.
        expect(Math.abs(r)).toBeLessThan(0.04)
      }
    }
  })

  it('never reuses exploration data for validation', () => {
    const baseSeed = 1_885_122
    const seeds = new Set<number>([baseSeed])
    for (const role of [SEED_ROLE.selectionNull, SEED_ROLE.validation, SEED_ROLE.freshBatch]) {
      for (let index = 0; index < 50; index += 1) {
        const seed = replicationSeed(baseSeed, role, index)
        expect(seeds.has(seed), `role ${role}, replication ${index}`).toBe(false)
        seeds.add(seed)
      }
    }
    const batch = generateReplicationDataset({
      variableCount: 60,
      observationCount: 40,
      baseSeed,
      role: SEED_ROLE.validation,
      index: 0,
    })
    expect(batch.columns[0]).not.toEqual(dataset.columns[0])
  })
})
