/// <reference lib="webworker" />
import { exploreRange } from '../services/explorer'

export type ExplorerRequest = { start: number; end: number; topN: number }
export type ExplorerMessage =
  | { type: 'progress'; done: number; total: number }
  | { type: 'done'; result: ReturnType<typeof exploreRange> }
  | { type: 'error'; message: string }

const ctx = self as unknown as DedicatedWorkerGlobalScope

ctx.onmessage = (e: MessageEvent<ExplorerRequest>) => {
  const { start, end, topN } = e.data
  try {
    const result = exploreRange(start, end, {
      topN,
      onProgress: (done, total) => ctx.postMessage({ type: 'progress', done, total } satisfies ExplorerMessage),
    })
    ctx.postMessage({ type: 'done', result } satisfies ExplorerMessage)
  } catch (err) {
    ctx.postMessage({ type: 'error', message: err instanceof Error ? err.message : String(err) } satisfies ExplorerMessage)
  }
}
