import { useId } from 'react'

export interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  displayValue: string
  disabled?: boolean
  onChange: (value: number) => void
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  displayValue,
  disabled,
  onChange,
}: SliderControlProps) {
  const id = useId()
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        <span className="text-sm font-semibold tabular-nums text-slate-900">{displayValue}</span>
      </div>
      <input
        id={id}
        type="range"
        className="mt-1.5 w-full accent-slate-900 disabled:opacity-50"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
