import { describe, expect, it } from 'vitest'
import enCommon from '@/i18n/en/common'
import { findScenario, scenarios } from '@/scenarios/registry'

describe('scenario registry', () => {
  it('has unique ids in ascending order', () => {
    const ids = scenarios.map((scenario) => scenario.id)
    expect(new Set(ids).size).toBe(ids.length)
    const orders = scenarios.map((scenario) => scenario.order)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('gives every scenario a title and a summary in the common namespace', () => {
    for (const scenario of scenarios) {
      const entry = enCommon.scenarios[scenario.id as keyof typeof enCommon.scenarios]
      expect(entry, scenario.id).toBeDefined()
      expect(entry.title.length).toBeGreaterThan(0)
      expect(entry.summary.length).toBeGreaterThan(0)
    }
  })

  it('uses only known concept keys', () => {
    for (const scenario of scenarios) {
      for (const key of scenario.conceptKeys) {
        expect(Object.keys(enCommon.concepts), `${scenario.id}: ${key}`).toContain(key)
      }
    }
  })

  it('points every scenario at its documentation file', () => {
    for (const scenario of scenarios) {
      expect(scenario.docs).toBe(`docs/scenarios/${scenario.id}.md`)
    }
  })

  it('gives available scenarios a component and planned ones none', () => {
    for (const scenario of scenarios) {
      if (scenario.status === 'available') {
        expect(typeof scenario.component, scenario.id).toBe('function')
      } else {
        expect(scenario.component, scenario.id).toBeUndefined()
      }
    }
  })

  it('lists the scenarios implemented so far', () => {
    expect(scenarios.filter((scenario) => scenario.status === 'available').map((s) => s.id)).toEqual([
      '01-dartboard',
      '02-best-line',
      '03-interesting-region',
    ])
  })

  it('finds scenarios by id', () => {
    expect(findScenario('01-dartboard')?.order).toBe(1)
    expect(findScenario('nope')).toBeUndefined()
  })
})
