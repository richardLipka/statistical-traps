import { useTranslation } from 'react-i18next'
import { formatNumber, formatPValueRelation } from '@/utils/format'
import { cn } from '@/utils/cn'
import { ALPHA } from '@/scenarios/02-best-line/model'
import type { DegreeResult } from '@/scenarios/02-best-line/analysis'

export interface DegreePickerProps {
  results: readonly DegreeResult[]
  /** Selected degree, or null while the user's own line is shown. */
  selected: number | null
  onSelect: (degree: number) => void
}

/**
 * Every model the search may choose from, with the number that would be
 * reported for it. Picking one is the search - and the point of doing it by
 * hand is that the user feels how ordinary the choice seems.
 */
export function DegreePicker({ results, selected, onSelect }: DegreePickerProps) {
  const { t } = useTranslation('bestline')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
      {results.map((result) => {
        const isSelected = selected === result.degree
        const isStriking = result.pValue < ALPHA
        return (
          <li key={result.degree}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(result.degree)}
              className={cn(
                'w-full rounded-lg border px-2 py-1.5 text-left transition-colors',
                isSelected
                  ? 'border-posthoc bg-posthoc-soft'
                  : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50',
              )}
            >
              <span className="block text-xs font-semibold text-slate-900">
                {t('models.degree', { degree: result.degree })}
              </span>
              <span className="block text-[11px] text-slate-600 tabular-nums">
                R² {formatNumber(result.rSquared, locale, 2)}
              </span>
              <span
                className={cn(
                  'block text-[11px] tabular-nums',
                  isStriking ? 'font-semibold text-posthoc' : 'text-slate-600',
                )}
              >
                {t('analysis.selection.gallery.itemPValue', {
                  p: formatPValueRelation(result.pValue, locale),
                })}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
