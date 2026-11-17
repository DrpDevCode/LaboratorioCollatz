import { collatzSync, nextCollatz } from './collatz'

/** Maior intervalo aceito por exploração. */
export const EXPLORE_MAX_SIZE = 10_000_000
/** Maior valor final aceito (n precisa caber com folga em Number). */
export const EXPLORE_MAX_END = 1_000_000_000_000
/** Acima disso a memoização ocuparia memória demais. */
const MEMO_LIMIT = 10_000_000
/** Acima disso 3x+1 pode passar de 2^53: segue em BigInt. */
const SAFE_X = Math.floor((Number.MAX_SAFE_INTEGER - 1) / 3)

export interface ExploreEntry {
  n: number
  steps: number
  /** Pico exato (BigInt em texto). */
  peak: string
}

export interface ExploreResult {
  start: number
  end: number
  count: number
  averageSteps: number
  /** Números com mais etapas, em ordem decrescente. */
  topSteps: ExploreEntry[]
  /** Números com os maiores picos. */
  topPeaks: ExploreEntry[]
  /** Números que bateram o recorde de etapas ao percorrer o intervalo em ordem. */
  records: { n: number; steps: number }[]
  /** histogram[s] = quantos números exigiram s etapas. */
  histogram: number[]
  elapsedMs: number
}

export interface ExploreOptions {
  topN?: number
  onProgress?: (done: number, total: number) => void
  progressEvery?: number
}

export type RangeCheck = { ok: true; start: number; end: number } | { ok: false; error: string }

export function validateRange(rawStart: string, rawEnd: string): RangeCheck {
  const s = rawStart.trim()
  const e = rawEnd.trim()
  if (!/^\d+$/.test(s) || !/^\d+$/.test(e)) return { ok: false, error: 'Informe inteiros positivos no início e no fim.' }
  const start = Number(s)
  const end = Number(e)
  if (start < 1) return { ok: false, error: 'O início deve ser maior ou igual a 1.' }
  if (end < start) return { ok: false, error: 'O fim deve ser maior ou igual ao início.' }
  if (end > EXPLORE_MAX_END) return { ok: false, error: `O fim deve ser no máximo ${EXPLORE_MAX_END.toLocaleString('pt-BR')}.` }
  if (end - start + 1 > EXPLORE_MAX_SIZE) {
    return { ok: false, error: `O intervalo pode ter no máximo ${EXPLORE_MAX_SIZE.toLocaleString('pt-BR')} números.` }
  }
  return { ok: true, start, end }
}

/** Mantém os k maiores por `score` (decrescente; empate favorece o menor n). */
function pushTop<T extends { n: number }>(list: T[], item: T, k: number, score: (t: T) => number) {
  const sc = score(item)
  if (list.length === k && sc <= score(list[k - 1])) return
  let i = list.length
  while (i > 0 && score(list[i - 1]) < sc) i--
  list.splice(i, 0, item)
  if (list.length > k) list.pop()
}

/**
 * Percorre [start, end] calculando etapas e pico de cada número.
 * Usa memoização: ao cair abaixo de n (num valor já visitado do intervalo),
 * reaproveita as etapas e o pico guardados para ele.
 */
export function exploreRange(start: number, end: number, opts: ExploreOptions = {}): ExploreResult {
  const t0 = performance.now()
  const topN = opts.topN ?? 20
  const every = opts.progressEvery ?? 50_000
  const total = end - start + 1
  const memoSize = end <= MEMO_LIMIT ? end + 1 : 0
  const memoSteps = new Uint16Array(memoSize)
  const memoPeak = new Float64Array(memoSize)

  const topSteps: { n: number; steps: number; peak: number }[] = []
  const topPeaks: { n: number; steps: number; peak: number }[] = []
  const records: { n: number; steps: number }[] = []
  const histogram: number[] = []
  let record = -1
  let sumSteps = 0

  for (let n = start; n <= end; n++) {
    let x = n
    let steps = 0
    let peak = n
    while (x !== 1) {
      if (x < n && x >= start && x < memoSize) {
        steps += memoSteps[x]
        if (memoPeak[x] > peak) peak = memoPeak[x]
        break
      }
      if (x > SAFE_X) {
        // Caminho raro: continua com aritmética exata.
        let b = BigInt(x)
        let pb = BigInt(peak)
        while (b !== 1n) {
          b = nextCollatz(b)
          steps++
          if (b > pb) pb = b
        }
        peak = Number(pb) // aproximado; o pico exato do top é recalculado no fim
        break
      }
      x = x % 2 === 0 ? x / 2 : 3 * x + 1
      steps++
      if (x > peak) peak = x
    }
    if (n < memoSize) {
      memoSteps[n] = steps
      memoPeak[n] = peak
    }
    sumSteps += steps
    histogram[steps] = (histogram[steps] ?? 0) + 1
    if (steps > record) {
      record = steps
      records.push({ n, steps })
    }
    pushTop(topSteps, { n, steps, peak }, topN, (t) => t.steps)
    pushTop(topPeaks, { n, steps, peak }, topN, (t) => t.peak)
    if (opts.onProgress && (n - start + 1) % every === 0) opts.onProgress(n - start + 1, total)
  }
  opts.onProgress?.(total, total)

  // Picos exatos via BigInt, só para os números exibidos.
  const exact = (e: { n: number; steps: number }): ExploreEntry => {
    const r = collatzSync(BigInt(e.n), e.steps + 1)
    return { n: e.n, steps: e.steps, peak: r.stats.max.toString() }
  }
  const peaksExact = topPeaks.map(exact).sort((a, b) => {
    const d = BigInt(b.peak) - BigInt(a.peak)
    return d > 0n ? 1 : d < 0n ? -1 : a.n - b.n
  })

  for (let i = 0; i < histogram.length; i++) histogram[i] ??= 0

  return {
    start,
    end,
    count: total,
    averageSteps: sumSteps / total,
    topSteps: topSteps.map(exact),
    topPeaks: peaksExact,
    records,
    histogram,
    elapsedMs: performance.now() - t0,
  }
}
