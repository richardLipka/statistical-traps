import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SliderControl } from '@/components/ui/SliderControl'
import { formatInteger, formatNumber } from '@/utils/format'
import { DARTBOARD_LIMITS } from '@/scenarios/01-dartboard/model'

export interface DartboardParams {
  dartCount: number
  radius: number
  seed: number
}

export interface ExperimentControlsProps {
  params: DartboardParams
  onChange: (params: Partial<DartboardParams>) => void
  onNewSeed: () => void
}

export function ExperimentControls({ params, onChange, onNewSeed }: ExperimentControlsProps) {
  const { t } = useTranslation('dartboard')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <Card title={t('controls.heading')}>
      <div className="space-y-4">
        <SliderControl
          label={t('controls.dartCount')}
          value={params.dartCount}
          min={DARTBOARD_LIMITS.minDartCount}
          max={DARTBOARD_LIMITS.maxDartCount}
          step={DARTBOARD_LIMITS.dartCountStep}
          displayValue={formatInteger(params.dartCount, locale)}
          onChange={(dartCount) => onChange({ dartCount })}
        />
        <SliderControl
          label={t('controls.radius')}
          value={params.radius}
          min={DARTBOARD_LIMITS.minRadius}
          max={DARTBOARD_LIMITS.maxRadius}
          step={DARTBOARD_LIMITS.radiusStep}
          displayValue={formatNumber(params.radius, locale, 2)}
          onChange={(radius) => onChange({ radius })}
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
