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
  REGION_DEFAULTS,
  REGION_LIMITS,
  STEP_SD,
  clampWindow,
  preRegisteredWindow,
  type Window,
} from '@/scenarios/03-interesting-region/model'
import {
  SEED_ROLE,
  generateReplicationSeries,
  generateSeries,
} from '@/scenarios/03-interesting-region/simulation'
import {
  evaluateWindow,
  replicateOnFreshData,
  scanWindows,
  selectionNullReplication,
  summarizeSelectionNull,
  type ReplicationSummary,
  type SelectionSearchResult,
} from '@/scenarios/03-interesting-region/analysis'
import { SeriesPlot, type PlotWindow } from '@/scenarios/03-interesting-region/components/SeriesPlot'
import { SearchGallery } from '@/scenarios/03-interesting-region/components/SearchGallery'
import {
  RecordControls,
  type RegionParams,
} from '@/scenarios/03-interesting-region/components/RecordControls'

const SELECTION_REPLICATIONS = 300
const VALIDATION_REPLICATIONS = 200
const HISTOGRAM_BINS = 22
/**
 * Where the user's own window starts before they move it.
 *
 * Deliberately an unremarkable stretch. The stage teaches the contrast
 * between a window nobody chose and a window chosen for looking extreme, so
 * the starting one must not already look like a finding - a test asserts
 * that it does not on the default record.
 */
function startingWindow(periodCount: number): Window {
  return clampWindow(
    { start: Math.round(periodCount * 0.05), end: Math.round(periodCount * 0.3) },
    periodCount,
  )
}

