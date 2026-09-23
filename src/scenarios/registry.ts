import DartboardScenario from '@/scenarios/01-dartboard/Scenario'
import BestLineScenario from '@/scenarios/02-best-line/Scenario'
import InterestingRegionScenario from '@/scenarios/03-interesting-region/Scenario'
import DoctorMortalityScenario from '@/scenarios/04-doctor-mortality/Scenario'
import MiracleDrugScenario from '@/scenarios/05-miracle-drug/Scenario'
import AiSynthesisScenario from '@/scenarios/07-ai-synthesis/Scenario'
import MysteriousCorrelationScenario from '@/scenarios/06-mysterious-correlation/Scenario'
import type { ScenarioDefinition } from '@/scenarios/types'

/**
 * The single place that knows which scenarios exist.
 *
 * Adding a scenario means: create its directory, implement its component,
 * add its localization namespace, write its documentation, and add one entry
 * here. Nothing else in the application needs to change.
 */
export const scenarios: readonly ScenarioDefinition[] = [
  {
    id: '01-dartboard',
    order: 1,
    status: 'available',
    titleKey: 'scenarios.01-dartboard.title',
    summaryKey: 'scenarios.01-dartboard.summary',
    conceptKeys: ['postHocHypothesis', 'exploratoryAnalysis', 'confirmation', 'replication'],
    namespace: 'dartboard',
    docs: 'docs/scenarios/01-dartboard.md',
    component: DartboardScenario,
  },
  {
    id: '02-best-line',
    order: 2,
    status: 'available',
    titleKey: 'scenarios.02-best-line.title',
    summaryKey: 'scenarios.02-best-line.summary',
    conceptKeys: ['overfitting', 'modelSelection', 'trainingData', 'testData', 'generalization'],
    namespace: 'bestline',
    docs: 'docs/scenarios/02-best-line.md',
    component: BestLineScenario,
  },
  {
    id: '03-interesting-region',
    order: 3,
    status: 'available',
    titleKey: 'scenarios.03-interesting-region.title',
    summaryKey: 'scenarios.03-interesting-region.summary',
    conceptKeys: [
      'multipleComparisons',
      'researcherDegreesOfFreedom',
      'falseDiscoveries',
      'selection',
    ],
    namespace: 'interestingregion',
    docs: 'docs/scenarios/03-interesting-region.md',
    component: InterestingRegionScenario,
  },
  {
    id: '04-doctor-mortality',
    order: 4,
    status: 'available',
    titleKey: 'scenarios.04-doctor-mortality.title',
    summaryKey: 'scenarios.04-doctor-mortality.summary',
    conceptKeys: [
      'multipleComparisons',
      'extremeValues',
      'confounding',
      'riskAdjustment',
      'investigationVersusProof',
    ],
    namespace: 'doctormortality',
    docs: 'docs/scenarios/04-doctor-mortality.md',
    component: DoctorMortalityScenario,
  },
  {
    id: '05-miracle-drug',
    order: 5,
    status: 'available',
    titleKey: 'scenarios.05-miracle-drug.title',
    summaryKey: 'scenarios.05-miracle-drug.summary',
    conceptKeys: [
      'multipleTesting',
      'falsePositives',
      'independentReplication',
      'pValueInterpretation',
    ],
    namespace: 'miracledrug',
    docs: 'docs/scenarios/05-miracle-drug.md',
    component: MiracleDrugScenario,
  },
  {
    id: '06-mysterious-correlation',
    order: 6,
    status: 'available',
    titleKey: 'scenarios.06-mysterious-correlation.title',
    summaryKey: 'scenarios.06-mysterious-correlation.summary',
    conceptKeys: [
      'dataMining',
      'correlation',
      'multipleComparisons',
      'replication',
      'predictionVersusExplanation',
    ],
    namespace: 'mysteriouscorrelation',
    docs: 'docs/scenarios/06-mysterious-correlation.md',
    component: MysteriousCorrelationScenario,
  },
  {
    id: '07-ai-synthesis',
    order: 7,
    status: 'available',
    titleKey: 'scenarios.07-ai-synthesis.title',
    summaryKey: 'scenarios.07-ai-synthesis.summary',
    conceptKeys: [
      'patternDiscovery',
      'hypothesisGeneration',
      'generalization',
      'causalInference',
      'independentReplication',
    ],
    namespace: 'aisynthesis',
    docs: 'docs/scenarios/07-ai-synthesis.md',
    component: AiSynthesisScenario,
  },
]

export function findScenario(id: string): ScenarioDefinition | undefined {
  return scenarios.find((scenario) => scenario.id === id)
}
