import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SliderControl } from '@/components/ui/SliderControl'
import { formatInteger } from '@/utils/format'
import { HOSPITAL_LIMITS } from '@/scenarios/04-doctor-mortality/model'

export interface HospitalParams {
  doctorCount: number
  patientsPerDoctor: number
  seed: number
}

export interface HospitalControlsProps {
  params: HospitalParams
  onChange: (params: Partial<HospitalParams>) => void
  onNewSeed: () => void
}

export function HospitalControls({ params, onChange, onNewSeed }: HospitalControlsProps) {
  const { t } = useTranslation('doctormortality')
  const { i18n } = useTranslation()
  const locale = i18n.language

  return (
    <Card title={t('controls.heading')}>
      <div className="space-y-4">
        <SliderControl
          label={t('controls.doctorCount')}
          value={params.doctorCount}
          min={HOSPITAL_LIMITS.minDoctors}
          max={HOSPITAL_LIMITS.maxDoctors}
          step={HOSPITAL_LIMITS.doctorsStep}
          displayValue={formatInteger(params.doctorCount, locale)}
          onChange={(doctorCount) => onChange({ doctorCount })}
        />
        <SliderControl
          label={t('controls.patientsPerDoctor')}
          value={params.patientsPerDoctor}
          min={HOSPITAL_LIMITS.minPatients}
          max={HOSPITAL_LIMITS.maxPatients}
          step={HOSPITAL_LIMITS.patientsStep}
          displayValue={formatInteger(params.patientsPerDoctor, locale)}
          onChange={(patientsPerDoctor) => onChange({ patientsPerDoctor })}
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
