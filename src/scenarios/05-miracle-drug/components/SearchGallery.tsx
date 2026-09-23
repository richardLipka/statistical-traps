import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { formatNumber, formatPValueRelation } from '@/utils/format'
import { ALPHA, outcomeNumber } from '@/scenarios/05-miracle-drug/model'
import {
  evaluateTrial,
  selectionNullTrial,
  type SelectionSearchResult,
} from '@/scenarios/05-miracle-drug/analysis'
import { ForestPlot } from '@/scenarios/05-miracle-drug/components/ForestPlot'

export interface SearchGalleryProps {
  searches: readonly SelectionSearchResult[]
  patientsPerArm: number
  outcomeCount: number
  baseSeed: number
}

/**
 * The best outcome from each of the most impressive simulated trials.
 *
 * Every trial below is a trial of a treatment that does nothing at all, and
 * every highlighted row would have been the headline of a press release.
 */
export function SearchGallery({
  searches,
  patientsPerArm,
  outcomeCount,
  baseSeed,
}: SearchGalleryProps) {
  const { t } = useTranslation('miracledrug')
  const { i18n } = useTranslation()
  const locale = i18n.language

  const items = useMemo(
    () =>
      searches.map((search) => ({
        search,
        results: evaluateTrial(
          selectionNullTrial({ patientsPerArm, outcomeCount, baseSeed, index: search.index }),
        ),
      })),
    [searches, patientsPerArm, outcomeCount, baseSeed],
  )

  if (items.length === 0) return null

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ search, results }) => (
        <li key={search.index}>
          <ForestPlot
            results={results}
            highlights={[{ index: search.outcomeIndex, tone: 'posthoc' }]}
            ariaLabel={t('analysis.selection.gallery.plotAria', {
              index: search.index + 1,
              outcome: outcomeNumber(search.outcomeIndex),
            })}
            compact
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {t('analysis.selection.gallery.caption', { index: search.index + 1 })}
          </p>
          <p className="text-xs font-medium text-slate-800 tabular-nums">
            {t('analysis.selection.gallery.item', {
              outcome: outcomeNumber(search.outcomeIndex),
              difference: formatNumber(search.difference, locale, 2),
            })}
          </p>
          <p className="text-xs font-medium whitespace-nowrap text-posthoc tabular-nums">
            {t('analysis.selection.gallery.itemStats', {
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
