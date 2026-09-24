import { binomialTestGreater, type BinomialTestResult } from '@/statistics/hypothesis/binomialTest'
import { riskAdjustedTest, type RiskAdjustedTestResult } from '@/statistics/hypothesis/riskAdjustedTest'
import {
  empiricalPValueLessOrEqual,
  mean,
  shareOf,
  type EmpiricalPValue,
} from '@/statistics/monteCarlo'
import { ALPHA } from '@/scenarios/04-doctor-mortality/model'
import {
  SEED_ROLE,
  generateReplicationHospital,
  type Hospital,
} from '@/scenarios/04-doctor-mortality/simulation'

export interface DoctorResult {
  index: number
  deaths: number
  patients: number
  /** Deaths per patient, the number a league table would show. */
  rate: number
  /** Average true risk of this doctor's patients: their case mix. */
  meanRisk: number
  /**
   * The comparison that ignores case mix: this doctor's deaths against the
   * hospital's overall rate, as though every patient were the same.
   */
  raw: BinomialTestResult
  /** The comparison against what this doctor's own patients were expected to have. */
  adjusted: RiskAdjustedTestResult
}

export function evaluateDoctor(hospital: Hospital, index: number): DoctorResult {
  const doctor = hospital.doctors[index]
  const patients = doctor.risks.length
  return {
    index,
    deaths: doctor.deathCount,
    patients,
    rate: patients > 0 ? doctor.deathCount / patients : Number.NaN,
    meanRisk: mean(doctor.risks),
    raw: binomialTestGreater(doctor.deathCount, patients, hospital.overallRate),
    adjusted: riskAdjustedTest(doctor.deathCount, doctor.risks),
  }
}

export function evaluateHospital(hospital: Hospital): DoctorResult[] {
  return hospital.doctors.map((doctor) => evaluateDoctor(hospital, doctor.index))
}

/** The doctor a league table of raw mortality puts at the bottom. */
export function worstByRate(results: readonly DoctorResult[]): number {
  let worst = results[0]
  for (const result of results) {
    if (result.rate > worst.rate) worst = result
  }
  return worst?.index ?? 0
}

/** The doctor who looks worst once their patients' risks are accounted for. */
export function worstByAdjusted(results: readonly DoctorResult[]): number {
  let worst = results[0]
  for (const result of results) {
    if (result.adjusted.pValue < worst.adjusted.pValue) worst = result
  }
  return worst?.index ?? 0
}

/** One simulated run of the whole procedure on a hospital where no doctor differs. */
export interface SelectionSearchResult {
  index: number
  doctorIndex: number
  deaths: number
  expected: number
  ratio: number
  pValue: number
}

export const SELECTION_GALLERY_SIZE = 5

export function selectionNullHospital(options: {
  severities: readonly number[]
  patientsPerDoctor: number
  baseSeed: number
  index: number
}): Hospital {
  const { severities, patientsPerDoctor, baseSeed, index } = options
  return generateReplicationHospital({
    severities,
    patientsPerDoctor,
    baseSeed,
    role: SEED_ROLE.selectionNull,
    index,
  })
}

export function selectionNullReplication(options: {
  severities: readonly number[]
  patientsPerDoctor: number
  baseSeed: number
  index: number
}): SelectionSearchResult {
  const { index } = options
  const hospital = selectionNullHospital(options)
  const results = evaluateHospital(hospital)
  const worst = results[worstByAdjusted(results)]
  return {
    index,
    doctorIndex: worst.index,
    deaths: worst.deaths,
    expected: worst.adjusted.expected,
    ratio: worst.adjusted.ratio,
    pValue: worst.adjusted.pValue,
  }
}

export interface SelectionNullResult {
  searches: SelectionSearchResult[]
  pValues: number[]
  /** How often the search alone flagged some doctor in a hospital with no bad doctor. */
  shareSignificant: number
  adjusted: EmpiricalPValue
  observedPValue: number
  topSearches: SelectionSearchResult[]
}


export interface NullEvidenceResult {
  replications: number
  /** One p-value of the pre-registered test per independent data set. */
  pValues: number[]
  shareSignificant: number
}

/**
 * Closing evidence that the generator really does contain nothing to find.
 *
 * The analysis fixed before the data is run on many independent data sets,
 * none of which took part in choosing anything. A valid test of a true null
 * spreads its p-values evenly over the whole interval, so the histogram is
 * flat and the share below alpha lands near alpha. That flat picture is the
 * scenario's opening claim made checkable.
 */
