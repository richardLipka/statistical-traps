/**
 * Least-squares polynomial fitting.
 *
 * Solved with Householder QR rather than the normal equations: a degree-9
 * Vandermonde matrix is badly conditioned, and squaring it would put the
 * reported R2 at the mercy of rounding error.
 */

export interface DataPoint {
  x: number
  y: number
}

export interface PolynomialModel {
  degree: number
  /** Coefficients in the internally scaled variable u = (x - centre) / halfRange. */
  coefficients: number[]
  centre: number
  halfRange: number
}

/** Solves min ||Ax - b|| for a full-rank overdetermined system. */
export function solveLeastSquares(matrix: readonly (readonly number[])[], rhs: readonly number[]): number[] {
  const rows = matrix.length
  const columns = rows === 0 ? 0 : matrix[0].length
  if (rows === 0 || columns === 0) return []

  const a = matrix.map((row) => [...row])
  const b = [...rhs]

  for (let k = 0; k < columns; k += 1) {
    let norm = 0
    for (let i = k; i < rows; i += 1) norm += a[i][k] * a[i][k]
    norm = Math.sqrt(norm)
    if (norm === 0) continue

    const alpha = a[k][k] > 0 ? -norm : norm
    const v = new Array<number>(rows).fill(0)
    for (let i = k; i < rows; i += 1) v[i] = a[i][k]
    v[k] -= alpha

    let vNormSquared = 0
    for (let i = k; i < rows; i += 1) vNormSquared += v[i] * v[i]
    if (vNormSquared < 1e-300) continue

    for (let j = k; j < columns; j += 1) {
      let dot = 0
      for (let i = k; i < rows; i += 1) dot += v[i] * a[i][j]
      const factor = (2 * dot) / vNormSquared
      for (let i = k; i < rows; i += 1) a[i][j] -= factor * v[i]
    }

    let dotB = 0
    for (let i = k; i < rows; i += 1) dotB += v[i] * b[i]
    const factorB = (2 * dotB) / vNormSquared
    for (let i = k; i < rows; i += 1) b[i] -= factorB * v[i]
  }

  const solution = new Array<number>(columns).fill(0)
  for (let i = columns - 1; i >= 0; i -= 1) {
    let sum = b[i]
    for (let j = i + 1; j < columns; j += 1) sum -= a[i][j] * solution[j]
    solution[i] = Math.abs(a[i][i]) < 1e-12 ? 0 : sum / a[i][i]
  }
  return solution
}

function scalingFor(points: readonly DataPoint[]): { centre: number; halfRange: number } {
  if (points.length === 0) return { centre: 0, halfRange: 1 }
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const point of points) {
    if (point.x < min) min = point.x
    if (point.x > max) max = point.x
  }
  const halfRange = (max - min) / 2
  return { centre: (min + max) / 2, halfRange: halfRange > 0 ? halfRange : 1 }
}

/** Least-squares polynomial of the given degree through these points. */
export function fitPolynomial(points: readonly DataPoint[], degree: number): PolynomialModel {
  const { centre, halfRange } = scalingFor(points)
  const safeDegree = Math.max(0, Math.min(degree, Math.max(0, points.length - 1)))

  const design = points.map((point) => {
    const u = (point.x - centre) / halfRange
    const row: number[] = []
    let power = 1
    for (let j = 0; j <= safeDegree; j += 1) {
      row.push(power)
      power *= u
    }
    return row
  })

  const coefficients = solveLeastSquares(
    design,
    points.map((point) => point.y),
  )

  return { degree: safeDegree, coefficients, centre, halfRange }
}

export function predictPolynomial(model: PolynomialModel, x: number): number {
  const u = (x - model.centre) / model.halfRange
  let value = 0
  let power = 1
  for (const coefficient of model.coefficients) {
    value += coefficient * power
    power *= u
  }
  return value
}

/** A straight line through two chosen points, in the same representation as a fit. */
export function lineThroughPoints(a: DataPoint, b: DataPoint): PolynomialModel {
  const centre = (a.x + b.x) / 2
  const halfRange = Math.abs(b.x - a.x) / 2 || 1
  const slope = (b.y - a.y) / (b.x - a.x || 1)
  // y = a.y + slope * (x - a.x) written in u = (x - centre) / halfRange
  const intercept = a.y + slope * (centre - a.x)
  return { degree: 1, coefficients: [intercept, slope * halfRange], centre, halfRange }
}
