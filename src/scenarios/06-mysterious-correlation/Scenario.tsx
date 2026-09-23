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
import { criticalCorrelation } from '@/statistics/hypothesis/correlationTest'
import { fitPolynomial } from '@/statistics/regression/leastSquares'
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
  DATASET_DEFAULTS,
  PRE_REGISTERED_PAIR,
  expectedFalsePositives,
  variableNumber,
  type VariablePair,
} from '@/scenarios/06-mysterious-correlation/model'
import {
  SEED_ROLE,
  generateDataset,
  generateReplicationDataset,
} from '@/scenarios/06-mysterious-correlation/simulation'
import {
  evaluatePair,
  pairPoints,
  replicateOnFreshData,
  selectionNullReplication,
  summarizeSelectionNull,
  sweepAllPairs,
  type ReplicationSummary,
  type SelectionSearchResult,
} from '@/scenarios/06-mysterious-correlation/analysis'
import { CorrelationMatrix } from '@/scenarios/06-mysterious-correlation/components/CorrelationMatrix'
import { DiscoveryList } from '@/scenarios/06-mysterious-correlation/components/DiscoveryList'
import { PairPlot } from '@/scenarios/06-mysterious-correlation/components/PairPlot'
import { SearchGallery } from '@/scenarios/06-mysterious-correlation/components/SearchGallery'
import {
  DatasetControls,
  type DatasetParams,
} from '@/scenarios/06-mysterious-correlation/components/DatasetControls'

const SELECTION_REPLICATIONS = 300
const VALIDATION_REPLICATIONS = 200
const HISTOGRAM_BINS = 20
const DISCOVERY_COUNT = 10

