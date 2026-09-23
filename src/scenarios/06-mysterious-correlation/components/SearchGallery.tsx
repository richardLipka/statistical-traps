import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { fitPolynomial } from '@/statistics/regression/leastSquares'
import { formatNumber, formatPValueRelation } from '@/utils/format'
import { ALPHA, variableNumber } from '@/scenarios/06-mysterious-correlation/model'
import {
  pairPoints,
  selectionNullDataset,
  type SelectionSearchResult,
} from '@/scenarios/06-mysterious-correlation/analysis'
import { PairPlot } from '@/scenarios/06-mysterious-correlation/components/PairPlot'

export interface SearchGalleryProps {
  searches: readonly SelectionSearchResult[]
  variableCount: number
  observationCount: number
  baseSeed: number
}

/**
 * The strongest relationship each of the most impressive simulated sweeps
 * found, drawn on the data it was found in.
 *
 * Every table below is one where every variable is independent of every
 * other, and every plot is the best pair the sweep could find in it.
 */
export function SearchGallery({
  searches,
  variableCount,
  observationCount,
  baseSeed,
}: SearchGalleryProps) {
  const { t } = useTranslation('mysteriouscorrelation')
  const { i18n } = useTranslation()
  const locale = i18n.language

  const items = useMemo(
    () =>
      searches.map((search) => {
        const dataset = selectionNullDataset({
          variableCount,
          observationCount,
          baseSeed,
          index: search.index,
        })
        const points = pairPoints(dataset, search.pair)
        return { search, points, line: fitPolynomial(points, 1) }
      }),
    [searches, variableCount, observationCount, baseSeed],
  )

  if (items.length === 0) return null

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ search, points, line }) => (
        <li key={search.index}>
          <PairPlot
            points={points}
            line={line}
            ariaLabel={t('analysis.selection.gallery.plotAria', {
              index: search.index + 1,
              a: variableNumber(search.pair.a),
              b: variableNumber(search.pair.b),
            })}
            compact
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {t('analysis.selection.gallery.caption', { index: search.index + 1 })}
          </p>
          <p className="text-xs font-medium text-slate-800 tabular-nums">
            {t('pairs.label', {
              a: variableNumber(search.pair.a),
              b: variableNumber(search.pair.b),
            })}
          </p>
          <p className="text-xs font-medium whitespace-nowrap text-posthoc tabular-nums">
            {t('analysis.selection.gallery.itemStats', {
              r: formatNumber(search.r, locale, 2),
              p: formatPValueRelation(search.pValue, locale),
            })}
          </p>
          {search.pValue < ALPHA ? (
            <Badge tone="posthoc" className="mt-1">
              {t('analysis.verdictStriking')}
            </Badge>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
