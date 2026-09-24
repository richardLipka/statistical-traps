import { createRng, deriveSeed } from '@/statistics/random/rng'
import { LOADING } from '@/scenarios/05-miracle-drug/model'

export interface Trial {
  patientsPerArm: number
  outcomeCount: number
  /** treatment[outcome][patient] — one measurement per patient per outcome. */
  treatment: number[][]
  control: number[][]
}

/**
 * True data-generating process of this scenario.
 *
 *   shared_i    ~ Normal(0, 1)                 one patient-level factor
 *   value_ik    = LOADING · shared_i + sqrt(1 - LOADING²) · Normal(0, 1)
 *
 * The treatment arm and the control arm are drawn from exactly the same
 * distribution. No term anywhere depends on which arm a patient is in, so
 * the true effect of the treatment on every outcome is exactly zero.
 *
 * The shared factor is what makes this a trial rather than a pile of coin
 * flips: a patient who scores well tends to score well on several outcomes
 * at once, so the outcomes are correlated with each other at LOADING². The
 * marginal distribution of each outcome is still standard normal, which
 * keeps every individual t-test exactly valid.
 */
function generateArm(
  patientsPerArm: number,
  outcomeCount: number,
  rng: ReturnType<typeof createRng>,
): number[][] {
  const unique = Math.sqrt(1 - LOADING * LOADING)
  const arm: number[][] = Array.from({ length: outcomeCount }, () =>
    new Array<number>(patientsPerArm),
  )
  for (let patient = 0; patient < patientsPerArm; patient += 1) {
    const shared = rng.normal(0, 1)
    for (let outcome = 0; outcome < outcomeCount; outcome += 1) {
      arm[outcome][patient] = LOADING * shared + unique * rng.normal(0, 1)
    }
  }
  return arm
}

export function generateTrial(options: {
  patientsPerArm: number
  outcomeCount: number
  seed: number
}): Trial {
  const { patientsPerArm, outcomeCount, seed } = options
  const rng = createRng(seed)
  return {
    patientsPerArm,
    outcomeCount,
    treatment: generateArm(patientsPerArm, outcomeCount, rng),
    control: generateArm(patientsPerArm, outcomeCount, rng),
  }
}

/** Seed roles, kept apart so exploration data is never reused for validation. */
export const SEED_ROLE = {
  observed: 0,
  selectionNull: 7_000_057,
  validation: 1_000_063,
  freshTrial: 5_000_051,
  /** Closing evidence that the treatment moves no outcome at all. */
  nullEvidence: 4_500_059,
} as const

export function replicationSeed(baseSeed: number, role: number, index: number): number {
  return deriveSeed(baseSeed + role, index + 1)
}

/** Another trial of the same design: new patients, same everything else. */
export function generateReplicationTrial(options: {
  patientsPerArm: number
  outcomeCount: number
  baseSeed: number
  role: number
  index: number
}): Trial {
  const { patientsPerArm, outcomeCount, baseSeed, role, index } = options
  return generateTrial({
    patientsPerArm,
    outcomeCount,
    seed: replicationSeed(baseSeed, role, index),
  })
}
