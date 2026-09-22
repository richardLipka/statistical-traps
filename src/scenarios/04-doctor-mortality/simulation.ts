import { createRng, deriveSeed } from '@/statistics/random/rng'
import {
  BASE_LOGIT,
  PATIENT_SD,
  SEVERITY_SD,
  logistic,
} from '@/scenarios/04-doctor-mortality/model'

export interface Doctor {
  index: number
  /** Case mix, on the log-odds scale: how sick this doctor's patients tend to be. */
  severity: number
  /** Each patient's true probability of dying. */
  risks: number[]
  /** Which of those patients died. */
  deaths: boolean[]
  deathCount: number
}

export interface Hospital {
  doctors: Doctor[]
  patientCount: number
  deathCount: number
  /** Deaths per patient across the whole hospital. */
  overallRate: number
}

/**
 * True data-generating process of this scenario.
 *
 *   severity_j ~ Normal(0, SEVERITY_SD)            fixed for doctor j
 *   logit(risk_i) = BASE_LOGIT + severity_j + Normal(0, PATIENT_SD)
 *   died_i ~ Bernoulli(risk_i)                     independent of everything
 *
 * Doctors differ in one way only: which patients they are sent. No term in
 * the model depends on how a doctor works, so the true effect of every
 * doctor on their patients' survival is exactly zero.
 *
 * Two consequences the scenario separates. Doctors really do differ in raw
 * mortality, and that difference is real - it is caused by the case mix.
 * And among many doctors whose risk-adjusted performance is identical, one
 * will still come out worst.
 */
export function generateHospital(options: {
  severities: readonly number[]
  patientsPerDoctor: number
  seed: number
}): Hospital {
  const { severities, patientsPerDoctor, seed } = options
  const rng = createRng(seed)
  const doctors: Doctor[] = []
  let deathCount = 0

  for (let index = 0; index < severities.length; index += 1) {
    const risks: number[] = new Array(patientsPerDoctor)
    const deaths: boolean[] = new Array(patientsPerDoctor)
    let doctorDeaths = 0
    for (let i = 0; i < patientsPerDoctor; i += 1) {
      const risk = logistic(BASE_LOGIT + severities[index] + rng.normal(0, PATIENT_SD))
      const died = rng.next() < risk
      risks[i] = risk
      deaths[i] = died
      if (died) doctorDeaths += 1
    }
    deathCount += doctorDeaths
    doctors.push({ index, severity: severities[index], risks, deaths, deathCount: doctorDeaths })
  }

  const patientCount = severities.length * patientsPerDoctor
  return {
    doctors,
    patientCount,
    deathCount,
    overallRate: patientCount > 0 ? deathCount / patientCount : Number.NaN,
  }
}

/**
 * The case mix of each doctor, which is a property of the doctor's practice
 * rather than of a particular year. It is generated from its own seed so
 * that "the same hospital, a year later" keeps the same doctors while every
 * patient and every outcome is new.
 */
export function generateSeverities(doctorCount: number, baseSeed: number): number[] {
  const rng = createRng(deriveSeed(baseSeed, 0x5eed))
  return Array.from({ length: doctorCount }, () => rng.normal(0, SEVERITY_SD))
}

/** Seed roles, kept apart so exploration data is never reused for validation. */
export const SEED_ROLE = {
  observed: 0,
  selectionNull: 4_000_037,
  validation: 6_000_041,
  freshYear: 2_000_029,
} as const

export function replicationSeed(baseSeed: number, role: number, index: number): number {
  return deriveSeed(baseSeed + role, index + 1)
}

/** Another year for the same doctors: new patients, new outcomes, same case mix. */
export function generateReplicationHospital(options: {
  severities: readonly number[]
  patientsPerDoctor: number
  baseSeed: number
  role: number
  index: number
}): Hospital {
  const { severities, patientsPerDoctor, baseSeed, role, index } = options
  return generateHospital({
    severities,
    patientsPerDoctor,
    seed: replicationSeed(baseSeed, role, index),
  })
}
