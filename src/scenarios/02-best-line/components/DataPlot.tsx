import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { toneStroke, type Tone } from '@/components/ui/tone'
import type { DataPoint } from '@/statistics/regression/leastSquares'
import { cn } from '@/utils/cn'
import { X_RANGE, Y_VIEW } from '@/scenarios/02-best-line/model'

const WIDTH = 120
const HEIGHT = 84
const PADDING = { top: 6, right: 6, bottom: 6, left: 6 }
const CURVE_SAMPLES = 160
const KEYBOARD_STEP = 0.1
const KEYBOARD_STEP_LARGE = 0.5

export interface PlotCurve {
  id: string
  tone: Tone
  predict: (x: number) => number
  dashed?: boolean
  thin?: boolean
}

export interface PlotHandle {
  id: string
  x: number
  y: number
  ariaLabel: string
}

export interface DataPlotProps {
  points: readonly DataPoint[]
  curves: readonly PlotCurve[]
  handles?: readonly PlotHandle[]
  /** Colour of the observations; "fresh" marks a new, independent sample. */
  pointTone?: Tone
  handleTone?: Tone
  onHandleMove?: (id: string, y: number) => void
  ariaLabel: string
  compact?: boolean
  className?: string
}

/**
 * Scatter plot with fitted curves.
 *
 * A curve is drawn only where it stays inside the visible range: a degree-9
 * polynomial leaves the plot, and pinning it to the edge would draw a model
 * that does not exist.
 */
export function DataPlot({
  points,
  curves,
  handles = [],
  pointTone = 'neutral',
  handleTone = 'posthoc',
  onHandleMove,
  ariaLabel,
  compact = false,
  className,
}: DataPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  const plotWidth = WIDTH - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom

  const xOf = (value: number) =>
    PADDING.left + ((value - X_RANGE.min) / (X_RANGE.max - X_RANGE.min)) * plotWidth
  const yOf = (value: number) =>
    PADDING.top + (1 - (value - Y_VIEW.min) / (Y_VIEW.max - Y_VIEW.min)) * plotHeight

  const toModelY = (event: PointerEvent): number | null => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    if (rect.height === 0) return null
    const relative = (event.clientY - rect.top) / rect.height
    const withinPlot = (relative * HEIGHT - PADDING.top) / plotHeight
    return Y_VIEW.max - withinPlot * (Y_VIEW.max - Y_VIEW.min)
  }

  const pathOf = (curve: PlotCurve) => {
    let path = ''
    let penDown = false
    for (let i = 0; i <= CURVE_SAMPLES; i += 1) {
      const x = X_RANGE.min + ((X_RANGE.max - X_RANGE.min) * i) / CURVE_SAMPLES
      const y = curve.predict(x)
      if (!Number.isFinite(y) || y < Y_VIEW.min || y > Y_VIEW.max) {
        penDown = false
        continue
      }
      path += `${penDown ? 'L' : 'M'}${xOf(x).toFixed(2)} ${yOf(y).toFixed(2)} `
      penDown = true
    }
    return path.trim()
  }

  const handlePointerDown = (id: string) => (event: PointerEvent<SVGCircleElement>) => {
    if (!onHandleMove) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(id)
    const y = toModelY(event)
    if (y !== null) onHandleMove(id, y)
  }

  const handlePointerMove = (id: string) => (event: PointerEvent<SVGCircleElement>) => {
    if (!onHandleMove || dragging !== id) return
    const y = toModelY(event)
    if (y !== null) onHandleMove(id, y)
  }

  const handlePointerUp = (event: PointerEvent<SVGCircleElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(null)
  }

  const handleKeyDown = (handle: PlotHandle) => (event: KeyboardEvent<SVGCircleElement>) => {
    if (!onHandleMove) return
    const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      onHandleMove(handle.id, handle.y + step)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      onHandleMove(handle.id, handle.y - step)
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn('w-full touch-none rounded-xl border border-slate-300 bg-board', className)}
      role="img"
      aria-label={ariaLabel}
    >
      {/* the level of "no relationship at all" */}
      <line
        x1={xOf(X_RANGE.min)}
        y1={yOf(0)}
        x2={xOf(X_RANGE.max)}
        y2={yOf(0)}
        stroke="currentColor"
        className="text-slate-200"
        strokeWidth={0.5}
      />

      {curves.map((curve) => (
        <path
          key={curve.id}
          d={pathOf(curve)}
          fill="none"
          stroke={toneStroke[curve.tone]}
          strokeWidth={curve.thin ? 0.6 : compact ? 0.8 : 1.1}
          strokeDasharray={curve.dashed ? '2 1.5' : undefined}
          strokeLinecap="round"
        />
      ))}

      {points.map((point, index) => (
        <circle
          key={index}
          cx={xOf(point.x)}
          cy={yOf(point.y)}
          r={compact ? 0.9 : 1.2}
          fill={toneStroke[pointTone]}
          opacity={0.8}
        />
      ))}

      {handles.map((handle) => (
        <circle
          key={handle.id}
          cx={xOf(handle.x)}
          cy={yOf(handle.y)}
          r={2.2}
          fill="white"
          stroke={toneStroke[handleTone]}
          strokeWidth={1.2}
          className={onHandleMove ? (dragging === handle.id ? 'cursor-grabbing' : 'cursor-grab') : undefined}
          tabIndex={onHandleMove ? 0 : undefined}
          role={onHandleMove ? 'button' : undefined}
          aria-label={handle.ariaLabel}
          onPointerDown={handlePointerDown(handle.id)}
          onPointerMove={handlePointerMove(handle.id)}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown(handle)}
        />
      ))}
    </svg>
  )
}
