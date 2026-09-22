export interface Point {
  x: number
  y: number
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

export function squaredDistance(a: Point, b: Point): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt(squaredDistance(a, b))
}

/** Area of a circle. */
export function circleArea(radius: number): number {
  return Math.PI * radius * radius
}
