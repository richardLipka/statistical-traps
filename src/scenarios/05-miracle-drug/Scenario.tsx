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
import { binIndexOf, binValues } from '@/statistics/monteCarlo'
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
  PRIMARY_OUTCOME,
  TRIAL_DEFAULTS,
  outcomeNumber,
} from '@/scenarios/05-miracle-drug/model'
import {
  SEED_ROLE,
  generateReplicationTrial,
  generateTrial,
} from '@/scenarios/05-miracle-drug/simulation'
import {
  averageOutcomeCorrelation,
  countSignificant,
  evaluateTrial,
  mostImpressiveOutcome,
  replicateOnFreshData,
  selectionNullReplication,
  summarizeSelectionNull,
  type ReplicationSummary,
  type SelectionSearchResult,
} from '@/scenarios/05-miracle-drug/analysis'
import {
  ForestPlot,
  type OutcomeHighlight,
} from '@/scenarios/05-miracle-drug/components/ForestPlot'
import { SearchGallery } from '@/scenarios/05-miracle-drug/components/SearchGallery'
import {
  TrialControls,
  type TrialParams,
} from '@/scenarios/05-miracle-drug/components/TrialControls'

const SELECTION_REPLICATIONS = 300
const VALIDATION_REPLICATIONS = 200
const HISTOGRAM_BINS = 20

