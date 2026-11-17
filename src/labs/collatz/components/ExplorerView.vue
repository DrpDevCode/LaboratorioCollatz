<script setup lang="ts">
import { computed } from 'vue'
import StatCard from '../../../shared/components/StatCard.vue'
import StepsHistogram from './StepsHistogram.vue'
import type { useExplorer } from '../composables/useExplorer'
import { EXPLORE_MAX_SIZE } from '../services/explorer'
import { formatInt, groupDigits, shortBig } from '../utils/format'

const props = defineProps<{ ex: ReturnType<typeof useExplorer> }>()
const emit = defineEmits<{ open: [n: string]; compare: [a: string, b: string] }>()

const r = computed(() => props.ex.result.value)
const champion = computed(() => r.value?.topSteps[0])
const presets = [
  ['1', '100'],
  ['1', '10000'],
  ['1', '100000'],
  ['1', '1000000'],
  ['1', '10000000'],
]

const start = computed({ get: () => props.ex.start.value, set: (v: string) => (props.ex.start.value = v) })
const end = computed({ get: () => props.ex.end.value, set: (v: string) => (props.ex.end.value = v) })
const topN = computed({ get: () => props.ex.topN.value, set: (v: number) => (props.ex.topN.value = v) })

function preset(a: string, b: string) {
  start.value = a
  end.value = b
  props.ex.run()
}

const maxBarSteps = computed(() => champion.value?.steps ?? 1)
</script>

