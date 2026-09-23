import { useMemo } from 'react'
import { toneStroke } from '@/components/ui/tone'
import { cn } from '@/utils/cn'
import type { VariablePair } from '@/scenarios/06-mysterious-correlation/model'
import {
  correlationBetween,
  standardizeColumns,
} from '@/scenarios/06-mysterious-correlation/analysis'
import type { Dataset } from '@/scenarios/06-mysterious-correlation/simulation'

const SIZE = 200
const PADDING = 4

export interface MatrixHighlight {
  pair: VariablePair
  tone: 'preset' | 'posthoc'
}

export interface CorrelationMatrixProps {
  dataset: Dataset
  highlights?: readonly MatrixHighlight[]
  ariaLabel: string
  className?: string
}

/**
 * Every pair of variables at once, shaded by how strongly they correlate.
 *
 * Deliberately not interactive: at this size a cell is a few pixels, and the
 * point of the picture is the scale of the search rather than any one cell.
 * The strongest cells are marked, and everything the user actually chooses
 * is chosen from the ranked list beside it.
 */
export function CorrelationMatrix({
  dataset,
  highlights = [],
  ariaLabel,
  className,
}: CorrelationMatrixProps) {
  const { cells, cell } = useMemo(() => {
    const standardized = standardizeColumns(dataset)
    const count = dataset.variableCount
    const width = (SIZE - 2 * PADDING) / count
    const entries: { x: number; y: number; r: number }[] = []
    for (let a = 0; a < count; a += 1) {
      for (let b = a + 1; b < count; b += 1) {
        entries.push({ x: a, y: b, r: correlationBetween(standardized, { a, b }) })
      }
    }
    return { cells: entries, cell: width }
  }, [dataset])

  const positionOf = (index: number) => PADDING + index * cell

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={cn('w-full rounded-xl border border-slate-300 bg-board', className)}
      role="img"
      aria-label={ariaLabel}
    >
      {cells.map((entry) => (
        <rect
          key={`${entry.x}-${entry.y}`}
          x={positionOf(entry.x)}
          y={positionOf(entry.y)}
          width={cell}
          height={cell}
          fill={entry.r >= 0 ? toneStroke.posthoc : toneStroke.preset}
          opacity={Math.min(1, Math.abs(entry.r) * 1.4)}
        />
      ))}
      {highlights.map((highlight) => {
        const a = Math.min(highlight.pair.a, highlight.pair.b)
        const b = Math.max(highlight.pair.a, highlight.pair.b)
        return (
          <rect
            key={`${highlight.tone}-${a}-${b}`}
            x={positionOf(a) - 1}
            y={positionOf(b) - 1}
            width={cell + 2}
            height={cell + 2}
            fill="none"
            stroke={toneStroke[highlight.tone]}
            strokeWidth={1.4}
          />
        )
      })}
    </svg>
  )
}
