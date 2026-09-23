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
import { integerHistogram } from '@/statistics/monteCarlo'
import { randomSeed } from '@/statistics/random/rng'
import { Histogram } from '@/visualization/Histogram'
import { SCENARIO_STAGES, type ScenarioStage } from '@/scenarios/types'
import { runChunked } from '@/utils/chunked'
import { formatInteger, formatNumber, formatPercent, formatPValue } from '@/utils/format'
import type { Point } from '@/utils/geometry'
import {
  ALPHA,
  DARTBOARD_DEFAULTS,
  POST_HOC_START,
  hitProbability,
  makeTarget,
  preRegisteredTarget,
} from '@/scenarios/01-dartboard/model'
import {
  SEED_ROLE,
  generateDarts,
  generateReplicationDarts,
} from '@/scenarios/01-dartboard/simulation'
import {
  evaluateTarget,
  findBestTarget,
  replicateOnFreshData,
  selectionNullReplication,
  summarizeSelectionNull,
  type ReplicationSummary,
  type SelectionSearchResult,
} from '@/scenarios/01-dartboard/analysis'
import { SearchGallery } from '@/scenarios/01-dartboard/components/SearchGallery'
import {
  DartBoardView,
  type BoardTarget,
} from '@/scenarios/01-dartboard/components/DartBoardView'
import {
  ExperimentControls,
  type DartboardParams,
} from '@/scenarios/01-dartboard/components/ExperimentControls'

const SELECTION_REPLICATIONS = 300
const VALIDATION_REPLICATIONS = 200

