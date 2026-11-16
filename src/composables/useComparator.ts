import { ref, shallowRef } from 'vue'
import { collatzAsync, DEFAULT_STEP_LIMIT, parseStart } from '../services/collatz'
import { compareResults, type Comparison } from '../services/analysis'
import type { CollatzResult } from '../types/collatz'

/** Calcula duas sequências e compara sua complexidade. */
export function useComparator() {
  const a = ref('27')
  const b = ref('97')
  const limit = ref(DEFAULT_STEP_LIMIT)
  const running = ref(false)
  const error = ref<string | null>(null)
  const results = shallowRef<[CollatzResult, CollatzResult] | null>(null)
  const comparison = shallowRef<Comparison | null>(null)
  let controller: AbortController | null = null

  async function run() {
    const pa = parseStart(a.value)
    const pb = parseStart(b.value)
    if (!pa.ok || !pb.ok) {
      error.value = !pa.ok ? `Número A: ${pa.error}` : `Número B: ${(pb as { error: string }).error}`
      return
    }
    error.value = null
    running.value = true
    controller = new AbortController()
    const opts = { limit: limit.value, signal: controller.signal }
    const ra = await collatzAsync(pa.value, opts)
    const rb = await collatzAsync(pb.value, opts)
    controller = null
    running.value = false
    results.value = [ra, rb]
    comparison.value = compareResults(ra, rb)
  }

  function cancel() {
    controller?.abort()
  }

  function setPair(x: string, y: string) {
    a.value = x
    b.value = y
    return run()
  }

  function swap() {
    ;[a.value, b.value] = [b.value, a.value]
  }

  return { a, b, limit, running, error, results, comparison, run, cancel, setPair, swap }
}