<template>
  <div class="grid gap-5">
    <form class="panel" @submit.prevent="ex.run()" novalidate>
      <h2 class="panel-title">Explorador de números</h2>
      <p class="mb-4 text-sm text-slate-400">
        Informe um intervalo e descubra quais números exigem mais etapas para chegar a 1. O cálculo roda em segundo plano
        (Web Worker), com memoização, e aceita até {{ formatInt(EXPLORE_MAX_SIZE) }} números por vez.
      </p>
      <div class="grid gap-3 sm:grid-cols-[1fr_1fr_9rem]">
        <label class="block">
          <span class="label">De</span>
          <input v-model="start" inputmode="numeric" class="field font-mono" :disabled="ex.running.value" />
        </label>
        <label class="block">
          <span class="label">Até</span>
          <input v-model="end" inputmode="numeric" class="field font-mono" :disabled="ex.running.value" />
        </label>
        <label class="block">
          <span class="label">Ranking</span>
          <select v-model.number="topN" class="field" :disabled="ex.running.value">
            <option :value="10">top 10</option>
            <option :value="20">top 20</option>
            <option :value="50">top 50</option>
          </select>
        </label>
      </div>
      <p class="mt-2 min-h-5 text-sm" :class="ex.error.value ? 'text-rose-400' : 'text-amber-300/80'">
        {{ ex.error.value ?? (ex.cancelled.value ? 'Exploração cancelada.' : '') }}
      </p>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <button v-if="!ex.running.value" class="btn btn-primary">Explorar</button>
        <button v-else type="button" class="btn btn-danger" @click="ex.cancel()">Cancelar</button>
        <span class="ml-2 text-xs text-slate-500">Atalhos:</span>
        <button v-for="p in presets" :key="p[1]" type="button" class="chip text-xs" :disabled="ex.running.value" @click="preset(p[0], p[1])">
          1–{{ formatInt(Number(p[1])) }}
        </button>
      </div>
      <div v-if="ex.running.value" class="mt-4" aria-live="polite">
        <div class="h-2 overflow-hidden rounded-full bg-slate-800">
          <div class="h-full bg-indigo-400 transition-[width]" :style="{ width: ex.progress.value * 100 + '%' }" />
        </div>
        <div class="mt-1 font-mono text-xs text-slate-400">{{ (ex.progress.value * 100).toFixed(0) }}%</div>
      </div>
    </form>

    <template v-if="r && champion">
      <section class="panel">
        <h2 class="panel-title">Resultado: {{ formatInt(r.start) }} a {{ formatInt(r.end) }}</h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Campeão de etapas" :value="formatInt(champion.n)" :hint="`${formatInt(champion.steps)} etapas`" accent="text-fuchsia-300" />
          <StatCard label="Maior pico" :value="shortBig(r.topPeaks[0].peak, 18)" :title="groupDigits(r.topPeaks[0].peak)" :hint="`atingido por ${formatInt(r.topPeaks[0].n)}`" accent="text-rose-300" />
          <StatCard label="Média de etapas" :value="r.averageSteps.toLocaleString('pt-BR', { maximumFractionDigits: 2 })" :hint="`${formatInt(r.count)} números`" />
          <StatCard label="Tempo de cálculo" :value="`${formatInt(Math.round(r.elapsedMs))} ms`" hint="no seu navegador" />
        </div>
        <p class="mt-4 text-sm text-slate-400">
          Todos os {{ formatInt(r.count) }} números do intervalo chegaram a 1. Isso é uma verificação para esses números,
          não uma demonstração da conjectura.
        </p>
      </section>

      <div class="grid gap-5 xl:grid-cols-2">
        <section class="panel">
          <h2 class="panel-title">Mais etapas até 1</h2>
          <ol class="space-y-1">
            <li v-for="(e, i) in r.topSteps" :key="e.n" class="group flex items-center gap-2 text-sm">
              <span class="w-6 text-right font-mono text-slate-600">{{ i + 1 }}</span>
              <span class="w-24 shrink-0 font-mono text-slate-100">{{ formatInt(e.n) }}</span>
              <span class="relative h-5 flex-1 overflow-hidden rounded bg-slate-800/60">
                <span class="absolute inset-y-0 left-0 rounded bg-indigo-500/50" :style="{ width: (e.steps / maxBarSteps) * 100 + '%' }" />
                <span class="relative px-2 font-mono text-xs leading-5 text-slate-100">{{ formatInt(e.steps) }} etapas</span>
              </span>
              <button class="btn !px-2 !py-0.5 text-xs" @click="emit('open', String(e.n))">Ver</button>
              <button v-if="i > 0" class="btn !px-2 !py-0.5 text-xs" title="Comparar com o campeão" @click="emit('compare', String(champion.n), String(e.n))">⇄</button>
            </li>
          </ol>
        </section>

        <section class="panel">
          <h2 class="panel-title">Maiores picos</h2>
          <ol class="space-y-1 text-sm">
            <li v-for="(e, i) in r.topPeaks" :key="e.n" class="flex items-center gap-2">
              <span class="w-6 text-right font-mono text-slate-600">{{ i + 1 }}</span>
              <span class="w-24 shrink-0 font-mono text-slate-100">{{ formatInt(e.n) }}</span>
              <span class="flex-1 truncate font-mono text-rose-300" :title="groupDigits(e.peak)">{{ groupDigits(e.peak) }}</span>
              <span class="hidden font-mono text-xs text-slate-500 sm:inline">{{ formatInt(e.steps) }} et.</span>
              <button class="btn !px-2 !py-0.5 text-xs" @click="emit('open', String(e.n))">Ver</button>
            </li>
          </ol>
        </section>
      </div>

      <section class="panel">
        <h2 class="panel-title">Distribuição das etapas</h2>
        <StepsHistogram :histogram="r.histogram" :highlight="champion.steps" />
        <p class="mt-1 text-xs text-slate-500">Quantos números do intervalo precisaram de cada quantidade de etapas. Em destaque, a faixa do campeão.</p>
      </section>

      <section class="panel">
        <h2 class="panel-title">Recordes de etapas</h2>
        <p class="mb-3 text-sm text-slate-400">Percorrendo o intervalo em ordem, estes números superaram todos os anteriores em quantidade de etapas.</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="rec in r.records"
            :key="rec.n"
            class="chip text-xs"
            :title="`${formatInt(rec.steps)} etapas`"
            @click="emit('open', String(rec.n))"
          >
            {{ formatInt(rec.n) }} <span class="text-slate-500">· {{ rec.steps }}</span>
          </button>
        </div>
      </section>
    </template>
  </div>
</template>