export default function MysteriousCorrelationScenario() {
  const { t } = useTranslation('mysteriouscorrelation')
  const { t: tc, i18n } = useTranslation('common')
  const locale = i18n.language

  const [stage, setStage] = useState<ScenarioStage>('introduction')
  const [reached, setReached] = useState<ScenarioStage[]>(['introduction'])
  const [params, setParams] = useState<DatasetParams>({
    variableCount: DATASET_DEFAULTS.variableCount,
    observationCount: DATASET_DEFAULTS.observationCount,
    seed: DATASET_DEFAULTS.seed,
  })
  const [sweptOnce, setSweptOnce] = useState(false)
  const [selectedPair, setSelectedPair] = useState<VariablePair | null>(null)
  const [selectionSearches, setSelectionSearches] = useState<SelectionSearchResult[] | null>(null)
  const [selectionProgress, setSelectionProgress] = useState<number | null>(null)
  const [freshIndex, setFreshIndex] = useState(0)
  const [replication, setReplication] = useState<ReplicationSummary | null>(null)
  const cancelSelection = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelSelection.current?.(), [])

  const dataset = useMemo(
    () =>
      generateDataset({
        variableCount: params.variableCount,
        observationCount: params.observationCount,
        seed: params.seed,
      }),
    [params.variableCount, params.observationCount, params.seed],
  )
  const sweep = useMemo(() => sweepAllPairs(dataset), [dataset])
  const discoveries = useMemo(
    () =>
      [...sweep.pairs]
        .sort((a, b) => Math.abs(b.test.r) - Math.abs(a.test.r))
        .slice(0, DISCOVERY_COUNT),
    [sweep],
  )
  const threshold = useMemo(
    () => criticalCorrelation(params.observationCount, ALPHA),
    [params.observationCount],
  )

  const preRegistered = useMemo(
    () => evaluatePair(dataset, PRE_REGISTERED_PAIR),
    [dataset],
  )
  const chosenPair = selectedPair ?? PRE_REGISTERED_PAIR
  const chosen = useMemo(() => evaluatePair(dataset, chosenPair), [dataset, chosenPair])

  const selection = useMemo(
    () =>
      selectionSearches
        ? summarizeSelectionNull(selectionSearches, chosen.test.r, chosen.test.pValue)
        : null,
    [selectionSearches, chosen.test.r, chosen.test.pValue],
  )
  const selectionBins = useMemo(
    () => (selection ? binValues(selection.absR, HISTOGRAM_BINS) : []),
    [selection],
  )
  const sweepBins = useMemo(
    () => binValues(sweep.pValues, HISTOGRAM_BINS, { min: 0, max: 1 }),
    [sweep],
  )

  const freshDataset = useMemo(
    () =>
      freshIndex === 0
        ? null
        : generateReplicationDataset({
            variableCount: params.variableCount,
            observationCount: params.observationCount,
            baseSeed: params.seed,
            role: SEED_ROLE.freshBatch,
            index: freshIndex - 1,
          }),
    [freshIndex, params.variableCount, params.observationCount, params.seed],
  )
  const freshPreRegistered = useMemo(
    () => (freshDataset ? evaluatePair(freshDataset, PRE_REGISTERED_PAIR) : null),
    [freshDataset],
  )
  const freshChosen = useMemo(
    () => (freshDataset ? evaluatePair(freshDataset, chosenPair) : null),
    [freshDataset, chosenPair],
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
    (partial: Partial<DatasetParams>) => {
      setParams((previous) => ({ ...previous, ...partial }))
      setSelectedPair(null)
      setSweptOnce(false)
      invalidateResults()
    },
    [invalidateResults],
  )

  const choosePair = useCallback((pair: VariablePair) => {
    setSelectedPair(pair)
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
          variableCount: params.variableCount,
          observationCount: params.observationCount,
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
  }, [params.variableCount, params.observationCount, params.seed])

  const runReplications = useCallback(() => {
    setReplication(
      replicateOnFreshData({
        variableCount: params.variableCount,
        observationCount: params.observationCount,
        baseSeed: params.seed,
        replications: VALIDATION_REPLICATIONS,
        preRegistered: PRE_REGISTERED_PAIR,
        discovered: chosenPair,
        observed: dataset,
      }),
    )
  }, [params.variableCount, params.observationCount, params.seed, chosenPair, dataset])

  const restart = useCallback(() => {
    invalidateResults()
    setParams({
      variableCount: DATASET_DEFAULTS.variableCount,
      observationCount: DATASET_DEFAULTS.observationCount,
      seed: DATASET_DEFAULTS.seed,
    })
    setSelectedPair(null)
    setSweptOnce(false)
    setStage('introduction')
    setReached(['introduction'])
  }, [invalidateResults])

  const showsFresh = (stage === 'validation' || stage === 'conclusion') && freshDataset !== null
  const shownDataset = showsFresh && freshDataset ? freshDataset : dataset
  const showsChosen = stage !== 'introduction' && stage !== 'experiment' && selectedPair !== null

  const shownPair = showsChosen ? chosenPair : PRE_REGISTERED_PAIR
  const shownPoints = useMemo(
    () => pairPoints(shownDataset, shownPair),
    [shownDataset, shownPair],
  )
  // The line is always the one fitted to the original data: on a new batch it
  // is a prediction, which is the question a discovered correlation implies.
  const frozenLine = useMemo(
    () => fitPolynomial(pairPoints(dataset, shownPair), 1),
    [dataset, shownPair],
  )

  const preRegisteredLabel = t('pairs.preRegistered', {
    a: variableNumber(PRE_REGISTERED_PAIR.a),
    b: variableNumber(PRE_REGISTERED_PAIR.b),
  })
  const chosenLabel = t('pairs.discovered', {
    a: variableNumber(chosenPair.a),
    b: variableNumber(chosenPair.b),
  })

  return (
    <ScenarioShell
      title={tc('scenarios.06-mysterious-correlation.title')}
      summary={tc('scenarios.06-mysterious-correlation.summary')}
      conceptKeys={[
        'dataMining',
        'correlation',
        'multipleComparisons',
        'replication',
        'predictionVersusExplanation',
      ]}
      stages={SCENARIO_STAGES}
      current={stage}
      reached={reached}
      onStageChange={goTo}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(20rem,30rem)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 space-y-3 lg:sticky lg:top-4">
          {stage === 'introduction' ? (
            <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-board px-6 text-center text-sm text-slate-500">
              {t('plot.notCollected')}
            </div>
          ) : (
            <>
              <CorrelationMatrix
                dataset={dataset}
                highlights={
                  showsChosen
                    ? [
                        { pair: PRE_REGISTERED_PAIR, tone: 'preset' },
                        { pair: chosenPair, tone: 'posthoc' },
                      ]
                    : [{ pair: PRE_REGISTERED_PAIR, tone: 'preset' }]
                }
                ariaLabel={t('plot.matrixAria', {
                  variables: params.variableCount,
                  pairs: sweep.tested,
                })}
              />
              <PairPlot
                points={shownPoints}
                line={frozenLine}
                tone={showsChosen ? 'posthoc' : 'preset'}
                pointTone={showsFresh ? 'fresh' : 'neutral'}
                ariaLabel={t('plot.pairAria', {
                  a: variableNumber(shownPair.a),
                  b: variableNumber(shownPair.b),
                })}
              />
            </>
          )}

          {stage !== 'introduction' ? (
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={showsFresh ? 'fresh' : 'neutral'} withDot>
                {showsFresh ? t('validation.freshBatch') : t('plot.legendRow')}
              </Badge>
              <Badge tone="preset" withDot>
                {t('pairs.preRegisteredShort')}
              </Badge>
              {showsChosen ? (
                <Badge tone="posthoc" withDot>
                  {t('pairs.discoveredShort')}
                </Badge>
              ) : null}
              <Badge tone="neutral">{t('plot.legendMatrix')}</Badge>
            </div>
          ) : null}

          {stage !== 'introduction' ? (
            <dl className="grid grid-cols-3 gap-2">
              <StatTile
                label={t('stats.variables')}
                value={formatInteger(params.variableCount, locale)}
                hint={t('stats.rows', { rows: params.observationCount })}
              />
              <StatTile
                label={t('stats.pairs')}
                value={formatInteger(sweep.tested, locale)}
                hint={t('stats.pairsHint')}
              />
              <StatTile
                label={t('stats.threshold')}
                value={formatNumber(threshold, locale, 2)}
                hint={t('stats.thresholdHint')}
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
              <p className="text-slate-700">{t('intro.body2')}</p>
              <blockquote className="border-l-4 border-preset bg-preset-soft/50 px-4 py-3 text-slate-800 italic">
                {t('intro.question', {
                  a: variableNumber(PRE_REGISTERED_PAIR.a),
                  b: variableNumber(PRE_REGISTERED_PAIR.b),
                })}
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
              <Card title={preRegisteredLabel} tone="preset">
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <StatTile
                    label={t('stats.correlation')}
                    value={formatNumber(preRegistered.test.r, locale, 2)}
                    tone="preset"
                  />
                  <StatTile
                    label={t('stats.t')}
                    value={formatNumber(preRegistered.test.t, locale, 2)}
                    tone="preset"
                  />
                  <StatTile
                    label={t('stats.pValue')}
                    value={formatPValue(preRegistered.test.pValue, locale)}
                    hint={
                      preRegistered.test.pValue < ALPHA
                        ? t('analysis.verdictStriking')
                        : t('analysis.verdictNothing')
                    }
                    tone="preset"
                  />
                </dl>
              </Card>
              <DatasetControls
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
              <p className="text-slate-700">
                {t('observation.body1', { pairs: formatInteger(sweep.tested, locale) })}
              </p>
              {!sweptOnce ? (
                <Button onClick={() => setSweptOnce(true)}>{t('observation.runSweep')}</Button>
              ) : (
                <>
                  <p className="text-slate-700">
                    {t('observation.body2', {
                      count: sweep.significantCount,
                      pairs: formatInteger(sweep.tested, locale),
                    })}
                  </p>
                  <Card title={t('observation.discoveries')} description={t('observation.discoveriesHint')}>
                    <DiscoveryList
                      results={discoveries}
                      selected={selectedPair}
                      onSelect={choosePair}
                    />
                  </Card>
                  {selectedPair !== null ? (
                    <Card title={chosenLabel} tone="posthoc">
                      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        <StatTile
                          label={t('stats.correlation')}
                          value={formatNumber(chosen.test.r, locale, 2)}
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
                      <p className="mt-3 text-sm text-slate-700">{t('observation.namingNote')}</p>
                    </Card>
                  ) : null}
                  <div>
                    <Button onClick={() => goTo('analysis')} disabled={selectedPair === null}>
                      {t('observation.action')}
                    </Button>
                    {selectedPair === null ? (
                      <p className="mt-2 text-xs text-slate-500">{t('observation.selectFirst')}</p>
                    ) : null}
                  </div>
                </>
              )}
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
                  columns={[t('stats.correlation'), t('stats.t'), t('analysis.naivePValue'), '']}
                  rows={[
                    {
                      key: 'pre-registered',
                      label: preRegisteredLabel,
                      tone: 'preset',
                      cells: [
                        formatNumber(preRegistered.test.r, locale, 2),
                        formatNumber(preRegistered.test.t, locale, 2),
                        formatPValue(preRegistered.test.pValue, locale),
                        <Badge key="verdict" tone="preset">
                          {preRegistered.test.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                    {
                      key: 'discovered',
                      label: chosenLabel,
                      tone: 'posthoc',
                      cells: [
                        formatNumber(chosen.test.r, locale, 2),
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
                title={t('analysis.sweep.heading')}
                description={t('analysis.sweep.body', {
                  pairs: formatInteger(sweep.tested, locale),
                })}
                tone="preset"
              >
                <dl className="grid grid-cols-3 gap-2">
                  <StatTile
                    label={t('analysis.sweep.significant')}
                    value={formatInteger(sweep.significantCount, locale)}
                  />
                  <StatTile
                    label={t('analysis.sweep.expected')}
                    value={formatNumber(expectedFalsePositives(params.variableCount), locale, 1)}
                    hint={t('analysis.sweep.expectedHint', {
                      pairs: formatInteger(sweep.tested, locale),
                    })}
                  />
                  <StatTile
                    label={t('analysis.sweep.discoveries')}
                    value={formatInteger(sweep.fdrDiscoveries, locale)}
                    hint={t('analysis.sweep.discoveriesHint')}
                    tone="posthoc"
                  />
                </dl>
                <div className="mt-4">
                  <Histogram
                    bins={sweepBins.map((bin) => ({
                      label: formatNumber(bin.start, locale, 1),
                      count: bin.count,
                    }))}
                    xLabel={t('analysis.sweep.histogramX')}
                    yLabel={t('analysis.sweep.histogramY')}
                    ariaLabel={t('analysis.sweep.histogramTitle')}
                    tone="preset"
                  />
                </div>
                <p className="mt-3 text-sm text-slate-700">{t('analysis.sweep.flat')}</p>
                <p className="mt-2 text-sm text-slate-700">
                  {t('analysis.sweep.corrections', {
                    bonferroni: formatPValueRelation(sweep.strongestBonferroni, locale),
                    fdr: formatPercent(sweep.smallestFdr, locale, 0),
                  })}
                </p>
              </Card>

              <Card
                title={t('analysis.selection.heading')}
                description={t('analysis.selection.body', {
                  pairs: formatInteger(sweep.tested, locale),
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
                      markerIndex={binIndexOf(selectionBins, selection.observedAbsR)}
                      markerLabel={t('analysis.selection.marker')}
                      xLabel={t('analysis.selection.histogramX')}
                      yLabel={t('analysis.selection.histogramY')}
                      ariaLabel={t('analysis.selection.histogramTitle')}
                    />
                    <StatTile
                      label={t('analysis.selection.adjusted')}
                      value={formatPValue(selection.adjusted.pValue, locale)}
                      hint={t('analysis.selection.adjustedHint', {
                        r: formatNumber(selection.observedAbsR, locale, 2),
                      })}
                      tone="posthoc"
                    />
                    <p className="text-sm text-slate-700">
                      {t('analysis.selection.meanSignificant', {
                        average: formatNumber(selection.meanSignificantCount, locale, 1),
                        pairs: formatInteger(sweep.tested, locale),
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
                        variableCount={params.variableCount}
                        observationCount={params.observationCount}
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
                    t('validation.original'),
                    t('validation.freshCorrelation'),
                    t('validation.freshPValue'),
                  ]}
                  rows={[
                    {
                      key: 'pre-registered',
                      label: preRegisteredLabel,
                      tone: 'preset',
                      cells: [
                        formatNumber(preRegistered.test.r, locale, 2),
                        freshPreRegistered
                          ? formatNumber(freshPreRegistered.test.r, locale, 2)
                          : '–',
                        freshPreRegistered
                          ? formatPValue(freshPreRegistered.test.pValue, locale)
                          : '–',
                      ],
                    },
                    {
                      key: 'discovered',
                      label: chosenLabel,
                      tone: 'posthoc',
                      cells: [
                        formatNumber(chosen.test.r, locale, 2),
                        freshChosen ? formatNumber(freshChosen.test.r, locale, 2) : '–',
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
                        t('validation.replications.meanR'),
                        t('validation.replications.shareSignificant'),
                        t('validation.replications.prediction'),
                      ]}
                      rows={[
                        {
                          key: 'pre-registered',
                          label: t('pairs.preRegisteredShort'),
                          tone: 'preset',
                          cells: [
                            formatNumber(replication.preRegistered.meanR, locale, 2),
                            formatPercent(replication.preRegistered.shareSignificant, locale, 1),
                            formatNumber(replication.preRegistered.meanFreshRSquared, locale, 2),
                          ],
                        },
                        {
                          key: 'discovered',
                          label: t('pairs.discoveredShort'),
                          tone: 'posthoc',
                          cells: [
                            formatNumber(replication.discovered.meanR, locale, 2),
                            formatPercent(replication.discovered.shareSignificant, locale, 1),
                            formatNumber(replication.discovered.meanFreshRSquared, locale, 2),
                          ],
                        },
                      ]}
                      caption={t('validation.replications.tableHint')}
                    />
                    <p className="text-sm text-slate-700">
                      {t('validation.replications.note', {
                        share: formatPercent(replication.shareDifferentPair, locale, 0),
                        direction: formatPercent(
                          replication.discovered.shareSameDirection,
                          locale,
                          0,
                        ),
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
