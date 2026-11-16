import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { validateRange, type ExploreResult } from '../services/explorer'
import type { ExplorerMessage, ExplorerRequest } from '../workers/explorer.worker'

/** Executa a exploração de intervalos num Web Worker (cancelável). */
export function useExplorer() {
  const start = ref('1')
  const end = ref('100000')
  const topN = ref(20)
  const running = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)
  const cancelled = ref(false)
  const result = shallowRef<ExploreResult | null>(null)
  let worker: Worker | null = null

  function stopWorker() {
    worker?.terminate()
    worker = null
  }

  function run() {
    const check = validateRange(start.value, end.value)
    if (!check.ok) {
      error.value = check.error
      return
    }
    stopWorker()
    error.value = null
    cancelled.value = false
    progress.value = 0
    running.value = true
    worker = new Worker(new URL('../workers/explorer.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<ExplorerMessage>) => {
      const m = e.data
      if (m.type === 'progress') progress.value = m.done / m.total
      else {
        if (m.type === 'done') result.value = m.result
        else error.value = `Falha na exploração: ${m.message}`
        running.value = false
        stopWorker()
      }
    }
    worker.onerror = (e) => {
      error.value = `Falha na exploração: ${e.message}`
      running.value = false
      stopWorker()
    }
    const req: ExplorerRequest = { start: check.start, end: check.end, topN: topN.value }
    worker.postMessage(req)
  }

  function cancel() {
    if (!running.value) return
    stopWorker()
    running.value = false
    cancelled.value = true
  }

  onBeforeUnmount(stopWorker)

  return { start, end, topN, running, progress, error, cancelled, result, run, cancel }
}
