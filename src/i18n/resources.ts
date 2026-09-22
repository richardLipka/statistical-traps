import csBestline from '@/i18n/cs/bestline'
import csCommon from '@/i18n/cs/common'
import csDartboard from '@/i18n/cs/dartboard'
import enBestline from '@/i18n/en/bestline'
import enCommon from '@/i18n/en/common'
import enDartboard from '@/i18n/en/dartboard'

export const LANGUAGES = ['cs', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

export const NAMESPACES = ['common', 'dartboard', 'bestline'] as const
export type Namespace = (typeof NAMESPACES)[number]

export const DEFAULT_NAMESPACE = 'common' satisfies Namespace
export const FALLBACK_LANGUAGE = 'en' satisfies Language
export const LANGUAGE_STORAGE_KEY = 'statistical-traps.language'

/**
 * All translations live here. A scenario adds its own namespace in both
 * languages; the parity test then guarantees the two stay in step.
 */
export const resources = {
  cs: {
    common: csCommon,
    dartboard: csDartboard,
    bestline: csBestline,
  },
  en: {
    common: enCommon,
    dartboard: enDartboard,
    bestline: enBestline,
  },
} as const

export function isLanguage(value: string | undefined | null): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}
