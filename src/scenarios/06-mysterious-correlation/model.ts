/**
 * A table of variables with nothing in it.
 *
 * Nothing here corresponds to any real data set, measurement or source. The
 * variables are numbered rather than named, and the scenario says why: the
 * names are where the explanation comes from, and a found correlation
 * always arrives with one.
 */

export const DATASET_LIMITS = {
  minVariables: 10,
  maxVariables: 80,
  variablesStep: 10,
  minObservations: 20,
  maxObservations: 120,
  observationsStep: 10,
} as const

export const DATASET_DEFAULTS = {
  variableCount: 60,
  observationCount: 40,
  seed: 1_885_122,
} as const

/** Significance threshold used for illustration only; it is not a truth criterion. */
export const ALPHA = 0.05

/** The pair somebody had a reason to look at, named before the data arrived. */
export const PRE_REGISTERED_PAIR = { a: 0, b: 1 } as const

export interface VariablePair {
  a: number
  b: number
}

/**
 * How many pairs an automated sweep will test: every unordered pair of
 * distinct variables.
 *
 * This is the number that does the damage. Doubling the variables roughly
 * quadruples it, which is why "we looked at everything" is a statement
 * about the size of a family of tests rather than about thoroughness.
 */
export function pairCount(variableCount: number): number {
  return (variableCount * (variableCount - 1)) / 2
}

/** Expected number of pairs below the threshold when nothing is related to anything. */
export function expectedFalsePositives(variableCount: number, alpha = ALPHA): number {
  return pairCount(variableCount) * alpha
}

export function pairsEqual(x: VariablePair, y: VariablePair): boolean {
  return (x.a === y.a && x.b === y.b) || (x.a === y.b && x.b === y.a)
}

/** Variables are numbered, not named. */
export function variableNumber(index: number): number {
  return index + 1
}