export function collectNullEvidence(options: {
  severities: readonly number[]
  patientsPerDoctor: number
  baseSeed: number
  replications: number
  doctor: number
  alpha?: number
}): NullEvidenceResult {
  const { severities, patientsPerDoctor, baseSeed, replications, doctor, alpha = ALPHA } = options
  const pValues: number[] = []
  for (let index = 0; index < replications; index += 1) {
    const hospital = generateReplicationHospital({
      severities,
      patientsPerDoctor,
      baseSeed,
      role: SEED_ROLE.nullEvidence,
      index,
    })
    pValues.push(evaluateDoctor(hospital, doctor).adjusted.pValue)
  }
  return {
    replications,
    pValues,
    shareSignificant: shareOf(pValues, (value) => value < alpha),
  }
}

export function summarizeSelectionNull(
  searches: SelectionSearchResult[],
  observedPValue: number,
): SelectionNullResult {
  const pValues = searches.map((search) => search.pValue)
  const topSearches = [...searches]
    .sort((a, b) => a.pValue - b.pValue || a.index - b.index)
    .slice(0, SELECTION_GALLERY_SIZE)
  return {
    searches,
    pValues,
    shareSignificant: shareOf(pValues, (value) => value < ALPHA),
    // Small p-values are the extreme ones here.
    adjusted: empiricalPValueLessOrEqual(observedPValue, pValues),
    observedPValue,
    topSearches,
  }
}

export function simulateSelectionNull(options: {
  severities: readonly number[]
  patientsPerDoctor: number
  baseSeed: number
  replications: number
  observedPValue: number
}): SelectionNullResult {
  const { replications, observedPValue, ...rest } = options
  const searches: SelectionSearchResult[] = []
  for (let index = 0; index < replications; index += 1) {
    searches.push(selectionNullReplication({ ...rest, index }))
  }
  return summarizeSelectionNull(searches, observedPValue)
}

export interface DoctorReplicationStats {
  /** Average observed-over-expected across independent years. */
  meanRatio: number
  meanRate: number
  /** Share of years in which this doctor would have been flagged. */
  shareSignificant: number
}

export interface ReplicationSummary {
  replications: number
  preRegistered: DoctorReplicationStats
  flagged: DoctorReplicationStats
  /** How often next year's worst doctor is somebody else entirely. */
  shareDifferentDoctor: number
}

function summarize(ratios: number[], rates: number[], pValues: number[]): DoctorReplicationStats {
  return {
    meanRatio: mean(ratios),
    meanRate: mean(rates),
    shareSignificant: shareOf(pValues, (value) => value < ALPHA),
  }
}

/**
 * Validation: the same two doctors are followed into years that took no part
 * in singling either of them out.
 *
 * Both are then in the same position - a doctor named before the year began -
 * and both behave accordingly.
 */
export function replicateOnFreshData(options: {
  severities: readonly number[]
  patientsPerDoctor: number
  baseSeed: number
  replications: number
  preRegistered: number
  flagged: number
}): ReplicationSummary {
  const { severities, patientsPerDoctor, baseSeed, replications, preRegistered, flagged } = options
  const collected = {
    preRegistered: { ratios: [] as number[], rates: [] as number[], pValues: [] as number[] },
    flagged: { ratios: [] as number[], rates: [] as number[], pValues: [] as number[] },
  }
  let differentDoctor = 0

  for (let index = 0; index < replications; index += 1) {
    const hospital = generateReplicationHospital({
      severities,
      patientsPerDoctor,
      baseSeed,
      role: SEED_ROLE.validation,
      index,
    })
    const results = evaluateHospital(hospital)
    for (const [key, doctorIndex] of [
      ['preRegistered', preRegistered],
      ['flagged', flagged],
    ] as const) {
      const result = results[doctorIndex]
      collected[key].ratios.push(result.adjusted.ratio)
      collected[key].rates.push(result.rate)
      collected[key].pValues.push(result.adjusted.pValue)
    }
    if (worstByAdjusted(results) !== flagged) differentDoctor += 1
  }

  return {
    replications,
    preRegistered: summarize(
      collected.preRegistered.ratios,
      collected.preRegistered.rates,
      collected.preRegistered.pValues,
    ),
    flagged: summarize(
      collected.flagged.ratios,
      collected.flagged.rates,
      collected.flagged.pValues,
    ),
    shareDifferentDoctor: replications > 0 ? differentDoctor / replications : Number.NaN,
  }
}
