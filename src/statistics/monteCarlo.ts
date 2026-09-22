/**
 * Monte Carlo helpers.
 *
 * When a statistic is produced by a *search* rather than by a pre-specified
 * test, its null distribution is usually not available in closed form. The
 * honest alternative is to simulate the whole search procedure many times on
 * data generated under the null hypothesis.
 */

export interface EmpiricalPValue {
  /** Number of simulated values at least as extreme as the observed one. */
  atLeastObserved: number
  replications: number
  /**
   * (1 + #{simulated >= observed}) / (1 + replications).
   *
   * The +1 correction keeps the p-value valid (never reports exactly 0) for a
   * finite number of replications.
   */
  pValue: number
}

export function empiricalPValueGreaterOrEqual(
  observed: number,
  samples: readonly number[],
): EmpiricalPValue {
  let atLeastObserved = 0
  for (const sample of samples) {
    if (sample >= observed) atLeastObserved += 1
  }
  return {
    atLeastObserved,
    replications: samples.length,
    pValue: (1 + atLeastObserved) / (1 + samples.length),
  }
}

/** The mirror image, for statistics where small values are the extreme ones (p-values). */
export function empiricalPValueLessOrEqual(
  observed: number,
  samples: readonly number[],
): EmpiricalPValue {
  let atLeastObserved = 0
  for (const sample of samples) {
    if (sample <= observed) atLeastObserved += 1
  }
  return {
    atLeastObserved,
    replications: samples.length,
    pValue: (1 + atLeastObserved) / (1 + samples.length),
  }
}

export interface HistogramBin {
  value: number
  count: number
}

export interface ValueBin {
  start: number
  end: number
  count: number
}

/** Histogram of continuous values over a fixed domain. */
export function binValues(
  values: readonly number[],
  binCount: number,
  domain?: { min: number; max: number },
): ValueBin[] {
  if (values.length === 0 || binCount <= 0) return []
  let min = domain?.min
  let max = domain?.max
  if (min === undefined || max === undefined) {
    min = Math.min(...values)
    max = Math.max(...values)
  }
  if (!(max > min)) max = min + 1

  const width = (max - min) / binCount
  const bins: ValueBin[] = Array.from({ length: binCount }, (_, index) => ({
    start: min + index * width,
    end: min + (index + 1) * width,
    count: 0,
  }))
  for (const value of values) {
    const index = Math.min(binCount - 1, Math.max(0, Math.floor((value - min) / width)))
    bins[index].count += 1
  }
  return bins
}

/** Index of the bin a value falls into, or -1 when it is outside the range. */
export function binIndexOf(bins: readonly ValueBin[], value: number): number {
  for (let index = 0; index < bins.length; index += 1) {
    const isLast = index === bins.length - 1
    if (value >= bins[index].start && (value < bins[index].end || (isLast && value <= bins[index].end))) {
      return index
    }
  }
  return -1
}

/** Histogram of integer-valued samples, with empty values in between kept. */
export function integerHistogram(values: readonly number[]): HistogramBin[] {
  if (values.length === 0) return []
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const value of values) {
    if (value < min) min = value
    if (value > max) max = value
  }
  const bins: HistogramBin[] = []
  for (let value = min; value <= max; value += 1) bins.push({ value, count: 0 })
  for (const value of values) {
    const bin = bins[value - min]
    if (bin) bin.count += 1
  }
  return bins
}

export function mean(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN
  let total = 0
  for (const value of values) total += value
  return total / values.length
}

/** Share of values satisfying a predicate, in [0, 1]. */
export function shareOf<T>(values: readonly T[], predicate: (value: T) => boolean): number {
  if (values.length === 0) return Number.NaN
  let matching = 0
  for (const value of values) {
    if (predicate(value)) matching += 1
  }
  return matching / values.length
}
