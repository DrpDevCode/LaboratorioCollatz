<script setup lang="ts">
import { computed } from 'vue'
import type { AnimationApi } from '../composables/useAnimation'
import { stepRow } from '../services/collatz'
import { formatInt, groupDigits, shortBig } from '../utils/format'

const props = defineProps<{ anim: AnimationApi; sequence: bigint[] }>()

const total = computed(() => props.sequence.length)
const cur = computed(() => props.anim.current.value)
const idx = computed(() => cur.value ?? total.value - 1)
const row = computed(() => (total.value ? stepRow(props.sequence, idx.value) : null))
const percent = computed(() => (total.value <= 1 ? 100 : (idx.value / (total.value - 1)) * 100))

/** Índice do máximo até cada etapa (prefixo), calculado uma vez por sequência. */
const prefixMax = computed(() => {
  const out = new Int32Array(props.sequence.length)
  let m = 0
  props.sequence.forEach((v, i) => {
    if (v > props.sequence[m]) m = i
    out[i] = m
  })
  return out
})

/** Subidas (3n+1) até a etapa atual, também como prefixo. */
const prefixOdd = computed(() => {
  const out = new Int32Array(props.sequence.length + 1)
  props.sequence.forEach((v, i) => (out[i + 1] = out[i] + (v % 2n === 1n ? 1 : 0)))
  return out
})

const live = computed(() => {
  const i = idx.value
  const odd = prefixOdd.value[i]
  return { odd, even: i - odd, maxSoFar: props.sequence[prefixMax.value[i]], maxAt: prefixMax.value[i] }
})

/** Últimas operações, da mais recente para a mais antiga. */
const feed = computed(() => {
  const out = []
  for (let i = idx.value; i >= Math.max(0, idx.value - 7); i--) out.push(stepRow(props.sequence, i))
  return out
})

const speed = computed({
  get: () => props.anim.speed.value,
  set: (v: number) => (props.anim.speed.value = v),
})

const colorOf = (r: { parity: string; result: bigint | null; value: bigint }) =>
  r.result === null && r.value === 1n ? 'text-emerald-300' : r.parity === 'par' ? 'text-sky-300' : 'text-amber-300'
</script>

<template>
  <section class="panel">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <h2 class="panel-title !mb-0">Laboratório ao vivo</h2>
      <span class="font-mono text-xs text-slate-500">etapa {{ formatInt(idx) }} de {{ formatInt(total - 1) }}</span>
    </div>

    <div v-if="row" class="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <!-- Operação em destaque -->
      <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div class="text-xs uppercase tracking-wider text-slate-500">valor atual</div>
        <Transition name="pop" mode="out-in">
          <div :key="idx" class="mt-1 break-all font-mono text-4xl font-semibold sm:text-5xl" :class="colorOf(row)" :title="groupDigits(row.value)">
            {{ shortBig(row.value, 28) }}
          </div>
        </Transition>
        <Transition name="pop" mode="out-in">
          <div :key="'op' + idx" class="mt-3 font-mono text-base text-slate-300 sm:text-lg">
            <template v-if="row.result !== null">
              <span :class="colorOf(row)">{{ row.parity === 'par' ? 'é par' : 'é ímpar' }}</span>
              <span class="text-slate-500"> → </span>
              <span class="break-all">{{ row.parity === 'par' ? 'n ÷ 2' : '3n + 1' }} = {{ shortBig(row.result, 28) }}</span>
            </template>
            <span v-else-if="row.value === 1n" class="text-emerald-300">chegou a 1: fim da trajetória</span>
            <span v-else class="text-amber-300">interrompido aqui (limite de etapas)</span>
          </div>
        </Transition>

        <div class="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div class="h-full bg-fuchsia-400 transition-[width] duration-150" :style="{ width: percent + '%' }" />
        </div>

        <dl class="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div class="rounded-lg bg-sky-500/10 p-2">
            <dt class="text-sky-300/70">divisões ÷2</dt>
            <dd class="font-mono text-lg text-sky-300">{{ formatInt(live.even) }}</dd>
          </div>
          <div class="rounded-lg bg-amber-500/10 p-2">
            <dt class="text-amber-300/70">subidas 3n+1</dt>
            <dd class="font-mono text-lg text-amber-300">{{ formatInt(live.odd) }}</dd>
          </div>
          <div class="rounded-lg bg-rose-500/10 p-2">
            <dt class="text-rose-300/70">pico até aqui</dt>
            <dd class="truncate font-mono text-lg text-rose-300" :title="groupDigits(live.maxSoFar)">{{ shortBig(live.maxSoFar, 12) }}</dd>
          </div>
        </dl>
      </div>

      <!-- Feed das operações -->
      <div>
        <div class="mb-2 text-xs uppercase tracking-wider text-slate-500">últimas operações</div>
        <TransitionGroup tag="ol" name="feed" class="space-y-1 font-mono text-sm">
          <li
            v-for="(r, k) in feed"
            :key="r.step"
            class="flex gap-2 rounded-md px-2 py-1"
            :class="k === 0 ? 'bg-fuchsia-500/10' : ''"
            :style="{ opacity: 1 - k * 0.1 }"
          >
            <span class="w-12 shrink-0 text-right text-slate-600">{{ r.step }}</span>
            <span class="truncate" :class="colorOf(r)" :title="r.result === null ? groupDigits(r.value) : `${r.operation} = ${groupDigits(r.result)}`">
              {{ r.result === null ? (r.value === 1n ? '1 ✓' : groupDigits(r.value)) : `${r.operation} = ${groupDigits(r.result)}` }}
            </span>
          </li>
        </TransitionGroup>
      </div>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-2">
      <button class="btn btn-primary" :disabled="!total" @click="anim.play()" title="Iniciar do começo">▶ Iniciar</button>
      <button v-if="anim.playing.value" class="btn" @click="anim.pause()">❚❚ Pausar</button>
      <button v-else class="btn" :disabled="!total || cur === null" @click="anim.resume()">⏵ Continuar</button>
      <button class="btn" :disabled="!total" @click="anim.restart()">⟲ Reiniciar</button>
      <button class="btn" :disabled="!total" @click="anim.stepBack()" aria-label="Retroceder uma etapa">⏮ −1</button>
      <button class="btn" :disabled="!total" @click="anim.stepForward()" aria-label="Avançar uma etapa">+1 ⏭</button>
      <button class="btn" :disabled="cur === null" @click="anim.reset()" title="Mostrar a sequência inteira">Ver tudo</button>
      <label class="ml-auto flex min-w-56 items-center gap-2 text-sm text-slate-400">
        Velocidade
        <input v-model.number="speed" type="range" min="1" max="200" class="w-full accent-fuchsia-400" aria-label="Etapas por segundo" />
        <span class="w-14 font-mono text-slate-200">{{ speed }}/s</span>
      </label>
    </div>
  </section>
</template>

<style scoped>
.pop-enter-active,
.pop-leave-active {
  transition: all 0.12s ease;
}
.pop-enter-from {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
.pop-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.feed-enter-active {
  transition: all 0.2s ease;
}
.feed-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.feed-leave-active {
  display: none;
}
</style>
