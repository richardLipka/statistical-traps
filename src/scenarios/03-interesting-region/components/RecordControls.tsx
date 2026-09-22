import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SliderControl } from '@/components/ui/SliderControl'
import { formatInteger } from '@/utils/format'
import { REGION_LIMITS } from '@/scenarios/03-interesting-region/model'

export interface RegionParams {
  periodCount: number
  seed: number
}

export interface RecordControlsProps {
  params: RegionParams
  onChange: (params: Partial<RegionParams>) => void
  onNewSeed: () => void
}

export function RecordControls({ params, onChange, onNewSeed }: RecordControlsProps) {
  const { t } = useTranslation('interestingregion')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <Card title={t('controls.heading')}>
      <div className="space-y-4">
        <SliderControl
          label={t('controls.periodCount')}
          value={params.periodCount}
          min={REGION_LIMITS.minPeriods}
          max={REGION_LIMITS.maxPeriods}
          step={REGION_LIMITS.periodsStep}
          displayValue={formatInteger(params.periodCount, locale)}
          onChange={(periodCount) => onChange({ periodCount })}
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
