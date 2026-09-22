import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export interface ExplanationPanelProps {
  title?: string
  children: ReactNode
  defaultOpen?: boolean
}

/**
 * Explanations stay collapsed by default: the user should meet the surprising
 * result before reading why it happens.
 */
export function ExplanationPanel({ title, children, defaultOpen = false }: ExplanationPanelProps) {
  const { t } = useTranslation()

  return (
    <details
      className="group rounded-xl border border-slate-300 bg-white open:border-slate-400"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-800 select-none marker:content-none hover:bg-slate-50">
        <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden="true">
          ▸
        </span>
        {title ?? t('explanation.show')}
      </summary>
      <div className="space-y-3 border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-700">
        {children}
      </div>
    </details>
  )
}
