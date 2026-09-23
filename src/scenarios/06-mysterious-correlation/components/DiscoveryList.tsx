import { useTranslation } from 'react-i18next'
import { formatNumber, formatPValueRelation } from '@/utils/format'
import { cn } from '@/utils/cn'
import { variableNumber, type VariablePair } from '@/scenarios/06-mysterious-correlation/model'
import type { PairResult } from '@/scenarios/06-mysterious-correlation/analysis'

export interface DiscoveryListProps {
  results: readonly PairResult[]
  selected: VariablePair | null
  onSelect: (pair: VariablePair) => void
}

/**
 * What an automated analyst hands back: the strongest relationships it
 * found, ranked, each with the numbers that would be reported for it.
 *
 * Every row here is a pair of variables with nothing between them, and the
 * list is the most persuasive object in the scenario - it looks exactly like
 * a list of findings.
 */
export function DiscoveryList({ results, selected, onSelect }: DiscoveryListProps) {
  const { t } = useTranslation('mysteriouscorrelation')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <ol className="space-y-1.5">
      {results.map((result) => {
        const isSelected =
          selected !== null && selected.a === result.pair.a && selected.b === result.pair.b
        return (
          <li key={`${result.pair.a}-${result.pair.b}`}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(result.pair)}
              className={cn(
                'flex w-full flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-left transition-colors',
                isSelected
                  ? 'border-posthoc bg-posthoc-soft'
                  : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50',
              )}
            >
              <span className="text-sm font-semibold text-slate-900">
                {t('pairs.label', {
                  a: variableNumber(result.pair.a),
                  b: variableNumber(result.pair.b),
                })}
              </span>
              <span className="text-xs tabular-nums text-slate-600">
                r {formatNumber(result.test.r, locale, 2)}
                {' · '}
                <span className="font-semibold text-posthoc">
                  p {formatPValueRelation(result.test.pValue, locale)}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
