import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { fitPolynomial, predictPolynomial } from '@/statistics/regression/leastSquares'
import { formatNumber, formatPValueRelation } from '@/utils/format'
import { ALPHA } from '@/scenarios/02-best-line/model'
import { selectionNullSample, type SelectionSearchResult } from '@/scenarios/02-best-line/analysis'
import { DataPlot } from '@/scenarios/02-best-line/components/DataPlot'

export interface SearchGalleryProps {
  searches: readonly SelectionSearchResult[]
  pointCount: number
  baseSeed: number
}

/**
 * The most convincing models the simulated searches found, drawn on the noise
 * they were found in. Every sample here was generated with no relationship at
 * all.
 */
export function SearchGallery({ searches, pointCount, baseSeed }: SearchGalleryProps) {
  const { t } = useTranslation('bestline')
  const { i18n } = useTranslation()
  const locale = i18n.language

  const plots = useMemo(
    () =>
      searches.map((search) => {
        const points = selectionNullSample({ pointCount, baseSeed, index: search.index })
        const model = fitPolynomial(points, search.degree)
        return { search, points, predict: (x: number) => predictPolynomial(model, x) }
      }),
    [searches, pointCount, baseSeed],
  )

  if (plots.length === 0) return null

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {plots.map(({ search, points, predict }) => (
        <li key={search.index}>
          <DataPlot
            points={points}
            curves={[{ id: `curve-${search.index}`, tone: 'posthoc', predict }]}
            ariaLabel={t('analysis.selection.gallery.plotAria', {
              index: search.index + 1,
              count: points.length,
            })}
            compact
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {t('analysis.selection.gallery.caption', { index: search.index + 1 })}
          </p>
          <p className="text-xs font-medium text-slate-800 tabular-nums">
            {t('analysis.selection.gallery.item', {
              degree: search.degree,
              rSquared: formatNumber(search.rSquared, locale, 2),
            })}
          </p>
          <p className="text-xs font-medium whitespace-nowrap text-posthoc tabular-nums">
            {t('analysis.selection.gallery.itemPValue', {
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
