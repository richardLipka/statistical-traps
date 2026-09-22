import { describe, expect, it } from 'vitest'
import {
  ALPHA,
  BASE_LOGIT,
  HOSPITAL_DEFAULTS,
  PATIENT_SD,
  SEVERITY_SD,
  doctorNumber,
  logistic,
  preRegisteredDoctor,
} from '@/scenarios/04-doctor-mortality/model'

describe('the hospital model', () => {
  it('maps log-odds to probabilities', () => {
    expect(logistic(0)).toBeCloseTo(0.5, 12)
    expect(logistic(BASE_LOGIT)).toBeCloseTo(0.0831726965, 9)
    // Strictly inside (0, 1) across the whole range the risk model produces,
    // which is BASE_LOGIT plus a few standard deviations either way.
    for (const x of [-12, -6, 0, 6, 12]) {
      expect(logistic(x)).toBeGreaterThan(0)
      expect(logistic(x)).toBeLessThan(1)
    }
    expect(logistic(1)).toBeGreaterThan(logistic(0.99))
    // Symmetric about zero.
    expect(logistic(1.3) + logistic(-1.3)).toBeCloseTo(1, 12)
  })

  it('names the audited doctor without knowing anything about the outcomes', () => {
    // It depends on the size of the hospital and on nothing else.
    for (const doctorCount of [10, 40, 41, 60]) {
      const index = preRegisteredDoctor(doctorCount)
      expect(preRegisteredDoctor(doctorCount)).toBe(index)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(doctorCount)
    }
  })

  it('numbers doctors from one, and gives them nothing else', () => {
    expect(doctorNumber(0)).toBe(1)
    expect(doctorNumber(18)).toBe(19)
  })

  it('keeps the risk parameters in a range where the scenario means something', () => {
    // Deaths must be common enough to count and rare enough to be noisy.
    expect(logistic(BASE_LOGIT)).toBeGreaterThan(0.02)
    expect(logistic(BASE_LOGIT)).toBeLessThan(0.25)
    expect(SEVERITY_SD).toBeGreaterThan(0)
    expect(PATIENT_SD).toBeGreaterThan(0)
    expect(ALPHA).toBe(0.05)
    expect(HOSPITAL_DEFAULTS.doctorCount).toBeGreaterThan(1)
  })
})
