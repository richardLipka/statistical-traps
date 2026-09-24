import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExplanationPanel } from '@/components/ExplanationPanel'
import { NullEvidencePanel } from '@/components/NullEvidencePanel'
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
import { ScatterPlot } from '@/visualization/ScatterPlot'
import { SCENARIO_STAGES, type ScenarioStage } from '@/scenarios/types'
import { runChunked } from '@/utils/chunked'
import {
  formatInteger,
  formatNumber,
  formatPValue,
  formatPercent,
} from '@/utils/format'
import {
  ALPHA,
  CONNECTED_FEATURE,
  STUDY_DEFAULTS,
  featureNumber,
  trueCorrelation,
} from '@/scenarios/07-ai-synthesis/model'
import {
  SEED_ROLE,
  generateReplicationStudy,
  generateStudy,
} from '@/scenarios/07-ai-synthesis/simulation'
import {
  candidatePoints,
  collectNullEvidence,
  countSignificant,
  evaluateCandidate,
  finalists,
  rankCandidates,
  replicateIntervention,
  replicateOnFreshData,
  selectionNullReplication,
  summarizeSelectionNull,
  type CandidateResult,
  type InterventionSummary,
  type NullEvidenceResult,
  type ReplicationSummary,
  type SelectionSearchResult,
} from '@/scenarios/07-ai-synthesis/analysis'
import { CandidateList } from '@/scenarios/07-ai-synthesis/components/CandidateList'
import { SearchGallery } from '@/scenarios/07-ai-synthesis/components/SearchGallery'
import {
  StudyControls,
  type StudyParams,
} from '@/scenarios/07-ai-synthesis/components/StudyControls'

const SELECTION_REPLICATIONS = 300
const VALIDATION_REPLICATIONS = 200
const INTERVENTION_REPLICATIONS = 200
const EVIDENCE_REPLICATIONS = 1000
const HISTOGRAM_BINS = 20
const SHORTLIST = 8
/** A second feature fixed in advance, which the hidden cause does not drive. */
const UNCONNECTED_EXAMPLE = CONNECTED_FEATURE + 1

/**
 * The scenario in one table: four questions, and the answers they get for a
 * feature that is really connected to the outcome and one that is not.
 *
 * Only the third row differs between them, and only the third row can be
 * settled by data the search never saw. The fourth is "no" for both, which
 * is the distinction the other six scenarios never reach.
 */
const LADDER = {
  describes: { connected: true, unconnected: true },
  distinguishes: { connected: false, unconnected: false },
  predicts: { connected: true, unconnected: false },
  changes: { connected: false, unconnected: false },
} as const

