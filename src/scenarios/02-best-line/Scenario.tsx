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
import { fitPolynomial, predictPolynomial } from '@/statistics/regression/leastSquares'
import { Histogram } from '@/visualization/Histogram'
import { LineChart } from '@/visualization/LineChart'
import { SCENARIO_STAGES, type ScenarioStage } from '@/scenarios/types'
import { runChunked } from '@/utils/chunked'
import { formatInteger, formatNumber, formatPValue, formatPercent } from '@/utils/format'
import {
  ALPHA,
  BESTLINE_DEFAULTS,
  FLAT_DEGREE,
  MANUAL_START,
  NOISE_SD,
  PRE_REGISTERED_DEGREE,
  X_RANGE,
  clampY,
  maxDegreeFor,
  type ModelSpec,
} from '@/scenarios/02-best-line/model'
import {
  SEED_ROLE,
  generateReplicationSample,
  generateSample,
} from '@/scenarios/02-best-line/simulation'
import {
  complexityCurve,
  evaluateOnSample,
  evaluateSpec,
  mostConvincingDegree,
  replicateOnFreshData,
  searchDegrees,
  selectionNullReplication,
  summarizeSelectionNull,
  type ReplicationSummary,
  type SelectionSearchResult,
} from '@/scenarios/02-best-line/analysis'
import { DataPlot, type PlotCurve } from '@/scenarios/02-best-line/components/DataPlot'
import { DegreePicker } from '@/scenarios/02-best-line/components/DegreePicker'
import { SearchGallery } from '@/scenarios/02-best-line/components/SearchGallery'
import {
  SampleControls,
  type BestLineParams,
} from '@/scenarios/02-best-line/components/SampleControls'

const SELECTION_REPLICATIONS = 300
const VALIDATION_REPLICATIONS = 200
const HISTOGRAM_BINS = 20
const CURVE_VIEW = { min: -2, max: 1 }

