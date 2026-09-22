import type bestline from '@/i18n/en/bestline'
import type common from '@/i18n/en/common'
import type doctormortality from '@/i18n/en/doctormortality'
import type dartboard from '@/i18n/en/dartboard'
import type interestingregion from '@/i18n/en/interestingregion'

/**
 * Makes translation keys type-checked: a typo in t('...') fails the build.
 * English is the reference set; the parity test checks that Czech matches it.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      dartboard: typeof dartboard
      bestline: typeof bestline
      interestingregion: typeof interestingregion
      doctormortality: typeof doctormortality
    }
  }
}
