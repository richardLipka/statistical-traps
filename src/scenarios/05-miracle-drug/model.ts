/**
 * A simulated two-arm trial.
 *
 * Nothing here corresponds to any real trial, treatment, condition or
 * patient, and no empirical clinical statistic is used or implied. The
 * outcomes are deliberately left unnamed - see `outcomeNumber`.
 */

export const TRIAL_LIMITS = {
  minPerArm: 20,
  maxPerArm: 150,
  perArmStep: 10,
  minOutcomes: 4,
  maxOutcomes: 30,
  outcomesStep: 2,
} as const

export const TRIAL_DEFAULTS = {
  patientsPerArm: 60,
  outcomeCount: 20,
  seed: 3_117_499,
} as const

/** Significance threshold used for illustration only; it is not a truth criterion. */
export const ALPHA = 0.05

/**
 * How strongly the outcomes hang together.
 *
 * Measurements taken on the same person are never independent: a patient who
 * is doing well tends to do well on several scales at once. Each outcome
 * loads on one shared patient factor with this weight, so any two outcomes
 * correlate at LOADING² - here 0.36.
 *
 * This is what makes the scenario more than "twenty coin flips". Bonferroni
 * assumes twenty independent chances; the search did not have twenty
 * independent chances, so the two corrections disagree, and the simulated
 * one is right.
 */
export const LOADING = 0.6

export function outcomeCorrelation(): number {
  return LOADING * LOADING
}

/**
 * The outcome the trial is registered on, named before anybody is enrolled.
 *
 * Which one it is does not matter. That it was named in advance is the only
 * thing that matters.
 */
export const PRIMARY_OUTCOME = 0

/**
 * Outcomes are numbered, not named.
 *
 * A named outcome invites a story, and a story is exactly what makes a
 * selected result persuasive. The scenario says this out loud rather than
 * inventing plausible-sounding clinical measures.
 */
export function outcomeNumber(index: number): number {
  return index + 1
}
