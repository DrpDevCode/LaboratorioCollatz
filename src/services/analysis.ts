import type { CollatzResult } from '../types/collatz'

/** Características derivadas da sequência real (além das estatísticas básicas). */
export interface SequenceAnalysis {
  /** Primeira etapa em que o valor fica abaixo do número inicial (null se nunca fica). */
  stoppingTime: number | null
  /** Maior valor ÷ número inicial, com 2 casas decimais (texto exato, pt-BR). */
  growth: string
  /** Fração das operações que foram 3n + 1 (0 a 1). */
  oddShare: number
  /** Maior sequência de etapas consecutivas em que o valor subiu. */
  longestRise: number
  /** Maior sequência de etapas consecutivas em que o valor desceu. */
  longestFall: number
  /** Maior aumento numa única etapa. */
  biggestJump: bigint
  /** Posição relativa do pico na trajetória (0 = início, 1 = fim). */
  peakPosition: number
}

/** max/start com 2 casas, calculado só com BigInt. */
export function ratioText(num: bigint, den: bigint): string {
  const scaled = (num * 100n + den / 2n) / den
  const whole = (scaled / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${whole},${(scaled % 100n).toString().padStart(2, '0')}`
}

export function analyze(r: CollatzResult): SequenceAnalysis {
  const seq = r.sequence
  const start = seq[0]
  let stoppingTime: number | null = null
  let rise = 0
  let fall = 0
  let longestRise = 0
  let longestFall = 0
  let biggestJump = 0n
  for (let i = 1; i < seq.length; i++) {
    const prev = seq[i - 1]
    const v = seq[i]
    if (stoppingTime === null && v < start) stoppingTime = i
    if (v > prev) {
      rise++
      fall = 0
      if (rise > longestRise) longestRise = rise
      if (v - prev > biggestJump) biggestJump = v - prev
    } else {
      fall++
      rise = 0
      if (fall > longestFall) longestFall = fall
    }
  }
  const { steps, oddOps, max, maxIndex } = r.stats
  return {
    stoppingTime,
    growth: ratioText(max, start),
    oddShare: steps === 0 ? 0 : oddOps / steps,
    longestRise,
    longestFall,
    biggestJump,
    peakPosition: steps === 0 ? 0 : maxIndex / steps,
  }
}

export type Side = 'a' | 'b' | 'tie'

export interface Criterion {
  key: string
  label: string
  description: string
  a: string
  b: string
  winner: Side
}

export interface Comparison {
  criteria: Criterion[]
  scoreA: number
  scoreB: number
  winner: Side
  reason: string
  /** Avisos quando alguma sequência não chegou a 1 (comparação parcial). */
  warnings: string[]
}

function cmp(a: bigint | number, b: bigint | number): Side {
  return a > b ? 'a' : a < b ? 'b' : 'tie'
}

/**
 * Compara a "complexidade" de duas trajetórias. Cada critério marca um ponto
 * para quem tiver o valor maior; o desempate é pelo total de etapas e depois pelo pico.
 */
export function compareResults(ra: CollatzResult, rb: CollatzResult): Comparison {
  const A = analyze(ra)
  const B = analyze(rb)
  const sa = ra.stats
  const sb = rb.stats
  const fmt = (v: bigint | number) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const criteria: Criterion[] = [
    { key: 'steps', label: 'Total de etapas', description: 'trajetória mais longa até 1', a: fmt(sa.steps), b: fmt(sb.steps), winner: cmp(sa.steps, sb.steps) },
    { key: 'max', label: 'Maior valor', description: 'pico absoluto mais alto', a: fmt(sa.max), b: fmt(sb.max), winner: cmp(sa.max, sb.max) },
    {
      key: 'growth',
      label: 'Crescimento (máx ÷ início)',
      description: 'quanto o número inflou em relação ao início',
      a: `${A.growth}×`,
      b: `${B.growth}×`,
      // max_a/start_a vs max_b/start_b sem divisão
      winner: cmp(sa.max * sb.start, sb.max * sa.start),
    },
    { key: 'odd', label: 'Operações 3n + 1', description: 'mais passos de subida', a: fmt(sa.oddOps), b: fmt(sb.oddOps), winner: cmp(sa.oddOps, sb.oddOps) },
    {
      key: 'stopping',
      label: 'Tempo de parada',
      description: 'etapas até cair abaixo do valor inicial',
      a: A.stoppingTime === null ? '—' : fmt(A.stoppingTime),
      b: B.stoppingTime === null ? '—' : fmt(B.stoppingTime),
      winner: cmp(A.stoppingTime ?? 0, B.stoppingTime ?? 0),
    },
    { key: 'rise', label: 'Maior subida consecutiva', description: 'mais etapas seguidas subindo', a: fmt(A.longestRise), b: fmt(B.longestRise), winner: cmp(A.longestRise, B.longestRise) },
  ]

  const scoreA = criteria.filter((c) => c.winner === 'a').length
  const scoreB = criteria.filter((c) => c.winner === 'b').length
  let winner: Side = cmp(scoreA, scoreB)
  let reason = `venceu ${Math.max(scoreA, scoreB)} de ${criteria.length} critérios`
  if (winner === 'tie') {
    winner = criteria[0].winner !== 'tie' ? criteria[0].winner : criteria[1].winner
    reason = winner === 'tie' ? 'as trajetórias empataram em todos os critérios decisivos' : 'empate nos critérios; desempate pelo total de etapas e pelo pico'
  }

  const warnings: string[] = []
  for (const [label, r] of [['A', ra], ['B', rb]] as const) {
    if (r.status !== 'converged') warnings.push(`A sequência ${label} não chegou a 1 (${r.status === 'limit' ? 'limite atingido' : 'cancelada'}); a comparação considera só as etapas calculadas.`)
  }
  return { criteria, scoreA, scoreB, winner, reason, warnings }
}
