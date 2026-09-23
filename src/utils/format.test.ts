import { describe, expect, it } from 'vitest'
import {
  formatInteger,
  formatNumber,
  formatPValue,
  formatPValueRelation,
  formatPercent,
} from '@/utils/format'

describe('formatting numbers for the reader', () => {
  it('uses the decimal separator of the language', () => {
    expect(formatNumber(1.5, 'en', 2)).toBe('1.50')
    expect(formatNumber(1.5, 'cs', 2)).toBe('1,50')
    expect(formatPercent(0.125, 'en', 1)).toBe('12.5%')
  })

  it('never shows a negative zero', () => {
    // An average that rounds to zero has no direction, and printing one
    // would suggest a result the data do not contain.
    expect(formatNumber(-0.0016, 'en', 2)).toBe('0.00')
    expect(formatNumber(-0.0016, 'cs', 2)).toBe('0,00')
    expect(formatNumber(-0, 'en', 2)).toBe('0.00')
    // A value that survives rounding keeps its sign.
    expect(formatNumber(-0.006, 'en', 2)).toBe('-0.01')
  })

  it('floors p-values instead of rounding them to a dishonest zero', () => {
    expect(formatPValue(0.0000004, 'en')).toBe('< 0.001')
    expect(formatPValue(0.032, 'en')).toBe('0.032')
    expect(formatPValue(0.9999, 'en')).toBe('> 0.999')
    expect(formatPValueRelation(0.032, 'en')).toBe('= 0.032')
    expect(formatPValueRelation(0.0000004, 'en')).toBe('< 0.001')
  })

  it('reports nothing rather than a placeholder number for values that do not exist', () => {
    expect(formatNumber(Number.NaN, 'en')).toBe('–')
    expect(formatInteger(Number.NaN, 'en')).toBe('–')
    expect(formatPercent(Number.NaN, 'en')).toBe('–')
    expect(formatPValue(Number.NaN, 'en')).toBe('–')
    expect(formatPValueRelation(Number.NaN, 'en')).toBe('–')
  })
})
