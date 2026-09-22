import { toneStroke, type Tone } from '@/components/ui/tone'

export interface ChartSeries {
  id: string
  tone: Tone
  points: readonly { x: number; y: number }[]
  dashed?: boolean
}

export interface LineChartProps {
  series: readonly ChartSeries[]
  xDomain: { min: number; max: number }
  yDomain: { min: number; max: number }
  xTicks: readonly number[]
  yTicks: readonly number[]
  formatX: (value: number) => string
  formatY: (value: number) => string
  xLabel: string
  yLabel: string
  ariaLabel: string
}

const WIDTH = 480
const HEIGHT = 240
const PADDING = { top: 14, right: 14, bottom: 42, left: 46 }

/**
 * Small multi-series line chart.
 *
 * A series leaves the chart rather than being flattened against the edge:
 * clamping a value of -40 to -2 would draw a line that claims something
 * untrue about the model.
 */
export function LineChart({
  series,
  xDomain,
  yDomain,
  xTicks,
  yTicks,
  formatX,
  formatY,
  xLabel,
  yLabel,
  ariaLabel,
}: LineChartProps) {
  const plotWidth = WIDTH - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom

  const xOf = (value: number) =>
    PADDING.left + ((value - xDomain.min) / (xDomain.max - xDomain.min)) * plotWidth
  const yOf = (value: number) =>
    PADDING.top + (1 - (value - yDomain.min) / (yDomain.max - yDomain.min)) * plotHeight
  const inside = (value: number) => value >= yDomain.min && value <= yDomain.max

  const pathOf = (points: readonly { x: number; y: number }[]) => {
    let path = ''
    let penDown = false
    for (const point of points) {
      if (!inside(point.y) || !Number.isFinite(point.y)) {
        penDown = false
        continue
      }
      path += `${penDown ? 'L' : 'M'}${xOf(point.x).toFixed(2)} ${yOf(point.y).toFixed(2)} `
      penDown = true
    }
    return path.trim()
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="xMidYMid meet"
    >
      {yTicks.map((tick) => (
        <g key={`y-${tick}`}>
          <line
            x1={PADDING.left}
            y1={yOf(tick)}
            x2={PADDING.left + plotWidth}
            y2={yOf(tick)}
            stroke="currentColor"
            className={tick === 0 ? 'text-slate-300' : 'text-slate-200'}
          />
          <text
            x={PADDING.left - 6}
            y={yOf(tick) + 3}
            className="fill-slate-500 text-[10px] tabular-nums"
            textAnchor="end"
          >
            {formatY(tick)}
          </text>
        </g>
      ))}

      {xTicks.map((tick) => (
        <text
          key={`x-${tick}`}
          x={xOf(tick)}
          y={PADDING.top + plotHeight + 14}
          className="fill-slate-500 text-[10px] tabular-nums"
          textAnchor="middle"
        >
          {formatX(tick)}
        </text>
      ))}

      {series.map((line) => (
        <g key={line.id}>
          <path
            d={pathOf(line.points)}
            fill="none"
            stroke={toneStroke[line.tone]}
            strokeWidth={2}
            strokeDasharray={line.dashed ? '5 3' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {line.points
            .filter((point) => inside(point.y) && Number.isFinite(point.y))
            .map((point) => (
              <circle
                key={`${line.id}-${point.x}`}
                cx={xOf(point.x)}
                cy={yOf(point.y)}
                r={2.4}
                fill={toneStroke[line.tone]}
              />
            ))}
        </g>
      ))}

      <text
        x={PADDING.left}
        y={PADDING.top - 3}
        className="fill-slate-500 text-[10px]"
        textAnchor="start"
      >
        {yLabel}
      </text>
      <text
        x={PADDING.left + plotWidth / 2}
        y={HEIGHT - 8}
        className="fill-slate-500 text-[11px]"
        textAnchor="middle"
      >
        {xLabel}
      </text>
    </svg>
  )
}
