/**
 * Runs `total` independent steps in small batches, yielding to the browser in
 * between so that a long Monte Carlo simulation never freezes the interface.
 * Returns a cancel function.
 */
export function runChunked<T>(options: {
  total: number
  chunkSize?: number
  step: (index: number) => T
  onProgress?: (completed: number) => void
  onDone: (results: T[]) => void
}): () => void {
  const { total, chunkSize = 20, step, onProgress, onDone } = options
  const results: T[] = []
  let cancelled = false
  let timer: ReturnType<typeof setTimeout> | undefined

  const runChunk = () => {
    if (cancelled) return
    const end = Math.min(results.length + chunkSize, total)
    for (let index = results.length; index < end; index += 1) {
      results.push(step(index))
    }
    onProgress?.(results.length)
    if (results.length >= total) {
      onDone(results)
      return
    }
    timer = setTimeout(runChunk, 0)
  }

  timer = setTimeout(runChunk, 0)

  return () => {
    cancelled = true
    if (timer !== undefined) clearTimeout(timer)
  }
}
