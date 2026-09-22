import type { ReactNode } from 'react'
import { toneDot, type Tone } from '@/components/ui/tone'
import { cn } from '@/utils/cn'

export interface ResultRow {
  key: string
  label: ReactNode
  tone?: Tone
  cells: ReactNode[]
}

export interface ResultTableProps {
  columns: ReactNode[]
  rows: ResultRow[]
  caption?: ReactNode
}

/** Small comparison table used to put two procedures side by side. */
export function ResultTable({ columns, rows, caption }: ResultTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] border-collapse text-sm">
        {caption ? <caption className="mb-2 text-left text-xs text-slate-500">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs tracking-wide text-slate-500 uppercase">
            <th scope="col" className="py-2 pr-3 font-medium">
              <span className="sr-only">—</span>
            </th>
            {columns.map((column, index) => (
              <th key={index} scope="col" className="py-2 pr-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-slate-100 last:border-0">
              <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-700">
                <span className="inline-flex items-center gap-2">
                  {row.tone ? (
                    <span className={cn('size-2 rounded-full', toneDot[row.tone])} aria-hidden="true" />
                  ) : null}
                  {row.label}
                </span>
              </th>
              {row.cells.map((cell, index) => (
                <td key={index} className="py-2 pr-3 tabular-nums text-slate-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
