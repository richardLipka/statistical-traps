import { describe, expect, it } from 'vitest'
import { binValues, mean } from '@/statistics/monteCarlo'
import { ALPHA, HOSPITAL_DEFAULTS, preRegisteredDoctor } from '@/scenarios/04-doctor-mortality/model'
import {
  SEED_ROLE,
  generateHospital,
  generateSeverities,
} from '@/scenarios/04-doctor-mortality/simulation'
import {
  collectNullEvidence,
  evaluateDoctor,
  evaluateHospital,
  replicateOnFreshData,
  selectionNullHospital,
  simulateSelectionNull,
  worstByAdjusted,
  worstByRate,
} from '@/scenarios/04-doctor-mortality/analysis'

const { doctorCount, patientsPerDoctor, seed } = HOSPITAL_DEFAULTS
const severities = generateSeverities(doctorCount, seed)
const hospital = generateHospital({ severities, patientsPerDoctor, seed })
const results = evaluateHospital(hospital)
const auditedIndex = preRegisteredDoctor(doctorCount)

describe('judging one doctor', () => {
  it('compares them both with the hospital and with their own patients', () => {
    const result = evaluateDoctor(hospital, 3)
    const doctor = hospital.doctors[3]
    expect(result.deaths).toBe(doctor.deathCount)
    expect(result.rate).toBeCloseTo(doctor.deathCount / patientsPerDoctor, 12)
    expect(result.raw.nullProbability).toBeCloseTo(hospital.overallRate, 12)
    expect(result.adjusted.expected).toBeCloseTo(
      doctor.risks.reduce((a, b) => a + b, 0),
      12,
    )
    expect(result.meanRisk).toBeCloseTo(mean(doctor.risks), 12)
  })

  it('finds nothing in the doctor named in advance', () => {
    expect(results[auditedIndex].adjusted.pValue).toBeGreaterThan(ALPHA)
    expect(results[auditedIndex].raw.pValue).toBeGreaterThan(ALPHA)
  })
})

describe('searching the league table', () => {
  const flagged = results[worstByAdjusted(results)]

  it('turns a hospital of identical doctors into a striking finding', () => {
    expect(flagged.raw.pValue).toBeLessThan(0.01)
    expect(flagged.adjusted.pValue).toBeLessThan(ALPHA)
    expect(flagged.rate).toBeGreaterThan(hospital.overallRate * 1.5)
  })

  it('shows that part of the excess is case mix rather than the doctor', () => {
    const hospitalMeanRisk = mean(results.map((result) => result.meanRisk))
    // This doctor's patients really were sicker than average ...
    expect(flagged.meanRisk).toBeGreaterThan(hospitalMeanRisk)
    // ... so adjusting for who they were treating weakens the result.
    expect(flagged.adjusted.pValue).toBeGreaterThan(flagged.raw.pValue)
  })

  it('returns the most extreme doctor by each ordering', () => {
    const byRate = worstByRate(results)
    const byAdjusted = worstByAdjusted(results)
    for (const result of results) {
      expect(result.rate).toBeLessThanOrEqual(results[byRate].rate)
      expect(result.adjusted.pValue).toBeGreaterThanOrEqual(results[byAdjusted].adjusted.pValue)
    }
  })

  it('finds an alarming doctor in most hospitals where no doctor differs', () => {
    let significant = 0
    const years = 30
    for (let index = 0; index < years; index += 1) {
      const year = generateHospital({ severities, patientsPerDoctor, seed: 500_000 + index * 977 })
      const worst = evaluateHospital(year)
      if (worst[worstByAdjusted(worst)].adjusted.pValue < ALPHA) significant += 1
    }
    // A single pre-specified doctor would be here about 5% of the time.
    expect(significant / years).toBeGreaterThan(0.5)
  })
})

