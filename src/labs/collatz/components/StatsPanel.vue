<script setup lang="ts">
import { computed } from 'vue'
import StatCard from '../../../shared/components/StatCard.vue'
import type { CollatzResult, RunStatus } from '../types/collatz'
import { formatInt, groupDigits, shortBig } from '../utils/format'

const props = defineProps<{ result: CollatzResult | null; status: RunStatus; progress: number }>()

const CONVERGED_MSG =
  'Esta sequência chegou ao número 1. Isso confirma o comportamento esperado para este número inicial, mas não constitui uma demonstração da Conjectura de Collatz para todos os números naturais.'

const statusInfo = computed(() => {
  switch (props.status) {
    case 'running':
      return { label: 'Processando', cls: 'text-indigo-300', box: 'border-indigo-500/40 bg-indigo-500/10', msg: `Calculando… ${formatInt(props.progress)} etapas até agora.` }
    case 'converged':
      return { label: 'Chegou a 1', cls: 'text-emerald-300', box: 'border-emerald-500/40 bg-emerald-500/10', msg: CONVERGED_MSG }
    case 'limit':
      return {
        label: 'Interrompido (limite)',
        cls: 'text-amber-300',
        box: 'border-amber-500/40 bg-amber-500/10',
        msg: `O processamento foi interrompido ao atingir o limite de ${formatInt(props.result?.limit ?? 0)} etapas, sem alcançar o número 1. Este resultado não deve ser interpretado como convergente nem como divergente; aumente o limite para continuar investigando.`,
      }
    case 'cancelled':
      return {
        label: 'Cancelado',
        cls: 'text-rose-300',
        box: 'border-rose-500/40 bg-rose-500/10',
        msg: 'O processamento foi cancelado pelo usuário. As estatísticas abaixo referem-se apenas às etapas calculadas até o cancelamento.',
      }
    default:
      return { label: 'Aguardando', cls: 'text-slate-400', box: 'border-slate-700 bg-slate-900/40', msg: 'Informe um número e clique em Calcular.' }
  }
})

const s = computed(() => props.result?.stats ?? null)
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Indicadores</h2>
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <StatCard label="Número inicial" :value="s ? shortBig(s.start) : '—'" :title="s ? groupDigits(s.start) : ''" />
      <StatCard label="Total de etapas" :value="s ? formatInt(s.steps) : '—'" />
      <StatCard label="Maior valor" :value="s ? shortBig(s.max) : '—'" :title="s ? groupDigits(s.max) : ''" accent="text-rose-300" />
      <StatCard label="Menor valor" :value="s ? shortBig(s.min) : '—'" :title="s ? groupDigits(s.min) : ''" />
      <StatCard label="Posição do máximo" :value="s ? `etapa ${formatInt(s.maxIndex)}` : '—'" />
      <StatCard label="Operações pares (÷2)" :value="s ? formatInt(s.evenOps) : '—'" accent="text-sky-300" />
      <StatCard label="Operações ímpares (3n+1)" :value="s ? formatInt(s.oddOps) : '—'" accent="text-amber-300" />
      <StatCard label="Dígitos do máximo" :value="s ? formatInt(s.maxDigits) : '—'" />
      <StatCard
        label="Razão máx./inicial"
        :value="s && s.start <= 10n ** 15n && s.max <= 10n ** 300n ? `${(Number(s.max) / Number(s.start)).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}×` : s ? '—' : '—'"
      />
      <StatCard label="Status" :value="statusInfo.label" :accent="statusInfo.cls" />
    </div>

    <div class="mt-4 rounded-lg border p-3 text-sm leading-relaxed" :class="statusInfo.box" role="status">
      <span :class="statusInfo.cls" class="font-medium">{{ statusInfo.msg }}</span>
    </div>
  </section>
</template>
