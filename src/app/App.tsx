import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '@/components/AppHeader'
import { HomePage } from '@/app/HomePage'
import { ScenarioPage } from '@/app/ScenarioPage'
import { useHashRoute } from '@/app/useHashRoute'

export default function App() {
  const route = useHashRoute()
  const { t } = useTranslation()

  useEffect(() => {
    document.title = `${t('app.title')} · ${t('app.subtitle')}`
  }, [t])

  const routeKey = route.name === 'scenario' ? `scenario:${route.id}` : route.name
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [routeKey])

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        {t('app.skipToContent')}
      </a>
      <AppHeader />
      <main id="content" className="flex-1">
        {route.name === 'home' ? <HomePage /> : <ScenarioPage id={route.id} />}
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-500 sm:px-6">
          <p>{t('footer.note')}</p>
        </div>
      </footer>
    </div>
  )
}
