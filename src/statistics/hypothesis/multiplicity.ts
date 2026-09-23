/**
 * Textbook corrections for testing several hypotheses at once.
 *
 * These are worth having beside the Monte Carlo corrections the scenarios
 * use, because they answer the same question by a different route and it is
 * instructive where they disagree: Bonferroni assumes nothing about how the
 * tests relate to each other, so when the tests are correlated - as outcomes
 * measured on the same people always are - it charges for more independent
 * chances than the search actually had.
 */

/** Bonferroni: multiply by the number of tests, capped at 1. */
export function bonferroni(pValue: number, tests: number): number {
  if (!Number.isFinite(pValue) || !(tests > 0)) return Number.NaN
  return Math.min(1, pValue * tests)
}

/**
 * Holm's step-down correction, which controls the same error rate as
 * Bonferroni but rejects at least as much. Returns adjusted p-values in the
 * order the p-values were given.
 */
export function holmAdjusted(pValues: readonly number[]): number[] {
  const count = pValues.length
  const order = pValues
    .map((pValue, index) => ({ pValue, index }))
    .sort((a, b) => a.pValue - b.pValue)

  const adjusted = new Array<number>(count)
  let running = 0
  for (let rank = 0; rank < count; rank += 1) {
    const scaled = Math.min(1, order[rank].pValue * (count - rank))
    // Monotone by construction: an adjusted p-value never falls below an
    // earlier one, or a less significant test could outrank a better one.
    running = Math.max(running, scaled)
    adjusted[order[rank].index] = running
  }
  return adjusted
}
