/**
 * The Poisson-binomial distribution: the number of successes among
 * independent trials that each have their OWN probability.
 *
 * This is what "expected deaths" means once patients differ from each other.
 * A binomial distribution assumes every trial carries the same risk, which
 * is exactly the assumption that fails when one doctor's patients are sicker
 * than another's.
 *
 * The distribution is built by convolution: start from "no trials, zero
 * successes with certainty" and fold in one trial at a time. Every term is a
 * product and a sum of non-negative numbers below one, so nothing cancels
 * and the result stays accurate without any log-space trickery.
 */

/** Full pmf: entry k is P(X = k), for k = 0 … probabilities.length. */
export function poissonBinomialPmf(probabilities: readonly number[]): number[] {
  let distribution = [1]
  for (const p of probabilities) {
    const next = new Array<number>(distribution.length + 1).fill(0)
    for (let k = 0; k < distribution.length; k += 1) {
      next[k] += distribution[k] * (1 - p)
      next[k + 1] += distribution[k] * p
    }
    distribution = next
  }
  return distribution
}

/** P(X >= k): the "at least this many deaths" question. */
export function poissonBinomialTailGreaterOrEqual(
  k: number,
  probabilities: readonly number[],
): number {
  const trials = probabilities.length
  if (k <= 0) return 1
  if (k > trials) return 0
  const pmf = poissonBinomialPmf(probabilities)
  let tail = 0
  for (let i = k; i <= trials; i += 1) tail += pmf[i]
  return Math.min(1, Math.max(0, tail))
}

/** Expected number of successes: the sum of the individual probabilities. */
export function poissonBinomialMean(probabilities: readonly number[]): number {
  let total = 0
  for (const p of probabilities) total += p
  return total
}

/** Variance: the sum of p(1 - p), which is smaller than a binomial with the same mean. */
export function poissonBinomialVariance(probabilities: readonly number[]): number {
  let total = 0
  for (const p of probabilities) total += p * (1 - p)
  return total
}
