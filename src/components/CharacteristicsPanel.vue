<script setup lang="ts">
import { computed } from 'vue'
import StatCard from './StatCard.vue'
import { analyze } from '../services/analysis'
import type { CollatzResult } from '../types/collatz'
import { formatInt, groupDigits, shortBig } from '../utils/format'

const props = defineProps<{ result: CollatzResult }>()
const a = computed(() => analyze(props.result))
const pct = (x: number) => `${(x * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

/** Leitura em linguagem natural das características. */
const story = computed(() => {
  const s = props.result.stats
  const x = a.value
  if (s.steps === 0) return 'O número 1 já é o fim da trajetória: nenhuma operação foi necessária.'
  const parts = [
    `Partindo de ${shortBig(s.start, 20)}, a sequência levou ${formatInt(s.steps)} etapas`,
    s.max > s.start
      ? `e subiu até ${shortBig(s.max, 20)} (${x.growth}× o valor inicial) na etapa ${formatInt(s.maxIndex)}, a ${pct(x.peakPosition)} do caminho.`
      : 'e nunca ultrapassou o valor inicial.',
  ]
  if (x.stoppingTime !== null) parts.push(`Caiu abaixo do valor inicial pela primeira vez na etapa ${formatInt(x.stoppingTime)}.`)
  parts.push(`${pct(x.oddShare)} das operações foram 3n + 1.`)
  return parts.join(' ')
})
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Características da sequência</h2>
    <p class="mb-4 text-sm leading-relaxed text-slate-300">{{ story }}</p>
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Tempo de parada" :value="a.stoppingTime === null ? '—' : formatInt(a.stoppingTime)" hint="1ª etapa abaixo do início" />
      <StatCard label="Crescimento" :value="`${a.growth}×`" hint="máximo ÷ inicial" accent="text-rose-300" />
      <StatCard label="Proporção 3n+1" :value="pct(a.oddShare)" hint="das operações" accent="text-amber-300" />
      <StatCard label="Maior subida seguida" :value="formatInt(a.longestRise)" hint="etapas consecutivas" />
      <StatCard label="Maior descida seguida" :value="formatInt(a.longestFall)" hint="etapas consecutivas" accent="text-sky-300" />
      <StatCard label="Maior salto" :value="shortBig(a.biggestJump, 16)" :title="groupDigits(a.biggestJump)" hint="aumento numa etapa" />
    </div>
  </section>
</template>
