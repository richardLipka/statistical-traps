import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SliderControl } from '@/components/ui/SliderControl'
import { formatInteger } from '@/utils/format'
import { STUDY_LIMITS } from '@/scenarios/07-ai-synthesis/model'

export interface StudyParams {
  candidateCount: number
  rowCount: number
  seed: number
}

export interface StudyControlsProps {
  params: StudyParams
  onChange: (params: Partial<StudyParams>) => void
  onNewSeed: () => void
}

export function StudyControls({ params, onChange, onNewSeed }: StudyControlsProps) {
  const { t } = useTranslation('aisynthesis')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <Card title={t('controls.heading')}>
      <div className="space-y-4">
        <SliderControl
          label={t('controls.candidateCount')}
          value={params.candidateCount}
          min={STUDY_LIMITS.minCandidates}
          max={STUDY_LIMITS.maxCandidates}
          step={STUDY_LIMITS.candidatesStep}
          displayValue={formatInteger(params.candidateCount, locale)}
          onChange={(candidateCount) => onChange({ candidateCount })}
        />
        <SliderControl
          label={t('controls.rowCount')}
          value={params.rowCount}
          min={STUDY_LIMITS.minRows}
          max={STUDY_LIMITS.maxRows}
          step={STUDY_LIMITS.rowsStep}
          displayValue={formatInteger(params.rowCount, locale)}
          onChange={(rowCount) => onChange({ rowCount })}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-slate-700">
            {t('controls.seed')}:{' '}
            <span className="font-semibold tabular-nums">{formatInteger(params.seed, locale)}</span>
          </span>
          <Button variant="secondary" onClick={onNewSeed}>
            {t('controls.newSeed')}
          </Button>
        </div>
        <p className="text-xs text-slate-500">{t('controls.hint')}</p>
      </div>
    </Card>
  )
}
