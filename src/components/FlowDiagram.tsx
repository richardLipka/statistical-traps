import { toneBorder, toneSurface, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'

export interface FlowDiagramProps {
  steps: readonly string[]
  tone?: Tone
  className?: string
}

/**
 * The recurring diagram of the application: data, a search, a result, a test
 * on new data. Reused wherever a process has to be shown as a sequence.
 */
export function FlowDiagram({ steps, tone = 'neutral', className }: FlowDiagramProps) {
  return (
    <ol className={cn('flex flex-col items-stretch gap-0', className)}>
      {steps.map((step, index) => (
        <li key={step} className="flex flex-col items-center">
          <div
            className={cn(
              'w-full rounded-lg border px-3 py-2 text-center text-sm text-slate-700',
              toneBorder[tone],
              toneSurface[tone],
            )}
          >
            {step}
          </div>
          {index < steps.length - 1 ? (
            <span className="py-1 text-slate-400" aria-hidden="true">
              ↓
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
