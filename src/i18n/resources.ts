import csBestline from '@/i18n/cs/bestline'
import csCommon from '@/i18n/cs/common'
import csDoctorMortality from '@/i18n/cs/doctormortality'
import csMiracleDrug from '@/i18n/cs/miracledrug'
import csAiSynthesis from '@/i18n/cs/aisynthesis'
import csMysteriousCorrelation from '@/i18n/cs/mysteriouscorrelation'
import csDartboard from '@/i18n/cs/dartboard'
import csInterestingRegion from '@/i18n/cs/interestingregion'
import enBestline from '@/i18n/en/bestline'
import enCommon from '@/i18n/en/common'
import enDoctorMortality from '@/i18n/en/doctormortality'
import enMiracleDrug from '@/i18n/en/miracledrug'
import enAiSynthesis from '@/i18n/en/aisynthesis'
import enMysteriousCorrelation from '@/i18n/en/mysteriouscorrelation'
import enDartboard from '@/i18n/en/dartboard'
import enInterestingRegion from '@/i18n/en/interestingregion'

export const LANGUAGES = ['cs', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

export const NAMESPACES = ['common', 'dartboard', 'bestline', 'interestingregion', 'doctormortality', 'miracledrug', 'mysteriouscorrelation', 'aisynthesis'] as const
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
    interestingregion: csInterestingRegion,
    doctormortality: csDoctorMortality,
    miracledrug: csMiracleDrug,
    mysteriouscorrelation: csMysteriousCorrelation,
    aisynthesis: csAiSynthesis,
  },
  en: {
    common: enCommon,
    dartboard: enDartboard,
    bestline: enBestline,
    interestingregion: enInterestingRegion,
    doctormortality: enDoctorMortality,
    miracledrug: enMiracleDrug,
    mysteriouscorrelation: enMysteriousCorrelation,
    aisynthesis: enAiSynthesis,
  },
} as const

export function isLanguage(value: string | undefined | null): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value)
}
