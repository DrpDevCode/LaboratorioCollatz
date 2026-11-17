import { describe, it, expect } from 'vitest'
import {
  baseTriangle,
  binomialIsOdd,
  chaosStep,
  defaultRatio,
  metrics,
  mulberry32,
  pascalMod2,
  pascalRows,
  removedAt,
  rule90,
  subdivide,
} from './sierpinski'

const tri = baseTriangle(400, 400)

describe('subdivide', () => {
  it('gera 3ⁿ triângulos', () => {
    for (let d = 0; d <= 6; d++) expect(subdivide(tri, d)).toHaveLength(3 ** d)
  })
  it('rejeita profundidade inválida', () => {
    expect(() => subdivide(tri, -1)).toThrow(RangeError)
    expect(() => subdivide(tri, 11)).toThrow(RangeError)
    expect(() => subdivide(tri, 1.5)).toThrow(RangeError)
  })
  it('nível 1 tem triângulos com metade do lado', () => {
    const [[a, b]] = subdivide(tri, 1)
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(Math.hypot(tri[1].x - tri[0].x, 0) / 2)
  })
  it('removidos no nível n = 3ⁿ⁻¹', () => {
    expect(removedAt(tri, 0)).toHaveLength(0)
    expect(removedAt(tri, 4)).toHaveLength(27)
  })
})

describe('baseTriangle', () => {
  it('é equilátero e cabe na caixa', () => {
    const [a, b, c] = baseTriangle(300, 200)
    const d = (p: typeof a, q: typeof a) => Math.hypot(p.x - q.x, p.y - q.y)
    expect(d(a, b)).toBeCloseTo(d(b, c))
    expect(d(b, c)).toBeCloseTo(d(c, a))
    for (const p of [a, b, c]) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(300)
      expect(p.y).toBeLessThanOrEqual(200)
    }
  })
})

describe('metrics', () => {
  it('valores conhecidos', () => {
    const m = metrics(3)
    expect(m.triangles).toBe(27)
    expect(m.removed).toBe(13)
    expect(m.areaFraction).toBeCloseTo(27 / 64)
    expect(m.perimeterFactor).toBeCloseTo(3 * 3.375)
    expect(m.dimension).toBeCloseTo(1.58496, 4)
  })
})

describe('jogo do caos', () => {
  it('é determinístico com a mesma semente e não sai do triângulo', () => {
    const run = () => {
      const out = { xs: new Float32Array(500), ys: new Float32Array(500), vs: new Uint8Array(500) }
      const st = { x: tri[0].x, y: tri[0].y, last: -1 }
      expect(chaosStep(tri, 0.5, st, 500, mulberry32(42), out, 0)).toBe(500)
      return out
    }
    const a = run()
    expect(Array.from(run().xs)).toEqual(Array.from(a.xs))
    for (let i = 0; i < 500; i++) {
      expect(a.ys[i]).toBeLessThanOrEqual(tri[0].y + 1e-3)
      expect(a.ys[i]).toBeGreaterThanOrEqual(tri[2].y - 1e-3)
    }
  })
  it('respeita a capacidade do buffer', () => {
    const out = { xs: new Float32Array(10), ys: new Float32Array(10), vs: new Uint8Array(10) }
    expect(chaosStep(tri, 0.5, { x: 0, y: 0, last: -1 }, 100, mulberry32(1), out, 4)).toBe(6)
  })
  it('noRepeat nunca repete vértice', () => {
    const out = { xs: new Float32Array(1000), ys: new Float32Array(1000), vs: new Uint8Array(1000) }
    chaosStep(tri, 0.5, { x: 0, y: 0, last: -1 }, 1000, mulberry32(7), out, 0, true)
    for (let i = 1; i < 1000; i++) expect(out.vs[i]).not.toBe(out.vs[i - 1])
  })
  it('razão padrão', () => {
    expect(defaultRatio(3)).toBe(0.5)
    expect(defaultRatio(5)).toBeCloseTo(0.618, 3)
    expect(defaultRatio(6)).toBeCloseTo(2 / 3, 5)
  })
})

describe('Pascal mod 2', () => {
  it('valores exatos', () => {
    expect(pascalRows(5)[4]).toEqual([1n, 4n, 6n, 4n, 1n])
    expect(pascalRows(41)[40][20]).toBe(137846528820n)
  })
  it('Lucas coincide com o cálculo exato', () => {
    const exact = pascalRows(64)
    const par = pascalMod2(64)
    for (let n = 0; n < 64; n++) for (let k = 0; k <= n; k++) expect(par[n][k]).toBe(exact[n][k] % 2n === 1n)
  })
  it('linha 2ᵏ−1 é toda ímpar', () => {
    expect(pascalMod2(32)[31].every(Boolean)).toBe(true)
    expect(binomialIsOdd(4, 2)).toBe(false)
  })
})

describe('Regra 90', () => {
  it('coincide com Pascal mod 2', () => {
    const g = 32
    const ca = rule90(g)
    const par = pascalMod2(g)
    for (let n = 0; n < g; n++) {
      const active: boolean[] = []
      for (let i = g - n; i <= g + n; i += 2) active.push(ca[n][i] === 1)
      expect(active).toEqual(par[n])
    }
  })
})
