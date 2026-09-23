import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExplanationPanel } from '@/components/ExplanationPanel'
import { ReplicationPanel } from '@/components/ReplicationPanel'
import { ResultTable } from '@/components/ResultTable'
import { ScenarioShell } from '@/components/ScenarioShell'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatTile } from '@/components/ui/StatTile'
import { binIndexOf, binValues, mean } from '@/statistics/monteCarlo'
import { randomSeed } from '@/statistics/random/rng'
import { Histogram } from '@/visualization/Histogram'
import { SCENARIO_STAGES, type ScenarioStage } from '@/scenarios/types'
import { runChunked } from '@/utils/chunked'
import {
  formatInteger,
  formatNumber,
  formatPValue,
  formatPValueRelation,
  formatPercent,
} from '@/utils/format'
import {
  ALPHA,
  HOSPITAL_DEFAULTS,
  doctorNumber,
  preRegisteredDoctor,
} from '@/scenarios/04-doctor-mortality/model'
import {
  SEED_ROLE,
  generateHospital,
  generateReplicationHospital,
  generateSeverities,
} from '@/scenarios/04-doctor-mortality/simulation'
import {
  evaluateHospital,
  replicateOnFreshData,
  selectionNullReplication,
  summarizeSelectionNull,
  worstByAdjusted,
  type ReplicationSummary,
  type SelectionSearchResult,
} from '@/scenarios/04-doctor-mortality/analysis'
import {
  DoctorChart,
  type DoctorHighlight,
} from '@/scenarios/04-doctor-mortality/components/DoctorChart'
import { SearchGallery } from '@/scenarios/04-doctor-mortality/components/SearchGallery'
import {
  HospitalControls,
  type HospitalParams,
} from '@/scenarios/04-doctor-mortality/components/HospitalControls'

const SELECTION_REPLICATIONS = 300
const VALIDATION_REPLICATIONS = 200
const HISTOGRAM_BINS = 20

