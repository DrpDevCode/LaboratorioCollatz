<script setup lang="ts">
import { computed } from 'vue'
import CompareChart from './CompareChart.vue'
import type { useComparator } from '../composables/useComparator'
import { shortBig, groupDigits } from '../utils/format'

const props = defineProps<{ cmp: ReturnType<typeof useComparator> }>()
const emit = defineEmits<{ open: [n: string] }>()

const c = computed(() => props.cmp.comparison.value)
const res = computed(() => props.cmp.results.value)
const labels = computed(() => (res.value ? [shortBig(res.value[0].stats.start, 16), shortBig(res.value[1].stats.start, 16)] : ['A', 'B']))
const series = computed(() =>
  res.value ? res.value.map((r, i) => ({ label: `${i === 0 ? 'A' : 'B'}: ${labels.value[i]}`, sequence: r.sequence })) : [],
)
const winnerLabel = computed(() => (c.value?.winner === 'a' ? labels.value[0] : c.value?.winner === 'b' ? labels.value[1] : null))

const pairs = [
  ['27', '97'],
  ['26', '27'],
  ['77031', '837799'],
  ['871', '6171'],
]

const a = computed({ get: () => props.cmp.a.value, set: (v: string) => (props.cmp.a.value = v) })
const b = computed({ get: () => props.cmp.b.value, set: (v: string) => (props.cmp.b.value = v) })
</script>

<template>
  <div class="grid gap-5">
    <form class="panel" @submit.prevent="cmp.run()" novalidate>
      <h2 class="panel-title">Comparador</h2>
      <div class="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <label class="block">
          <span class="label text-indigo-300">Número A</span>
          <input v-model="a" inputmode="numeric" class="field font-mono text-lg" :disabled="cmp.running.value" />
        </label>
        <button type="button" class="btn mb-0.5 justify-center" :disabled="cmp.running.value" @click="cmp.swap()" aria-label="Trocar A e B">⇄</button>
        <label class="block">
          <span class="label text-amber-300">Número B</span>
          <input v-model="b" inputmode="numeric" class="field font-mono text-lg" :disabled="cmp.running.value" />
        </label>
      </div>
      <p class="mt-2 min-h-5 text-sm" :class="cmp.error.value ? 'text-rose-400' : 'text-slate-500'">
        {{ cmp.error.value ?? 'Os dois números são calculados com BigInt e comparados em seis critérios de complexidade.' }}
      </p>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <button v-if="!cmp.running.value" class="btn btn-primary">Comparar</button>
        <button v-else type="button" class="btn btn-danger" @click="cmp.cancel()">Cancelar</button>
        <span class="ml-2 text-xs text-slate-500">Pares curiosos:</span>
        <button v-for="p in pairs" :key="p.join()" type="button" class="chip text-xs" :disabled="cmp.running.value" @click="cmp.setPair(p[0], p[1])">
          {{ p[0] }} × {{ p[1] }}
        </button>
      </div>
    </form>

    <template v-if="c && res">
      <!-- Veredito -->
      <section class="panel">
        <div class="flex flex-wrap items-center gap-4">
          <div class="text-4xl" aria-hidden="true">{{ c.winner === 'tie' ? '⚖️' : '🏆' }}</div>
          <div>
            <div class="text-xs uppercase tracking-wider text-slate-500">comportamento mais complexo</div>
            <div class="text-2xl font-semibold text-slate-50">
              <template v-if="winnerLabel">
                <span :class="c.winner === 'a' ? 'text-indigo-300' : 'text-amber-300'" class="font-mono">{{ winnerLabel }}</span>
              </template>
              <template v-else>Empate</template>
            </div>
            <div class="text-sm text-slate-400">
              Placar <span class="font-mono text-indigo-300">{{ c.scoreA }}</span> ×
              <span class="font-mono text-amber-300">{{ c.scoreB }}</span>, {{ c.reason }}.
            </div>
          </div>
        </div>
        <p v-for="w in c.warnings" :key="w" class="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2 text-sm text-amber-300">{{ w }}</p>
      </section>

      <!-- Lado a lado -->
      <section class="panel">
        <h2 class="panel-title">Lado a lado</h2>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[34rem] text-sm">
            <thead class="text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th class="py-2 text-left">Critério</th>
                <th class="py-2 text-right text-indigo-300">A · <span class="font-mono normal-case">{{ labels[0] }}</span></th>
                <th class="py-2 text-right text-amber-300">B · <span class="font-mono normal-case">{{ labels[1] }}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="k in c.criteria" :key="k.key" class="border-t border-slate-800">
                <td class="py-2 pr-3">
                  <div class="text-slate-200">{{ k.label }}</div>
                  <div class="text-xs text-slate-500">{{ k.description }}</div>
                </td>
                <td class="py-2 text-right font-mono" :title="k.a">
                  <span :class="k.winner === 'a' ? 'rounded bg-indigo-500/20 px-1.5 text-indigo-200' : 'text-slate-400'">{{ k.a.length > 22 ? k.a.slice(0, 22) + '…' : k.a }}</span>
                  <span v-if="k.winner === 'a'" class="ml-1 text-indigo-300">●</span>
                </td>
                <td class="py-2 text-right font-mono" :title="k.b">
                  <span :class="k.winner === 'b' ? 'rounded bg-amber-500/20 px-1.5 text-amber-200' : 'text-slate-400'">{{ k.b.length > 22 ? k.b.slice(0, 22) + '…' : k.b }}</span>
                  <span v-if="k.winner === 'b'" class="ml-1 text-amber-300">●</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button class="btn text-xs" @click="emit('open', res[0].stats.start.toString())" :title="groupDigits(res[0].stats.start)">Abrir A no laboratório</button>
          <button class="btn text-xs" @click="emit('open', res[1].stats.start.toString())" :title="groupDigits(res[1].stats.start)">Abrir B no laboratório</button>
        </div>
      </section>

      <section class="panel">
        <h2 class="panel-title">Trajetórias sobrepostas</h2>
        <CompareChart :series="series" />
      </section>
    </template>
  </div>
</template>