describe('correcting for the search', () => {
  const flagged = results[worstByAdjusted(results)]
  const selection = simulateSelectionNull({
    severities,
    patientsPerDoctor,
    baseSeed: seed,
    replications: 150,
    observedPValue: flagged.adjusted.pValue,
  })

  it('measures the flagged doctor against the distribution of worst doctors', () => {
    expect(selection.adjusted.pValue).toBeGreaterThan(flagged.adjusted.pValue * 10)
    expect(selection.adjusted.pValue).toBeGreaterThan(ALPHA)
  })

  it('shows how often the search alone flags somebody', () => {
    expect(selection.shareSignificant).toBeGreaterThan(0.5)
  })

  it('collects a gallery of the most alarming simulated doctors', () => {
    expect(selection.topSearches).toHaveLength(5)
    const pValues = selection.topSearches.map((search) => search.pValue)
    expect(pValues).toEqual([...pValues].sort((a, b) => a - b))
    for (const search of selection.topSearches) {
      expect(search.pValue).toBeLessThan(ALPHA)
      expect(search.ratio).toBeGreaterThan(1)
    }
  })

  it('can redraw a simulated year from its replication index alone', () => {
    for (const search of selection.topSearches) {
      const redrawn = selectionNullHospital({
        severities,
        patientsPerDoctor,
        baseSeed: seed,
        index: search.index,
      })
      const repeated = evaluateDoctor(redrawn, search.doctorIndex)
      expect(repeated.deaths).toBe(search.deaths)
      expect(repeated.adjusted.pValue).toBeCloseTo(search.pValue, 12)
    }
  })
})

describe('validating on later years', () => {
  const flaggedIndex = worstByAdjusted(results)
  const summary = replicateOnFreshData({
    severities,
    patientsPerDoctor,
    baseSeed: seed,
    replications: 200,
    preRegistered: auditedIndex,
    flagged: flaggedIndex,
  })

  it('brings the flagged doctor back to an ordinary ratio', () => {
    expect(summary.flagged.meanRatio).toBeGreaterThan(0.85)
    expect(summary.flagged.meanRatio).toBeLessThan(1.15)
    expect(results[flaggedIndex].adjusted.ratio).toBeGreaterThan(1.4)
  })

  it('puts both doctors at about the nominal error rate', () => {
    for (const stats of [summary.preRegistered, summary.flagged]) {
      expect(stats.shareSignificant).toBeGreaterThan(0.005)
      expect(stats.shareSignificant).toBeLessThan(0.12)
    }
  })

  it('shows next year’s worst doctor being somebody else', () => {
    expect(summary.shareDifferentDoctor).toBeGreaterThan(0.7)
  })

  it('validates on years that took no part in the search', () => {
    // The flagged doctor is extreme in the year that selected them ...
    expect(results[flaggedIndex].adjusted.pValue).toBeLessThan(ALPHA)
    // ... and indistinguishable from the audited one afterwards.
    expect(
      Math.abs(summary.flagged.meanRatio - summary.preRegistered.meanRatio),
    ).toBeLessThan(0.2)
  })
})

/**
 * The closing panel claims the generator holds nothing. These assert the
 * property the claim rests on rather than one seed's exact number: a valid
 * test of a true null spreads its p-values evenly, so no tenth of the range
 * is favoured and the share below alpha sits near alpha.
 */
describe('null evidence', () => {
  const REPLICATIONS = 400

  it('produces p-values that are spread evenly', () => {
    const result = collectNullEvidence({
      severities: generateSeverities(
        HOSPITAL_DEFAULTS.doctorCount,
        HOSPITAL_DEFAULTS.seed,
      ),
      patientsPerDoctor: HOSPITAL_DEFAULTS.patientsPerDoctor,
      baseSeed: HOSPITAL_DEFAULTS.seed,
      replications: REPLICATIONS,
      doctor: preRegisteredDoctor(HOSPITAL_DEFAULTS.doctorCount),
    })

    expect(result.pValues).toHaveLength(REPLICATIONS)
    for (const pValue of result.pValues) {
      expect(pValue).toBeGreaterThanOrEqual(0)
      expect(pValue).toBeLessThanOrEqual(1)
    }
    expect(result.shareSignificant).toBeGreaterThan(0.01)
    expect(result.shareSignificant).toBeLessThan(0.1)

    const bins = binValues(result.pValues, 10, { min: 0, max: 1 })
    const counts = bins.map((bin) => bin.count)
    // Even coverage: no tenth of the range is empty, and none holds a fifth
    // of everything. Both would show up long before the histogram looked flat.
    for (const count of counts) {
      expect(count).toBeGreaterThan(0)
      expect(count).toBeLessThan(REPLICATIONS / 5)
    }
  })

  it('draws data no other role has used', () => {
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.validation)
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.selectionNull)
    expect(SEED_ROLE.nullEvidence).not.toBe(SEED_ROLE.observed)
  })
})
