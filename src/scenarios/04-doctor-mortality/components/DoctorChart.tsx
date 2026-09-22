import { toneStroke, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'
import type { DoctorResult } from '@/scenarios/04-doctor-mortality/analysis'

const WIDTH = 200
const HEIGHT = 96
const PADDING = { top: 8, right: 6, bottom: 8, left: 6 }

export interface DoctorHighlight {
  index: number
  tone: Tone
}

export interface DoctorChartProps {
  results: readonly DoctorResult[]
  /** Raw deaths per patient, or deaths against what this doctor's patients were expected to have. */
  metric: 'rate' | 'ratio'
  /** The line everything is read against: the hospital rate, or 1 for a ratio. */
  reference: number
  highlights?: readonly DoctorHighlight[]
  barTone?: Tone
  onSelect?: (index: number) => void
  labelFor?: (index: number) => string
  ariaLabel: string
  compact?: boolean
  className?: string
}

/**
 * One column per doctor, against the line they are all being compared to.
 *
 * The same chart draws the league table of raw mortality and the
 * risk-adjusted picture, because the point of the scenario is that those are
 * two different pictures of the same year.
 */
export function DoctorChart({
  results,
  metric,
  reference,
  highlights = [],
  barTone = 'neutral',
  onSelect,
  labelFor,
  ariaLabel,
  compact = false,
  className,
}: DoctorChartProps) {
  if (results.length === 0) return null

  const valueOf = (result: DoctorResult) =>
    metric === 'rate' ? result.rate : result.adjusted.ratio
  const values = results.map(valueOf)
  const top = Math.max(...values, reference) * 1.12
  const plotWidth = WIDTH - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom
  const slot = plotWidth / results.length
  const barWidth = Math.max(1, slot - Math.min(1.6, slot * 0.3))

  const xOf = (position: number) => PADDING.left + position * slot + (slot - barWidth) / 2
  const yOf = (value: number) =>
    PADDING.top + (1 - (Number.isFinite(value) ? value : 0) / top) * plotHeight

  const toneOf = (index: number): Tone =>
    highlights.find((highlight) => highlight.index === index)?.tone ?? barTone

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn('w-full rounded-xl border border-slate-300 bg-board', className)}
      role={onSelect ? 'group' : 'img'}
      aria-label={ariaLabel}
    >
      {results.map((result, position) => {
        const value = valueOf(result)
        const tone = toneOf(result.index)
        const isHighlighted = tone !== barTone
        const y = yOf(value)
        return (
          <g key={result.index}>
            <rect
              x={xOf(position)}
              y={y}
              width={barWidth}
              height={Math.max(0.4, PADDING.top + plotHeight - y)}
              fill={toneStroke[tone]}
              opacity={isHighlighted ? 0.95 : 0.45}
            />
            {onSelect ? (
              <rect
                x={PADDING.left + position * slot}
                y={PADDING.top}
                width={slot}
                height={plotHeight}
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

      {/* what every doctor is being compared to */}
      <line
        x1={PADDING.left}
        y1={yOf(reference)}
        x2={PADDING.left + plotWidth}
        y2={yOf(reference)}
        stroke="currentColor"
        className="text-slate-400"
        strokeWidth={compact ? 0.4 : 0.6}
        strokeDasharray="2 1.5"
      />
      <line
        x1={PADDING.left}
        y1={PADDING.top + plotHeight}
        x2={PADDING.left + plotWidth}
        y2={PADDING.top + plotHeight}
        stroke="currentColor"
        className="text-slate-300"
        strokeWidth={0.4}
      />
    </svg>
  )
}
