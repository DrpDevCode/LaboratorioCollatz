<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import CompareChart, { type CompareSeries } from './CompareChart.vue'
import { collatzSync, computeStats } from '../services/collatz'
import type { HistoryEntry } from '../types/collatz'
import { formatDate, formatInt, groupDigits, shortBig } from '../utils/format'

const props = defineProps<{ entries: HistoryEntry[]; busy: boolean }>()
const emit = defineEmits<{ open: [entry: HistoryEntry]; remove: [id: string]; clearAll: [] }>()

const MAX_COMPARE = 4
/** Teto de etapas por sequência na comparação, para não travar a interface. */
const COMPARE_STEP_CAP = 200_000

const selected = ref<string[]>([])
const series = shallowRef<CompareSeries[]>([])

watch(
  () => props.entries,
  (list) => {
    const ids = new Set(list.map((e) => e.id))
    selected.value = selected.value.filter((id) => ids.has(id))
  },
)

function toggle(id: string) {
  const i = selected.value.indexOf(id)
  if (i >= 0) selected.value.splice(i, 1)
  else if (selected.value.length < MAX_COMPARE) selected.value.push(id)
}

const compareRows = computed(() =>
  series.value.map((s) => ({ label: s.label, stats: computeStats(s.sequence), truncated: s.label.includes('*') })),
)

watch(
  selected,
  (ids) => {
    series.value = ids
      .map((id) => props.entries.find((e) => e.id === id))
      .filter((e): e is HistoryEntry => !!e)
      .map((e) => {
        const cap = Math.min(e.limit, COMPARE_STEP_CAP)
        const r = collatzSync(BigInt(e.start), cap)
        return { label: shortBig(e.start, 16) + (cap < e.limit && r.status !== 'converged' ? '*' : ''), sequence: r.sequence }
      })
  },
  { deep: true },
)

const STATUS_LABEL: Record<HistoryEntry['status'], string> = {
  converged: 'chegou a 1',
  limit: 'limite',
  cancelled: 'cancelado',
}
</script>

<template>
  <section class="panel">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 class="panel-title !mb-0">Histórico</h2>
      <button v-if="entries.length" class="btn btn-danger !py-1 text-xs" @click="emit('clearAll')">Apagar tudo</button>
    </div>

    <p v-if="!entries.length" class="text-sm text-slate-500">Nenhum cálculo salvo ainda. Os resultados ficam guardados neste navegador.</p>

    <ul v-else class="max-h-80 divide-y divide-slate-800 overflow-y-auto rounded-lg border border-slate-800">
      <li v-for="e in entries" :key="e.id" class="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
        <label class="flex items-center gap-2" :title="`Selecionar para comparar (até ${MAX_COMPARE})`">
          <input
            type="checkbox"
            class="accent-indigo-400"
            :checked="selected.includes(e.id)"
            :disabled="!selected.includes(e.id) && selected.length >= MAX_COMPARE"
            @change="toggle(e.id)"
          />
          <span class="font-mono font-semibold text-slate-100" :title="groupDigits(e.start)">{{ shortBig(e.start, 20) }}</span>
        </label>
        <span class="text-slate-400">{{ formatInt(e.steps) }} etapas</span>
        <span class="text-rose-300/90" :title="groupDigits(e.max)">máx {{ shortBig(e.max, 18) }}</span>
        <span
          class="tag"
          :class="{
            'bg-emerald-500/15 text-emerald-300': e.status === 'converged',
            'bg-amber-500/15 text-amber-300': e.status === 'limit',
            'bg-rose-500/15 text-rose-300': e.status === 'cancelled',
          }"
        >{{ STATUS_LABEL[e.status] }}</span>
        <span class="text-xs text-slate-600">{{ formatDate(e.createdAt) }}</span>
        <span class="ml-auto flex gap-1">
          <button class="btn !px-2 !py-0.5 text-xs" :disabled="busy" @click="emit('open', e)">Reabrir</button>
          <button class="btn !px-2 !py-0.5 text-xs" aria-label="Excluir registro" @click="emit('remove', e.id)">✕</button>
        </span>
      </li>
    </ul>

    <div v-if="series.length" class="mt-5">
      <h3 class="mb-2 text-sm font-medium text-slate-300">Comparação ({{ series.length }})</h3>
      <CompareChart :series="series" />
      <div class="mt-3 overflow-x-auto">
        <table class="w-full min-w-[28rem] text-left font-mono text-sm">
          <thead class="text-xs uppercase text-slate-500">
            <tr><th class="py-1 pr-3">Início</th><th class="pr-3">Etapas</th><th class="pr-3">Máximo</th><th class="pr-3">Pos. máx.</th><th>Ímpares</th></tr>
          </thead>
          <tbody>
            <tr v-for="r in compareRows" :key="r.label" class="border-t border-slate-800">
              <td class="py-1 pr-3">{{ r.label }}</td>
              <td class="pr-3">{{ formatInt(r.stats.steps) }}</td>
              <td class="pr-3" :title="groupDigits(r.stats.max)">{{ shortBig(r.stats.max, 20) }}</td>
              <td class="pr-3">{{ formatInt(r.stats.maxIndex) }}</td>
              <td>{{ formatInt(r.stats.oddOps) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="compareRows.some((r) => r.truncated)" class="mt-1 text-xs text-slate-500">
          * comparação limitada a {{ formatInt(COMPARE_STEP_CAP) }} etapas.
        </p>
      </div>
    </div>
    <p v-else-if="entries.length > 1" class="mt-3 text-xs text-slate-500">Marque até {{ MAX_COMPARE }} registros para comparar as sequências.</p>
  </section>
</template>
