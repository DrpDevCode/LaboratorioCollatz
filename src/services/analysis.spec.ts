import { describe, it, expect } from 'vitest'
import { analyze, compareResults, ratioText } from './analysis'
import { collatzSync } from './collatz'

describe('analyze', () => {
  it('27: tempo de parada 96 e crescimento 341,93×', () => {
    const a = analyze(collatzSync(27n))
    expect(a.stoppingTime).toBe(96)
    expect(a.growth).toBe('341,93')
    expect(a.oddShare).toBeCloseTo(41 / 111, 10)
  })

  it('7: subidas, descidas e maior salto', () => {
    // 7 22 11 34 17 52 26 13 40 20 10 5 16 8 4 2 1
    const a = analyze(collatzSync(7n))
    expect(a.longestRise).toBe(1)
    expect(a.longestFall).toBe(4)
    expect(a.biggestJump).toBe(35n) // 17 → 52
    expect(a.stoppingTime).toBe(11) // 5 < 7
  })

  it('1: sequência trivial', () => {
    const a = analyze(collatzSync(1n))
    expect(a).toMatchObject({ stoppingTime: null, growth: '1,00', oddShare: 0, longestRise: 0 })
  })

  it('ratioText arredonda e agrupa milhares', () => {
    expect(ratioText(10n, 3n)).toBe('3,33')
    expect(ratioText(2n, 3n)).toBe('0,67')
    expect(ratioText(12345678n, 1n)).toBe('12.345.678,00')
  })
})

describe('compareResults', () => {
  it('27 × 97: 97 tem mais etapas, 27 cresce mais, picos empatam', () => {
    const c = compareResults(collatzSync(27n), collatzSync(97n))
    const by = Object.fromEntries(c.criteria.map((x) => [x.key, x.winner]))
    expect(by.steps).toBe('b')
    expect(by.max).toBe('tie')
    expect(by.growth).toBe('a')
    expect(c.scoreA + c.scoreB).toBeLessThanOrEqual(c.criteria.length)
    expect(c.winner).not.toBe('tie')
  })

  it('números iguais empatam', () => {
    const c = compareResults(collatzSync(27n), collatzSync(27n))
    expect(c.winner).toBe('tie')
  })

  it('avisa quando uma sequência não chegou a 1', () => {
    const c = compareResults(collatzSync(27n, 10), collatzSync(7n))
    expect(c.warnings).toHaveLength(1)
  })
})
