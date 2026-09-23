import { toneStroke, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'

const WIDTH = 120
const HEIGHT = 84
const PADDING = 8
const CURVE_SAMPLES = 60

export interface ScatterPoint {
  x: number
  y: number
}

export interface ScatterPlotProps {
  points: readonly ScatterPoint[]
  /** A line or curve through them, as a function of x. */
  predict?: (x: number) => number
  lineTone?: Tone
  pointTone?: Tone
  ariaLabel: string
  compact?: boolean
  className?: string
}

/**
 * Two measurements plotted against each other, with an optional fitted line.
 *
 * The axes are scaled to the points, and the line is drawn only where it
 * stays inside that range - a line pinned to the edge would claim something
 * the model does not say.
 *
 * Used wherever a scenario needs to show one relationship on its own: it is
 * the picture a discovered correlation is presented with, and the reason it
 * is believed.
 */
export function ScatterPlot({
  points,
  predict,
  lineTone = 'posthoc',
  pointTone = 'neutral',
  ariaLabel,
  compact = false,
  className,
}: ScatterPlotProps) {
  if (points.length === 0) return null

  const span = (values: number[]) => {
    const low = Math.min(...values)
    const high = Math.max(...values)
    const margin = (high - low || 1) * 0.08
    return { low: low - margin, high: high + margin }
  }
  const xSpan = span(points.map((point) => point.x))
  const ySpan = span(points.map((point) => point.y))

  const xOf = (value: number) =>
    PADDING + ((value - xSpan.low) / (xSpan.high - xSpan.low)) * (WIDTH - 2 * PADDING)
  const yOf = (value: number) =>
    PADDING + (1 - (value - ySpan.low) / (ySpan.high - ySpan.low)) * (HEIGHT - 2 * PADDING)

  let path = ''
  if (predict) {
    let penDown = false
    for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
      const x = xSpan.low + ((xSpan.high - xSpan.low) * i) / CURVE_SAMPLES
      const y = predict(x)
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
          stroke={toneStroke[lineTone]}
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
