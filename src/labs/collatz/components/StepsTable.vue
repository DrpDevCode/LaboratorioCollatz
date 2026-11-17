<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { stepRow } from '../services/collatz'
import { formatInt, groupDigits } from '../utils/format'

const props = defineProps<{ sequence: bigint[]; current: number | null; maxIndex: number }>()
const emit = defineEmits<{ pick: [step: number] }>()

const pageSize = ref(50)
const page = ref(0)
const jump = ref<number | null>(null)

const pageCount = computed(() => Math.max(1, Math.ceil(props.sequence.length / pageSize.value)))
const rows = computed(() => {
  const start = page.value * pageSize.value
  const end = Math.min(props.sequence.length, start + pageSize.value)
  const out = []
  for (let i = start; i < end; i++) out.push(stepRow(props.sequence, i))
  return out
})

watch(() => props.sequence, () => (page.value = 0))
watch(pageSize, () => (page.value = 0))
// Acompanha a animação: vai para a página da etapa atual.
watch(
  () => props.current,
  (c) => {
    if (c !== null) page.value = Math.floor(c / pageSize.value)
  },
)

function goToStep() {
  if (jump.value === null || !Number.isFinite(jump.value)) return
  const s = Math.min(props.sequence.length - 1, Math.max(0, Math.floor(jump.value)))
  page.value = Math.floor(s / pageSize.value)
  emit('pick', s)
}

function trim(n: bigint): string {
  const g = groupDigits(n)
  return g.length > 48 ? g.slice(0, 48) + '…' : g
}
</script>

<template>
  <section class="panel">
    <div class="mb-3 flex flex-wrap items-end justify-between gap-3">
      <h2 class="panel-title !mb-0">Tabela de operações</h2>
      <form class="flex items-center gap-2 text-sm" @submit.prevent="goToStep">
        <input v-model.number="jump" type="number" min="0" placeholder="etapa" class="field !w-28 !py-1 font-mono" />
        <button class="btn !py-1">Ir</button>
        <select v-model.number="pageSize" class="field !w-auto !py-1">
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="250">250</option>
        </select>
      </form>
    </div>

    <div class="overflow-x-auto rounded-lg border border-slate-800">
      <table class="w-full min-w-[40rem] text-left text-sm">
        <thead class="bg-slate-900 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th class="px-3 py-2">Etapa</th>
            <th class="px-3 py-2">Número atual</th>
            <th class="px-3 py-2">Tipo</th>
            <th class="px-3 py-2">Operação</th>
            <th class="px-3 py-2">Resultado</th>
          </tr>
        </thead>
        <tbody class="font-mono">
          <tr
            v-for="r in rows"
            :key="r.step"
            class="cursor-pointer border-t border-slate-800/80 hover:bg-slate-800/40"
            :class="{
              '!bg-fuchsia-500/15': r.step === current,
              'bg-rose-500/5': r.step === maxIndex,
            }"
            @click="emit('pick', r.step)"
          >
            <td class="px-3 py-1.5 text-slate-500">{{ formatInt(r.step) }}</td>
            <td class="px-3 py-1.5" :title="groupDigits(r.value)">
              {{ trim(r.value) }}
              <span v-if="r.step === maxIndex" class="ml-1 rounded bg-rose-500/20 px-1 text-[0.65rem] text-rose-300">máx</span>
            </td>
            <td class="px-3 py-1.5">
              <span v-if="r.result === null && r.value === 1n" class="tag bg-emerald-500/15 text-emerald-300">final</span>
              <span v-else-if="r.parity === 'par'" class="tag bg-sky-500/15 text-sky-300">par</span>
              <span v-else class="tag bg-amber-500/15 text-amber-300">ímpar</span>
            </td>
            <td class="px-3 py-1.5 text-slate-400" :title="r.operation">{{ r.operation.length > 56 ? r.operation.slice(0, 56) + '…' : r.operation }}</td>
            <td class="px-3 py-1.5" :class="r.result === 1n ? 'text-emerald-300' : ''" :title="r.result === null ? '' : groupDigits(r.result)">
              {{ r.result === null ? '—' : trim(r.result) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
      <span>
        {{ formatInt(sequence.length) }} linhas · página {{ formatInt(page + 1) }} de {{ formatInt(pageCount) }}
      </span>
      <div class="flex gap-1">
        <button class="btn !py-1" :disabled="page === 0" @click="page = 0">«</button>
        <button class="btn !py-1" :disabled="page === 0" @click="page--">‹</button>
        <button class="btn !py-1" :disabled="page >= pageCount - 1" @click="page++">›</button>
        <button class="btn !py-1" :disabled="page >= pageCount - 1" @click="page = pageCount - 1">»</button>
      </div>
    </div>
  </section>
</template>