export default function DartboardScenario() {
  const { t } = useTranslation('dartboard')
  const { t: tc, i18n } = useTranslation('common')
  const locale = i18n.language

  const [stage, setStage] = useState<ScenarioStage>('introduction')
  const [reached, setReached] = useState<ScenarioStage[]>(['introduction'])
  const [params, setParams] = useState<DartboardParams>({
    dartCount: DARTBOARD_DEFAULTS.dartCount,
    radius: DARTBOARD_DEFAULTS.radius,
    seed: DARTBOARD_DEFAULTS.seed,
  })
  const [postHocCentre, setPostHocCentre] = useState<Point>(POST_HOC_START)
  const [selectionSearches, setSelectionSearches] = useState<SelectionSearchResult[] | null>(null)
  const [selectionProgress, setSelectionProgress] = useState<number | null>(null)
  const [freshIndex, setFreshIndex] = useState(0)
  const [replication, setReplication] = useState<ReplicationSummary | null>(null)
  const cancelSelection = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelSelection.current?.(), [])

  const darts = useMemo(
    () => generateDarts(params.dartCount, params.seed),
    [params.dartCount, params.seed],
  )
  const presetTarget = useMemo(() => preRegisteredTarget(params.radius), [params.radius])
  const postHocTarget = useMemo(
    () => makeTarget(postHocCentre, params.radius),
    [postHocCentre, params.radius],
  )
  const presetEvaluation = useMemo(() => evaluateTarget(darts, presetTarget), [darts, presetTarget])
  const postHocEvaluation = useMemo(
    () => evaluateTarget(darts, postHocTarget),
    [darts, postHocTarget],
  )
  const best = useMemo(() => findBestTarget(darts, params.radius), [darts, params.radius])

  const selection = useMemo(
    () =>
      selectionSearches ? summarizeSelectionNull(selectionSearches, postHocEvaluation.hits) : null,
    [selectionSearches, postHocEvaluation.hits],
  )
  const selectionBins = useMemo(
    () => (selection ? integerHistogram(selection.maxHits) : []),
    [selection],
  )

  const freshDarts = useMemo(
    () =>
      freshIndex === 0
        ? null
        : generateReplicationDarts(params.dartCount, params.seed, SEED_ROLE.freshThrow, freshIndex - 1),
    [freshIndex, params.dartCount, params.seed],
  )
  const freshPreset = useMemo(
    () => (freshDarts ? evaluateTarget(freshDarts, presetTarget) : null),
    [freshDarts, presetTarget],
  )
  const freshPostHoc = useMemo(
    () => (freshDarts ? evaluateTarget(freshDarts, postHocTarget) : null),
    [freshDarts, postHocTarget],
  )

  const goTo = useCallback((next: ScenarioStage) => {
    // Validation is always shown on data that were never used to choose anything,
    // however the user arrived at the stage.
    if (next === 'validation') setFreshIndex((index) => (index === 0 ? 1 : index))
    setStage(next)
    setReached((previous) => (previous.includes(next) ? previous : [...previous, next]))
  }, [])

  /** Any change to the data invalidates every result derived from it. */
  const invalidateResults = useCallback(() => {
    cancelSelection.current?.()
    cancelSelection.current = null
    setSelectionSearches(null)
    setSelectionProgress(null)
    setReplication(null)
    setFreshIndex(0)
  }, [])

  const updateParams = useCallback(
    (partial: Partial<DartboardParams>) => {
      setParams((previous) => ({ ...previous, ...partial }))
      invalidateResults()
    },
    [invalidateResults],
  )

  const moveTarget = useCallback(
    (_id: string, centre: Point) => {
      setPostHocCentre(centre)
      setReplication(null)
    },
    [],
  )

  const runSelectionNull = useCallback(() => {
    cancelSelection.current?.()
    setSelectionSearches(null)
    setSelectionProgress(0)
    cancelSelection.current = runChunked({
      total: SELECTION_REPLICATIONS,
      chunkSize: 15,
      step: (index) =>
        selectionNullReplication({
          dartCount: params.dartCount,
          radius: params.radius,
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
  }, [params.dartCount, params.radius, params.seed])

  const runReplications = useCallback(() => {
    setReplication(
      replicateOnFreshData({
        dartCount: params.dartCount,
        baseSeed: params.seed,
        replications: VALIDATION_REPLICATIONS,
        preRegistered: presetTarget,
        postHoc: postHocTarget,
      }),
    )
  }, [params.dartCount, params.seed, presetTarget, postHocTarget])

  const restart = useCallback(() => {
    invalidateResults()
    setParams({
      dartCount: DARTBOARD_DEFAULTS.dartCount,
      radius: DARTBOARD_DEFAULTS.radius,
      seed: DARTBOARD_DEFAULTS.seed,
    })
    setPostHocCentre(POST_HOC_START)
    setStage('introduction')
    setReached(['introduction'])
  }, [invalidateResults])

  const probability = hitProbability(params.radius)
  const showPostHoc = stage !== 'introduction' && stage !== 'experiment'
  const showsFreshDarts = stage === 'validation' && freshDarts !== null
  const boardDarts =
    stage === 'introduction' ? [] : ((showsFreshDarts ? freshDarts : null) ?? darts)

  const boardTargets: BoardTarget[] = showPostHoc
    ? [
        {
          id: 'post-hoc',
          target: postHocTarget,
          tone: 'posthoc',
          draggable: stage === 'observation',
          ariaLabel: t('targets.postHocAria', {
            x: Math.round(postHocTarget.x * 100),
            y: Math.round(postHocTarget.y * 100),
          }),
        },
        { id: 'pre-registered', target: presetTarget, tone: 'preset' },
      ]
    : [{ id: 'pre-registered', target: presetTarget, tone: 'preset' }]

  const hitsOf = (hits: number, total: number) => t('stats.hitsOf', { hits, total })

  return (
    <ScenarioShell
      title={tc('scenarios.01-dartboard.title')}
      summary={tc('scenarios.01-dartboard.summary')}
      conceptKeys={['postHocHypothesis', 'exploratoryAnalysis', 'confirmation', 'replication']}
      stages={SCENARIO_STAGES}
      current={stage}
      reached={reached}
      onStageChange={goTo}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(20rem,26rem)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 lg:sticky lg:top-4">
          <DartBoardView
            darts={boardDarts}
            targets={boardTargets}
            ariaLabel={t('board.aria', { count: boardDarts.length })}
            dartTone={showsFreshDarts ? 'fresh' : 'neutral'}
            onMove={stage === 'observation' ? moveTarget : undefined}
          />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stage !== 'introduction' ? (
              <Badge tone={showsFreshDarts ? 'fresh' : 'neutral'} withDot>
                {showsFreshDarts ? t('validation.freshData') : t('board.legendDart')}
              </Badge>
            ) : null}
            <Badge tone="preset" withDot>
              {t('targets.presetShort')}
            </Badge>
            {showPostHoc ? (
              <Badge tone="posthoc" withDot>
                {t('targets.postHocShort')}
              </Badge>
            ) : null}
          </div>
          {stage !== 'introduction' ? (
            <dl className="mt-3 grid grid-cols-2 gap-2">
              <StatTile
                label={t('stats.dartsThrown')}
                value={formatInteger(boardDarts.length, locale)}
              />
              <StatTile
                label={t('stats.expected')}
                value={formatNumber(boardDarts.length * probability, locale, 1)}
                hint={t('stats.hitProbability') + ': ' + formatPercent(probability, locale)}
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
              <Card title={tc('scenario.trueProcessHeading')} tone="neutral">
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
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <StatTile
                  label={t('targets.presetShort')}
                  value={formatInteger(presetEvaluation.hits, locale)}
                  hint={hitsOf(presetEvaluation.hits, darts.length)}
                  tone="preset"
                />
                <StatTile
                  label={t('stats.expected')}
                  value={formatNumber(presetEvaluation.test.expected, locale, 1)}
                />
                <StatTile
                  label={t('stats.hitProbability')}
                  value={formatPercent(probability, locale)}
                  hint={t('stats.hitProbabilityHint')}
                />
              </dl>
              <ExplanationPanel title={t('experiment.numbersTitle')}>
                <p>
                  {t('experiment.numbersBody1', {
                    share: formatPercent(hitProbability(params.radius), locale, 1),
                    darts: formatInteger(params.dartCount, locale),
                    expected: formatNumber(presetEvaluation.test.expected, locale, 1),
                  })}
                </p>
                <p>{t('experiment.numbersBody2')}</p>
              </ExplanationPanel>
              <ExperimentControls
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
              <p className="text-sm text-slate-500">{t('targets.dragHint')}</p>
              <p className="text-slate-700">{t('observation.testBody')}</p>
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <StatTile
                  label={t('stats.capturedNow')}
                  value={formatInteger(postHocEvaluation.hits, locale)}
                  hint={hitsOf(postHocEvaluation.hits, darts.length)}
                  tone="posthoc"
                />
                <StatTile
                  label={t('observation.livePValue')}
                  value={formatPValue(postHocEvaluation.test.pValue, locale)}
                  hint={
                    postHocEvaluation.test.pValue < ALPHA
                      ? t('analysis.verdictStriking')
                      : t('analysis.verdictNothing')
                  }
                  tone="posthoc"
                />
                <StatTile
                  label={t('targets.presetShort')}
                  value={formatInteger(presetEvaluation.hits, locale)}
                  hint={`${t('analysis.naivePValue')}: ${formatPValue(presetEvaluation.test.pValue, locale)}`}
                  tone="preset"
                />
              </dl>
              <p className="text-slate-700">{t('observation.body2')}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => moveTarget('post-hoc', { x: best.target.x, y: best.target.y })}
                >
                  {t('observation.auto')}
                </Button>
                <Button variant="ghost" onClick={() => moveTarget('post-hoc', POST_HOC_START)}>
                  {t('observation.reset')}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                {t('observation.autoHint', {
                  count: formatInteger(best.candidatesExamined, locale),
                })}
              </p>
              <Button onClick={() => goTo('analysis')}>{t('observation.action')}</Button>
            </section>
          ) : null}

          {stage === 'analysis' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('analysis.heading')}</h2>
              <p className="text-slate-700">
                {t('analysis.body1', { probability: formatPercent(probability, locale) })}
              </p>
              <Card>
                <ResultTable
                  columns={[t('stats.hits'), t('analysis.naivePValue'), '']}
                  rows={[
                    {
                      key: 'preset',
                      label: t('targets.preset'),
                      tone: 'preset',
                      cells: [
                        formatInteger(presetEvaluation.hits, locale),
                        formatPValue(presetEvaluation.test.pValue, locale),
                        <Badge key="verdict" tone="preset">
                          {presetEvaluation.test.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                    {
                      key: 'post-hoc',
                      label: t('targets.postHoc'),
                      tone: 'posthoc',
                      cells: [
                        formatInteger(postHocEvaluation.hits, locale),
                        formatPValue(postHocEvaluation.test.pValue, locale),
                        <Badge key="verdict" tone="posthoc">
                          {postHocEvaluation.test.pValue < ALPHA
                            ? t('analysis.verdictStriking')
                            : t('analysis.verdictNothing')}
                        </Badge>,
                      ],
                    },
                  ]}
                  caption={t('analysis.naiveHint')}
                />
              </Card>
              <p className="text-slate-700">{t('analysis.body2')}</p>

              <Card
                title={t('analysis.selection.heading')}
                description={t('analysis.selection.body', { replications: SELECTION_REPLICATIONS })}
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
                        label: formatInteger(bin.value, locale),
                        count: bin.count,
                      }))}
                      markerIndex={selectionBins.findIndex(
                        (bin) => bin.value === selection.observedHits,
                      )}
                      markerLabel={t('analysis.selection.marker', { hits: selection.observedHits })}
                      xLabel={t('analysis.selection.histogramX')}
                      yLabel={t('analysis.selection.histogramY')}
                      ariaLabel={t('analysis.selection.histogramTitle')}
                    />
                    <StatTile
                      label={t('analysis.selection.adjusted')}
                      value={formatPValue(selection.adjusted.pValue, locale)}
                      hint={t('analysis.selection.adjustedHint', { hits: selection.observedHits })}
                      tone="posthoc"
                    />
                    <p className="text-sm text-slate-700">
                      {t(
                        selection.adjusted.pValue < ALPHA
                          ? 'analysis.selection.conclusionStrong'
                          : 'analysis.selection.conclusion',
                        {
                          mean: formatNumber(selection.meanMaxHits, locale, 1),
                          hits: selection.observedHits,
                        },
                      )}
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
                        dartCount={params.dartCount}
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
                  columns={[t('validation.originalData'), t('validation.freshData')]}
                  rows={[
                    {
                      key: 'preset',
                      label: t('targets.preset'),
                      tone: 'preset',
                      cells: [
                        `${formatInteger(presetEvaluation.hits, locale)} · ${formatPValue(presetEvaluation.test.pValue, locale)}`,
                        freshPreset
                          ? `${formatInteger(freshPreset.hits, locale)} · ${formatPValue(freshPreset.test.pValue, locale)}`
                          : '–',
                      ],
                    },
                    {
                      key: 'post-hoc',
                      label: t('targets.postHoc'),
                      tone: 'posthoc',
                      cells: [
                        `${formatInteger(postHocEvaluation.hits, locale)} · ${formatPValue(postHocEvaluation.test.pValue, locale)}`,
                        freshPostHoc
                          ? `${formatInteger(freshPostHoc.hits, locale)} · ${formatPValue(freshPostHoc.test.pValue, locale)}`
                          : '–',
                      ],
                    },
                  ]}
                  caption={`${t('stats.hits')} · ${t('analysis.naivePValue')}`}
                />
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => setFreshIndex((index) => index + 1)}>
                    {t('validation.throwFresh')}
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
                        t('validation.replications.meanHits'),
                        t('validation.replications.significantShare'),
                      ]}
                      rows={[
                        {
                          key: 'preset',
                          label: t('targets.preset'),
                          tone: 'preset',
                          cells: [
                            formatNumber(replication.preRegistered.meanHits, locale, 2),
                            formatPercent(replication.preRegistered.significantShare, locale),
                          ],
                        },
                        {
                          key: 'post-hoc',
                          label: t('targets.postHoc'),
                          tone: 'posthoc',
                          cells: [
                            formatNumber(replication.postHoc.meanHits, locale, 2),
                            formatPercent(replication.postHoc.significantShare, locale),
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
