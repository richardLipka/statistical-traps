import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SliderControl } from '@/components/ui/SliderControl'
import { formatInteger } from '@/utils/format'
import { BESTLINE_LIMITS } from '@/scenarios/02-best-line/model'

export interface BestLineParams {
  pointCount: number
  seed: number
}

export interface SampleControlsProps {
  params: BestLineParams
  onChange: (params: Partial<BestLineParams>) => void
  onNewSeed: () => void
}

export function SampleControls({ params, onChange, onNewSeed }: SampleControlsProps) {
  const { t } = useTranslation('bestline')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <Card title={t('controls.heading')}>
      <div className="space-y-4">
        <SliderControl
          label={t('controls.pointCount')}
          value={params.pointCount}
          min={BESTLINE_LIMITS.minPoints}
          max={BESTLINE_LIMITS.maxPoints}
          step={BESTLINE_LIMITS.pointsStep}
          displayValue={formatInteger(params.pointCount, locale)}
          onChange={(pointCount) => onChange({ pointCount })}
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