export default function AiSynthesisScenario() {
  const { t } = useTranslation('aisynthesis')
  const { t: tc, i18n } = useTranslation('common')
  const locale = i18n.language

  const [stage, setStage] = useState<ScenarioStage>('introduction')
  const [reached, setReached] = useState<ScenarioStage[]>(['introduction'])
  const [params, setParams] = useState<StudyParams>({
    candidateCount: STUDY_DEFAULTS.candidateCount,
    rowCount: STUDY_DEFAULTS.rowCount,
    seed: STUDY_DEFAULTS.seed,
  })
  const [guess, setGuess] = useState<number | null>(null)
  const [selectionSearches, setSelectionSearches] = useState<SelectionSearchResult[] | null>(null)
  const [selectionProgress, setSelectionProgress] = useState<number | null>(null)
  const [freshIndex, setFreshIndex] = useState(0)
  const [replication, setReplication] = useState<ReplicationSummary | null>(null)
  const [intervention, setIntervention] = useState<InterventionSummary | null>(null)
  const [evidence, setEvidence] = useState<NullEvidenceResult | null>(null)
  const cancelSelection = useRef<(() => void) | null>(null)

  useEffect(() => () => cancelSelection.current?.(), [])

  const study = useMemo(
    () =>
      generateStudy({
        candidateCount: params.candidateCount,
        rowCount: params.rowCount,
        seed: params.seed,
      }),
    [params.candidateCount, params.rowCount, params.seed],
  )
  const ranked = useMemo(() => rankCandidates(study), [study])
  const pair = useMemo(() => finalists(ranked), [ranked])
  const significantCount = useMemo(() => countSignificant(ranked), [ranked])
  const followed = useMemo(
    () => [pair.first.index, pair.second.index],
    [pair.first.index, pair.second.index],
  )

  const selection = useMemo(
    () =>
      selectionSearches
        ? summarizeSelectionNull(selectionSearches, pair.first.test.r)
        : null,
    [selectionSearches, pair.first.test.r],
  )
  const secondAdjusted = useMemo(
    () =>
      selectionSearches
        ? summarizeSelectionNull(selectionSearches, pair.second.test.r).adjusted.pValue
        : Number.NaN,
    [selectionSearches, pair.second.test.r],
  )
  /**
   * Whether the search correction rejected both finalists.
   *
   * It does at the default settings, and that is the point the scenario is
   * built on - but a smaller search charges less, so a strong enough
   * candidate can come through it. The text says which of the two happened
   * rather than assuming the default.
   */
  const bothRejected =
    selection !== null &&
    selection.adjusted.pValue >= ALPHA &&
    (Number.isNaN(secondAdjusted) || secondAdjusted >= ALPHA)

  const selectionBins = useMemo(
    () => (selection ? binValues(selection.absR, HISTOGRAM_BINS) : []),
    [selection],
  )

  const freshStudy = useMemo(
    () =>
      freshIndex === 0
        ? null
        : generateReplicationStudy({
            candidateCount: params.candidateCount,
            rowCount: params.rowCount,
            baseSeed: params.seed,
            role: SEED_ROLE.freshStudy,
            index: freshIndex - 1,
          }),
    [freshIndex, params.candidateCount, params.rowCount, params.seed],
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
    setIntervention(null)
    setEvidence(null)
    setFreshIndex(0)
  }, [])

  const updateParams = useCallback(
    (partial: Partial<StudyParams>) => {
      setParams((previous) => ({ ...previous, ...partial }))
      setGuess(null)
      invalidateResults()
    },
    [invalidateResults],
  )

  const runSelectionNull = useCallback(() => {
    cancelSelection.current?.()
    setSelectionSearches(null)
    setSelectionProgress(0)
    cancelSelection.current = runChunked({
      total: SELECTION_REPLICATIONS,
      chunkSize: 10,
      step: (index) =>
        selectionNullReplication({
          candidateCount: params.candidateCount,
          rowCount: params.rowCount,
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
  }, [params.candidateCount, params.rowCount, params.seed])

  const runReplications = useCallback(() => {
    setReplication(
      replicateOnFreshData({
        candidateCount: params.candidateCount,
        rowCount: params.rowCount,
        baseSeed: params.seed,
        replications: VALIDATION_REPLICATIONS,
        candidates: followed,
        observed: study,
      }),
    )
  }, [params.candidateCount, params.rowCount, params.seed, followed, study])

  const runIntervention = useCallback(() => {
    setIntervention(
      replicateIntervention({
        candidateCount: params.candidateCount,
        rowCount: params.rowCount,
        baseSeed: params.seed,
        replications: INTERVENTION_REPLICATIONS,
        candidates: followed,
      }),
    )
  }, [params.candidateCount, params.rowCount, params.seed, followed])

  const runEvidence = useCallback(() => {
    setEvidence(
      collectNullEvidence({
        candidateCount: params.candidateCount,
        rowCount: params.rowCount,
        baseSeed: params.seed,
        replications: EVIDENCE_REPLICATIONS,
        unconnected: UNCONNECTED_EXAMPLE,
      }),
    )
  }, [params.candidateCount, params.rowCount, params.seed])

  const restart = useCallback(() => {
    invalidateResults()
    setParams({
      candidateCount: STUDY_DEFAULTS.candidateCount,
      rowCount: STUDY_DEFAULTS.rowCount,
      seed: STUDY_DEFAULTS.seed,
    })
    setGuess(null)
    setStage('introduction')
    setReached(['introduction'])
  }, [invalidateResults])

  /** Which feature is really connected stays hidden until the data decide it. */
  const revealed = stage === 'validation' || stage === 'conclusion'
  const showsFresh = revealed && freshStudy !== null
  const shownStudy = showsFresh && freshStudy ? freshStudy : study

  const labelFor = (candidate: CandidateResult) =>
    t('features.label', { feature: featureNumber(candidate.index) })
  const verdictFor = (candidate: CandidateResult) =>
    revealed
      ? candidate.connected
        ? t('features.connected')
        : t('features.unconnected')
      : t('features.unknown')

  const plotFor = (candidate: CandidateResult) => {
    const points = candidatePoints(shownStudy, candidate.index)
    const line = fitPolynomial(candidatePoints(study, candidate.index), 1)
    return (
      <div key={candidate.index}>
        <ScatterPlot
          points={points}
          predict={(x) => predictPolynomial(line, x)}
          lineTone={revealed && candidate.connected ? 'fresh' : 'posthoc'}
          pointTone={showsFresh ? 'fresh' : 'neutral'}
          ariaLabel={t('plot.candidateAria', {
            feature: featureNumber(candidate.index),
          })}
        />
        <p className="mt-1.5 text-sm font-semibold text-slate-900">{labelFor(candidate)}</p>
        <p className="text-xs text-slate-600 tabular-nums">
          {t('plot.candidateStats', {
            r: formatNumber(
              showsFresh ? evaluateCandidate(shownStudy, candidate.index).test.r : candidate.test.r,
              locale,
              2,
            ),
          })}
        </p>
        {revealed ? (
          <Badge tone={candidate.connected ? 'fresh' : 'neutral'} className="mt-1">
            {verdictFor(candidate)}
          </Badge>
        ) : null}
      </div>
    )
  }

  const guessedCandidate = ranked.find((result) => result.index === guess) ?? null
  const guessWasRight = guessedCandidate?.connected ?? false

  return (
    <ScenarioShell
      title={tc('scenarios.07-ai-synthesis.title')}
      summary={tc('scenarios.07-ai-synthesis.summary')}
      conceptKeys={[
        'patternDiscovery',
        'hypothesisGeneration',
        'generalization',
        'causalInference',
        'independentReplication',
      ]}
      stages={SCENARIO_STAGES}
      current={stage}
      reached={reached}
      onStageChange={goTo}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(20rem,30rem)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 space-y-3 lg:sticky lg:top-4">
          {stage === 'introduction' || stage === 'experiment' ? (
            <div className="flex aspect-[2/1] w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-board px-6 text-center text-sm text-slate-500">
              {stage === 'introduction' ? t('plot.notHandedOver') : t('plot.searching')}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {[pair.first, pair.second].map((candidate) => plotFor(candidate))}
            </div>
          )}

          {stage !== 'introduction' ? (
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={showsFresh ? 'fresh' : 'neutral'} withDot>
                {showsFresh ? t('validation.freshCases') : t('plot.legendCase')}
              </Badge>
              <Badge tone="neutral">{t('plot.legendAxes')}</Badge>
            </div>
          ) : null}

          {stage !== 'introduction' ? (
            <dl className="grid grid-cols-3 gap-2">
              <StatTile
                label={t('stats.candidates')}
                value={formatInteger(params.candidateCount, locale)}
                hint={t('stats.candidatesHint')}
              />
              <StatTile
                label={t('stats.rows')}
                value={formatInteger(params.rowCount, locale)}
              />
              <StatTile
                label={t('stats.significant')}
                value={formatInteger(significantCount, locale)}
                hint={t('stats.significantHint', {
                  expected: formatNumber(params.candidateCount * ALPHA, locale, 0),
                })}
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
              <Card title={t('intro.questionsHeading')} tone="preset">
                <ol className="space-y-2 text-sm text-slate-700">
                  {(['describes', 'distinguishes', 'predicts', 'changes'] as const).map(
                    (question, index) => (
                      <li key={question} className="flex gap-2">
                        <span className="font-semibold tabular-nums text-slate-500">
                          {index + 1}.
                        </span>
                        <span>{t(`questions.${question}`)}</span>
                      </li>
                    ),
                  )}
                </ol>
              </Card>
              <p className="text-slate-700">{t('intro.body3')}</p>
              <Card title={tc('scenario.trueProcessHeading')}>
                <p className="text-sm text-slate-700">
                  {t('intro.trueProcess', {
                    correlation: formatNumber(trueCorrelation(), locale, 2),
                  })}
                </p>
              </Card>
              <Card title={t('intro.fictionHeading')} tone="fresh">
                <p className="text-sm text-slate-700">{t('intro.fictionBody')}</p>
              </Card>
              <ExplanationPanel title={t('intro.recipeTitle')}>
                <ol className="space-y-2">
                  {([1, 2, 3] as const).map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="font-semibold tabular-nums text-slate-500">{step}.</span>
                      <span>{t(`intro.recipeStep${step}`)}</span>
                    </li>
                  ))}
                </ol>
              </ExplanationPanel>
              <Button onClick={() => goTo('experiment')}>{t('intro.action')}</Button>
            </section>
          ) : null}

          {stage === 'experiment' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                {t('experiment.heading')}
              </h2>
              <p className="text-slate-700">
                {t('experiment.body1', {
                  candidates: formatInteger(params.candidateCount, locale),
                })}
              </p>
              <Card title={t('experiment.shortlist')} description={t('experiment.shortlistHint')}>
                <CandidateList results={ranked.slice(0, SHORTLIST)} highlighted={followed} />
              </Card>
              <p className="text-slate-700">
                {t('experiment.body2', { count: significantCount })}
              </p>
              <ExplanationPanel title={t('experiment.numbersTitle')}>
                <p>{t('experiment.numbersBody1')}</p>
                <p>
                  {t('experiment.numbersBody2', {
                    candidates: formatInteger(params.candidateCount, locale),
                    expected: formatNumber(params.candidateCount * ALPHA, locale, 0),
                  })}
                </p>
              </ExplanationPanel>
              <StudyControls
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
              <Card>
                <ResultTable
                  columns={[t('stats.correlation'), t('stats.pValue'), '']}
                  rows={[pair.first, pair.second].map((candidate) => ({
                    key: String(candidate.index),
                    label: labelFor(candidate),
                    tone: 'posthoc' as const,
                    cells: [
                      formatNumber(candidate.test.r, locale, 2),
                      formatPValue(candidate.test.pValue, locale),
                      <Badge key="verdict" tone="posthoc">
                        {candidate.test.pValue < ALPHA
                          ? t('analysis.verdictStriking')
                          : t('analysis.verdictNothing')}
                      </Badge>,
                    ],
                  }))}
                  caption={t('observation.tableHint')}
                />
              </Card>
              <p className="text-slate-700">{t('observation.body2')}</p>
              <Card title={t('observation.guessHeading')} description={t('observation.guessBody')}>
                <div className="flex flex-wrap gap-2">
                  {[pair.first, pair.second].map((candidate) => (
                    <Button
                      key={candidate.index}
                      variant={guess === candidate.index ? 'primary' : 'secondary'}
                      aria-pressed={guess === candidate.index}
                      onClick={() => setGuess(candidate.index)}
                    >
                      {labelFor(candidate)}
                    </Button>
                  ))}
                </div>
                {guess !== null ? (
                  <p className="mt-3 text-sm text-slate-700">{t('observation.guessRecorded')}</p>
                ) : null}
              </Card>
              <div>
                <Button onClick={() => goTo('analysis')} disabled={guess === null}>
                  {t('observation.action')}
                </Button>
                {guess === null ? (
                  <p className="mt-2 text-xs text-slate-500">{t('observation.guessFirst')}</p>
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

              <Card
                title={t('analysis.selection.heading')}
                description={t('analysis.selection.body', {
                  candidates: formatInteger(params.candidateCount, locale),
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
                    <ResultTable
                      columns={[t('analysis.naivePValue'), t('analysis.selection.adjusted')]}
                      rows={[
                        {
                          key: 'first',
                          label: labelFor(pair.first),
                          tone: 'posthoc',
                          cells: [
                            formatPValue(pair.first.test.pValue, locale),
                            formatPValue(selection.adjusted.pValue, locale),
                          ],
                        },
                        {
                          key: 'second',
                          label: labelFor(pair.second),
                          tone: 'posthoc',
                          cells: [
                            formatPValue(pair.second.test.pValue, locale),
                            formatPValue(secondAdjusted, locale),
                          ],
                        },
                      ]}
                      caption={t('analysis.selection.tableHint')}
                    />
                    <p className="text-sm text-slate-700">
                      {t(
                        bothRejected
                          ? 'analysis.selection.bothFail'
                          : 'analysis.selection.oneSurvives',
                      )}
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {t(
                        bothRejected
                          ? 'analysis.selection.notFalse'
                          : 'analysis.selection.notProven',
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
                        candidateCount={params.candidateCount}
                        rowCount={params.rowCount}
                        baseSeed={params.seed}
                      />
                    </div>
                  </div>
                ) : null}
              </Card>

              <ExplanationPanel title={t('analysis.explanation.title')}>
                <p>
                  {t('analysis.explanation.body1', {
                    candidates: formatInteger(params.candidateCount, locale),
                  })}
                </p>
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
                      rows={replication.candidates.map((stats) => ({
                        key: String(stats.candidate),
                        label: t('features.label', { feature: featureNumber(stats.candidate) }),
                        tone: stats.connected ? ('fresh' as const) : ('posthoc' as const),
                        cells: [
                          formatNumber(stats.meanR, locale, 2),
                          formatPercent(stats.shareSignificant, locale, 1),
                          formatNumber(stats.meanFreshRSquared, locale, 2),
                        ],
                      }))}
                      caption={t('validation.replications.tableHint')}
                    />
                    <p className="text-sm text-slate-700">{t('validation.replications.note')}</p>
                    {guessedCandidate ? (
                      <p className="text-sm font-medium text-slate-900">
                        {guessWasRight
                          ? t('validation.guessRight', {
                              feature: featureNumber(guessedCandidate.index),
                            })
                          : t('validation.guessWrong', {
                              feature: featureNumber(guessedCandidate.index),
                            })}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </ReplicationPanel>

              <p className="text-slate-700">{t('validation.body2')}</p>

              <Card
                title={t('validation.intervention.heading')}
                description={t('validation.intervention.body')}
                tone="fresh"
              >
                <Button onClick={runIntervention}>
                  {t('validation.intervention.run', { replications: INTERVENTION_REPLICATIONS })}
                </Button>
                {intervention ? (
                  <div className="mt-4 space-y-3">
                    <ResultTable
                      columns={[
                        t('validation.intervention.observed'),
                        t('validation.intervention.set'),
                      ]}
                      rows={intervention.candidates.map((stats) => ({
                        key: String(stats.candidate),
                        label: t('features.label', { feature: featureNumber(stats.candidate) }),
                        tone: stats.connected ? ('fresh' as const) : ('posthoc' as const),
                        cells: [
                          formatNumber(stats.observedDifference, locale, 2),
                          formatNumber(stats.interventionDifference, locale, 2),
                        ],
                      }))}
                      caption={t('validation.intervention.tableHint')}
                    />
                    <p className="text-sm text-slate-700">{t('validation.intervention.note')}</p>
                    <p className="text-sm text-slate-700">{t('validation.intervention.caveat')}</p>
                  </div>
                ) : null}
              </Card>

              <Button onClick={() => goTo('conclusion')}>{t('validation.action')}</Button>
            </section>
          ) : null}

          {stage === 'conclusion' ? (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('conclusion.heading')}</h2>
              <Card title={t('conclusion.ladderHeading')}>
                <ResultTable
                  columns={[labelFor(pair.first), labelFor(pair.second)]}
                  rows={(['describes', 'distinguishes', 'predicts', 'changes'] as const).map(
                    (question) => ({
                      key: question,
                      label: t(`questions.${question}`),
                      cells: [pair.first, pair.second].map((candidate) => {
                        const yes =
                          LADDER[question][candidate.connected ? 'connected' : 'unconnected']
                        return (
                          <Badge key={candidate.index} tone={yes ? 'fresh' : 'neutral'}>
                            {yes ? t('answers.yes') : t('answers.no')}
                          </Badge>
                        )
                      }),
                    }),
                  )}
                  caption={t('conclusion.ladderHint')}
                />
              </Card>
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
              <NullEvidencePanel
                title={t('conclusion.evidence.heading')}
                description={t('conclusion.evidence.body', {
                  replications: formatInteger(EVIDENCE_REPLICATIONS, locale),
                })}
                actionLabel={t('conclusion.evidence.run', {
                  replications: formatInteger(EVIDENCE_REPLICATIONS, locale),
                })}
                onRun={runEvidence}
                values={evidence?.unconnectedPValues ?? null}
                scale="unit"
                formatBinLabel={(value) => formatNumber(value, locale, 1)}
                histogramX={t('conclusion.evidence.histogramX')}
                histogramY={t('conclusion.evidence.histogramY')}
                ariaLabel={t('conclusion.evidence.ariaLabel', {
                  replications: formatInteger(EVIDENCE_REPLICATIONS, locale),
                })}
                caption={t('conclusion.evidence.caption')}
                note={t('conclusion.evidence.note', {
                  connected: formatPercent(evidence?.shareConnectedSignificant ?? 0, locale, 1),
                  unconnected: formatPercent(evidence?.shareUnconnectedSignificant ?? 0, locale, 1),
                })}
              />
              <Card title={t('conclusion.aiHeading')} tone="preset">
                <p className="text-sm text-slate-700">{t('conclusion.aiBody1')}</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">{t('conclusion.aiLine')}</p>
                <p className="mt-3 text-sm text-slate-700">{t('conclusion.aiBody2')}</p>
              </Card>
              <Card title={t('conclusion.endHeading')} tone="fresh">
                <p className="text-sm text-slate-700">{t('conclusion.endBody')}</p>
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
