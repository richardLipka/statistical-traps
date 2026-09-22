import type { ReactNode } from 'react'
import { toneBorder, toneSurface, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'

export interface CardProps {
  title?: ReactNode
  description?: ReactNode
  tone?: Tone
  className?: string
  children?: ReactNode
}

export function Card({ title, description, tone = 'neutral', className, children }: CardProps) {
  return (
    <section
      className={cn('rounded-xl border p-4 sm:p-5', toneBorder[tone], toneSurface[tone], className)}
    >
      {title ? <h3 className="text-base font-semibold text-slate-900">{title}</h3> : null}
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      {children ? <div className={cn(title || description ? 'mt-4' : undefined)}>{children}</div> : null}
    </section>
  )
}
