/**
 * A prediction problem handed to an automated system.
 *
 * Nothing here is a real data set, model or system. The point of the
 * scenario is not that machines are unreliable - the search it performs is
 * done correctly - but that finding a pattern, predicting with it,
 * confirming it and acting on it are four different things.
 */

export const STUDY_LIMITS = {
  minCandidates: 50,
  maxCandidates: 400,
  candidatesStep: 50,
  minRows: 30,
  maxRows: 150,
  rowsStep: 10,
} as const

export const STUDY_DEFAULTS = {
  /** Candidate features offered to the system, all but one pure noise. */
  candidateCount: 200,
  rowCount: 60,
  seed: 7_471_047,
} as const

/** Significance threshold used for illustration only; it is not a truth criterion. */
export const ALPHA = 0.05

/**
 * How strongly the hidden cause drives the outcome, and the one feature
 * connected to it, on a correlation scale.
 *
 * Their product is the correlation the connected feature really has with
 * the outcome: 0.49 here. That is deliberately close to what the strongest
 * of a few hundred unrelated features reaches by chance in a table this
 * size, because the scenario depends on the two being indistinguishable in
 * the data the search was run on.
 */
export const OUTCOME_LOADING = 0.7
export const FEATURE_LOADING = 0.7

export function trueCorrelation(): number {
  return OUTCOME_LOADING * FEATURE_LOADING
}

/**
 * The connected feature sits at a fixed position in the table, and nothing
 * in the data marks it out. The system is never told which column it is,
 * and neither is the user until the validation stage.
 */
export const CONNECTED_FEATURE = 0

export function isConnected(index: number): boolean {
  return index === CONNECTED_FEATURE
}

/** Features are numbered, not named. */
export function featureNumber(index: number): number {
  return index + 1
}

/** The four questions the scenario asks of whatever the system returns. */
export const QUESTIONS = ['describes', 'distinguishes', 'predicts', 'changes'] as const
export type Question = (typeof QUESTIONS)[number]