export default function InterestingRegionScenario() {
  const { t } = useTranslation('interestingregion')
  const { t: tc, i18n } = useTranslation('common')
  const locale = i18n.language

  const [stage, setStage] = useState<ScenarioStage>('introduction')
  const [reached, setReached] = useState<ScenarioStage[]>(['introduction'])
  const [params, setParams] = useState<RegionParams>({
    periodCount: REGION_DEFAULTS.periodCount,
    seed: REGION_DEFAULTS.seed,
  })
  const [userWindow, setUserWindow] = useState<Window>(() =>
    startingWindow(REGION_DEFAULTS.periodCount),
  )
  const [usedSearch, setUsedSearch] = useState(false)
  const [selectionSearches, setSelectionSearches] = useState<SelectionSearchResult[] | null>(null)
  const [selectionProgress, setSelectionProgress] = useState<number | null>(null)
  const [freshIndex, setFreshIndex] = useState(0)
  const [replication, setReplication] = useState<ReplicationSummary | null>(null)
  const cancelSelection = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelSelection.current?.(), [])

  const series = useMemo(
    () => generateSeries(params.periodCount, params.seed),
    [params.periodCount, params.seed],
  )
  const declaredWindow = useMemo(
    () => preRegisteredWindow(params.periodCount),
    [params.periodCount],
  )
  const preRegistered = useMemo(
    () => evaluateWindow(series, declaredWindow),
    [series, declaredWindow],
  )
  const chosen = useMemo(() => evaluateWindow(series, userWindow), [series, userWindow])
  const scan = useMemo(() => scanWindows(series), [series])

  const selection = useMemo(
    () =>
      selectionSearches
        ? summarizeSelectionNull(selectionSearches, chosen.z, chosen.pValue)
        : null,
    [selectionSearches, chosen.z, chosen.pValue],
  )
  const selectionBins = useMemo(
    () => (selection ? binValues(selection.absZValues, HISTOGRAM_BINS) : []),
    [selection],
  )

  const freshSeries = useMemo(
    () =>
      freshIndex === 0
        ? null
        : generateReplicationSeries(
            params.periodCount,
            params.seed,
            SEED_ROLE.freshSeries,
            freshIndex - 1,
          ),
    [freshIndex, params.periodCount, params.seed],
  )
  const freshPreRegistered = freshSeries ? evaluateWindow(freshSeries, declaredWindow) : null
  const freshChosen = freshSeries ? evaluateWindow(freshSeries, userWindow) : null

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
    (partial: Partial<RegionParams>) => {
      setParams((previous) => {
        const next = { ...previous, ...partial }
        if (partial.periodCount !== undefined) {
          setUserWindow(startingWindow(next.periodCount))
          setUsedSearch(false)
        }
        return next
      })
      invalidateResults()
    },
    [invalidateResults],
  )

  const moveEdge = useCallback(
    (edge: 'start' | 'end', period: number) => {
      setUserWindow((previous) => {
        const proposed =
          edge === 'start'
            ? { start: period, end: Math.max(period + REGION_LIMITS.minWindow, previous.end) }
            : { start: Math.min(previous.start, period - REGION_LIMITS.minWindow), end: period }
        return clampWindow(proposed, params.periodCount)
      })
      setUsedSearch(false)
      setReplication(null)
    },
    [params.periodCount],
  )

  const findMostStriking = useCallback(() => {
    setUserWindow(scan.best.window)
    setUsedSearch(true)
    setReplication(null)
  }, [scan.best.window])

  const runSelectionNull = useCallback(() => {
    cancelSelection.current?.()
    setSelectionSearches(null)
    setSelectionProgress(0)
    cancelSelection.current = runChunked({
      total: SELECTION_REPLICATIONS,
      chunkSize: 10,
      step: (index) =>
        selectionNullReplication({
          periodCount: params.periodCount,
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
  }, [params.periodCount, params.seed])

  const runReplications = useCallback(() => {
    setReplication(
      replicateOnFreshData({
        periodCount: params.periodCount,
        baseSeed: params.seed,
        replications: VALIDATION_REPLICATIONS,
        preRegistered: declaredWindow,
        chosen: userWindow,
      }),
    )
  }, [params.periodCount, params.seed, declaredWindow, userWindow])

  const restart = useCallback(() => {
    invalidateResults()
    setParams({ periodCount: REGION_DEFAULTS.periodCount, seed: REGION_DEFAULTS.seed })
    setUserWindow(startingWindow(REGION_DEFAULTS.periodCount))
    setUsedSearch(false)
    setStage('introduction')
    setReached(['introduction'])
  }, [invalidateResults])

  const showsFresh = (stage === 'validation' || stage === 'conclusion') && freshSeries !== null
  const shownSeries = showsFresh && freshSeries ? freshSeries : series
  const showsChosen = stage !== 'introduction' && stage !== 'experiment'

  const plotWindows: PlotWindow[] = []
  if (stage !== 'introduction') {
    plotWindows.push({ id: 'pre-registered', window: declaredWindow, tone: 'preset' })
  }
  if (showsChosen) {
    plotWindows.push({
      id: 'chosen',
      window: userWindow,
      tone: 'posthoc',
      draggable: stage === 'observation',
    })
  }

  const windowLabel = t('windows.chosenRange', {
    start: userWindow.start,
    end: userWindow.end,
    length: chosen.length,
  })
  const declaredLabel = t('windows.preRegisteredRange', {
    start: declaredWindow.start,
    end: declaredWindow.end,
    length: preRegistered.length,
  })

  return (
    <ScenarioShell
      title={tc('scenarios.03-interesting-region.title')}
      summary={tc('scenarios.03-interesting-region.summary')}
      conceptKeys={[
        'multipleComparisons',
        'researcherDegreesOfFreedom',
        'falseDiscoveries',
        'selection',
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
              {t('plot.notStarted')}
            </div>
          ) : (
            <SeriesPlot
              series={shownSeries}
              windows={plotWindows}
              seriesTone={showsFresh ? 'fresh' : 'neutral'}
              onEdgeMove={stage === 'observation' ? moveEdge : undefined}
              edgeLabel={(edge, period) =>
                t('plot.edgeAria', {
                  edge: edge === 'start' ? t('plot.edgeStart') : t('plot.edgeEnd'),
                  period,
                })
              }
              ariaLabel={t('plot.aria', { count: params.periodCount })}
            />
          )}

          {stage !== 'introduction' ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Badge tone={showsFresh ? 'fresh' : 'neutral'} withDot>
                {showsFresh ? t('validation.freshData') : t('plot.legendRecord')}
              </Badge>
              <Badge tone="preset" withDot>
                {t('windows.preRegisteredShort')}
              </Badge>
              {showsChosen ? (
                <Badge tone="posthoc" withDot>
                  {t('windows.chosenShort')}
                </Badge>
              ) : null}
            </div>
          ) : null}

          {stage !== 'introduction' ? (
            <dl className="mt-3 grid grid-cols-3 gap-2">
              <StatTile
                label={t('stats.periods')}
                value={formatInteger(params.periodCount, locale)}
              />
              <StatTile
                label={t('stats.change')}
                value={formatNumber(
                  showsChosen
                    ? (showsFresh && freshChosen ? freshChosen.change : chosen.change)
                    : (showsFresh && freshPreRegistered
                        ? freshPreRegistered.change
                        : preRegistered.change),
                  locale,
                  1,
                )}
                hint={showsChosen ? windowLabel : declaredLabel}
                tone={showsChosen ? 'posthoc' : 'preset'}
              />
              <StatTile
                label={t('stats.pValue')}
                value={formatPValue(
                  showsChosen
                    ? (showsFresh && freshChosen ? freshChosen.pValue : chosen.pValue)
                    : (showsFresh && freshPreRegistered
                        ? freshPreRegistered.pValue
                        : preRegistered.pValue),
                  locale,
                )}
                hint={showsFresh ? t('validation.freshData') : undefined}
                tone={showsChosen ? 'posthoc' : 'preset'}
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
                <p className="text-sm text-slate-700">{t('intro.goalBody')}</p>
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
                {t('intro.question')}
              </blockquote>
              <p className="text-slate-700">{t('intro.body3')}</p>
              <Card title={tc('scenario.trueProcessHeading')}>
                <p className="text-sm text-slate-700">
                  {t('intro.trueProcess', { sd: formatNumber(STEP_SD, locale, 1) })}
                </p>
              </Card>
              <Button onClick={() => goTo('experiment')}>{t('intro.action')}</Button>
            </section>
          ) : null}

          {stage === 'experiment' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('experiment.heading')}</h2>
              <p className="text-slate-700">{t('experiment.body1')}</p>
              <p className="text-slate-700">{t('experiment.body2')}</p>
              <Card title={declaredLabel} tone="preset">
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <StatTile
                    label={t('stats.change')}
                    value={formatNumber(preRegistered.change, locale, 1)}
                    tone="preset"
                  />
                  <StatTile
                    label={t('stats.z')}
                    value={formatNumber(preRegistered.z, locale, 2)}
                    tone="preset"
                  />
                  <StatTile
                    label={t('stats.pValue')}
                    value={formatPValue(preRegistered.pValue, locale)}
                    hint={
                      preRegistered.pValue < ALPHA
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
              <RecordControls
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
              <p className="text-sm text-slate-500">{t('observation.dragHint')}</p>
              <Card title={windowLabel} tone="posthoc">
                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <StatTile
                    label={t('stats.change')}
                    value={formatNumber(chosen.change, locale, 1)}
                    tone="posthoc"
                  />
                  <StatTile
                    label={t('stats.z')}
                    value={formatNumber(chosen.z, locale, 2)}
                    tone="posthoc"
                  />
                  <StatTile
                    label={t('stats.pValue')}
                    value={formatPValue(chosen.pValue, locale)}
                    hint={
                      chosen.pValue < ALPHA
                        ? t('analysis.verdictStriking')
                        : t('analysis.verdictNothing')
                    }
                    tone="posthoc"
                  />
                </dl>
              </Card>
              <p className="text-slate-700">{t('observation.body2')}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={findMostStriking}>
                  {t('observation.autoBest')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setUserWindow(startingWindow(params.periodCount))
                    setUsedSearch(false)
                  }}
                >
                  {t('observation.reset')}
                </Button>
              </div>
              {usedSearch ? (
                <p className="text-sm text-slate-700">
                  {t('observation.autoBestNote', {
                    candidates: formatInteger(scan.candidates, locale),
                  })}
                </p>
              ) : null}
              <Button onClick={() => goTo('analysis')}>{t('observation.action')}</Button>
            </section>
          ) : null}

          {stage === 'analysis' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('analysis.heading')}</h2>
              <p className="text-slate-700">{t('analysis.body1')}</p>
              <Card>
                <ResultTable
                  columns={[t('stats.change'), t('stats.z'), t('analysis.naivePValue'), '']}
                  rows={[
                    {
                      key: 'pre-registered',
                      label: declaredLabel,
                      tone: 'preset',
                      cells: [
                        formatNumber(preRegistered.change, locale, 1),
                        formatNumber(preRegistered.z, locale, 2),
                        formatPValue(preRegistered.pValue, locale),
                        <Badge key="verdict" tone="preset">
                          {preRegistered.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                    {
                      key: 'chosen',
                      label: windowLabel,
                      tone: 'posthoc',
                      cells: [
                        formatNumber(chosen.change, locale, 1),
                        formatNumber(chosen.z, locale, 2),
                        formatPValue(chosen.pValue, locale),
                        <Badge key="verdict" tone="posthoc">
                          {chosen.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                  ]}
                  caption={t('analysis.naiveHint')}
                />
              </Card>
              <p className="text-slate-700">
                {t('analysis.body2', { candidates: formatInteger(scan.candidates, locale) })}
              </p>
              {selection === null ? (
                <p className="text-sm font-medium text-posthoc">{t('analysis.runFirst')}</p>
              ) : null}

              <Card
                title={t('analysis.selection.heading')}
                description={t('analysis.selection.body', {
                  candidates: formatInteger(scan.candidates, locale),
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
                        label: formatNumber(bin.start, locale, 1),
                        count: bin.count,
                      }))}
                      markerIndex={binIndexOf(selectionBins, selection.observedAbsZ)}
                      markerLabel={t('analysis.selection.marker')}
                      xLabel={t('analysis.selection.histogramX')}
                      yLabel={t('analysis.selection.histogramY')}
                      ariaLabel={t('analysis.selection.histogramTitle')}
                    />
                    <StatTile
                      label={t('analysis.selection.adjusted')}
                      value={formatPValue(selection.adjusted.pValue, locale)}
                      hint={t('analysis.selection.adjustedHint', {
                        z: formatNumber(selection.observedAbsZ, locale, 2),
                      })}
                      tone="posthoc"
                    />
                    <p className="text-sm text-slate-700">
                      {t('analysis.selection.shareSignificant', {
                        // One decimal: 299 of 300 must not be reported as 100%.
                        share: formatPercent(selection.shareSignificant, locale, 1),
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
                        periodCount={params.periodCount}
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
                    t('validation.originalRecord'),
                    t('validation.freshChange'),
                    t('validation.freshPValue'),
                  ]}
                  rows={[
                    {
                      key: 'pre-registered',
                      label: declaredLabel,
                      tone: 'preset',
                      cells: [
                        formatNumber(preRegistered.change, locale, 1),
                        freshPreRegistered
                          ? formatNumber(freshPreRegistered.change, locale, 1)
                          : '–',
                        freshPreRegistered
                          ? formatPValue(freshPreRegistered.pValue, locale)
                          : '–',
                      ],
                    },
                    {
                      key: 'chosen',
                      label: windowLabel,
                      tone: 'posthoc',
                      cells: [
                        formatNumber(chosen.change, locale, 1),
                        freshChosen ? formatNumber(freshChosen.change, locale, 1) : '–',
                        freshChosen ? formatPValue(freshChosen.pValue, locale) : '–',
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
                        t('validation.replications.meanAbsZ'),
                        t('validation.replications.shareSignificant'),
                      ]}
                      rows={[
                        {
                          key: 'pre-registered',
                          label: t('windows.preRegisteredShort'),
                          tone: 'preset',
                          cells: [
                            formatNumber(replication.preRegistered.meanAbsZ, locale, 2),
                            formatPercent(replication.preRegistered.shareSignificant, locale, 1),
                          ],
                        },
                        {
                          key: 'chosen',
                          label: t('windows.chosenShort'),
                          tone: 'posthoc',
                          cells: [
                            formatNumber(replication.chosen.meanAbsZ, locale, 2),
                            formatPercent(replication.chosen.shareSignificant, locale, 1),
                          ],
                        },
                      ]}
                      caption={t('validation.replications.tableHint')}
                    />
                    <p className="text-sm text-slate-700">
                      {t('validation.replications.note', {
                        share: formatPercent(replication.shareDifferentWindow, locale, 0),
                        z: formatNumber(replication.meanSearchAbsZ, locale, 2),
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
