import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { formatInteger, formatPValueRelation } from '@/utils/format'
import { ALPHA } from '@/scenarios/01-dartboard/model'
import {
  evaluateTarget,
  selectionNullDarts,
  type SelectionSearchResult,
} from '@/scenarios/01-dartboard/analysis'
import { DartBoardView } from '@/scenarios/01-dartboard/components/DartBoardView'

export interface SearchGalleryProps {
  searches: readonly SelectionSearchResult[]
  dartCount: number
  baseSeed: number
}

/**
 * The best circles the simulated searches found, drawn on the data they were
 * found in. Every board here was generated with no effect at all, and every
 * circle on it would be reported as a discovery by the naive test - which is
 * the point the gallery is making.
 */
export function SearchGallery({ searches, dartCount, baseSeed }: SearchGalleryProps) {
  const { t } = useTranslation('dartboard')
  const { i18n } = useTranslation()
  const locale = i18n.language

  const boards = useMemo(
    () =>
      searches.map((search) => {
        const darts = selectionNullDarts({ dartCount, baseSeed, index: search.index })
        return { search, darts, evaluation: evaluateTarget(darts, search.target) }
      }),
    [searches, dartCount, baseSeed],
  )

  if (boards.length === 0) return null

  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {boards.map(({ search, darts, evaluation }) => (
        <li key={search.index}>
          <DartBoardView
            darts={darts}
            targets={[{ id: `search-${search.index}`, target: search.target, tone: 'posthoc' }]}
            ariaLabel={t('analysis.selection.gallery.boardAria', {
              index: search.index + 1,
              count: darts.length,
            })}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {t('analysis.selection.gallery.caption', { index: search.index + 1 })}
          </p>
          <p className="text-xs font-medium text-slate-800 tabular-nums">
            {t('analysis.selection.gallery.item', {
              hits: formatInteger(evaluation.hits, locale),
            })}
          </p>
          <p className="text-xs font-medium whitespace-nowrap text-posthoc tabular-nums">
            {t('analysis.selection.gallery.itemPValue', {
              p: formatPValueRelation(evaluation.test.pValue, locale),
            })}
          </p>
          {evaluation.test.pValue < ALPHA ? (
            <Badge tone="posthoc" className="mt-1">
              {t('analysis.verdictStriking')}
            </Badge>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
