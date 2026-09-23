import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SliderControl } from '@/components/ui/SliderControl'
import { formatInteger } from '@/utils/format'
import { DATASET_LIMITS, pairCount } from '@/scenarios/06-mysterious-correlation/model'

export interface DatasetParams {
  variableCount: number
  observationCount: number
  seed: number
}

export interface DatasetControlsProps {
  params: DatasetParams
  onChange: (params: Partial<DatasetParams>) => void
  onNewSeed: () => void
}

export function DatasetControls({ params, onChange, onNewSeed }: DatasetControlsProps) {
  const { t } = useTranslation('mysteriouscorrelation')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <Card title={t('controls.heading')}>
      <div className="space-y-4">
        <SliderControl
          label={t('controls.variableCount')}
          value={params.variableCount}
          min={DATASET_LIMITS.minVariables}
          max={DATASET_LIMITS.maxVariables}
          step={DATASET_LIMITS.variablesStep}
          displayValue={t('controls.variablesValue', {
            variables: formatInteger(params.variableCount, locale),
            pairs: formatInteger(pairCount(params.variableCount), locale),
          })}
          onChange={(variableCount) => onChange({ variableCount })}
        />
        <SliderControl
          label={t('controls.observationCount')}
          value={params.observationCount}
          min={DATASET_LIMITS.minObservations}
          max={DATASET_LIMITS.maxObservations}
          step={DATASET_LIMITS.observationsStep}
          displayValue={formatInteger(params.observationCount, locale)}
          onChange={(observationCount) => onChange({ observationCount })}
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
