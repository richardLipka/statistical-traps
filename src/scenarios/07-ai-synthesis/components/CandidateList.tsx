import { useTranslation } from 'react-i18next'
import { formatNumber, formatPValueRelation } from '@/utils/format'
import { cn } from '@/utils/cn'
import { featureNumber } from '@/scenarios/07-ai-synthesis/model'
import type { CandidateResult } from '@/scenarios/07-ai-synthesis/analysis'

export interface CandidateListProps {
  results: readonly CandidateResult[]
  /** Features the scenario is following, marked without saying why. */
  highlighted?: readonly number[]
}

/**
 * The system's output: the candidates it ranked highest, with the numbers
 * that support them.
 *
 * Read-only on purpose. The user does not choose here - the point of the
 * scenario is that the ranking is all the data can offer, and that two rows
 * of it can be worth entirely different things.
 */
export function CandidateList({ results, highlighted = [] }: CandidateListProps) {
  const { t } = useTranslation('aisynthesis')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <ol className="space-y-1.5">
      {results.map((result, rank) => {
        const isFollowed = highlighted.includes(result.index)
        return (
          <li
            key={result.index}
            className={cn(
              'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border px-3 py-2',
              isFollowed ? 'border-posthoc bg-posthoc-soft' : 'border-slate-200 bg-white',
            )}
          >
            <span className="text-sm font-medium text-slate-900">
              <span className="mr-2 text-xs text-slate-500 tabular-nums">{rank + 1}.</span>
              {t('features.label', { feature: featureNumber(result.index) })}
            </span>
            <span className="text-xs tabular-nums text-slate-600">
              r {formatNumber(result.test.r, locale, 2)}
              {' · '}
              <span className={cn('font-semibold', isFollowed && 'text-posthoc')}>
                p {formatPValueRelation(result.test.pValue, locale)}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