export default function MiracleDrugScenario() {
  const { t } = useTranslation('miracledrug')
  const { t: tc, i18n } = useTranslation('common')
  const locale = i18n.language

  const [stage, setStage] = useState<ScenarioStage>('introduction')
  const [reached, setReached] = useState<ScenarioStage[]>(['introduction'])
  const [params, setParams] = useState<TrialParams>({
    patientsPerArm: TRIAL_DEFAULTS.patientsPerArm,
    outcomeCount: TRIAL_DEFAULTS.outcomeCount,
    seed: TRIAL_DEFAULTS.seed,
  })
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null)
  const [usedSearch, setUsedSearch] = useState(false)
  const [selectionSearches, setSelectionSearches] = useState<SelectionSearchResult[] | null>(null)
  const [selectionProgress, setSelectionProgress] = useState<number | null>(null)
  const [freshIndex, setFreshIndex] = useState(0)
  const [replication, setReplication] = useState<ReplicationSummary | null>(null)
  const cancelSelection = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelSelection.current?.(), [])

  const trial = useMemo(
    () =>
      generateTrial({
        patientsPerArm: params.patientsPerArm,
        outcomeCount: params.outcomeCount,
        seed: params.seed,
      }),
    [params.patientsPerArm, params.outcomeCount, params.seed],
  )
  const results = useMemo(() => evaluateTrial(trial), [trial])
  const significantCount = useMemo(() => countSignificant(results), [results])
  const correlation = useMemo(() => averageOutcomeCorrelation(trial), [trial])

  const primary = results[PRIMARY_OUTCOME]
  const chosenIndex = selectedOutcome ?? PRIMARY_OUTCOME
  const chosen = results[chosenIndex]

  const selection = useMemo(
    () =>
      selectionSearches ? summarizeSelectionNull(selectionSearches, chosen.test.pValue) : null,
    [selectionSearches, chosen.test.pValue],
  )
  const selectionBins = useMemo(
    () => (selection ? binValues(selection.pValues, HISTOGRAM_BINS) : []),
    [selection],
  )

  const freshTrial = useMemo(
    () =>
      freshIndex === 0
        ? null
        : generateReplicationTrial({
            patientsPerArm: params.patientsPerArm,
            outcomeCount: params.outcomeCount,
            baseSeed: params.seed,
            role: SEED_ROLE.freshTrial,
            index: freshIndex - 1,
          }),
    [freshIndex, params.patientsPerArm, params.outcomeCount, params.seed],
  )
  const freshResults = useMemo(
    () => (freshTrial ? evaluateTrial(freshTrial) : null),
    [freshTrial],
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
    (partial: Partial<TrialParams>) => {
      setParams((previous) => ({ ...previous, ...partial }))
      setSelectedOutcome(null)
      setUsedSearch(false)
      invalidateResults()
    },
    [invalidateResults],
  )

  const chooseOutcome = useCallback((index: number, fromSearch = false) => {
    setSelectedOutcome(index)
    setUsedSearch(fromSearch)
    setReplication(null)
  }, [])

  const runSelectionNull = useCallback(() => {
    cancelSelection.current?.()
    setSelectionSearches(null)
    setSelectionProgress(0)
    cancelSelection.current = runChunked({
      total: SELECTION_REPLICATIONS,
      chunkSize: 15,
      step: (index) =>
        selectionNullReplication({
          patientsPerArm: params.patientsPerArm,
          outcomeCount: params.outcomeCount,
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
  }, [params.patientsPerArm, params.outcomeCount, params.seed])

  const runReplications = useCallback(() => {
    setReplication(
      replicateOnFreshData({
        patientsPerArm: params.patientsPerArm,
        outcomeCount: params.outcomeCount,
        baseSeed: params.seed,
        replications: VALIDATION_REPLICATIONS,
        primary: PRIMARY_OUTCOME,
        chosen: chosenIndex,
        primaryDirection: primary.test.difference,
        chosenDirection: chosen.test.difference,
      }),
    )
  }, [
    params.patientsPerArm,
    params.outcomeCount,
    params.seed,
    chosenIndex,
    primary.test.difference,
    chosen.test.difference,
  ])

  const restart = useCallback(() => {
    invalidateResults()
    setParams({
      patientsPerArm: TRIAL_DEFAULTS.patientsPerArm,
      outcomeCount: TRIAL_DEFAULTS.outcomeCount,
      seed: TRIAL_DEFAULTS.seed,
    })
    setSelectedOutcome(null)
    setUsedSearch(false)
    setStage('introduction')
    setReached(['introduction'])
  }, [invalidateResults])

  const showsFresh = (stage === 'validation' || stage === 'conclusion') && freshResults !== null
  const shownResults = showsFresh && freshResults ? freshResults : results
  const showsChosen = stage !== 'introduction' && stage !== 'experiment' && selectedOutcome !== null

  const highlights: OutcomeHighlight[] = [{ index: PRIMARY_OUTCOME, tone: 'preset' }]
  if (showsChosen) highlights.push({ index: chosenIndex, tone: 'posthoc' })

  const primaryLabel = t('outcomes.primary', { outcome: outcomeNumber(PRIMARY_OUTCOME) })
  const chosenLabel = t('outcomes.chosen', { outcome: outcomeNumber(chosenIndex) })

  const freshPrimary = freshResults ? freshResults[PRIMARY_OUTCOME] : null
  const freshChosen = freshResults ? freshResults[chosenIndex] : null

  return (
    <ScenarioShell
      title={tc('scenarios.05-miracle-drug.title')}
      summary={tc('scenarios.05-miracle-drug.summary')}
      conceptKeys={[
        'multipleTesting',
        'falsePositives',
        'independentReplication',
        'pValueInterpretation',
      ]}
      stages={SCENARIO_STAGES}
      current={stage}
      reached={reached}
      onStageChange={goTo}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(20rem,32rem)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 lg:sticky lg:top-4">
          {stage === 'introduction' ? (
            <div className="flex aspect-[200/110] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-board px-6 text-center text-sm text-slate-500">
              {t('plot.notStarted')}
            </div>
          ) : (
            <ForestPlot
              results={shownResults}
              highlights={highlights}
              barTone={showsFresh ? 'fresh' : 'neutral'}
              onSelect={stage === 'observation' ? chooseOutcome : undefined}
              labelFor={(index) =>
                t('plot.outcomeAria', {
                  outcome: outcomeNumber(index),
                  difference: formatNumber(shownResults[index].test.difference, locale, 2),
                })
              }
              ariaLabel={t('plot.aria', { count: params.outcomeCount })}
            />
          )}

          {stage !== 'introduction' ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone={showsFresh ? 'fresh' : 'neutral'} withDot>
                {showsFresh ? t('validation.freshTrial') : t('plot.legendOutcome')}
              </Badge>
              <Badge tone="preset" withDot>
                {t('outcomes.primaryShort')}
              </Badge>
              {showsChosen ? (
                <Badge tone="posthoc" withDot>
                  {t('outcomes.chosenShort')}
                </Badge>
              ) : null}
              <Badge tone="neutral">{t('plot.legendInterval')}</Badge>
            </div>
          ) : null}

          {stage !== 'introduction' ? (
            <dl className="mt-3 grid grid-cols-3 gap-2">
              <StatTile
                label={t('stats.outcomes')}
                value={formatInteger(params.outcomeCount, locale)}
              />
              <StatTile
                label={t('stats.patients')}
                value={formatInteger(params.patientsPerArm * 2, locale)}
                hint={t('stats.patientsHint', { perArm: params.patientsPerArm })}
              />
              <StatTile
                label={t('stats.significantCount')}
                value={formatInteger(
                  showsFresh && freshResults ? countSignificant(freshResults) : significantCount,
                  locale,
                )}
                hint={t('stats.significantHint', { outcomes: params.outcomeCount })}
                tone="posthoc"
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
                  {t('intro.goalBody', { outcomes: params.outcomeCount })}
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
                {t('intro.question', { outcome: outcomeNumber(PRIMARY_OUTCOME) })}
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
              <p className="text-slate-700">
                {t('experiment.body1', { perArm: formatInteger(params.patientsPerArm, locale) })}
              </p>
              <p className="text-slate-700">
                {t(
                  primary.test.pValue < ALPHA ? 'experiment.body2Hit' : 'experiment.body2',
                )}
              </p>
              <Card title={primaryLabel} tone="preset">
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <StatTile
                    label={t('stats.difference')}
                    value={formatNumber(primary.test.difference, locale, 2)}
                    hint={t('stats.differenceHint')}
                    tone="preset"
                  />
                  <StatTile
                    label={t('stats.t')}
                    value={formatNumber(primary.test.t, locale, 2)}
                    tone="preset"
                  />
                  <StatTile
                    label={t('stats.pValue')}
                    value={formatPValue(primary.test.pValue, locale)}
                    hint={
                      primary.test.pValue < ALPHA
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
              <TrialControls
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
              {selectedOutcome !== null ? (
                <Card title={chosenLabel} tone="posthoc">
                  <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <StatTile
                      label={t('stats.difference')}
                      value={formatNumber(chosen.test.difference, locale, 2)}
                      hint={t('stats.differenceHint')}
                      tone="posthoc"
                    />
                    <StatTile
                      label={t('stats.t')}
                      value={formatNumber(chosen.test.t, locale, 2)}
                      tone="posthoc"
                    />
                    <StatTile
                      label={t('stats.pValue')}
                      value={formatPValue(chosen.test.pValue, locale)}
                      hint={
                        chosen.test.pValue < ALPHA
                          ? t('analysis.verdictStriking')
                          : t('analysis.verdictNothing')
                      }
                      tone="posthoc"
                    />
                  </dl>
                </Card>
              ) : null}
              <p className="text-slate-700">
                {t('observation.body2', {
                  expected: formatNumber(params.outcomeCount * ALPHA, locale, 1),
                  count: significantCount,
                  outcomes: params.outcomeCount,
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => chooseOutcome(mostImpressiveOutcome(results), true)}
                >
                  {t('observation.autoBest')}
                </Button>
                {selectedOutcome !== null ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedOutcome(null)
                      setUsedSearch(false)
                    }}
                  >
                    {t('observation.reset')}
                  </Button>
                ) : null}
              </div>
              {usedSearch ? (
                <p className="text-sm text-slate-700">
                  {t('observation.autoBestNote', { outcomes: params.outcomeCount })}
                </p>
              ) : null}
              <div>
                <Button onClick={() => goTo('analysis')} disabled={selectedOutcome === null}>
                  {t('observation.action')}
                </Button>
                {selectedOutcome === null ? (
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

              <Card>
                <ResultTable
                  columns={[t('stats.difference'), t('stats.t'), t('analysis.naivePValue'), '']}
                  rows={[
                    {
                      key: 'primary',
                      label: primaryLabel,
                      tone: 'preset',
                      cells: [
                        formatNumber(primary.test.difference, locale, 2),
                        formatNumber(primary.test.t, locale, 2),
                        formatPValue(primary.test.pValue, locale),
                        <Badge key="verdict" tone="preset">
                          {primary.test.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                    {
                      key: 'chosen',
                      label: chosenLabel,
                      tone: 'posthoc',
                      cells: [
                        formatNumber(chosen.test.difference, locale, 2),
                        formatNumber(chosen.test.t, locale, 2),
                        formatPValue(chosen.test.pValue, locale),
                        <Badge key="verdict" tone="posthoc">
                          {chosen.test.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                  ]}
                  caption={t('analysis.naiveHint')}
                />
              </Card>

              <Card
                title={t('analysis.textbook.heading')}
                description={t('analysis.textbook.body', { outcomes: params.outcomeCount })}
                tone="preset"
              >
                <dl className="grid grid-cols-2 gap-2">
                  <StatTile
                    label={t('analysis.textbook.bonferroni')}
                    value={formatPValue(chosen.bonferroni, locale)}
                    hint={t('analysis.textbook.bonferroniHint', {
                      outcomes: params.outcomeCount,
                    })}
                  />
                  <StatTile
                    label={t('analysis.textbook.holm')}
                    value={formatPValue(chosen.holm, locale)}
                    hint={t('analysis.textbook.holmHint')}
                  />
                </dl>
                <p className="mt-3 text-sm text-slate-700">{t('analysis.textbook.note')}</p>
              </Card>

              <Card
                title={t('analysis.selection.heading')}
                description={t('analysis.selection.body', {
                  outcomes: params.outcomeCount,
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
                        average: formatNumber(selection.meanSignificantCount, locale, 1),
                        outcomes: params.outcomeCount,
                      })}
                    </p>
                    <p className="text-sm text-slate-700">
                      {t('analysis.selection.versusBonferroni', {
                        simulated: formatPValueRelation(selection.adjusted.pValue, locale),
                        bonferroni: formatPValueRelation(chosen.bonferroni, locale),
                        correlation: formatNumber(correlation, locale, 2),
                        outcomes: params.outcomeCount,
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
                        patientsPerArm={params.patientsPerArm}
                        outcomeCount={params.outcomeCount}
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
                    t('validation.firstTrial'),
                    t('validation.nextDifference'),
                    t('validation.nextPValue'),
                  ]}
                  rows={[
                    {
                      key: 'primary',
                      label: primaryLabel,
                      tone: 'preset',
                      cells: [
                        formatNumber(primary.test.difference, locale, 2),
                        freshPrimary
                          ? formatNumber(freshPrimary.test.difference, locale, 2)
                          : '–',
                        freshPrimary ? formatPValue(freshPrimary.test.pValue, locale) : '–',
                      ],
                    },
                    {
                      key: 'chosen',
                      label: chosenLabel,
                      tone: 'posthoc',
                      cells: [
                        formatNumber(chosen.test.difference, locale, 2),
                        freshChosen ? formatNumber(freshChosen.test.difference, locale, 2) : '–',
                        freshChosen ? formatPValue(freshChosen.test.pValue, locale) : '–',
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
                        t('validation.replications.meanDifference'),
                        t('validation.replications.shareSignificant'),
                        t('validation.replications.sameDirection'),
                      ]}
                      rows={[
                        {
                          key: 'primary',
                          label: t('outcomes.primaryShort'),
                          tone: 'preset',
                          cells: [
                            formatNumber(replication.primary.meanDifference, locale, 2),
                            formatPercent(replication.primary.shareSignificant, locale, 1),
                            formatPercent(replication.primary.shareSameDirection, locale, 0),
                          ],
                        },
                        {
                          key: 'chosen',
                          label: t('outcomes.chosenShort'),
                          tone: 'posthoc',
                          cells: [
                            formatNumber(replication.chosen.meanDifference, locale, 2),
                            formatPercent(replication.chosen.shareSignificant, locale, 1),
                            formatPercent(replication.chosen.shareSameDirection, locale, 0),
                          ],
                        },
                      ]}
                      caption={t('validation.replications.tableHint')}
                    />
                    <p className="text-sm text-slate-700">
                      {t('validation.replications.note', {
                        share: formatPercent(replication.shareDifferentOutcome, locale, 0),
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
