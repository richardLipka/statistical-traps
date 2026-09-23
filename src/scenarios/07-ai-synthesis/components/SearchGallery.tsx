import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { fitPolynomial, predictPolynomial } from '@/statistics/regression/leastSquares'
import { ScatterPlot } from '@/visualization/ScatterPlot'
import { formatNumber, formatPValueRelation } from '@/utils/format'
import { ALPHA, featureNumber } from '@/scenarios/07-ai-synthesis/model'
import {
  candidatePoints,
  selectionNullStudy,
  type SelectionSearchResult,
} from '@/scenarios/07-ai-synthesis/analysis'

export interface SearchGalleryProps {
  searches: readonly SelectionSearchResult[]
  candidateCount: number
  rowCount: number
  baseSeed: number
}

/**
 * The best candidate each of the most impressive simulated searches found,
 * in worlds where no feature is connected to the outcome at all.
 *
 * These are what a correctly performed search returns when there is nothing
 * to return, and they are indistinguishable from the real thing on the page.
 */
export function SearchGallery({
  searches,
  candidateCount,
  rowCount,
  baseSeed,
}: SearchGalleryProps) {
  const { t } = useTranslation('aisynthesis')
  const { i18n } = useTranslation()
  const locale = i18n.language

  const items = useMemo(
    () =>
      searches.map((search) => {
        const study = selectionNullStudy({
          candidateCount,
          rowCount,
          baseSeed,
          index: search.index,
        })
        const points = candidatePoints(study, search.candidate)
        return { search, points, line: fitPolynomial(points, 1) }
      }),
    [searches, candidateCount, rowCount, baseSeed],
  )

  if (items.length === 0) return null

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ search, points, line }) => (
        <li key={search.index}>
          <ScatterPlot
            points={points}
            predict={(x) => predictPolynomial(line, x)}
            ariaLabel={t('analysis.selection.gallery.plotAria', {
              index: search.index + 1,
              feature: featureNumber(search.candidate),
            })}
            compact
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {t('analysis.selection.gallery.caption', { index: search.index + 1 })}
          </p>
          <p className="text-xs font-medium text-slate-800 tabular-nums">
            {t('features.label', { feature: featureNumber(search.candidate) })}
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
