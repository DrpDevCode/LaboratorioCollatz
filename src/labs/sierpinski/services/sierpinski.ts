import type { Point, Triangle } from '../types/sierpinski'

export const MAX_DEPTH = 10

/** Triângulo equilátero que cabe numa caixa largura × altura, com margem. */
export function baseTriangle(width: number, height: number, margin = 16): Triangle {
  const w = width - 2 * margin
  const h = height - 2 * margin
  const side = Math.min(w, (h * 2) / Math.sqrt(3))
  const th = (side * Math.sqrt(3)) / 2
  const x0 = (width - side) / 2
  const y0 = (height + th) / 2
  return [
    { x: x0, y: y0 },
    { x: x0 + side, y: y0 },
    { x: x0 + side / 2, y: y0 - th },
  ]
}

const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

/** Subdivide recursivamente: cada triângulo vira três (o central é removido). */
export function subdivide(tri: Triangle, depth: number): Triangle[] {
  if (!Number.isInteger(depth) || depth < 0 || depth > MAX_DEPTH) throw new RangeError(`profundidade deve ser 0..${MAX_DEPTH}`)
  let level: Triangle[] = [tri]
  for (let d = 0; d < depth; d++) {
    const next: Triangle[] = []
    for (const [a, b, c] of level) {
      const ab = mid(a, b)
      const bc = mid(b, c)
      const ca = mid(c, a)
      next.push([a, ab, ca], [ab, b, bc], [ca, bc, c])
    }
    level = next
  }
  return level
}

/** Triângulos removidos (invertidos) em cada nível, para visualizar os "buracos". */
export function removedAt(tri: Triangle, depth: number): Triangle[] {
  if (depth < 1) return []
  return subdivide(tri, depth - 1).map(([a, b, c]) => [mid(a, b), mid(b, c), mid(c, a)] as Triangle)
}

export interface Metrics {
  depth: number
  triangles: number
  removed: number
  areaFraction: number
  perimeterFactor: number
  dimension: number
}

/** Métricas para lado 1: área relativa (3/4)ⁿ, perímetro total 3·(3/2)ⁿ. */
export function metrics(depth: number): Metrics {
  return {
    depth,
    triangles: 3 ** depth,
    removed: (3 ** depth - 1) / 2,
    areaFraction: (3 / 4) ** depth,
    perimeterFactor: 3 * (3 / 2) ** depth,
    dimension: Math.log(3) / Math.log(2),
  }
}

/** Gerador pseudoaleatório determinístico (mulberry32). */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Vértices de um polígono regular de k lados, centrado na caixa. */
export function polygon(k: number, width: number, height: number, margin = 16): Point[] {
  if (k === 3) return baseTriangle(width, height, margin)
  const r = Math.min(width, height) / 2 - margin
  const cx = width / 2
  const cy = height / 2
  return Array.from({ length: k }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / k
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })
}

/** Razão clássica que faz as cópias de um k-gono se tocarem sem sobrepor. */
export function defaultRatio(k: number): number {
  if (k === 3) return 0.5
  if (k === 4) return 0.5
  let s = 0
  for (let j = 1; j <= Math.floor(k / 4); j++) s += Math.cos((2 * Math.PI * j) / k)
  return 1 - 1 / (2 * (1 + s))
}

export interface ChaosState {
  x: number
  y: number
  last: number
}

/**
 * Jogo do Caos: escolhe um vértice ao acaso e avança `ratio` da distância até ele.
 * Grava pontos em xs/ys/vs a partir de `offset`. Com `noRepeat`, nunca repete o vértice anterior.
 */
export function chaosStep(
  vertices: Point[],
  ratio: number,
  state: ChaosState,
  count: number,
  rng: () => number,
  out: { xs: Float32Array; ys: Float32Array; vs: Uint8Array },
  offset: number,
  noRepeat = false,
): number {
  const k = vertices.length
  let n = 0
  while (n < count && offset + n < out.xs.length) {
    let v = Math.floor(rng() * k)
    if (noRepeat && k > 1) while (v === state.last) v = Math.floor(rng() * k)
    const p = vertices[v]
    state.x += (p.x - state.x) * ratio
    state.y += (p.y - state.y) * ratio
    state.last = v
    out.xs[offset + n] = state.x
    out.ys[offset + n] = state.y
    out.vs[offset + n] = v
    n++
  }
  return n
}

/** C(n, k) é ímpar ⇔ k & (n − k) = 0 (teorema de Lucas). */
export function binomialIsOdd(n: number, k: number): boolean {
  return k >= 0 && k <= n && (k & (n - k)) === 0
}

/** Linhas do Triângulo de Pascal com valores exatos (BigInt). */
export function pascalRows(rows: number): bigint[][] {
  const out: bigint[][] = []
  for (let n = 0; n < rows; n++) {
    const row: bigint[] = [1n]
    for (let k = 1; k <= n; k++) row.push(k === n ? 1n : out[n - 1][k - 1] + out[n - 1][k])
    out.push(row)
  }
  return out
}

/** Paridade das linhas de Pascal (true = ímpar). */
export function pascalMod2(rows: number): boolean[][] {
  return Array.from({ length: rows }, (_, n) => Array.from({ length: n + 1 }, (_, k) => binomialIsOdd(n, k)))
}

/** Autômato celular elementar, Regra 90: nova célula = esquerda XOR direita. Começa com uma célula ativa. */
export function rule90(generations: number): Uint8Array[] {
  const width = 2 * generations + 1
  let row = new Uint8Array(width)
  row[generations] = 1
  const out = [row]
  for (let g = 1; g < generations; g++) {
    const next = new Uint8Array(width)
    for (let i = 0; i < width; i++) next[i] = (i > 0 ? row[i - 1] : 0) ^ (i < width - 1 ? row[i + 1] : 0)
    out.push(next)
    row = next
  }
  return out
}
