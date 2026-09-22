/**
 * A simulated hospital.
 *
 * Nothing here corresponds to any real hospital, doctor or patient, and no
 * empirical mortality statistic is used or implied. The numbers are chosen
 * to make the mechanism visible, not to describe medicine.
 */

export const HOSPITAL_LIMITS = {
  minDoctors: 10,
  maxDoctors: 60,
  doctorsStep: 5,
  minPatients: 30,
  maxPatients: 120,
  patientsStep: 10,
} as const

export const HOSPITAL_DEFAULTS = {
  doctorCount: 40,
  patientsPerDoctor: 60,
  seed: 118_785,
} as const

/** Significance threshold used for illustration only; it is not a truth criterion. */
export const ALPHA = 0.05

/**
 * Parameters of the risk model, on the log-odds scale.
 *
 * BASE_LOGIT sets the typical risk a patient carries. SEVERITY_SD is how
 * much doctors differ in the kind of patients they are sent - the case mix,
 * which is a genuine difference between doctors and has nothing to do with
 * how well any of them works. PATIENT_SD is how much patients of the same
 * doctor differ from each other.
 *
 * There is deliberately no term for the doctor's skill. Every doctor in this
 * hospital is exactly as good as every other.
 */
export const BASE_LOGIT = -2.4
export const SEVERITY_SD = 0.55
export const PATIENT_SD = 0.7

export function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

/**
 * The doctor whose work is examined this year, named before the year starts:
 * the one due for the routine audit.
 *
 * Which doctor it is does not matter. That it was named in advance is the
 * only thing that matters.
 */
export function preRegisteredDoctor(doctorCount: number): number {
  return Math.min(doctorCount - 1, Math.floor(doctorCount / 4))
}

/** Doctors are shown by number: this hospital has no names and no people in it. */
export function doctorNumber(index: number): number {
  return index + 1
}
