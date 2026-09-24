import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { binIndexOf, binValues, integerHistogram } from '@/statistics/monteCarlo'
import { Histogram } from '@/visualization/Histogram'

const UNIT_BINS = 10

export type NullEvidenceScale = 'unit' | 'integer'

export interface NullEvidencePanelProps {
  title: string
  description: string
  actionLabel: string
  onRun: () => void
  /**
   * One value of the pre-registered statistic per independent data set.
   * Null until the reader runs it.
   */
  values: readonly number[] | null
  /**
   * 'unit' bins p-values into ten bins over the whole interval, so a valid
   * test of a true null draws a flat histogram. 'integer' gives one bar per
   * count, which is what a discrete statistic needs: binning counts into ten
   * bins leaves empty bars that look like a defect rather than arithmetic.
   */
  scale: NullEvidenceScale
  /** Value to single out, e.g. the count the generator predicts. */
  markerValue?: number
  markerLabel?: string
  formatBinLabel: (value: number) => string
  histogramX: string
  histogramY: string
  ariaLabel: string
  caption: string
  note: string
}

/**
 * Closing evidence that the generator really does contain what the scenario
 * says it contains.
 *
 * Every scenario asserts from its first screen that there is no effect, and
 * until here the reader has only our word for it. Running the
 * pre-registered analysis on many independent data sets makes the claim
 * checkable: p-values of a valid test on a true null are spread evenly, and
 * a count sits around the number the generator predicts.
 *
 * The panel deliberately replicates the pre-registered analysis only. A
 * searched-for result has no such reference distribution, which is what the
 * preceding stages are about.
 */
export function NullEvidencePanel({
  title,
  description,
  actionLabel,
  onRun,
  values,
  scale,
  markerValue,
  markerLabel,
  formatBinLabel,
  histogramX,
  histogramY,
  ariaLabel,
  caption,
  note,
}: NullEvidencePanelProps) {
  const columns =
    values === null
      ? []
      : scale === 'integer'
        ? integerHistogram(values).map((bin) => ({
            label: formatBinLabel(bin.value),
            count: bin.count,
            value: bin.value,
          }))
        : binValues(values, UNIT_BINS, { min: 0, max: 1 }).map((bin) => ({
            label: formatBinLabel(bin.start),
            count: bin.count,
            value: bin.start,
          }))

  let markerIndex = -1
  if (values !== null && markerValue !== undefined) {
    markerIndex =
      scale === 'integer'
        ? columns.findIndex((column) => column.value === Math.round(markerValue))
        : binIndexOf(binValues(values, UNIT_BINS, { min: 0, max: 1 }), markerValue)
  }

  return (
    <Card title={title} description={description} tone="fresh">
      <Button onClick={onRun}>{actionLabel}</Button>
      {columns.length > 0 ? (
        <div className="mt-4 space-y-3">
          <Histogram
            bins={columns.map(({ label, count }) => ({ label, count }))}
            markerIndex={markerIndex}
            markerLabel={markerLabel}
            xLabel={histogramX}
            yLabel={histogramY}
            ariaLabel={ariaLabel}
            tone="fresh"
            markerTone="preset"
          />
          <p className="text-sm text-slate-700">{caption}</p>
          <p className="text-sm text-slate-700">{note}</p>
        </div>
      ) : null}
    </Card>
  )
}
