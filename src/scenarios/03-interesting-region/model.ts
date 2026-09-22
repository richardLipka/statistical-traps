import { clamp } from '@/utils/geometry'

/**
 * A record of one measurement per period. Each period the value moves by an
 * independent random step; the steps have this standard deviation, and it is
 * known exactly because we choose it.
 */
export const STEP_SD = 1

export const REGION_LIMITS = {
  minPeriods: 60,
  maxPeriods: 200,
  periodsStep: 20,
  /** Shortest period the search may propose, in steps. */
  minWindow: 5,
} as const

export const REGION_DEFAULTS = {
  periodCount: 120,
  seed: 300_009,
} as const

export const ALPHA = 0.05

/**
 * A stretch of the record, as a half-open range of steps [start, end).
 *
 * Step i is the move from period i to period i+1, so a window covers the
 * change in the level between period `start` and period `end`.
 */
export interface Window {
  start: number
  end: number
}

export function windowLength(window: Window): number {
  return window.end - window.start
}

/**
 * The stretch we commit to before the machine is switched on: the middle
 * third of the record.
 *
 * Any fixed choice would do. What matters is that it is fixed in advance and
 * therefore cannot have been influenced by what the data turned out to be.
 */
export function preRegisteredWindow(periodCount: number): Window {
  return {
    start: Math.floor(periodCount / 3),
    end: Math.floor((2 * periodCount) / 3),
  }
}

/** Keeps a window inside the record and no shorter than the minimum length. */
export function clampWindow(window: Window, periodCount: number): Window {
  const minLength = Math.min(REGION_LIMITS.minWindow, periodCount)
  const start = clamp(Math.round(window.start), 0, periodCount - minLength)
  const end = clamp(Math.round(window.end), start + minLength, periodCount)
  return { start, end }
}

export function windowsEqual(a: Window, b: Window): boolean {
  return a.start === b.start && a.end === b.end
}

export function windowsOverlap(a: Window, b: Window): boolean {
  return a.start < b.end && b.start < a.end
}

/**
 * How many stretches the search may choose between: every window of length
 * `minWindow` or more.
 *
 * The number matters. It is the size of the family of tests that the single
 * reported p-value silently comes from.
 */
export function candidateWindowCount(periodCount: number, minWindow: number): number {
  let total = 0
  for (let length = minWindow; length <= periodCount; length += 1) {
    total += periodCount - length + 1
  }
  return Math.max(0, total)
}
