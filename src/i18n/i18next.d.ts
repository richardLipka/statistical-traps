import type bestline from '@/i18n/en/bestline'
import type common from '@/i18n/en/common'
import type dartboard from '@/i18n/en/dartboard'

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
    }
  }
}
