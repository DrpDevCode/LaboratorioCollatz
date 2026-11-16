import { computed, ref, shallowRef } from 'vue'
import { collatzAsync, DEFAULT_STEP_LIMIT, MAX_STEP_LIMIT, parseStart } from '../services/collatz'
import type { CollatzResult, RunStatus } from '../types/collatz'

/** Estado e ações do cálculo principal. */
export function useCollatz() {
  const input = ref('27')
  const limit = ref(DEFAULT_STEP_LIMIT)
  const status = ref<RunStatus>('idle')
  const progress = ref(0)
  const error = ref<string | null>(null)
  const result = shallowRef<CollatzResult | null>(null)
  let controller: AbortController | null = null

  const running = computed(() => status.value === 'running')

  function validLimit(): number | null {
    const l = Math.floor(Number(limit.value))
    if (!Number.isFinite(l) || l < 1 || l > MAX_STEP_LIMIT) {
      error.value = `O limite de etapas deve estar entre 1 e ${MAX_STEP_LIMIT.toLocaleString('pt-BR')}.`
      return null
    }
    return l
  }

  async function run(): Promise<CollatzResult | null> {
    if (running.value) return null
    const parsed = parseStart(input.value)
    if (!parsed.ok) {
      error.value = parsed.error
      return null
    }
    const l = validLimit()
    if (l === null) return null

    error.value = null
    status.value = 'running'
    progress.value = 0
    result.value = null
    controller = new AbortController()
    const r = await collatzAsync(parsed.value, {
      limit: l,
      signal: controller.signal,
      onProgress: (s) => (progress.value = s),
    })
    controller = null
    result.value = r
    status.value = r.status
    return r
  }

  function cancel() {
    controller?.abort()
  }

  function clear() {
    cancel()
    input.value = ''
    result.value = null
    status.value = 'idle'
    progress.value = 0
    error.value = null
  }

  async function load(start: string, stepLimit: number) {
    input.value = start
    limit.value = stepLimit
    return run()
  }

  return { input, limit, status, progress, error, result, running, run, cancel, clear, load }
}
