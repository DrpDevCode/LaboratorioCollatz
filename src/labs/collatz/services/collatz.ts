import type { CollatzResult, CollatzStats, FinalStatus, Parity, StepRow } from '../types/collatz'

export const DEFAULT_STEP_LIMIT = 100_000
export const MAX_STEP_LIMIT = 5_000_000

/** Aplica uma iteração da regra de Collatz. */
export function nextCollatz(n: bigint): bigint {
  return n % 2n === 0n ? n / 2n : 3n * n + 1n
}

export function parityOf(n: bigint): Parity {
  return n % 2n === 0n ? 'par' : 'impar'
}

export type ParseResult = { ok: true; value: bigint } | { ok: false; error: string }

/** Valida e converte a entrada do usuário. */
export function parseStart(raw: string): ParseResult {
  const s = raw.trim()
  if (s === '') return { ok: false, error: 'Informe um número.' }
  if (!/^\d+$/.test(s)) {
    return { ok: false, error: 'Use apenas dígitos: um inteiro positivo, sem sinais, pontos ou espaços.' }
  }
  const value = BigInt(s)
  if (value < 1n) return { ok: false, error: 'O número deve ser maior ou igual a 1.' }
  return { ok: true, value }
}

/** Estatísticas calculadas a partir da sequência real. */
export function computeStats(sequence: bigint[]): CollatzStats {
  if (sequence.length === 0) throw new Error('Sequência vazia')
  let max = sequence[0]
  let min = sequence[0]
  let maxIndex = 0
  let evenOps = 0
  let oddOps = 0
  const last = sequence.length - 1
  for (let i = 0; i <= last; i++) {
    const v = sequence[i]
    if (v > max) {
      max = v
      maxIndex = i
    }
    if (v < min) min = v
    // Cada elemento, exceto o último, originou uma operação.
    if (i < last) {
      if (v % 2n === 0n) evenOps++
      else oddOps++
    }
  }
  return {
    start: sequence[0],
    steps: last,
    max,
    min,
    maxIndex,
    evenOps,
    oddOps,
    maxDigits: max.toString().length,
  }
}

function finish(sequence: bigint[], status: FinalStatus, limit: number): CollatzResult {
  return { sequence, stats: computeStats(sequence), status, limit }
}

/** Cálculo síncrono (testes, histórico e comparação). */
export function collatzSync(start: bigint, limit = DEFAULT_STEP_LIMIT): CollatzResult {
  const sequence: bigint[] = [start]
  let n = start
  while (n !== 1n && sequence.length - 1 < limit) {
    n = nextCollatz(n)
    sequence.push(n)
  }
  return finish(sequence, n === 1n ? 'converged' : 'limit', limit)
}

export interface AsyncOptions {
  limit?: number
  signal?: AbortSignal
  chunkSize?: number
  onProgress?: (steps: number) => void
}

/**
 * Cálculo em blocos, cedendo o thread principal entre eles para manter a
 * interface responsiva e permitir cancelamento via AbortSignal.
 */
export async function collatzAsync(start: bigint, opts: AsyncOptions = {}): Promise<CollatzResult> {
  const limit = opts.limit ?? DEFAULT_STEP_LIMIT
  const chunk = opts.chunkSize ?? 20_000
  const sequence: bigint[] = [start]
  let n = start
  if (opts.signal?.aborted) return finish(sequence, 'cancelled', limit)
  while (n !== 1n && sequence.length - 1 < limit) {
    const stop = Math.min(limit, sequence.length - 1 + chunk)
    while (n !== 1n && sequence.length - 1 < stop) {
      n = nextCollatz(n)
      sequence.push(n)
    }
    opts.onProgress?.(sequence.length - 1)
    if (n !== 1n && sequence.length - 1 < limit) {
      await new Promise((r) => setTimeout(r, 0))
      if (opts.signal?.aborted) return finish(sequence, 'cancelled', limit)
    }
  }
  return finish(sequence, n === 1n ? 'converged' : 'limit', limit)
}

/** Monta a linha de uma etapa sob demanda (sem materializar a tabela inteira). */
export function stepRow(sequence: bigint[], step: number): StepRow {
  const value = sequence[step]
  const parity = parityOf(value)
  if (step >= sequence.length - 1) {
    return {
      step,
      value,
      parity,
      operation: value === 1n ? 'Chegada em 1' : 'Interrompido',
      result: null,
    }
  }
  const operation = parity === 'par' ? `${value} ÷ 2` : `3 × ${value} + 1`
  return { step, value, parity, operation, result: sequence[step + 1] }
}

/** Aproximação de log10 válida para BigInt de qualquer tamanho. */
export function log10Big(n: bigint): number {
  const s = n.toString()
  if (s.length <= 15) return Math.log10(Number(n))
  return Math.log10(Number(s.slice(0, 15))) + (s.length - 15)
}
