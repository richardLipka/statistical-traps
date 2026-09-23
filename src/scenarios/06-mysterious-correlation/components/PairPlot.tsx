import { toneStroke, type Tone } from '@/components/ui/tone'
import type { DataPoint, PolynomialModel } from '@/statistics/regression/leastSquares'
import { predictPolynomial } from '@/statistics/regression/leastSquares'
import { cn } from '@/utils/cn'

const WIDTH = 120
const HEIGHT = 84
const PADDING = 8

export interface PairPlotProps {
  points: readonly DataPoint[]
  /** The line fitted to these points, or one carried over from other data. */
  line?: PolynomialModel
  tone?: Tone
  pointTone?: Tone
  ariaLabel: string
  compact?: boolean
  className?: string
}

/**
 * The two variables of one pair, plotted against each other.
 *
 * This is the picture a discovered correlation is presented with, and it is
 * the reason the discovery is believed: forty points and a line through them
 * look like a relationship whatever produced them.
 */
export function PairPlot({
  points,
  line,
  tone = 'posthoc',
  pointTone = 'neutral',
  ariaLabel,
  compact = false,
  className,
}: PairPlotProps) {
  if (points.length === 0) return null

  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const span = (values: number[]) => {
    const low = Math.min(...values)
    const high = Math.max(...values)
    const margin = (high - low || 1) * 0.08
    return { low: low - margin, high: high + margin }
  }
  const xSpan = span(xs)
  const ySpan = span(ys)

  const xOf = (value: number) =>
    PADDING + ((value - xSpan.low) / (xSpan.high - xSpan.low)) * (WIDTH - 2 * PADDING)
  const yOf = (value: number) =>
    PADDING + (1 - (value - ySpan.low) / (ySpan.high - ySpan.low)) * (HEIGHT - 2 * PADDING)

  let path = ''
  if (line) {
    let penDown = false
    const steps = 60
    for (let i = 0; i <= steps; i += 1) {
      const x = xSpan.low + ((xSpan.high - xSpan.low) * i) / steps
      const y = predictPolynomial(line, x)
      if (!Number.isFinite(y) || y < ySpan.low || y > ySpan.high) {
        penDown = false
        continue
      }
      path += `${penDown ? 'L' : 'M'}${xOf(x).toFixed(2)} ${yOf(y).toFixed(2)} `
      penDown = true
    }
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn('w-full rounded-xl border border-slate-300 bg-board', className)}
      role="img"
      aria-label={ariaLabel}
    >
      {path ? (
        <path
          d={path.trim()}
          fill="none"
          stroke={toneStroke[tone]}
          strokeWidth={compact ? 0.8 : 1.1}
          strokeLinecap="round"
        />
      ) : null}
      {points.map((point, index) => (
        <circle
          key={index}
          cx={xOf(point.x)}
          cy={yOf(point.y)}
          r={compact ? 0.9 : 1.3}
          fill={toneStroke[pointTone]}
          opacity={0.75}
        />
      ))}
    </svg>
  )
}