export default function BestLineScenario() {
  const { t } = useTranslation('bestline')
  const { t: tc, i18n } = useTranslation('common')
  const locale = i18n.language

  const [stage, setStage] = useState<ScenarioStage>('introduction')
  const [reached, setReached] = useState<ScenarioStage[]>(['introduction'])
  const [params, setParams] = useState<BestLineParams>({
    pointCount: BESTLINE_DEFAULTS.pointCount,
    seed: BESTLINE_DEFAULTS.seed,
  })
  const [manualLine, setManualLine] = useState({
    left: MANUAL_START.kind === 'manual' ? MANUAL_START.left : 0,
    right: MANUAL_START.kind === 'manual' ? MANUAL_START.right : 0,
  })
  const [selectedDegree, setSelectedDegree] = useState<number | null>(null)
  const [selectionSearches, setSelectionSearches] = useState<SelectionSearchResult[] | null>(null)
  const [selectionProgress, setSelectionProgress] = useState<number | null>(null)
  const [freshIndex, setFreshIndex] = useState(0)
  const [replication, setReplication] = useState<ReplicationSummary | null>(null)
  const cancelSelection = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelSelection.current?.(), [])

  const points = useMemo(
    () => generateSample(params.pointCount, params.seed),
    [params.pointCount, params.seed],
  )
  const maxDegree = maxDegreeFor(params.pointCount)
  const degreeResults = useMemo(() => searchDegrees(points, maxDegree), [points, maxDegree])

  const spec: ModelSpec = useMemo(
    () =>
      selectedDegree === null
        ? { kind: 'manual', left: manualLine.left, right: manualLine.right }
        : { kind: 'fitted', degree: selectedDegree },
    [selectedDegree, manualLine],
  )

  const chosen = useMemo(() => evaluateSpec(points, spec), [points, spec])
  const preRegistered = useMemo(
    () => evaluateSpec(points, { kind: 'fitted', degree: PRE_REGISTERED_DEGREE }),
    [points],
  )
  const flatModel = useMemo(() => fitPolynomial(points, FLAT_DEGREE), [points])

  const selection = useMemo(
    () =>
      selectionSearches ? summarizeSelectionNull(selectionSearches, chosen.test.pValue) : null,
    [selectionSearches, chosen.test.pValue],
  )
  const selectionBins = useMemo(
    () => (selection ? binValues(selection.pValues, HISTOGRAM_BINS, { min: 0, max: 1 }) : []),
    [selection],
  )

  const freshPoints = useMemo(
    () =>
      freshIndex === 0
        ? null
        : generateReplicationSample(
            params.pointCount,
            params.seed,
            SEED_ROLE.freshSample,
            freshIndex - 1,
          ),
    [freshIndex, params.pointCount, params.seed],
  )
  const curve = useMemo(
    () => (freshPoints ? complexityCurve(points, freshPoints, maxDegree) : null),
    [points, freshPoints, maxDegree],
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
    (partial: Partial<BestLineParams>) => {
      setParams((previous) => {
        const next = { ...previous, ...partial }
        // A smaller sample may no longer allow the chosen degree.
        setSelectedDegree((degree) =>
          degree === null ? null : Math.min(degree, maxDegreeFor(next.pointCount)),
        )
        return next
      })
      invalidateResults()
    },
    [invalidateResults],
  )

  const moveHandle = useCallback((id: string, y: number) => {
    setSelectedDegree(null)
    setManualLine((previous) => ({ ...previous, [id]: clampY(y) }))
    setReplication(null)
  }, [])

  const chooseDegree = useCallback((degree: number) => {
    setSelectedDegree(degree)
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
          pointCount: params.pointCount,
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
  }, [params.pointCount, params.seed])

  const runReplications = useCallback(() => {
    setReplication(
      replicateOnFreshData({
        pointCount: params.pointCount,
        baseSeed: params.seed,
        replications: VALIDATION_REPLICATIONS,
        flat: flatModel,
        preRegistered: preRegistered.model,
        chosen: chosen.model,
      }),
    )
  }, [params.pointCount, params.seed, flatModel, preRegistered.model, chosen.model])

  const restart = useCallback(() => {
    invalidateResults()
    setParams({ pointCount: BESTLINE_DEFAULTS.pointCount, seed: BESTLINE_DEFAULTS.seed })
    setManualLine({
      left: MANUAL_START.kind === 'manual' ? MANUAL_START.left : 0,
      right: MANUAL_START.kind === 'manual' ? MANUAL_START.right : 0,
    })
    setSelectedDegree(null)
    setStage('introduction')
    setReached(['introduction'])
  }, [invalidateResults])

  const showsFreshPoints = (stage === 'validation' || stage === 'conclusion') && freshPoints !== null
  const plotPoints = stage === 'introduction' ? [] : (showsFreshPoints ? freshPoints : points) ?? points

  const curves: PlotCurve[] = []
  if (stage === 'introduction' || showsFreshPoints) {
    curves.push({
      id: 'flat',
      tone: 'neutral',
      dashed: true,
      thin: true,
      predict: (x) => predictPolynomial(flatModel, x),
    })
  }
  if (stage !== 'introduction') {
    curves.push({
      id: 'pre-registered',
      tone: 'preset',
      thin: stage !== 'experiment',
      predict: (x) => predictPolynomial(preRegistered.model, x),
    })
  }
  if (stage !== 'introduction' && stage !== 'experiment') {
    curves.push({
      id: 'chosen',
      tone: 'posthoc',
      predict: (x) => predictPolynomial(chosen.model, x),
    })
  }

  const handles =
    stage === 'observation' && selectedDegree === null
      ? [
          {
            id: 'left',
            x: X_RANGE.min,
            y: manualLine.left,
            ariaLabel: t('plot.handleAria', {
              side: t('plot.sideLeft'),
              value: formatNumber(manualLine.left, locale, 1),
            }),
          },
          {
            id: 'right',
            x: X_RANGE.max,
            y: manualLine.right,
            ariaLabel: t('plot.handleAria', {
              side: t('plot.sideRight'),
              value: formatNumber(manualLine.right, locale, 1),
            }),
          },
        ]
      : []

  const chosenLabel =
    selectedDegree === null ? t('models.manual') : t('models.degree', { degree: selectedDegree })

  return (
    <ScenarioShell
      title={tc('scenarios.02-best-line.title')}
      summary={tc('scenarios.02-best-line.summary')}
      conceptKeys={['overfitting', 'modelSelection', 'trainingData', 'testData', 'generalization']}
      stages={SCENARIO_STAGES}
      current={stage}
      reached={reached}
      onStageChange={goTo}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(20rem,30rem)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 lg:sticky lg:top-4">
          <DataPlot
            points={plotPoints}
            curves={curves}
            handles={handles}
            pointTone={showsFreshPoints ? 'fresh' : 'neutral'}
            onHandleMove={stage === 'observation' ? moveHandle : undefined}
            ariaLabel={t('plot.aria', { count: plotPoints.length })}
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stage !== 'introduction' ? (
              <Badge tone={showsFreshPoints ? 'fresh' : 'neutral'} withDot>
                {showsFreshPoints ? t('validation.freshData') : t('plot.legendPoint')}
              </Badge>
            ) : null}
            {stage === 'introduction' || showsFreshPoints ? (
              <Badge tone="neutral" withDot>
                {t('models.flatShort')}
              </Badge>
            ) : null}
            {stage !== 'introduction' ? (
              <Badge tone="preset" withDot>
                {t('models.preRegisteredShort')}
              </Badge>
            ) : null}
            {stage !== 'introduction' && stage !== 'experiment' ? (
              <Badge tone="posthoc" withDot>
                {selectedDegree === null ? t('models.manualShort') : t('models.chosenShort')}
              </Badge>
            ) : null}
          </div>
          {stage !== 'introduction' ? (
            <dl className="mt-3 grid grid-cols-2 gap-2">
              <StatTile
                label={t('stats.points')}
                value={formatInteger(plotPoints.length, locale)}
              />
              <StatTile
                label={t('stats.rSquared')}
                value={formatNumber(
                  stage === 'experiment' ? preRegistered.training.rSquared : chosen.training.rSquared,
                  locale,
                  2,
                )}
                hint={stage === 'experiment' ? t('models.preRegistered') : chosenLabel}
                tone={stage === 'experiment' ? 'preset' : 'posthoc'}
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
                {t('intro.question')}
              </blockquote>
              <p className="text-slate-700">{t('intro.body3')}</p>
              <Card title={tc('scenario.trueProcessHeading')}>
                <p className="text-sm text-slate-700">{t('intro.trueProcess')}</p>
              </Card>
              <Button onClick={() => goTo('experiment')}>{t('intro.action')}</Button>
            </section>
          ) : null}

          {stage === 'experiment' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('experiment.heading')}</h2>
              <p className="text-slate-700">{t('experiment.body1')}</p>
              <p className="text-slate-700">{t('experiment.body2')}</p>
              <dl className="grid grid-cols-2 gap-2">
                <StatTile
                  label={t('stats.rSquared')}
                  value={formatNumber(preRegistered.training.rSquared, locale, 2)}
                  hint={t('models.preRegistered')}
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
              <SampleControls
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
              <p className="text-sm text-slate-500">{t('observation.manualHint')}</p>
              <dl className="grid grid-cols-2 gap-2">
                <StatTile
                  label={t('stats.rSquared')}
                  value={formatNumber(chosen.training.rSquared, locale, 2)}
                  hint={chosenLabel}
                  tone="posthoc"
                />
                <StatTile
                  label={t('stats.pValue')}
                  value={
                    chosen.testable
                      ? formatPValue(chosen.test.pValue, locale)
                      : t('stats.notApplicable')
                  }
                  hint={
                    chosen.testable
                      ? chosen.test.pValue < ALPHA
                        ? t('analysis.verdictStriking')
                        : t('analysis.verdictNothing')
                      : t('observation.testNote')
                  }
                  tone="posthoc"
                />
              </dl>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => chooseDegree(PRE_REGISTERED_DEGREE)}>
                  {t('observation.fitLine')}
                </Button>
                {selectedDegree !== null ? (
                  <Button variant="ghost" onClick={() => setSelectedDegree(null)}>
                    {t('observation.resetManual')}
                  </Button>
                ) : null}
              </div>

              <p className="text-slate-700">{t('observation.body2')}</p>
              <Card title={t('observation.flexibility')} description={t('observation.degreePickerHint')}>
                <DegreePicker
                  results={degreeResults}
                  selected={selectedDegree}
                  onSelect={chooseDegree}
                />
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    onClick={() => chooseDegree(mostConvincingDegree(degreeResults))}
                  >
                    {t('observation.autoBest')}
                  </Button>
                </div>
              </Card>

              <div>
                <Button onClick={() => goTo('analysis')} disabled={selectedDegree === null}>
                  {t('observation.action')}
                </Button>
                {selectedDegree === null ? (
                  <p className="mt-2 text-xs text-slate-500">{t('observation.testNote')}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {stage === 'analysis' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('analysis.heading')}</h2>
              <p className="text-slate-700">{t('analysis.body1')}</p>
              <Card>
                <ResultTable
                  columns={[t('stats.rSquared'), t('analysis.naivePValue'), '']}
                  rows={[
                    {
                      key: 'pre-registered',
                      label: t('models.preRegistered'),
                      tone: 'preset',
                      cells: [
                        formatNumber(preRegistered.training.rSquared, locale, 2),
                        formatPValue(preRegistered.test.pValue, locale),
                        <Badge key="verdict" tone="preset">
                          {preRegistered.test.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                    {
                      key: 'chosen',
                      label: `${t('models.chosen')} · ${chosenLabel}`,
                      tone: 'posthoc',
                      cells: [
                        formatNumber(chosen.training.rSquared, locale, 2),
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
              <p className="text-slate-700">{t('analysis.body2', { count: maxDegree })}</p>
              {selection === null ? (
                <p className="text-sm font-medium text-posthoc">{t('analysis.runFirst')}</p>
              ) : null}

              <Card
                title={t('analysis.selection.heading')}
                description={t('analysis.selection.body', {
                  maxDegree,
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
                      })}
                    </p>
                    <p className="text-sm text-slate-700">
                      {t('analysis.selection.conclusion', {
                        pValue: formatPValue(selection.observedPValue, locale),
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
                        pointCount={params.pointCount}
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
                    t('validation.originalData'),
                    t('stats.freshRSquared'),
                    t('stats.rmse'),
                  ]}
                  rows={[
                    {
                      key: 'flat',
                      label: t('models.flat'),
                      tone: 'neutral',
                      cells: [
                        formatNumber(0, locale, 2),
                        freshPoints
                          ? formatNumber(evaluateOnSample(flatModel, freshPoints).rSquared, locale, 2)
                          : '–',
                        freshPoints
                          ? formatNumber(evaluateOnSample(flatModel, freshPoints).rmse, locale, 2)
                          : '–',
                      ],
                    },
                    {
                      key: 'pre-registered',
                      label: t('models.preRegistered'),
                      tone: 'preset',
                      cells: [
                        formatNumber(preRegistered.training.rSquared, locale, 2),
                        freshPoints
                          ? formatNumber(
                              evaluateOnSample(preRegistered.model, freshPoints).rSquared,
                              locale,
                              2,
                            )
                          : '–',
                        freshPoints
                          ? formatNumber(
                              evaluateOnSample(preRegistered.model, freshPoints).rmse,
                              locale,
                              2,
                            )
                          : '–',
                      ],
                    },
                    {
                      key: 'chosen',
                      label: `${t('models.chosen')} · ${chosenLabel}`,
                      tone: 'posthoc',
                      cells: [
                        formatNumber(chosen.training.rSquared, locale, 2),
                        freshPoints
                          ? formatNumber(
                              evaluateOnSample(chosen.model, freshPoints).rSquared,
                              locale,
                              2,
                            )
                          : '–',
                        freshPoints
                          ? formatNumber(evaluateOnSample(chosen.model, freshPoints).rmse, locale, 2)
                          : '–',
                      ],
                    },
                  ]}
                  caption={t('stats.rmseHint', { noise: formatNumber(NOISE_SD, locale, 1) })}
                />
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => setFreshIndex((index) => index + 1)}>
                    {t('validation.drawFresh')}
                  </Button>
                </div>
              </Card>
              <p className="text-slate-700">{t('validation.body2')}</p>

              {curve ? (
                <Card title={t('validation.curve.heading')} description={t('validation.curve.body')}>
                  <LineChart
                    series={[
                      {
                        id: 'training',
                        tone: 'posthoc',
                        points: curve.map((entry) => ({
                          x: entry.degree,
                          y: entry.trainingRSquared,
                        })),
                      },
                      {
                        id: 'fresh',
                        tone: 'fresh',
                        dashed: true,
                        points: curve.map((entry) => ({ x: entry.degree, y: entry.freshRSquared })),
                      },
                    ]}
                    xDomain={{ min: 0, max: maxDegree }}
                    yDomain={CURVE_VIEW}
                    xTicks={curve.map((entry) => entry.degree)}
                    yTicks={[1, 0, -1, -2]}
                    formatX={(value) => formatInteger(value, locale)}
                    formatY={(value) => formatNumber(value, locale, 0)}
                    xLabel={t('validation.curve.xLabel')}
                    yLabel={t('validation.curve.yLabel')}
                    ariaLabel={t('validation.curve.heading')}
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="posthoc" withDot>
                      {t('validation.curve.training')}
                    </Badge>
                    <Badge tone="fresh" withDot>
                      {t('validation.curve.fresh')}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{t('validation.curve.clipNote')}</p>
                </Card>
              ) : null}

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
                        t('validation.replications.meanRSquared'),
                        t('validation.replications.meanRmse'),
                        t('validation.replications.worseThanFlat'),
                      ]}
                      rows={[
                        {
                          key: 'flat',
                          label: t('models.flatShort'),
                          tone: 'neutral',
                          cells: [
                            formatNumber(replication.flat.meanRSquared, locale, 2),
                            formatNumber(replication.flat.meanRmse, locale, 2),
                            '–',
                          ],
                        },
                        {
                          key: 'pre-registered',
                          label: t('models.preRegisteredShort'),
                          tone: 'preset',
                          cells: [
                            formatNumber(replication.preRegistered.meanRSquared, locale, 2),
                            formatNumber(replication.preRegistered.meanRmse, locale, 2),
                            formatPercent(replication.preRegistered.shareWorseThanFlat, locale, 0),
                          ],
                        },
                        {
                          key: 'chosen',
                          label: chosenLabel,
                          tone: 'posthoc',
                          cells: [
                            formatNumber(replication.chosen.meanRSquared, locale, 2),
                            formatNumber(replication.chosen.meanRmse, locale, 2),
                            formatPercent(replication.chosen.shareWorseThanFlat, locale, 0),
                          ],
                        },
                      ]}
                    />
                    <p className="text-sm text-slate-700">{t('validation.replications.note')}</p>
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
