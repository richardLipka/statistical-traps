import { describe, expect, it } from 'vitest'
import { mean } from '@/statistics/monteCarlo'
import { correlation } from '@/statistics/regression/goodnessOfFit'
import {
  CONNECTED_FEATURE,
  STUDY_DEFAULTS,
  isConnected,
  trueCorrelation,
} from '@/scenarios/07-ai-synthesis/model'
import {
  SEED_ROLE,
  generateReplicationStudy,
  generateStudy,
  interveneOnFeature,
  replicationSeed,
} from '@/scenarios/07-ai-synthesis/simulation'

const study = generateStudy({ candidateCount: 200, rowCount: 60, seed: STUDY_DEFAULTS.seed })

function correlationWith(values: readonly number[], other: readonly number[]) {
  return correlation(values.map((value, index) => ({ x: value, y: other[index] })))
}

describe('the world this scenario simulates', () => {
  it('is reproducible from its seed', () => {
    const again = generateStudy({ candidateCount: 200, rowCount: 60, seed: STUDY_DEFAULTS.seed })
    expect(again.features[0]).toEqual(study.features[0])
    expect(again.outcome).toEqual(study.outcome)
    const other = generateStudy({ candidateCount: 200, rowCount: 60, seed: STUDY_DEFAULTS.seed + 1 })
    expect(other.outcome).not.toEqual(study.outcome)
  })

  it('fills the table with the requested shape', () => {
    expect(study.features).toHaveLength(200)
    expect(study.outcome).toHaveLength(60)
    expect(study.hidden).toHaveLength(60)
    for (const values of study.features) expect(values).toHaveLength(60)
  })

  it('connects exactly one feature to the outcome, at the stated strength', () => {
    const big = generateStudy({ candidateCount: 30, rowCount: 20_000, seed: 12_345 })
    const connected = correlationWith(big.features[CONNECTED_FEATURE], big.outcome)
    expect(connected).toBeCloseTo(trueCorrelation(), 1)

    for (let candidate = 1; candidate < 30; candidate += 1) {
      // The standard error of r at n = 20 000 is about 0.007.
      expect(Math.abs(correlationWith(big.features[candidate], big.outcome))).toBeLessThan(0.04)
    }
  })

  it('routes the connection through a cause that is not in the table', () => {
    const big = generateStudy({ candidateCount: 3, rowCount: 20_000, seed: 999 })
    // Both the outcome and the connected feature track the hidden variable ...
    expect(correlationWith(big.hidden, big.outcome)).toBeCloseTo(0.7, 1)
    expect(correlationWith(big.hidden, big.features[CONNECTED_FEATURE])).toBeCloseTo(0.7, 1)
    // ... and nothing else does.
    expect(Math.abs(correlationWith(big.hidden, big.features[1]))).toBeLessThan(0.04)
  })

  it('severs the connection when the feature is set rather than caused', () => {
    const big = generateStudy({ candidateCount: 3, rowCount: 20_000, seed: 424_242 })
    const intervened = interveneOnFeature(big, CONNECTED_FEATURE, 7)
    // The outcome is untouched: it never depended on the feature.
    expect(intervened.outcome).toEqual(big.outcome)
    expect(intervened.hidden).toEqual(big.hidden)
    // And the correlation is gone, because the shared cause no longer reaches it.
    expect(
      Math.abs(correlationWith(intervened.features[CONNECTED_FEATURE], intervened.outcome)),
    ).toBeLessThan(0.04)
    // Other columns are left alone.
    expect(intervened.features[1]).toEqual(big.features[1])
  })

  it('marks the connected feature in one place only', () => {
    expect(isConnected(CONNECTED_FEATURE)).toBe(true)
    expect(isConnected(CONNECTED_FEATURE + 1)).toBe(false)
  })

  it('draws every candidate from the same distribution', () => {
    const big = generateStudy({ candidateCount: 3, rowCount: 20_000, seed: 31 })
    for (const values of big.features) {
      const average = mean(values)
      expect(Math.abs(average)).toBeLessThan(0.05)
      expect(mean(values.map((value) => (value - average) ** 2))).toBeCloseTo(1, 1)
    }
  })

  it('never reuses exploration data for validation', () => {
    const baseSeed = STUDY_DEFAULTS.seed
    const seeds = new Set<number>([baseSeed])
    for (const role of [
      SEED_ROLE.selectionNull,
      SEED_ROLE.validation,
      SEED_ROLE.freshStudy,
      SEED_ROLE.intervention,
    ]) {
      for (let index = 0; index < 50; index += 1) {
        const seed = replicationSeed(baseSeed, role, index)
        expect(seeds.has(seed), `role ${role}, replication ${index}`).toBe(false)
        seeds.add(seed)
      }
    }
    const fresh = generateReplicationStudy({
      candidateCount: 200,
      rowCount: 60,
      baseSeed,
      role: SEED_ROLE.validation,
      index: 0,
    })
    expect(fresh.outcome).not.toEqual(study.outcome)
  })
})
