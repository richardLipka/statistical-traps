import { describe, expect, it } from 'vitest'
import { LANGUAGES, NAMESPACES, resources } from '@/i18n/resources'

type Translations = Record<string, unknown>

function flatten(value: Translations, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      return flatten(entry as Translations, path)
    }
    return [path]
  })
}

function keysOf(language: (typeof LANGUAGES)[number], namespace: (typeof NAMESPACES)[number]): string[] {
  return flatten(resources[language][namespace] as Translations).sort()
}

describe('localization', () => {
  it.each(NAMESPACES)('namespace "%s" has the same keys in Czech and English', (namespace) => {
    const cs = keysOf('cs', namespace)
    const en = keysOf('en', namespace)

    expect(cs.filter((key) => !en.includes(key))).toEqual([])
    expect(en.filter((key) => !cs.includes(key))).toEqual([])
  })

  it.each(NAMESPACES)('namespace "%s" has no empty strings', (namespace) => {
    for (const language of LANGUAGES) {
      const entries = flatten(resources[language][namespace] as Translations)
      for (const key of entries) {
        const value = key
          .split('.')
          .reduce<unknown>(
            (node, part) => (node as Record<string, unknown>)[part],
            resources[language][namespace],
          )
        expect(typeof value, `${language}:${namespace}:${key}`).toBe('string')
        expect((value as string).trim().length, `${language}:${namespace}:${key}`).toBeGreaterThan(0)
      }
    }
  })

  it('keeps interpolation placeholders identical across languages', () => {
    for (const namespace of NAMESPACES) {
      for (const key of keysOf('en', namespace)) {
        const read = (language: (typeof LANGUAGES)[number]) =>
          key
            .split('.')
            .reduce<unknown>(
              (node, part) => (node as Record<string, unknown>)[part],
              resources[language][namespace],
            ) as string

        const placeholders = (text: string) => (text.match(/{{\s*\w+\s*}}/g) ?? []).sort()
        expect(placeholders(read('cs')), `${namespace}:${key}`).toEqual(placeholders(read('en')))
      }
    }
  })
})
