import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { toneStroke, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'
import { clamp } from '@/utils/geometry'
import type { Window } from '@/scenarios/03-interesting-region/model'
import type { Series } from '@/scenarios/03-interesting-region/simulation'

const WIDTH = 200
const HEIGHT = 96
const PADDING = { top: 6, right: 6, bottom: 6, left: 6 }
const KEYBOARD_STEP = 1
const KEYBOARD_STEP_LARGE = 5

export interface PlotWindow {
  id: string
  window: Window
  tone: Tone
  /** Only one window is ever draggable: the one the user is choosing. */
  draggable?: boolean
}

export interface SeriesPlotProps {
  series: Series
  windows?: readonly PlotWindow[]
  seriesTone?: Tone
  /** Called with a new period index while an edge is being dragged. */
  onEdgeMove?: (edge: 'start' | 'end', period: number) => void
  edgeLabel?: (edge: 'start' | 'end', period: number) => string
  ariaLabel: string
  compact?: boolean
  className?: string
}

/**
 * The record as the user sees it: the running level, period by period.
 *
 * The steps are independent, but the level is their running total, so
 * neighbouring points share almost all of their history. That is why the
 * curve looks like it has trends and turning points, and why picking the
 * most striking stretch out of it feels like reading something real.
 */
export function SeriesPlot({
  series,
  windows = [],
  seriesTone = 'neutral',
  onEdgeMove,
  edgeLabel,
  ariaLabel,
  compact = false,
  className,
}: SeriesPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null)

  const periodCount = series.steps.length
  const plotWidth = WIDTH - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom

  let low = Math.min(...series.levels)
  let high = Math.max(...series.levels)
  const span = high - low
  const margin = span > 0 ? span * 0.08 : 1
  low -= margin
  high += margin

  const xOf = (period: number) => PADDING.left + (period / periodCount) * plotWidth
  const yOf = (level: number) =>
    PADDING.top + (1 - (level - low) / (high - low)) * plotHeight

  const path = series.levels
    .map((level, period) => `${period === 0 ? 'M' : 'L'}${xOf(period).toFixed(2)} ${yOf(level).toFixed(2)}`)
    .join(' ')

  const toPeriod = (event: PointerEvent): number | null => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0) return null
    const relative = (event.clientX - rect.left) / rect.width
    const withinPlot = (relative * WIDTH - PADDING.left) / plotWidth
    return clamp(Math.round(withinPlot * periodCount), 0, periodCount)
  }

  const handlePointerDown = (edge: 'start' | 'end') => (event: PointerEvent<SVGRectElement>) => {
    if (!onEdgeMove) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(edge)
    const period = toPeriod(event)
    if (period !== null) onEdgeMove(edge, period)
  }

  const handlePointerMove = (edge: 'start' | 'end') => (event: PointerEvent<SVGRectElement>) => {
    if (!onEdgeMove || dragging !== edge) return
    const period = toPeriod(event)
    if (period !== null) onEdgeMove(edge, period)
  }

  const handlePointerUp = (event: PointerEvent<SVGRectElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(null)
  }

  const handleKeyDown =
    (edge: 'start' | 'end', period: number) => (event: KeyboardEvent<SVGRectElement>) => {
      if (!onEdgeMove) return
      const step = event.shiftKey ? KEYBOARD_STEP_LARGE : KEYBOARD_STEP
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        onEdgeMove(edge, period - step)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        onEdgeMove(edge, period + step)
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
      {/* the level the record started from */}
      <line
        x1={xOf(0)}
        y1={yOf(0)}
        x2={xOf(periodCount)}
        y2={yOf(0)}
        stroke="currentColor"
        className="text-slate-200"
        strokeWidth={0.5}
      />

      {windows.map((entry) => (
        <rect
          key={entry.id}
          x={xOf(entry.window.start)}
          y={PADDING.top}
          width={Math.max(0.5, xOf(entry.window.end) - xOf(entry.window.start))}
          height={plotHeight}
          fill={toneStroke[entry.tone]}
          opacity={0.14}
        />
      ))}

      <path
        d={path}
        fill="none"
        stroke={toneStroke[seriesTone]}
        strokeWidth={compact ? 0.5 : 0.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* the part of the record inside each window, drawn over the rest */}
      {windows.map((entry) => (
        <path
          key={`highlight-${entry.id}`}
          d={series.levels
            .slice(entry.window.start, entry.window.end + 1)
            .map(
              (level, offset) =>
                `${offset === 0 ? 'M' : 'L'}${xOf(entry.window.start + offset).toFixed(2)} ${yOf(level).toFixed(2)}`,
            )
            .join(' ')}
          fill="none"
          stroke={toneStroke[entry.tone]}
          strokeWidth={compact ? 1 : 1.6}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}

      {windows
        .filter((entry) => entry.draggable && onEdgeMove)
        .flatMap((entry) =>
          (['start', 'end'] as const).map((edge) => {
            const period = entry.window[edge]
            return (
              <rect
                key={`${entry.id}-${edge}`}
                x={xOf(period) - 1.6}
                y={PADDING.top}
                width={3.2}
                height={plotHeight}
                fill={toneStroke[entry.tone]}
                opacity={dragging === edge ? 0.9 : 0.55}
                rx={1}
                className={dragging === edge ? 'cursor-grabbing' : 'cursor-grab'}
                tabIndex={0}
                role="button"
                aria-label={edgeLabel ? edgeLabel(edge, period) : undefined}
                onPointerDown={handlePointerDown(edge)}
                onPointerMove={handlePointerMove(edge)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onKeyDown={handleKeyDown(edge, period)}
              />
            )
          }),
        )}
    </svg>
  )
}
