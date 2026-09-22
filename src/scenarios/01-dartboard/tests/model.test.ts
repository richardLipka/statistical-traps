import { describe, expect, it } from 'vitest'
import {
  BOARD,
  DARTBOARD_LIMITS,
  clampTargetCentre,
  countHits,
  hitProbability,
  isHit,
  makeTarget,
  preRegisteredTarget,
} from '@/scenarios/01-dartboard/model'

describe('hitProbability', () => {
  it('is the circle area, because the board has area 1', () => {
    expect(BOARD.area).toBe(1)
    expect(hitProbability(0.12)).toBeCloseTo(Math.PI * 0.12 * 0.12, 12)
  })

  it('stays below 1 for every allowed radius', () => {
    for (let r = DARTBOARD_LIMITS.minRadius; r <= DARTBOARD_LIMITS.maxRadius + 1e-9; r += 0.01) {
      expect(hitProbability(r)).toBeLessThan(1)
    }
  })
})

describe('clampTargetCentre', () => {
  it('keeps the whole circle inside the board', () => {
    const radius = 0.2
    const clamped = clampTargetCentre({ x: -5, y: 5 }, radius)
    expect(clamped.x).toBeCloseTo(radius, 12)
    expect(clamped.y).toBeCloseTo(1 - radius, 12)
  })

  it('leaves an interior point untouched', () => {
    expect(clampTargetCentre({ x: 0.5, y: 0.4 }, 0.1)).toEqual({ x: 0.5, y: 0.4 })
  })
})

describe('targets', () => {
  it('places the pre-registered target at the centre', () => {
    const target = preRegisteredTarget(0.1)
    expect(target).toEqual({ x: 0.5, y: 0.5, radius: 0.1 })
  })

  it('clamps targets built from arbitrary points', () => {
    const target = makeTarget({ x: 0.99, y: 0.5 }, 0.15)
    expect(target.x).toBeCloseTo(0.85, 12)
  })
})

describe('isHit and countHits', () => {
  const target = { x: 0.5, y: 0.5, radius: 0.1 }

  it('counts a dart at the centre and one exactly on the rim', () => {
    expect(isHit({ x: 0.5, y: 0.5 }, target)).toBe(true)
    expect(isHit({ x: 0.6, y: 0.5 }, target)).toBe(true)
  })

  it('rejects a dart outside the circle', () => {
    expect(isHit({ x: 0.61, y: 0.5 }, target)).toBe(false)
  })

  it('counts hits in a list', () => {
    const darts = [
      { x: 0.5, y: 0.5 },
      { x: 0.55, y: 0.52 },
      { x: 0.9, y: 0.1 },
    ]
    expect(countHits(darts, target)).toBe(2)
    expect(countHits([], target)).toBe(0)
  })
})
