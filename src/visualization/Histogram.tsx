import { toneStroke, type Tone } from '@/components/ui/tone'

export interface HistogramColumn {
  /** Text under the bar; the scenario decides how its values are formatted. */
  label: string
  count: number
}

export interface HistogramProps {
  bins: readonly HistogramColumn[]
  /** Index of the highlighted bar, e.g. the bar the observed result falls into. */
  markerIndex?: number
  markerLabel?: string
  xLabel: string
  yLabel: string
  ariaLabel: string
  tone?: Tone
  markerTone?: Tone
}

const WIDTH = 480
const HEIGHT = 220
const PADDING = { top: 16, right: 12, bottom: 44, left: 44 }

/** Histogram of simulated results, with one bar optionally singled out. */
export function Histogram({
  bins,
  markerIndex = -1,
  markerLabel,
  xLabel,
  yLabel,
  ariaLabel,
  tone = 'neutral',
  markerTone = 'posthoc',
}: HistogramProps) {
  if (bins.length === 0) return null

  const plotWidth = WIDTH - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom
  const maxCount = Math.max(...bins.map((bin) => bin.count), 1)
  const slot = plotWidth / bins.length
  const barWidth = Math.max(2, slot - Math.min(6, slot * 0.25))

  const xOf = (index: number) => PADDING.left + index * slot + (slot - barWidth) / 2
  const centreOf = (index: number) => PADDING.left + index * slot + slot / 2
  const heightOf = (count: number) => (count / maxCount) * plotHeight

  const labelEvery = Math.max(1, Math.ceil(bins.length / 12))

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* y axis */}
      <line
        x1={PADDING.left}
        y1={PADDING.top}
        x2={PADDING.left}
        y2={PADDING.top + plotHeight}
        stroke="currentColor"
        className="text-slate-300"
      />
      <text x={PADDING.left} y={PADDING.top - 4} className="fill-slate-500 text-[10px]" textAnchor="start">
        {yLabel}
      </text>
      <text
        x={PADDING.left - 6}
        y={PADDING.top + 8}
        className="fill-slate-500 text-[10px]"
        textAnchor="end"
      >
        {maxCount}
      </text>
      <text
        x={PADDING.left - 6}
        y={PADDING.top + plotHeight}
        className="fill-slate-500 text-[10px]"
        textAnchor="end"
      >
        0
      </text>

      {/* bars */}
      {bins.map((bin, index) => {
        const barHeight = heightOf(bin.count)
        const isMarked = markerIndex === index
        return (
          <rect
            key={`${bin.label}-${index}`}
            x={xOf(index)}
            y={PADDING.top + plotHeight - barHeight}
            width={barWidth}
            height={barHeight}
            fill={isMarked ? toneStroke[markerTone] : toneStroke[tone]}
            opacity={isMarked ? 0.95 : 0.35}
          />
        )
      })}

      {/* x axis */}
      <line
        x1={PADDING.left}
        y1={PADDING.top + plotHeight}
        x2={PADDING.left + plotWidth}
        y2={PADDING.top + plotHeight}
        stroke="currentColor"
        className="text-slate-300"
      />
      {bins.map((bin, index) =>
        index % labelEvery === 0 ? (
          <text
            key={`label-${bin.label}-${index}`}
            x={centreOf(index)}
            y={PADDING.top + plotHeight + 14}
            className="fill-slate-500 text-[10px] tabular-nums"
            textAnchor="middle"
          >
            {bin.label}
          </text>
        ) : null,
      )}
      <text
        x={PADDING.left + plotWidth / 2}
        y={HEIGHT - 8}
        className="fill-slate-500 text-[11px]"
        textAnchor="middle"
      >
        {xLabel}
      </text>

      {/* marker */}
      {markerIndex >= 0 && markerIndex < bins.length ? (
        <g>
          <line
            x1={centreOf(markerIndex)}
            y1={PADDING.top}
            x2={centreOf(markerIndex)}
            y2={PADDING.top + plotHeight}
            stroke={toneStroke[markerTone]}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          {markerLabel ? (
            <text
              x={Math.min(centreOf(markerIndex) + 6, WIDTH - PADDING.right)}
              y={PADDING.top + 10}
              className="text-[10px] font-semibold"
              fill={toneStroke[markerTone]}
              textAnchor={centreOf(markerIndex) > WIDTH * 0.7 ? 'end' : 'start'}
            >
              {markerLabel}
            </text>
          ) : null}
        </g>
      ) : null}
    </svg>
  )
}
