import type { ReactNode } from 'react'
import { toneBorder, toneDot, toneSurface, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'

export interface BadgeProps {
  children: ReactNode
  tone?: Tone
  withDot?: boolean
  className?: string
}

export function Badge({ children, tone = 'neutral', withDot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium text-slate-700',
        toneBorder[tone],
        toneSurface[tone],
        className,
      )}
    >
      {withDot ? <span className={cn('size-2 rounded-full', toneDot[tone])} aria-hidden="true" /> : null}
      {children}
    </span>
  )
}
