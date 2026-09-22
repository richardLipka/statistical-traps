import type { ReactNode } from 'react'
import { toneBorder, toneSurface, toneText, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'

export interface StatTileProps {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  tone?: Tone
  className?: string
}

export function StatTile({ label, value, hint, tone = 'neutral', className }: StatTileProps) {
  return (
    <div className={cn('rounded-lg border px-3 py-2.5', toneBorder[tone], toneSurface[tone], className)}>
      <div className="text-xs font-medium tracking-wide text-slate-600 uppercase">{label}</div>
      <div className={cn('mt-1 text-2xl font-semibold tabular-nums', toneText[tone])}>{value}</div>
      {hint ? <div className="mt-1 text-xs leading-snug text-slate-500">{hint}</div> : null}
    </div>
  )
}
