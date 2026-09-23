import { describe, expect, it } from 'vitest'
import {
  ALPHA,
  LOADING,
  PRIMARY_OUTCOME,
  TRIAL_DEFAULTS,
  TRIAL_LIMITS,
  outcomeCorrelation,
  outcomeNumber,
} from '@/scenarios/05-miracle-drug/model'

describe('the trial model', () => {
  it('registers a primary outcome that is part of the panel', () => {
    expect(PRIMARY_OUTCOME).toBeGreaterThanOrEqual(0)
    expect(PRIMARY_OUTCOME).toBeLessThan(TRIAL_LIMITS.minOutcomes)
  })

  it('numbers outcomes from one, and gives them nothing else', () => {
    expect(outcomeNumber(0)).toBe(1)
    expect(outcomeNumber(19)).toBe(20)
  })

  it('correlates the outcomes without making them interchangeable', () => {
    expect(outcomeCorrelation()).toBeCloseTo(LOADING * LOADING, 12)
    // Strong enough that Bonferroni overcorrects, weak enough that the
    // outcomes are still distinct measurements.
    expect(outcomeCorrelation()).toBeGreaterThan(0.1)
    expect(outcomeCorrelation()).toBeLessThan(0.7)
  })

  it('offers a panel large enough for the search to matter', () => {
    expect(TRIAL_DEFAULTS.outcomeCount).toBeGreaterThanOrEqual(10)
    expect(TRIAL_DEFAULTS.patientsPerArm).toBeGreaterThanOrEqual(TRIAL_LIMITS.minPerArm)
    expect(TRIAL_DEFAULTS.patientsPerArm).toBeLessThanOrEqual(TRIAL_LIMITS.maxPerArm)
    expect(ALPHA).toBe(0.05)
  })
})
