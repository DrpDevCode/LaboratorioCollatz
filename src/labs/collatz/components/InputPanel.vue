<script setup lang="ts">
import { MAX_STEP_LIMIT } from '../services/collatz'
import { formatInt } from '../utils/format'

const input = defineModel<string>('input', { required: true })
const limit = defineModel<number>('limit', { required: true })

defineProps<{ running: boolean; progress: number; error: string | null }>()
const emit = defineEmits<{ run: []; cancel: []; clear: [] }>()

const examples = ['7', '27', '97', '871', '63728127', '989345275647']

function pick(v: string) {
  input.value = v
  emit('run')
}
</script>

<template>
  <form class="panel" @submit.prevent="emit('run')" novalidate>
    <h2 class="panel-title">Entrada</h2>
    <div class="grid gap-4 sm:grid-cols-[1fr_12rem]">
      <label class="block">
        <span class="label">Número inicial (n ≥ 1)</span>
        <input
          v-model="input"
          inputmode="numeric"
          autocomplete="off"
          spellcheck="false"
          placeholder="ex.: 27"
          class="field font-mono text-lg"
          :class="error ? 'border-rose-500/70' : ''"
          :disabled="running"
          aria-describedby="input-help"
        />
      </label>
      <label class="block">
        <span class="label">Limite de etapas</span>
        <input
          v-model.number="limit"
          type="number"
          min="1"
          :max="MAX_STEP_LIMIT"
          step="1000"
          class="field font-mono"
          :disabled="running"
        />
      </label>
    </div>

    <p id="input-help" class="mt-2 min-h-5 text-sm" :class="error ? 'text-rose-400' : 'text-slate-500'" role="status">
      {{ error ?? 'Aceita inteiros de qualquer tamanho; o cálculo usa BigInt.' }}
    </p>

    <div class="mt-3 flex flex-wrap items-center gap-2">
      <button v-if="!running" type="submit" class="btn btn-primary">Calcular</button>
      <button v-else type="button" class="btn btn-danger" @click="emit('cancel')">Cancelar</button>
      <button type="button" class="btn" :disabled="running" @click="emit('clear')">Limpar</button>
      <span v-if="running" class="ml-1 font-mono text-sm text-indigo-300" aria-live="polite">
        <span class="inline-block animate-pulse">●</span> {{ formatInt(progress) }} etapas…
      </span>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
      Exemplos:
      <button
        v-for="ex in examples"
        :key="ex"
        type="button"
        class="chip"
        :disabled="running"
        @click="pick(ex)"
      >
        {{ ex }}
      </button>
    </div>
  </form>
</template>
