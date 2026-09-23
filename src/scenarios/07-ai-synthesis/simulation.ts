import { createRng, deriveSeed } from '@/statistics/random/rng'
import {
  CONNECTED_FEATURE,
  FEATURE_LOADING,
  OUTCOME_LOADING,
} from '@/scenarios/07-ai-synthesis/model'

export interface Study {
  candidateCount: number
  rowCount: number
  /** features[candidate][row] — what the system is allowed to see. */
  features: number[][]
  /** What it is asked to predict. */
  outcome: number[]
  /**
   * The common cause. Present in the simulation and absent from the table,
   * exactly as a cause nobody measured is absent from real data.
   */
  hidden: number[]
}

/**
 * True data-generating process of this scenario.
 *
 *   hidden_i    ~ Normal(0, 1)                                unmeasured
 *   outcome_i   = OUTCOME_LOADING · hidden_i + noise
 *   feature_0_i = FEATURE_LOADING · hidden_i + noise          the connected one
 *   feature_j_i ~ Normal(0, 1)                                everything else
 *
 * Two facts matter, and they pull in opposite directions.
 *
 * The connected feature genuinely predicts the outcome - their correlation
 * is real, it is not an artefact of the search, and it holds in data nobody
 * has seen. Every other feature is unrelated to the outcome entirely.
 *
 * And nothing in the table causes anything. The outcome depends on the
 * hidden variable alone, so changing a feature changes nothing at all. The
 * connected feature predicts because it shares a cause with the outcome,
 * which is the difference between knowing and doing.
 */
export function generateStudy(options: {
  candidateCount: number
  rowCount: number
  seed: number
}): Study {
  const { candidateCount, rowCount, seed } = options
  const rng = createRng(seed)
  const outcomeUnique = Math.sqrt(1 - OUTCOME_LOADING * OUTCOME_LOADING)
  const featureUnique = Math.sqrt(1 - FEATURE_LOADING * FEATURE_LOADING)

  const hidden = new Array<number>(rowCount)
  const outcome = new Array<number>(rowCount)
  const features: number[][] = Array.from({ length: candidateCount }, () =>
    new Array<number>(rowCount),
  )

  for (let row = 0; row < rowCount; row += 1) {
    const cause = rng.normal(0, 1)
    hidden[row] = cause
    outcome[row] = OUTCOME_LOADING * cause + outcomeUnique * rng.normal(0, 1)
    for (let candidate = 0; candidate < candidateCount; candidate += 1) {
      features[candidate][row] =
        candidate === CONNECTED_FEATURE
          ? FEATURE_LOADING * cause + featureUnique * rng.normal(0, 1)
          : rng.normal(0, 1)
    }
  }

  return { candidateCount, rowCount, features, outcome, hidden }
}

/**
 * The same world, except that we set one feature ourselves.
 *
 * The hidden cause and the outcome are generated exactly as before; the
 * chosen feature is then overwritten with values drawn independently of
 * everything else, which severs the link between it and the hidden cause.
 * That is an intervention, and it is only possible here because we wrote
 * the world. In data somebody merely collected, this is the experiment
 * that has not been run.
 */
export function interveneOnFeature(study: Study, candidate: number, seed: number): Study {
  const rng = createRng(seed)
  const features = study.features.map((values, index) =>
    index === candidate ? values.map(() => rng.normal(0, 1)) : [...values],
  )
  return { ...study, features }
}

/** Seed roles, kept apart so exploration data is never reused for validation. */
export const SEED_ROLE = {
  observed: 0,
  selectionNull: 9_000_071,
  validation: 3_000_089,
  freshStudy: 6_000_073,
  intervention: 1_000_081,
} as const

export function replicationSeed(baseSeed: number, role: number, index: number): number {
  return deriveSeed(baseSeed + role, index + 1)
}

/** Another study of the same design: new cases, same world. */
export function generateReplicationStudy(options: {
  candidateCount: number
  rowCount: number
  baseSeed: number
  role: number
  index: number
}): Study {
  const { candidateCount, rowCount, baseSeed, role, index } = options
  return generateStudy({
    candidateCount,
    rowCount,
    seed: replicationSeed(baseSeed, role, index),
  })
}
