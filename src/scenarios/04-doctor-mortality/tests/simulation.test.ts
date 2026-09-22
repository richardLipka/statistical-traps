import { describe, expect, it } from 'vitest'
import { mean } from '@/statistics/monteCarlo'
import { BASE_LOGIT, logistic } from '@/scenarios/04-doctor-mortality/model'
import {
  SEED_ROLE,
  generateHospital,
  generateReplicationHospital,
  generateSeverities,
  replicationSeed,
} from '@/scenarios/04-doctor-mortality/simulation'

const severities = generateSeverities(40, 118_785)

function hospital(seed: number) {
  return generateHospital({ severities, patientsPerDoctor: 60, seed })
}

describe('the hospital-generating process', () => {
  it('is reproducible from its seed', () => {
    expect(hospital(5).deathCount).toBe(hospital(5).deathCount)
    expect(hospital(5).doctors[3].risks).toEqual(hospital(5).doctors[3].risks)
    expect(hospital(5).deathCount).not.toBe(hospital(6).deathCount)
  })

  it('counts deaths consistently at every level', () => {
    const year = hospital(118_785)
    expect(year.patientCount).toBe(40 * 60)
    let total = 0
    for (const doctor of year.doctors) {
      expect(doctor.deaths.filter(Boolean)).toHaveLength(doctor.deathCount)
      expect(doctor.risks).toHaveLength(60)
      total += doctor.deathCount
    }
    expect(year.deathCount).toBe(total)
    expect(year.overallRate).toBeCloseTo(total / year.patientCount, 12)
  })

  it('gives every patient a genuine probability', () => {
    for (const doctor of hospital(9).doctors) {
      for (const risk of doctor.risks) {
        expect(risk).toBeGreaterThan(0)
        expect(risk).toBeLessThan(1)
      }
    }
  })

  it('gives doctors different case mixes but the same skill', () => {
    const year = hospital(118_785)
    const meanRisks = year.doctors.map((doctor) => mean(doctor.risks))
    // Case mix genuinely differs between doctors.
    expect(Math.max(...meanRisks) - Math.min(...meanRisks)).toBeGreaterThan(0.02)
    // And a doctor's patients die at their own risk, not at a rate of the doctor's own.
    const expectedDeaths = year.doctors.reduce(
      (sum, doctor) => sum + doctor.risks.reduce((a, b) => a + b, 0),
      0,
    )
    expect(year.deathCount / expectedDeaths).toBeGreaterThan(0.85)
    expect(year.deathCount / expectedDeaths).toBeLessThan(1.15)
  })

  it('produces deaths at the rate the risk model specifies', () => {
    const many = generateHospital({
      severities: generateSeverities(200, 31),
      patientsPerDoctor: 200,
      seed: 31,
    })
    const risks = many.doctors.flatMap((doctor) => doctor.risks)
    expect(mean(risks)).toBeCloseTo(many.overallRate, 2)
    // The average risk sits near the base rate, since case mix is centred on zero.
    expect(mean(risks)).toBeGreaterThan(logistic(BASE_LOGIT) * 0.8)
    expect(mean(risks)).toBeLessThan(logistic(BASE_LOGIT) * 1.5)
  })

  it('keeps the same doctors when a new year is generated', () => {
    const nextYear = generateReplicationHospital({
      severities,
      patientsPerDoctor: 60,
      baseSeed: 118_785,
      role: SEED_ROLE.validation,
      index: 0,
    })
    const thisYear = hospital(118_785)
    for (let index = 0; index < severities.length; index += 1) {
      expect(nextYear.doctors[index].severity).toBe(thisYear.doctors[index].severity)
    }
    // Same doctors, entirely new patients.
    expect(nextYear.doctors[0].risks).not.toEqual(thisYear.doctors[0].risks)
  })

  it('never reuses exploration data for validation', () => {
    const baseSeed = 118_785
    const seeds = new Set<number>([baseSeed])
    for (const role of [SEED_ROLE.selectionNull, SEED_ROLE.validation, SEED_ROLE.freshYear]) {
      for (let index = 0; index < 50; index += 1) {
        const seed = replicationSeed(baseSeed, role, index)
        expect(seeds.has(seed), `role ${role}, replication ${index}`).toBe(false)
        seeds.add(seed)
      }
    }
  })
})
