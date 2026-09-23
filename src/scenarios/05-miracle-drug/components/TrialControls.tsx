import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SliderControl } from '@/components/ui/SliderControl'
import { formatInteger } from '@/utils/format'
import { TRIAL_LIMITS } from '@/scenarios/05-miracle-drug/model'

export interface TrialParams {
  patientsPerArm: number
  outcomeCount: number
  seed: number
}

export interface TrialControlsProps {
  params: TrialParams
  onChange: (params: Partial<TrialParams>) => void
  onNewSeed: () => void
}

export function TrialControls({ params, onChange, onNewSeed }: TrialControlsProps) {
  const { t } = useTranslation('miracledrug')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <Card title={t('controls.heading')}>
      <div className="space-y-4">
        <SliderControl
          label={t('controls.patientsPerArm')}
          value={params.patientsPerArm}
          min={TRIAL_LIMITS.minPerArm}
          max={TRIAL_LIMITS.maxPerArm}
          step={TRIAL_LIMITS.perArmStep}
          displayValue={formatInteger(params.patientsPerArm, locale)}
          onChange={(patientsPerArm) => onChange({ patientsPerArm })}
        />
        <SliderControl
          label={t('controls.outcomeCount')}
          value={params.outcomeCount}
          min={TRIAL_LIMITS.minOutcomes}
          max={TRIAL_LIMITS.maxOutcomes}
          step={TRIAL_LIMITS.outcomesStep}
          displayValue={formatInteger(params.outcomeCount, locale)}
          onChange={(outcomeCount) => onChange({ outcomeCount })}
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
