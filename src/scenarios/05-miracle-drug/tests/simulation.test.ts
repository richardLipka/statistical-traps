import { describe, expect, it } from 'vitest'
import { correlation } from '@/statistics/regression/goodnessOfFit'
import { mean } from '@/statistics/monteCarlo'
import { LOADING, outcomeCorrelation } from '@/scenarios/05-miracle-drug/model'
import {
  SEED_ROLE,
  generateReplicationTrial,
  generateTrial,
  replicationSeed,
} from '@/scenarios/05-miracle-drug/simulation'

const trial = generateTrial({ patientsPerArm: 60, outcomeCount: 20, seed: 3_117_499 })

describe('the trial-generating process', () => {
  it('is reproducible from its seed', () => {
    const again = generateTrial({ patientsPerArm: 60, outcomeCount: 20, seed: 3_117_499 })
    expect(again.treatment[0]).toEqual(trial.treatment[0])
    expect(again.control[7]).toEqual(trial.control[7])
    const other = generateTrial({ patientsPerArm: 60, outcomeCount: 20, seed: 3_117_500 })
    expect(other.treatment[0]).not.toEqual(trial.treatment[0])
  })

  it('fills both arms with the requested shape', () => {
    expect(trial.treatment).toHaveLength(20)
    expect(trial.control).toHaveLength(20)
    for (const values of [...trial.treatment, ...trial.control]) {
      expect(values).toHaveLength(60)
      for (const value of values) expect(Number.isFinite(value)).toBe(true)
    }
  })

  it('gives the treatment no effect on any outcome', () => {
    const big = generateTrial({ patientsPerArm: 4000, outcomeCount: 6, seed: 12_345 })
    for (let outcome = 0; outcome < 6; outcome += 1) {
      const difference = mean(big.treatment[outcome]) - mean(big.control[outcome])
      // With 4000 per arm the standard error is about 0.022.
      expect(Math.abs(difference)).toBeLessThan(0.1)
    }
  })

  it('leaves every outcome standard normal, so each test stays exactly valid', () => {
    const big = generateTrial({ patientsPerArm: 6000, outcomeCount: 4, seed: 777 })
    for (const values of big.treatment) {
      const average = mean(values)
      const variance = mean(values.map((value) => (value - average) ** 2))
      expect(Math.abs(average)).toBeLessThan(0.06)
      expect(variance).toBeCloseTo(1, 1)
    }
  })

  it('correlates the outcomes with each other, as measurements on one person do', () => {
    const big = generateTrial({ patientsPerArm: 4000, outcomeCount: 5, seed: 424_242 })
    const observed: number[] = []
    for (let a = 0; a < 5; a += 1) {
      for (let b = a + 1; b < 5; b += 1) {
        observed.push(
          correlation(
            big.treatment[a].map((value, index) => ({ x: value, y: big.treatment[b][index] })),
          ),
        )
      }
    }
    expect(mean(observed)).toBeCloseTo(outcomeCorrelation(), 1)
    expect(mean(observed)).toBeCloseTo(LOADING * LOADING, 1)
  })

  it('never reuses exploration data for validation', () => {
    const baseSeed = 3_117_499
    const seeds = new Set<number>([baseSeed])
    for (const role of [SEED_ROLE.selectionNull, SEED_ROLE.validation, SEED_ROLE.freshTrial]) {
      for (let index = 0; index < 50; index += 1) {
        const seed = replicationSeed(baseSeed, role, index)
        expect(seeds.has(seed), `role ${role}, replication ${index}`).toBe(false)
        seeds.add(seed)
      }
    }
    const replication = generateReplicationTrial({
      patientsPerArm: 60,
      outcomeCount: 20,
      baseSeed,
      role: SEED_ROLE.validation,
      index: 0,
    })
    expect(replication.treatment[0]).not.toEqual(trial.treatment[0])
  })
})
