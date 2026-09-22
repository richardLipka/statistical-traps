import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { formatNumber, formatPValueRelation } from '@/utils/format'
import { ALPHA } from '@/scenarios/03-interesting-region/model'
import {
  selectionNullSeries,
  type SelectionSearchResult,
} from '@/scenarios/03-interesting-region/analysis'
import { SeriesPlot } from '@/scenarios/03-interesting-region/components/SeriesPlot'

export interface SearchGalleryProps {
  searches: readonly SelectionSearchResult[]
  periodCount: number
  baseSeed: number
}

/**
 * The most striking periods the simulated searches found, drawn on the
 * records they were found in. Every record here is a walk with no trend at
 * all, and every highlighted stretch would be reported as a finding.
 */
export function SearchGallery({ searches, periodCount, baseSeed }: SearchGalleryProps) {
  const { t } = useTranslation('interestingregion')
  const { i18n } = useTranslation()
  const locale = i18n.language

  const items = useMemo(
    () =>
      searches.map((search) => ({
        search,
        series: selectionNullSeries({ periodCount, baseSeed, index: search.index }),
      })),
    [searches, periodCount, baseSeed],
  )

  if (items.length === 0) return null

  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ search, series }) => (
        <li key={search.index}>
          <SeriesPlot
            series={series}
            windows={[{ id: `window-${search.index}`, window: search.window, tone: 'posthoc' }]}
            ariaLabel={t('analysis.selection.gallery.plotAria', {
              index: search.index + 1,
              start: search.window.start,
              end: search.window.end,
            })}
            compact
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {t('analysis.selection.gallery.caption', { index: search.index + 1 })}
          </p>
          <p className="text-xs font-medium text-slate-800 tabular-nums">
            {t('analysis.selection.gallery.item', {
              start: search.window.start,
              end: search.window.end,
              change: formatNumber(search.change, locale, 1),
            })}
          </p>
          <p className="text-xs font-medium whitespace-nowrap text-posthoc tabular-nums">
            {t('analysis.selection.gallery.itemStats', {
              z: formatNumber(Math.abs(search.z), locale, 2),
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
