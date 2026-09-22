/**
 * Locale-aware formatting. Czech uses a decimal comma, so every number shown
 * to the user goes through here rather than through toFixed().
 */

export function formatNumber(value: number, locale: string, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return '–'
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

export function formatInteger(value: number, locale: string): string {
  if (!Number.isFinite(value)) return '–'
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
}

export function formatPercent(value: number, locale: string, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return '–'
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

/**
 * p-values are shown with three decimals, with a floor rather than a rounded
 * zero: "< 0.001" is honest, "0.000" is not.
 */
export function formatPValue(value: number, locale: string): string {
  if (!Number.isFinite(value)) return '–'
  if (value < 0.001) return `< ${formatNumber(0.001, locale, 3)}`
  if (value > 0.999) return `> ${formatNumber(0.999, locale, 3)}`
  return formatNumber(value, locale, 3)
}

/**
 * p-value carrying its comparison symbol, for use after a bare "p":
 * "= 0.032" or "< 0.001". The symbols are the same in both languages.
 */
export function formatPValueRelation(value: number, locale: string): string {
  const text = formatPValue(value, locale)
  return text.startsWith('<') || text.startsWith('>') || text === '–' ? text : `= ${text}`
}
