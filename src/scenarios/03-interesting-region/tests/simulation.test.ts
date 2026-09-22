import { describe, expect, it } from 'vitest'
import { STEP_SD } from '@/scenarios/03-interesting-region/model'
import {
  SEED_ROLE,
  generateReplicationSeries,
  generateSeries,
  replicationSeed,
} from '@/scenarios/03-interesting-region/simulation'

describe('the record-generating process', () => {
  it('is reproducible from its seed', () => {
    expect(generateSeries(40, 99).steps).toEqual(generateSeries(40, 99).steps)
    expect(generateSeries(40, 99).steps).not.toEqual(generateSeries(40, 100).steps)
  })

  it('draws the level as the running total of the steps', () => {
    const series = generateSeries(50, 7)
    expect(series.levels).toHaveLength(51)
    expect(series.levels[0]).toBe(0)
    let total = 0
    for (let i = 0; i < series.steps.length; i += 1) {
      total += series.steps[i]
      expect(series.levels[i + 1]).toBeCloseTo(total, 12)
    }
  })

  it('draws steps with the standard deviation the analysis assumes', () => {
    const series = generateSeries(40_000, 2024)
    const mean = series.steps.reduce((a, b) => a + b, 0) / series.steps.length
    const variance =
      series.steps.reduce((sum, step) => sum + (step - mean) ** 2, 0) / series.steps.length
    expect(mean).toBeCloseTo(0, 1)
    expect(Math.sqrt(variance)).toBeCloseTo(STEP_SD, 1)
  })

  it('has no drift: the record is as likely to end below zero as above', () => {
    let above = 0
    const records = 400
    for (let index = 0; index < records; index += 1) {
      const series = generateSeries(120, 5000 + index * 37)
      if (series.levels[series.levels.length - 1] > 0) above += 1
    }
    // Binomial(400, 0.5) stays well inside this range.
    expect(above / records).toBeGreaterThan(0.4)
    expect(above / records).toBeLessThan(0.6)
  })

  it('keeps successive steps independent', () => {
    const series = generateSeries(20_000, 4242)
    let covariance = 0
    for (let i = 1; i < series.steps.length; i += 1) {
      covariance += series.steps[i] * series.steps[i - 1]
    }
    // A correlated walk would show a systematic product here.
    expect(Math.abs(covariance / (series.steps.length - 1))).toBeLessThan(0.05)
  })

  it('never reuses exploration data for validation', () => {
    const periodCount = 60
    const baseSeed = 300_009
    const observed = generateSeries(periodCount, baseSeed)
    const roles = [SEED_ROLE.selectionNull, SEED_ROLE.validation, SEED_ROLE.freshSeries]

    const seeds = new Set<number>([baseSeed])
    for (const role of roles) {
      for (let index = 0; index < 50; index += 1) {
        const seed = replicationSeed(baseSeed, role, index)
        expect(seeds.has(seed), `role ${role}, replication ${index}`).toBe(false)
        seeds.add(seed)
        expect(generateReplicationSeries(periodCount, baseSeed, role, index).steps).not.toEqual(
          observed.steps,
        )
      }
    }
  })
})
