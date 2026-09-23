import { toneStroke, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'
import type { OutcomeResult } from '@/scenarios/05-miracle-drug/analysis'

const WIDTH = 200
const PADDING = { top: 6, right: 8, bottom: 10, left: 8 }
const ROW_HEIGHT = 4.6
const COMPACT_ROW_HEIGHT = 2.8

export interface OutcomeHighlight {
  index: number
  tone: Tone
}

export interface ForestPlotProps {
  results: readonly OutcomeResult[]
  highlights?: readonly OutcomeHighlight[]
  barTone?: Tone
  onSelect?: (index: number) => void
  labelFor?: (index: number) => string
  ariaLabel: string
  compact?: boolean
  className?: string
}

/**
 * One row per outcome: the measured difference between the arms, with the
 * interval the trial can actually distinguish it within.
 *
 * The vertical line is zero - no difference. An interval that crosses it is
 * a result the trial cannot tell apart from nothing, which is what almost
 * every row here is, because nothing is exactly what the treatment does.
 */
export function ForestPlot({
  results,
  highlights = [],
  barTone = 'neutral',
  onSelect,
  labelFor,
  ariaLabel,
  compact = false,
  className,
}: ForestPlotProps) {
  if (results.length === 0) return null

  const rowHeight = compact ? COMPACT_ROW_HEIGHT : ROW_HEIGHT
  const height = PADDING.top + PADDING.bottom + results.length * rowHeight
  const plotWidth = WIDTH - PADDING.left - PADDING.right

  const reach = Math.max(
    ...results.map((result) =>
      Math.abs(result.test.difference) + Math.abs(result.test.marginOfError),
    ),
    0.1,
  )
  const span = reach * 1.05

  const xOf = (value: number) => PADDING.left + ((value + span) / (2 * span)) * plotWidth
  const yOf = (position: number) => PADDING.top + (position + 0.5) * rowHeight

  const toneOf = (index: number): Tone =>
    highlights.find((highlight) => highlight.index === index)?.tone ?? barTone

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      className={cn('w-full rounded-xl border border-slate-300 bg-board', className)}
      role={onSelect ? 'group' : 'img'}
      aria-label={ariaLabel}
    >
      {/* no difference between the arms */}
      <line
        x1={xOf(0)}
        y1={PADDING.top}
        x2={xOf(0)}
        y2={height - PADDING.bottom}
        stroke="currentColor"
        className="text-slate-300"
        strokeWidth={0.5}
      />

      {results.map((result, position) => {
        const tone = toneOf(result.index)
        const isHighlighted = tone !== barTone
        const y = yOf(position)
        const { difference, marginOfError } = result.test
        const low = difference - marginOfError
        const high = difference + marginOfError
        return (
          <g key={result.index}>
            <line
              x1={xOf(low)}
              y1={y}
              x2={xOf(high)}
              y2={y}
              stroke={toneStroke[tone]}
              strokeWidth={isHighlighted ? 0.9 : 0.6}
              strokeLinecap="round"
              opacity={isHighlighted ? 0.95 : 0.45}
            />
            <circle
              cx={xOf(difference)}
              cy={y}
              r={isHighlighted ? 1.5 : 1.1}
              fill={toneStroke[tone]}
              opacity={isHighlighted ? 1 : 0.6}
            />
            {onSelect ? (
              <rect
                x={PADDING.left}
                y={PADDING.top + position * rowHeight}
                width={plotWidth}
                height={rowHeight}
                fill="transparent"
                className="cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={labelFor ? labelFor(result.index) : undefined}
                aria-pressed={isHighlighted}
                onClick={() => onSelect(result.index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(result.index)
                  }
                }}
              />
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}
