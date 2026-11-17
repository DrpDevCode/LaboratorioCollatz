import { describe, it, expect } from 'vitest'
import {
  collatzAsync,
  collatzSync,
  computeStats,
  log10Big,
  nextCollatz,
  parseStart,
  stepRow,
} from './collatz'

describe('nextCollatz', () => {
  it('aplica n/2 para par e 3n+1 para ímpar', () => {
    expect(nextCollatz(10n)).toBe(5n)
    expect(nextCollatz(5n)).toBe(16n)
  })
})

describe('números conhecidos', () => {
  it('1: sequência trivial, 0 etapas', () => {
    const r = collatzSync(1n)
    expect(r.sequence).toEqual([1n])
    expect(r.stats).toMatchObject({ steps: 0, max: 1n, min: 1n, evenOps: 0, oddOps: 0 })
    expect(r.status).toBe('converged')
  })

  it('2: [2, 1]', () => {
    const r = collatzSync(2n)
    expect(r.sequence).toEqual([2n, 1n])
    expect(r.stats).toMatchObject({ steps: 1, max: 2n, min: 1n, maxIndex: 0, evenOps: 1, oddOps: 0 })
  })

  it('7: 16 etapas, máximo 52', () => {
    const r = collatzSync(7n)
    expect(r.sequence).toEqual([
      7n, 22n, 11n, 34n, 17n, 52n, 26n, 13n, 40n, 20n, 10n, 5n, 16n, 8n, 4n, 2n, 1n,
    ])
    expect(r.stats).toMatchObject({ steps: 16, max: 52n, maxIndex: 5, evenOps: 11, oddOps: 5, maxDigits: 2 })
  })

  it('27: 111 etapas, máximo 9232 na etapa 77', () => {
    const r = collatzSync(27n)
    expect(r.stats).toMatchObject({ steps: 111, max: 9232n, maxIndex: 77, oddOps: 41, evenOps: 70, maxDigits: 4 })
    expect(r.status).toBe('converged')
  })

  it('97: 118 etapas, máximo 9232', () => {
    const r = collatzSync(97n)
    expect(r.stats).toMatchObject({ steps: 118, max: 9232n, min: 1n })
    expect(r.status).toBe('converged')
  })
})

describe('precisão BigInt', () => {
  it('trata números além de Number.MAX_SAFE_INTEGER sem perda', () => {
    const big = 2n ** 100n + 1n
    const r = collatzSync(big)
    expect(r.sequence[1]).toBe(3n * big + 1n)
    expect(r.status).toBe('converged')
    for (let i = 0; i < r.sequence.length - 1; i++) {
      expect(r.sequence[i + 1]).toBe(nextCollatz(r.sequence[i]))
    }
  })
})

describe('limite e cancelamento', () => {
  it('interrompe no limite sem declarar convergência', () => {
    const r = collatzSync(27n, 10)
    expect(r.status).toBe('limit')
    expect(r.stats.steps).toBe(10)
    expect(r.sequence.at(-1)).not.toBe(1n)
  })

  it('async produz o mesmo resultado que sync', async () => {
    const a = await collatzAsync(27n, { chunkSize: 7 })
    expect(a.sequence).toEqual(collatzSync(27n).sequence)
    expect(a.status).toBe('converged')
  })

  it('async respeita AbortSignal', async () => {
    const ctrl = new AbortController()
    ctrl.abort()
    const r = await collatzAsync(27n, { chunkSize: 5, signal: ctrl.signal })
    expect(r.status).toBe('cancelled')
  })

  it('async respeita o limite', async () => {
    const r = await collatzAsync(27n, { limit: 50, chunkSize: 7 })
    expect(r.status).toBe('limit')
    expect(r.stats.steps).toBe(50)
  })
})

describe('parseStart', () => {
  it.each(['', '0', '-3', '2.5', '1e3', 'abc', '12 3', '000'])('rejeita "%s"', (s) => {
    expect(parseStart(s).ok).toBe(false)
  })
  it('aceita inteiros grandes', () => {
    const p = parseStart(' 123456789012345678901234567890 ')
    expect(p.ok && p.value).toBe(123456789012345678901234567890n)
  })
})

describe('utilitários', () => {
  it('stepRow descreve operação e chegada', () => {
    const seq = collatzSync(3n).sequence
    expect(stepRow(seq, 0)).toMatchObject({ parity: 'impar', operation: '3 × 3 + 1', result: 10n })
    expect(stepRow(seq, 1)).toMatchObject({ parity: 'par', operation: '10 ÷ 2', result: 5n })
    expect(stepRow(seq, seq.length - 1)).toMatchObject({ operation: 'Chegada em 1', result: null })
  })
  it('computeStats rejeita sequência vazia', () => {
    expect(() => computeStats([])).toThrow()
  })
  it('log10Big aproxima números enormes', () => {
    expect(log10Big(10n ** 400n)).toBeCloseTo(400, 6)
    expect(log10Big(1000n)).toBeCloseTo(3, 9)
  })
})
