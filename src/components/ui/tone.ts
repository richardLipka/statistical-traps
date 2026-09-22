/**
 * The shared visual language of the application.
 *
 *   preset  - anything specified before the data were seen
 *   posthoc - anything chosen after looking at the data
 *   fresh   - new, independent data used for validation
 *
 * Scenarios reuse these tones so that the same idea always looks the same,
 * whatever it is applied to (a circle, a line, a subgroup, a variable).
 */
export type Tone = 'neutral' | 'preset' | 'posthoc' | 'fresh'

export const toneText: Record<Tone, string> = {
  neutral: 'text-slate-700',
  preset: 'text-preset',
  posthoc: 'text-posthoc',
  fresh: 'text-fresh',
}

export const toneBorder: Record<Tone, string> = {
  neutral: 'border-slate-200',
  preset: 'border-preset/40',
  posthoc: 'border-posthoc/40',
  fresh: 'border-fresh/40',
}

export const toneSurface: Record<Tone, string> = {
  neutral: 'bg-white',
  preset: 'bg-preset-soft/60',
  posthoc: 'bg-posthoc-soft/60',
  fresh: 'bg-fresh-soft/60',
}

export const toneDot: Record<Tone, string> = {
  neutral: 'bg-slate-400',
  preset: 'bg-preset',
  posthoc: 'bg-posthoc',
  fresh: 'bg-fresh',
}

/** Colour values for SVG visualizations, matching the CSS tokens. */
export const toneStroke: Record<Tone, string> = {
  neutral: 'var(--color-dart)',
  preset: 'var(--color-preset)',
  posthoc: 'var(--color-posthoc)',
  fresh: 'var(--color-fresh)',
}
