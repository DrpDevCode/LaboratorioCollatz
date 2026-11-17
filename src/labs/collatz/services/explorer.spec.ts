import { describe, it, expect } from 'vitest'
import { exploreRange, validateRange } from './explorer'
import { collatzSync } from './collatz'

describe('exploreRange', () => {
  it('1–10: 9 exige mais etapas (19)', () => {
    const r = exploreRange(1, 10)
    expect(r.topSteps[0]).toMatchObject({ n: 9, steps: 19 })
    expect(r.count).toBe(10)
  })

  it('1–100.000: 77.031 com 350 etapas', () => {
    const r = exploreRange(1, 100_000, { topN: 5 })
    expect(r.topSteps[0]).toMatchObject({ n: 77031, steps: 350 })
    expect(r.topSteps).toHaveLength(5)
    expect(r.histogram.reduce((a, b) => a + b, 0)).toBe(100_000)
  })

  it('recordes clássicos de 1 a 30', () => {
    const r = exploreRange(1, 30)
    expect(r.records.map((x) => x.n)).toEqual([1, 2, 3, 6, 7, 9, 18, 25, 27])
  })

  it('maior pico de 1–100 é 9.232', () => {
    const r = exploreRange(1, 100)
    expect(r.topPeaks[0].peak).toBe('9232')
    expect(r.topPeaks[0].n).toBe(27) // menor n que atinge 9.232
  })

  it('bate com o cálculo BigInt em intervalo que não começa em 1', () => {
    const r = exploreRange(1000, 1200, { topN: 201 })
    for (const e of r.topSteps) {
      const s = collatzSync(BigInt(e.n))
      expect(e.steps).toBe(s.stats.steps)
      expect(e.peak).toBe(s.stats.max.toString())
    }
  })

  it('média de etapas confere', () => {
    const r = exploreRange(1, 3) // 0, 1, 7
    expect(r.averageSteps).toBeCloseTo(8 / 3, 10)
  })
})

describe('validateRange', () => {
  it.each([
    ['0', '10'],
    ['10', '5'],
    ['a', '5'],
    ['1', '20000000'],
    ['1', '2000000000000'],
  ])('rejeita %s–%s', (a, b) => {
    expect(validateRange(a, b).ok).toBe(false)
  })
  it('aceita intervalo válido', () => {
    expect(validateRange('1', '100000')).toEqual({ ok: true, start: 1, end: 100000 })
  })
})
