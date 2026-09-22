import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { StepIndicator } from '@/components/StepIndicator'
import { Badge } from '@/components/ui/Badge'
import { conceptKey } from '@/i18n/keys'
import { routes } from '@/app/routes'
import type { ScenarioStage } from '@/scenarios/types'

export interface ScenarioShellProps {
  title: string
  summary: string
  conceptKeys: readonly string[]
  stages: readonly ScenarioStage[]
  current: ScenarioStage
  reached: readonly ScenarioStage[]
  onStageChange: (stage: ScenarioStage) => void
  children: ReactNode
}

/**
 * The frame every scenario is rendered in: title, concepts, lifecycle
 * navigation. Scenario-specific logic never lives here.
 */
export function ScenarioShell({
  title,
  summary,
  conceptKeys,
  stages,
  current,
  reached,
  onStageChange,
  children,
}: ScenarioShellProps) {
  const { t } = useTranslation()
  const currentIndex = stages.indexOf(current)

  return (
    <article className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <a href={routes.home} className="text-sm text-slate-500 hover:text-slate-800">
        ← {t('nav.backToOverview')}
      </a>

      <header className="mt-3">
        <h1 className="text-2xl font-semibold text-balance text-slate-900 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-slate-600">{summary}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {conceptKeys.map((key) => (
            <li key={key}>
              <Badge>{t(conceptKey(key))}</Badge>
            </li>
          ))}
        </ul>
      </header>

      <div className="mt-6 border-y border-slate-200 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StepIndicator
            stages={stages}
            current={current}
            reached={reached}
            onSelect={onStageChange}
          />
          <span className="text-xs text-slate-500 tabular-nums">
            {t('scenario.stepOf', { current: currentIndex + 1, total: stages.length })}
          </span>
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </article>
  )
}
