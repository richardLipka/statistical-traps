import { circleArea, clamp, squaredDistance, type Point } from '@/utils/geometry'

/**
 * The board is the unit square [0, 1] x [0, 1], so its area is exactly 1 and
 * the probability of a uniformly thrown dart landing in a circle of radius r
 * is simply the circle's area.
 */
export const BOARD = {
  min: 0,
  max: 1,
  area: 1,
} as const

export type Dart = Point

export interface Target {
  x: number
  y: number
  radius: number
}

export const DARTBOARD_LIMITS = {
  minDartCount: 20,
  maxDartCount: 200,
  dartCountStep: 10,
  minRadius: 0.06,
  maxRadius: 0.2,
  radiusStep: 0.01,
} as const

export const DARTBOARD_DEFAULTS = {
  dartCount: 120,
  radius: 0.12,
  seed: 777,
} as const

/** Where the freely movable target starts, before the user touches it. */
export const POST_HOC_START: Point = { x: 0.24, y: 0.76 }

/** Significance threshold used for illustration only; it is not a truth criterion. */
export const ALPHA = 0.05

/**
 * Probability that one uniformly thrown dart lands inside a circle of this
 * radius. Valid because target centres are constrained so that the whole
 * circle lies inside the board - see clampTargetCentre.
 */
export function hitProbability(radius: number): number {
  return circleArea(radius) / BOARD.area
}

/** Keeps a target fully inside the board, so its area (and hit probability) never changes. */
export function clampTargetCentre(point: Point, radius: number): Point {
  return {
    x: clamp(point.x, BOARD.min + radius, BOARD.max - radius),
    y: clamp(point.y, BOARD.min + radius, BOARD.max - radius),
  }
}

/** The target declared before the data exist: the centre of the board. */
export function preRegisteredTarget(radius: number): Target {
  return { x: 0.5, y: 0.5, radius }
}

export function makeTarget(centre: Point, radius: number): Target {
  const clamped = clampTargetCentre(centre, radius)
  return { x: clamped.x, y: clamped.y, radius }
}

export function isHit(dart: Dart, target: Target): boolean {
  // Tolerance keeps darts exactly on the rim counted consistently.
  return squaredDistance(dart, target) <= target.radius * target.radius + 1e-12
}

export function countHits(darts: readonly Dart[], target: Target): number {
  let hits = 0
  for (const dart of darts) {
    if (isHit(dart, target)) hits += 1
  }
  return hits
}
