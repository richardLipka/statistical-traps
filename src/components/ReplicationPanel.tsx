import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Tone } from '@/components/ui/tone'

export interface ReplicationPanelProps {
  title: string
  description: string
  actionLabel: string
  onRun: () => void
  disabled?: boolean
  tone?: Tone
  children?: ReactNode
}

/**
 * Generic "run it again on new data" panel. Every scenario needs the same
 * gesture - repeat the procedure on independent data and look at the spread
 * of outcomes - so the frame lives in the shared components.
 */
export function ReplicationPanel({
  title,
  description,
  actionLabel,
  onRun,
  disabled = false,
  tone = 'fresh',
  children,
}: ReplicationPanelProps) {
  return (
    <Card title={title} description={description} tone={tone}>
      <Button onClick={onRun} disabled={disabled}>
        {actionLabel}
      </Button>
      {children ? <div className="mt-4">{children}</div> : null}
    </Card>
  )
}
