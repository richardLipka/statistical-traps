/**
 * Translation keys built from registry data.
 *
 * Keys are type-checked against the English resources, and these three are
 * assembled at runtime from a scenario id or a concept name, so each is
 * narrowed to one existing key of the same shape.
 */
export const conceptKey = (key: string) => `concepts.${key}` as 'concepts.replication'

export const scenarioTitleKey = (id: string) =>
  `scenarios.${id}.title` as 'scenarios.01-dartboard.title'

export const scenarioSummaryKey = (id: string) =>
  `scenarios.${id}.summary` as 'scenarios.01-dartboard.summary'
