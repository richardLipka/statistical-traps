import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/i18n/resources'
import { cn } from '@/utils/cn'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-0.5"
      role="group"
      aria-label={t('language.label')}
    >
      {LANGUAGES.map((language) => {
        const active = i18n.language === language
        return (
          <button
            key={language}
            type="button"
            aria-pressed={active}
            onClick={() => void i18n.changeLanguage(language)}
            className={cn(
              'rounded-md px-2.5 py-1 text-sm font-medium transition-colors',
              active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
            )}
          >
            {t(`language.${language}`)}
          </button>
        )
      })}
    </div>
  )
}
