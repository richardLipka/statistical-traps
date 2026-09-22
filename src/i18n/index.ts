import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  DEFAULT_NAMESPACE,
  FALLBACK_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  NAMESPACES,
  isLanguage,
  resources,
  type Language,
} from '@/i18n/resources'

function readStoredLanguage(): Language | undefined {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(stored) ? stored : undefined
  } catch {
    return undefined
  }
}

export function detectInitialLanguage(): Language {
  const stored = readStoredLanguage()
  if (stored) return stored
  const preferred = typeof navigator === 'undefined' ? '' : navigator.language.toLowerCase()
  return preferred.startsWith('cs') || preferred.startsWith('sk') ? 'cs' : FALLBACK_LANGUAGE
}

void i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  defaultNS: DEFAULT_NAMESPACE,
  ns: [...NAMESPACES],
  interpolation: {
    // React already escapes everything it renders.
    escapeValue: false,
  },
})

function applyLanguageToDocument(language: string): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language
  }
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Storage is optional; the language switch works without it.
  }
}

applyLanguageToDocument(i18n.language)
i18n.on('languageChanged', applyLanguageToDocument)

export default i18n
