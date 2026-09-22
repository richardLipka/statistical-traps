import { useTranslation } from 'react-i18next'
import type { ScenarioStage } from '@/scenarios/types'
import { cn } from '@/utils/cn'

export interface StepIndicatorProps {
  stages: readonly ScenarioStage[]
  current: ScenarioStage
  /** Stages already reached; later ones stay locked so the surprise survives. */
  reached: readonly ScenarioStage[]
  onSelect: (stage: ScenarioStage) => void
}

export function StepIndicator({ stages, current, reached, onSelect }: StepIndicatorProps) {
  const { t } = useTranslation()
  const currentIndex = stages.indexOf(current)

  return (
    <nav aria-label={t('scenario.stepOf', { current: currentIndex + 1, total: stages.length })}>
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
        {stages.map((stage, index) => {
          const isCurrent = stage === current
          const isReached = reached.includes(stage)
          return (
            <li key={stage} className="flex items-center">
              <button
                type="button"
                disabled={!isReached}
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelect(stage)}
                className={cn(
                  'rounded-md px-2 py-1 text-xs font-medium transition-colors sm:text-sm',
                  isCurrent && 'bg-slate-900 text-white',
                  !isCurrent && isReached && 'text-slate-600 hover:bg-slate-200/70',
                  !isReached && 'cursor-not-allowed text-slate-400',
                )}
              >
                <span className="tabular-nums">{index + 1}.</span> {t(`stages.${stage}`)}
              </button>
              {index < stages.length - 1 ? (
                <span className="px-0.5 text-slate-300" aria-hidden="true">
                  ›
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
