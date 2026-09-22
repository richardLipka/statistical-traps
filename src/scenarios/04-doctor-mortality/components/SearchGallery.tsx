import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { formatNumber, formatPValueRelation } from '@/utils/format'
import { ALPHA, doctorNumber } from '@/scenarios/04-doctor-mortality/model'
import {
  evaluateHospital,
  selectionNullHospital,
  type SelectionSearchResult,
} from '@/scenarios/04-doctor-mortality/analysis'
import { DoctorChart } from '@/scenarios/04-doctor-mortality/components/DoctorChart'

export interface SearchGalleryProps {
  searches: readonly SelectionSearchResult[]
  severities: readonly number[]
  patientsPerDoctor: number
  baseSeed: number
}

/**
 * The worst-looking doctor from each of the most extreme simulated years.
 *
 * Every hospital below is one where no doctor is any better or worse than
 * any other, and every highlighted column would have been the subject of an
 * investigation.
 */
export function SearchGallery({
  searches,
  severities,
  patientsPerDoctor,
  baseSeed,
}: SearchGalleryProps) {
  const { t } = useTranslation('doctormortality')
  const { i18n } = useTranslation()
  const locale = i18n.language

  const items = useMemo(
    () =>
      searches.map((search) => ({
        search,
        results: evaluateHospital(
          selectionNullHospital({
            severities,
            patientsPerDoctor,
            baseSeed,
            index: search.index,
          }),
        ),
      })),
    [searches, severities, patientsPerDoctor, baseSeed],
  )

  if (items.length === 0) return null

  return (
    <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ search, results }) => (
        <li key={search.index}>
          <DoctorChart
            results={results}
            metric="ratio"
            reference={1}
            highlights={[{ index: search.doctorIndex, tone: 'posthoc' }]}
            ariaLabel={t('analysis.selection.gallery.plotAria', {
              index: search.index + 1,
              doctor: doctorNumber(search.doctorIndex),
            })}
            compact
          />
          <p className="mt-1.5 text-xs text-slate-500">
            {t('analysis.selection.gallery.caption', { index: search.index + 1 })}
          </p>
          <p className="text-xs font-medium text-slate-800 tabular-nums">
            {t('analysis.selection.gallery.item', {
              doctor: doctorNumber(search.doctorIndex),
              deaths: search.deaths,
              expected: formatNumber(search.expected, locale, 1),
            })}
          </p>
          <p className="text-xs font-medium whitespace-nowrap text-posthoc tabular-nums">
            {t('analysis.selection.gallery.itemStats', {
              ratio: formatNumber(search.ratio, locale, 2),
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
