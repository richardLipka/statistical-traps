import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { routes } from '@/app/routes'

export function AppHeader() {
  const { t } = useTranslation()

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href={routes.home} className="group flex items-baseline gap-2">
          <span className="text-base font-semibold text-slate-900 group-hover:text-slate-700">
            {t('app.title')}
          </span>
          <span className="hidden text-sm text-slate-500 sm:inline">{t('app.subtitle')}</span>
        </a>
        <LanguageSwitcher />
      </div>
    </header>
  )
}
