import type { ComponentType } from 'react'
import type { Namespace } from '@/i18n/resources'

/**
 * The conceptual lifecycle shared by every scenario. A scenario does not have
 * to show these as separate pages - it must only make the sequence legible:
 * what was generated, what we did with it, what we found, why it looks
 * convincing, and what happens when it is tested properly.
 */
export const SCENARIO_STAGES = [
  'introduction',
  'experiment',
  'observation',
  'analysis',
  'validation',
  'conclusion',
] as const

export type ScenarioStage = (typeof SCENARIO_STAGES)[number]

export type ScenarioStatus = 'available' | 'planned'

export interface ScenarioMeta {
  /** Directory name and route segment, e.g. "01-dartboard". */
  id: string
  order: number
  status: ScenarioStatus
  /** Key in the common namespace: scenarios.<id>.title */
  titleKey: string
  summaryKey: string
  /** Keys in the common namespace: concepts.<key> */
  conceptKeys: readonly string[]
  /** Namespace holding this scenario's own strings. */
  namespace?: Namespace
  /** Path of the scenario's documentation file. */
  docs: string
}

export interface AvailableScenario extends ScenarioMeta {
  status: 'available'
  component: ComponentType
}

export interface PlannedScenario extends ScenarioMeta {
  status: 'planned'
  component?: undefined
}

export type ScenarioDefinition = AvailableScenario | PlannedScenario