export default function DoctorMortalityScenario() {
  const { t } = useTranslation('doctormortality')
  const { t: tc, i18n } = useTranslation('common')
  const locale = i18n.language

  const [stage, setStage] = useState<ScenarioStage>('introduction')
  const [reached, setReached] = useState<ScenarioStage[]>(['introduction'])
  const [params, setParams] = useState<HospitalParams>({
    doctorCount: HOSPITAL_DEFAULTS.doctorCount,
    patientsPerDoctor: HOSPITAL_DEFAULTS.patientsPerDoctor,
    seed: HOSPITAL_DEFAULTS.seed,
  })
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [usedSearch, setUsedSearch] = useState(false)
  const [selectionSearches, setSelectionSearches] = useState<SelectionSearchResult[] | null>(null)
  const [selectionProgress, setSelectionProgress] = useState<number | null>(null)
  const [freshIndex, setFreshIndex] = useState(0)
  const [replication, setReplication] = useState<ReplicationSummary | null>(null)
  const cancelSelection = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelSelection.current?.(), [])

  const severities = useMemo(
    () => generateSeverities(params.doctorCount, params.seed),
    [params.doctorCount, params.seed],
  )
  const hospital = useMemo(
    () =>
      generateHospital({
        severities,
        patientsPerDoctor: params.patientsPerDoctor,
        seed: params.seed,
      }),
    [severities, params.patientsPerDoctor, params.seed],
  )
  const results = useMemo(() => evaluateHospital(hospital), [hospital])
  const hospitalMeanRisk = useMemo(
    () => mean(results.map((result) => result.meanRisk)),
    [results],
  )

  const auditedIndex = preRegisteredDoctor(params.doctorCount)
  const audited = results[auditedIndex]
  const flaggedIndex = selectedDoctor ?? auditedIndex
  const flagged = results[flaggedIndex]

  const selection = useMemo(
    () =>
      selectionSearches
        ? summarizeSelectionNull(selectionSearches, flagged.adjusted.pValue)
        : null,
    [selectionSearches, flagged.adjusted.pValue],
  )
  const selectionBins = useMemo(
    () => (selection ? binValues(selection.pValues, HISTOGRAM_BINS) : []),
    [selection],
  )

  const freshHospital = useMemo(
    () =>
      freshIndex === 0
        ? null
        : generateReplicationHospital({
            severities,
            patientsPerDoctor: params.patientsPerDoctor,
            baseSeed: params.seed,
            role: SEED_ROLE.freshYear,
            index: freshIndex - 1,
          }),
    [freshIndex, severities, params.patientsPerDoctor, params.seed],
  )
  const freshResults = useMemo(
    () => (freshHospital ? evaluateHospital(freshHospital) : null),
    [freshHospital],
  )

  const goTo = useCallback((next: ScenarioStage) => {
    if (next === 'validation') setFreshIndex((index) => (index === 0 ? 1 : index))
    setStage(next)
    setReached((previous) => (previous.includes(next) ? previous : [...previous, next]))
  }, [])

  const invalidateResults = useCallback(() => {
    cancelSelection.current?.()
    cancelSelection.current = null
    setSelectionSearches(null)
    setSelectionProgress(null)
    setReplication(null)
    setFreshIndex(0)
  }, [])

  const updateParams = useCallback(
    (partial: Partial<HospitalParams>) => {
      setParams((previous) => ({ ...previous, ...partial }))
      setSelectedDoctor(null)
      setUsedSearch(false)
      invalidateResults()
    },
    [invalidateResults],
  )

  const chooseDoctor = useCallback((index: number, fromSearch = false) => {
    setSelectedDoctor(index)
    setUsedSearch(fromSearch)
    setReplication(null)
  }, [])

  const runSelectionNull = useCallback(() => {
    cancelSelection.current?.()
    setSelectionSearches(null)
    setSelectionProgress(0)
    cancelSelection.current = runChunked({
      total: SELECTION_REPLICATIONS,
      chunkSize: 10,
      step: (index) =>
        selectionNullReplication({
          severities,
          patientsPerDoctor: params.patientsPerDoctor,
          baseSeed: params.seed,
          index,
        }),
      onProgress: setSelectionProgress,
      onDone: (searches) => {
        setSelectionSearches(searches)
        setSelectionProgress(null)
        cancelSelection.current = null
      },
    })
  }, [severities, params.patientsPerDoctor, params.seed])

  const runReplications = useCallback(() => {
    setReplication(
      replicateOnFreshData({
        severities,
        patientsPerDoctor: params.patientsPerDoctor,
        baseSeed: params.seed,
        replications: VALIDATION_REPLICATIONS,
        preRegistered: auditedIndex,
        flagged: flaggedIndex,
      }),
    )
  }, [severities, params.patientsPerDoctor, params.seed, auditedIndex, flaggedIndex])

  const restart = useCallback(() => {
    invalidateResults()
    setParams({
      doctorCount: HOSPITAL_DEFAULTS.doctorCount,
      patientsPerDoctor: HOSPITAL_DEFAULTS.patientsPerDoctor,
      seed: HOSPITAL_DEFAULTS.seed,
    })
    setSelectedDoctor(null)
    setUsedSearch(false)
    setStage('introduction')
    setReached(['introduction'])
  }, [invalidateResults])

  const showsFresh = (stage === 'validation' || stage === 'conclusion') && freshResults !== null
  const shownResults = showsFresh && freshResults ? freshResults : results
  const showsFlagged = stage !== 'introduction' && stage !== 'experiment' && selectedDoctor !== null
  const chartMetric = stage === 'introduction' || stage === 'experiment' || stage === 'observation'
    ? 'rate'
    : 'ratio'

  const highlights: DoctorHighlight[] = [{ index: auditedIndex, tone: 'preset' }]
  if (showsFlagged) highlights.push({ index: flaggedIndex, tone: 'posthoc' })

  const auditedLabel = t('doctors.audited', { doctor: doctorNumber(auditedIndex) })
  const flaggedLabel = t('doctors.flagged', { doctor: doctorNumber(flaggedIndex) })

  const freshAudited = freshResults ? freshResults[auditedIndex] : null
  const freshFlagged = freshResults ? freshResults[flaggedIndex] : null

  return (
    <ScenarioShell
      title={tc('scenarios.04-doctor-mortality.title')}
      summary={tc('scenarios.04-doctor-mortality.summary')}
      conceptKeys={[
        'multipleComparisons',
        'extremeValues',
        'confounding',
        'riskAdjustment',
        'investigationVersusProof',
      ]}
      stages={SCENARIO_STAGES}
      current={stage}
      reached={reached}
      onStageChange={goTo}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(20rem,32rem)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 lg:sticky lg:top-4">
          {stage === 'introduction' ? (
            <div className="flex aspect-[200/96] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-board px-6 text-center text-sm text-slate-500">
              {t('chart.notStarted')}
            </div>
          ) : (
            <DoctorChart
              results={shownResults}
              metric={chartMetric}
              reference={chartMetric === 'rate' ? hospital.overallRate : 1}
              highlights={highlights}
              barTone={showsFresh ? 'fresh' : 'neutral'}
              onSelect={stage === 'observation' ? chooseDoctor : undefined}
              labelFor={(index) =>
                t('chart.doctorAria', {
                  doctor: doctorNumber(index),
                  rate: formatPercent(shownResults[index].rate, locale, 1),
                })
              }
              ariaLabel={
                chartMetric === 'rate'
                  ? t('chart.ariaRate', { count: params.doctorCount })
                  : t('chart.ariaRatio', { count: params.doctorCount })
              }
            />
          )}

          {stage !== 'introduction' ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone={showsFresh ? 'fresh' : 'neutral'} withDot>
                {showsFresh ? t('validation.freshYear') : t('chart.legendDoctor')}
              </Badge>
              <Badge tone="preset" withDot>
                {t('doctors.auditedShort')}
              </Badge>
              {showsFlagged ? (
                <Badge tone="posthoc" withDot>
                  {t('doctors.flaggedShort')}
                </Badge>
              ) : null}
              <Badge tone="neutral">
                {chartMetric === 'rate' ? t('chart.legendRate') : t('chart.legendRatio')}
              </Badge>
            </div>
          ) : null}

          {stage !== 'introduction' ? (
            <dl className="mt-3 grid grid-cols-3 gap-2">
              <StatTile
                label={t('stats.doctors')}
                value={formatInteger(params.doctorCount, locale)}
              />
              <StatTile
                label={t('stats.patients')}
                value={formatInteger(hospital.patientCount, locale)}
              />
              <StatTile
                label={t('stats.hospitalRate')}
                value={formatPercent(
                  showsFresh && freshHospital ? freshHospital.overallRate : hospital.overallRate,
                  locale,
                  1,
                )}
                hint={showsFresh ? t('validation.freshYear') : undefined}
              />
            </dl>
          ) : null}
        </div>

        <div className="min-w-0 space-y-5">
          {stage === 'introduction' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('intro.heading')}</h2>
              <p className="text-slate-700">{t('intro.body1')}</p>
              <Card title={t('intro.goalHeading')} tone="preset">
                <p className="text-sm text-slate-700">
                  {t('intro.goalBody', { doctors: params.doctorCount })}
                </p>
                <ol className="mt-3 space-y-1.5 text-sm text-slate-700">
                  {([1, 2, 3] as const).map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="font-semibold tabular-nums text-slate-500">{step}.</span>
                      <span>{t(`intro.goalStep${step}`)}</span>
                    </li>
                  ))}
                </ol>
              </Card>
              <p className="text-slate-700">{t('intro.body2')}</p>
              <blockquote className="border-l-4 border-preset bg-preset-soft/50 px-4 py-3 text-slate-800 italic">
                {t('intro.question', { doctor: doctorNumber(auditedIndex) })}
              </blockquote>
              <p className="text-slate-700">{t('intro.body3')}</p>
              <Card title={tc('scenario.trueProcessHeading')}>
                <p className="text-sm text-slate-700">{t('intro.trueProcess')}</p>
              </Card>
              <Card title={t('intro.fictionHeading')} tone="fresh">
                <p className="text-sm text-slate-700">{t('intro.fictionBody')}</p>
              </Card>
              <Button onClick={() => goTo('experiment')}>{t('intro.action')}</Button>
            </section>
          ) : null}

          {stage === 'experiment' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('experiment.heading')}</h2>
              <p className="text-slate-700">{t('experiment.body1')}</p>
              <p className="text-slate-700">{t('experiment.body2')}</p>
              <Card title={auditedLabel} tone="preset">
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <StatTile
                    label={t('stats.deaths')}
                    value={formatInteger(audited.deaths, locale)}
                    hint={t('stats.ofPatients', { patients: audited.patients })}
                    tone="preset"
                  />
                  <StatTile
                    label={t('stats.expected')}
                    value={formatNumber(audited.adjusted.expected, locale, 1)}
                    hint={t('stats.expectedHint')}
                    tone="preset"
                  />
                  <StatTile
                    label={t('stats.pValue')}
                    value={formatPValue(audited.adjusted.pValue, locale)}
                    hint={
                      audited.adjusted.pValue < ALPHA
                        ? t('analysis.verdictStriking')
                        : t('analysis.verdictNothing')
                    }
                    tone="preset"
                  />
                </dl>
              </Card>
              <ExplanationPanel title={t('experiment.numbersTitle')}>
                <p>{t('experiment.numbersBody1')}</p>
                <p>{t('experiment.numbersBody2')}</p>
              </ExplanationPanel>
              <HospitalControls
                params={params}
                onChange={updateParams}
                onNewSeed={() => updateParams({ seed: randomSeed() })}
              />
              <Button onClick={() => goTo('observation')}>{t('experiment.action')}</Button>
            </section>
          ) : null}

          {stage === 'observation' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('observation.heading')}</h2>
              <p className="text-slate-700">{t('observation.body1')}</p>
              <p className="text-sm text-slate-500">{t('observation.clickHint')}</p>
              {selectedDoctor !== null ? (
                <Card title={flaggedLabel} tone="posthoc">
                  <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <StatTile
                      label={t('stats.deaths')}
                      value={formatInteger(flagged.deaths, locale)}
                      hint={t('stats.ofPatients', { patients: flagged.patients })}
                      tone="posthoc"
                    />
                    <StatTile
                      label={t('stats.rate')}
                      value={formatPercent(flagged.rate, locale, 1)}
                      hint={t('stats.againstHospital', {
                        rate: formatPercent(hospital.overallRate, locale, 1),
                      })}
                      tone="posthoc"
                    />
                    <StatTile
                      label={t('stats.rawPValue')}
                      value={formatPValue(flagged.raw.pValue, locale)}
                      hint={
                        flagged.raw.pValue < ALPHA
                          ? t('analysis.verdictStriking')
                          : t('analysis.verdictNothing')
                      }
                      tone="posthoc"
                    />
                  </dl>
                </Card>
              ) : null}
              <p className="text-slate-700">{t('observation.body2')}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => chooseDoctor(worstByAdjusted(results), true)}
                >
                  {t('observation.autoWorst')}
                </Button>
                {selectedDoctor !== null ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedDoctor(null)
                      setUsedSearch(false)
                    }}
                  >
                    {t('observation.reset')}
                  </Button>
                ) : null}
              </div>
              {usedSearch ? (
                <p className="text-sm text-slate-700">
                  {t('observation.autoWorstNote', { doctors: params.doctorCount })}
                </p>
              ) : null}
              <div>
                <Button onClick={() => goTo('analysis')} disabled={selectedDoctor === null}>
                  {t('observation.action')}
                </Button>
                {selectedDoctor === null ? (
                  <p className="mt-2 text-xs text-slate-500">{t('observation.selectFirst')}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {stage === 'analysis' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('analysis.heading')}</h2>
              <p className="text-slate-700">{t('analysis.body1')}</p>
              {selection === null ? (
                <p className="text-sm font-medium text-posthoc">{t('analysis.runFirst')}</p>
              ) : null}

              <Card title={t('analysis.raw.heading')} description={t('analysis.raw.body')}>
                <ResultTable
                  columns={[t('stats.deaths'), t('stats.rate'), t('analysis.rawPValue'), '']}
                  rows={[
                    {
                      key: 'audited',
                      label: auditedLabel,
                      tone: 'preset',
                      cells: [
                        formatInteger(audited.deaths, locale),
                        formatPercent(audited.rate, locale, 1),
                        formatPValue(audited.raw.pValue, locale),
                        <Badge key="verdict" tone="preset">
                          {audited.raw.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                    {
                      key: 'flagged',
                      label: flaggedLabel,
                      tone: 'posthoc',
                      cells: [
                        formatInteger(flagged.deaths, locale),
                        formatPercent(flagged.rate, locale, 1),
                        formatPValue(flagged.raw.pValue, locale),
                        <Badge key="verdict" tone="posthoc">
                          {flagged.raw.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                  ]}
                  caption={t('analysis.raw.caption', {
                    rate: formatPercent(hospital.overallRate, locale, 1),
                  })}
                />
              </Card>

              <Card
                title={t('analysis.adjustment.heading')}
                description={t('analysis.adjustment.body')}
                tone="preset"
              >
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <StatTile
                    label={t('stats.caseMix')}
                    value={formatPercent(flagged.meanRisk, locale, 1)}
                    hint={t('stats.caseMixHint', {
                      rate: formatPercent(hospitalMeanRisk, locale, 1),
                    })}
                  />
                  <StatTile
                    label={t('stats.expected')}
                    value={formatNumber(flagged.adjusted.expected, locale, 1)}
                    hint={t('stats.expectedHint')}
                  />
                  <StatTile
                    label={t('stats.ratio')}
                    value={formatNumber(flagged.adjusted.ratio, locale, 2)}
                    hint={t('stats.ratioHint')}
                    tone="posthoc"
                  />
                </dl>
                <div className="mt-4">
                  <ResultTable
                    columns={[t('stats.deaths'), t('stats.expected'), t('stats.ratio'), t('analysis.adjustedPValue')]}
                    rows={[
                      {
                        key: 'audited',
                        label: auditedLabel,
                        tone: 'preset',
                        cells: [
                          formatInteger(audited.deaths, locale),
                          formatNumber(audited.adjusted.expected, locale, 1),
                          formatNumber(audited.adjusted.ratio, locale, 2),
                          formatPValue(audited.adjusted.pValue, locale),
                        ],
                      },
                      {
                        key: 'flagged',
                        label: flaggedLabel,
                        tone: 'posthoc',
                        cells: [
                          formatInteger(flagged.deaths, locale),
                          formatNumber(flagged.adjusted.expected, locale, 1),
                          formatNumber(flagged.adjusted.ratio, locale, 2),
                          formatPValue(flagged.adjusted.pValue, locale),
                        ],
                      },
                    ]}
                    caption={t('analysis.adjustment.caption')}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  {t('analysis.adjustment.note', {
                    p: formatPValueRelation(flagged.adjusted.pValue, locale),
                  })}
                </p>
                <p className="mt-2 text-sm text-slate-700">{t('analysis.adjustment.limit')}</p>
              </Card>

              <Card
                title={t('analysis.selection.heading')}
                description={t('analysis.selection.body', {
                  doctors: params.doctorCount,
                  replications: SELECTION_REPLICATIONS,
                })}
                tone="posthoc"
              >
                <Button onClick={runSelectionNull} disabled={selectionProgress !== null}>
                  {selectionProgress !== null
                    ? t('analysis.selection.running')
                    : t('analysis.selection.run', { replications: SELECTION_REPLICATIONS })}
                </Button>
                {selection ? (
                  <div className="mt-4 space-y-3">
                    <Histogram
                      bins={selectionBins.map((bin) => ({
                        label: formatNumber(bin.start, locale, 2),
                        count: bin.count,
                      }))}
                      markerIndex={binIndexOf(selectionBins, selection.observedPValue)}
                      markerLabel={t('analysis.selection.marker')}
                      xLabel={t('analysis.selection.histogramX')}
                      yLabel={t('analysis.selection.histogramY')}
                      ariaLabel={t('analysis.selection.histogramTitle')}
                    />
                    <StatTile
                      label={t('analysis.selection.adjusted')}
                      value={formatPValue(selection.adjusted.pValue, locale)}
                      hint={t('analysis.selection.adjustedHint', {
                        pValue: formatPValue(selection.observedPValue, locale),
                      })}
                      tone="posthoc"
                    />
                    <p className="text-sm text-slate-700">
                      {t('analysis.selection.shareSignificant', {
                        share: formatPercent(selection.shareSignificant, locale, 0),
                        doctors: params.doctorCount,
                      })}
                    </p>
                    <p className="text-sm text-slate-700">
                      {t('analysis.selection.conclusion', {
                        naive: formatPValueRelation(selection.observedPValue, locale),
                        adjusted: formatPValueRelation(selection.adjusted.pValue, locale),
                      })}
                    </p>
                    <div className="border-t border-posthoc/20 pt-3">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {t('analysis.selection.gallery.heading')}
                      </h4>
                      <p className="mt-1 mb-3 text-sm text-slate-700">
                        {t('analysis.selection.gallery.body')}
                      </p>
                      <SearchGallery
                        searches={selection.topSearches}
                        severities={severities}
                        patientsPerDoctor={params.patientsPerDoctor}
                        baseSeed={params.seed}
                      />
                    </div>
                  </div>
                ) : null}
              </Card>

              <ExplanationPanel title={t('analysis.explanation.title')}>
                <p>{t('analysis.explanation.body1')}</p>
                <p>{t('analysis.explanation.body2')}</p>
                <p>{t('analysis.explanation.body3')}</p>
              </ExplanationPanel>

              <Button onClick={() => goTo('validation')}>{t('analysis.action')}</Button>
            </section>
          ) : null}

          {stage === 'validation' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('validation.heading')}</h2>
              <p className="text-slate-700">{t('validation.body1')}</p>
              <Card>
                <ResultTable
                  columns={[
                    t('validation.thisYear'),
                    t('validation.nextYearDeaths'),
                    t('validation.nextYearRatio'),
                    t('validation.nextYearPValue'),
                  ]}
                  rows={[
                    {
                      key: 'audited',
                      label: auditedLabel,
                      tone: 'preset',
                      cells: [
                        formatNumber(audited.adjusted.ratio, locale, 2),
                        freshAudited ? formatInteger(freshAudited.deaths, locale) : '–',
                        freshAudited ? formatNumber(freshAudited.adjusted.ratio, locale, 2) : '–',
                        freshAudited ? formatPValue(freshAudited.adjusted.pValue, locale) : '–',
                      ],
                    },
                    {
                      key: 'flagged',
                      label: flaggedLabel,
                      tone: 'posthoc',
                      cells: [
                        formatNumber(flagged.adjusted.ratio, locale, 2),
                        freshFlagged ? formatInteger(freshFlagged.deaths, locale) : '–',
                        freshFlagged ? formatNumber(freshFlagged.adjusted.ratio, locale, 2) : '–',
                        freshFlagged ? formatPValue(freshFlagged.adjusted.pValue, locale) : '–',
                      ],
                    },
                  ]}
                  caption={t('validation.tableHint')}
                />
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => setFreshIndex((index) => index + 1)}>
                    {t('validation.drawFresh')}
                  </Button>
                </div>
              </Card>
              <p className="text-slate-700">{t('validation.body2')}</p>

              <ReplicationPanel
                title={t('validation.replications.heading')}
                description={t('validation.replications.body')}
                actionLabel={t('validation.replications.run', {
                  replications: VALIDATION_REPLICATIONS,
                })}
                onRun={runReplications}
              >
                {replication ? (
                  <div className="space-y-3">
                    <ResultTable
                      columns={[
                        t('validation.replications.meanRatio'),
                        t('validation.replications.shareSignificant'),
                      ]}
                      rows={[
                        {
                          key: 'audited',
                          label: t('doctors.auditedShort'),
                          tone: 'preset',
                          cells: [
                            formatNumber(replication.preRegistered.meanRatio, locale, 2),
                            formatPercent(replication.preRegistered.shareSignificant, locale, 1),
                          ],
                        },
                        {
                          key: 'flagged',
                          label: t('doctors.flaggedShort'),
                          tone: 'posthoc',
                          cells: [
                            formatNumber(replication.flagged.meanRatio, locale, 2),
                            formatPercent(replication.flagged.shareSignificant, locale, 1),
                          ],
                        },
                      ]}
                      caption={t('validation.replications.tableHint')}
                    />
                    <p className="text-sm text-slate-700">
                      {t('validation.replications.note', {
                        share: formatPercent(replication.shareDifferentDoctor, locale, 0),
                      })}
                    </p>
                  </div>
                ) : null}
              </ReplicationPanel>

              <Button onClick={() => goTo('conclusion')}>{t('validation.action')}</Button>
            </section>
          ) : null}

          {stage === 'conclusion' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('conclusion.heading')}</h2>
              <ul className="space-y-2">
                {([1, 2, 3, 4] as const).map((index) => (
                  <li key={index} className="flex gap-2 text-slate-700">
                    <span aria-hidden="true" className="text-slate-400">
                      —
                    </span>
                    <span>{t(`conclusion.point${index}`)}</span>
                  </li>
                ))}
              </ul>
              <Card title={t('conclusion.legitimate.heading')} tone="fresh">
                <p className="text-sm text-slate-700">{t('conclusion.legitimate.body')}</p>
              </Card>
              <Card title={t('conclusion.nextHeading')}>
                <p className="text-sm text-slate-700">{t('conclusion.nextBody')}</p>
              </Card>
              <Button variant="secondary" onClick={restart}>
                {tc('actions.restart')}
              </Button>
            </section>
          ) : null}
        </div>
      </div>
    </ScenarioShell>
  )
}
