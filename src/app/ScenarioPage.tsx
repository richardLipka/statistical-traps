import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { conceptKey, scenarioSummaryKey, scenarioTitleKey } from '@/i18n/keys'
import { routes } from '@/app/routes'
import { findScenario } from '@/scenarios/registry'

export interface ScenarioPageProps {
  id: string
}

export function ScenarioPage({ id }: ScenarioPageProps) {
  const { t } = useTranslation()
  const scenario = findScenario(id)

  if (!scenario) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t('scenario.notFound.heading')}</h1>
        <p className="mt-2 text-slate-600">{t('scenario.notFound.body')}</p>
        <a href={routes.home} className="mt-4 inline-block text-sm text-slate-600 hover:text-slate-900">
          ← {t('nav.backToOverview')}
        </a>
      </div>
    )
  }

  if (scenario.status === 'available') {
    const Component = scenario.component
    return <Component />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <a href={routes.home} className="text-sm text-slate-500 hover:text-slate-800">
        ← {t('nav.backToOverview')}
      </a>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">
        {t(scenarioTitleKey(scenario.id))}
      </h1>
      <p className="mt-2 text-slate-600">
        {t(scenarioSummaryKey(scenario.id))}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {scenario.conceptKeys.map((key) => (
          <li key={key}>
            <Badge>{t(conceptKey(key))}</Badge>
          </li>
        ))}
      </ul>
      <Card className="mt-6" title={t('scenario.planned.heading')}>
        <p className="text-sm text-slate-700">{t('scenario.planned.body')}</p>
      </Card>
    </div>
  )
}
