import { useTranslation } from 'react-i18next'
import { FlowDiagram } from '@/components/FlowDiagram'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { conceptKey, scenarioSummaryKey, scenarioTitleKey } from '@/i18n/keys'
import { routes } from '@/app/routes'
import { scenarios } from '@/scenarios/registry'
import { cn } from '@/utils/cn'

export function HomePage() {
  const { t } = useTranslation()

  const cycle = [
    t('home.cycle.data'),
    t('home.cycle.search'),
    t('home.cycle.result'),
    t('home.cycle.validate'),
    t('home.cycle.outcome'),
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="max-w-3xl">
        <h1 className="text-3xl font-semibold text-balance text-slate-900 sm:text-4xl">
          {t('home.heading')}
        </h1>
        <p className="mt-3 text-lg text-slate-700">{t('home.lead')}</p>
        <p className="mt-4 text-slate-700">{t('home.body1')}</p>
        <p className="mt-3 text-slate-700">{t('home.body2')}</p>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
        <Card title={t('home.cycleHeading')}>
          <FlowDiagram steps={cycle} />
        </Card>
        <Card title={t('home.disclaimerHeading')} tone="fresh">
          <p className="text-sm leading-relaxed text-slate-700">{t('home.disclaimerBody')}</p>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">{t('home.scenariosHeading')}</h2>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">{t('home.scenariosLead')}</p>

        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {scenarios.map((scenario) => {
            const available = scenario.status === 'available'
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    {String(scenario.order).padStart(2, '0')}
                  </span>
                  <Badge tone={available ? 'fresh' : 'neutral'}>
                    {available ? t('status.available') : t('status.planned')}
                  </Badge>
                </div>
                <h3 className="mt-2 text-base font-semibold text-slate-900">
                  {t(scenarioTitleKey(scenario.id))}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {t(scenarioSummaryKey(scenario.id))}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {scenario.conceptKeys.map((key) => (
                    <li key={key}>
                      <Badge>{t(conceptKey(key))}</Badge>
                    </li>
                  ))}
                </ul>
              </>
            )

            return (
              <li key={scenario.id}>
                {available ? (
                  <a
                    href={routes.scenario(scenario.id)}
                    className={cn(
                      'block h-full rounded-xl border border-slate-300 bg-white p-4 transition-colors',
                      'hover:border-slate-400 hover:bg-slate-50',
                    )}
                  >
                    {content}
                  </a>
                ) : (
                  <div className="h-full rounded-xl border border-dashed border-slate-300 bg-white/60 p-4">
                    {content}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
