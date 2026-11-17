<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import FractalCanvas from './FractalCanvas.vue'
import { rule90 } from '../services/sierpinski'
import { pick, type Palette } from '../utils/palettes'
import type { DrawFn } from '../types/sierpinski'

const props = defineProps<{ palette: Palette }>()
const generations = ref(64)
const shown = ref(64)
const playing = ref(false)
let timer = 0

const grid = computed(() => rule90(generations.value))
const rules = [
  [1, 1, 1, 0], [1, 1, 0, 1], [1, 0, 1, 0], [1, 0, 0, 1],
  [0, 1, 1, 1], [0, 1, 0, 0], [0, 0, 1, 1], [0, 0, 0, 0],
]

const draw = computed<DrawFn>(() => (ctx, w, h) => {
  const g = generations.value
  const width = 2 * g + 1
  const cell = Math.min((w - 16) / width, (h - 16) / g)
  const left = (w - cell * width) / 2
  const top = (h - cell * g) / 2
  for (let r = 0; r < Math.min(shown.value, g); r++) {
    ctx.fillStyle = r === shown.value - 1 && playing.value ? '#f8fafc' : pick(props.palette, Math.floor(r / Math.max(1, g / 6)))
    const row = grid.value[r]
    for (let i = 0; i < width; i++) if (row[i]) ctx.fillRect(left + i * cell, top + r * cell, cell, cell)
  }
})

const version = computed(() => `${generations.value}|${shown.value}|${props.palette.id}|${playing.value}`)

function stop() {
  playing.value = false
  clearInterval(timer)
}

function play() {
  stop()
  shown.value = 1
  playing.value = true
  const delay = Math.max(10, 3000 / generations.value)
  timer = window.setInterval(() => {
    if (shown.value >= generations.value) return stop()
    shown.value++
  }, delay)
}

function setGenerations(g: number) {
  stop()
  generations.value = g
  shown.value = g
}

onBeforeUnmount(stop)
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Autômato celular · Regra 90</h2>
    <div class="mb-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <label class="label" for="gens">Gerações: <span class="font-mono text-indigo-300">{{ generations }}</span></label>
        <input
          id="gens"
          :value="generations"
          type="range"
          min="8"
          max="512"
          class="w-full accent-indigo-400"
          @input="setGenerations(Number(($event.target as HTMLInputElement).value))"
        />
      </div>
      <div class="flex gap-2">
        <button v-if="!playing" class="btn btn-primary" @click="play">▶ Gerar linha a linha</button>
        <button v-else class="btn btn-danger" @click="stop">■ Parar</button>
      </div>
    </div>

    <div class="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
      <div v-for="(r, i) in rules" :key="i" class="flex flex-col items-center gap-1 rounded-lg border border-slate-800 p-2">
        <div class="flex gap-0.5">
          <span v-for="(b, j) in r.slice(0, 3)" :key="j" class="h-3 w-3 border border-slate-600" :class="b ? 'bg-indigo-400' : 'bg-slate-900'" />
        </div>
        <span class="text-slate-500">↓</span>
        <span class="h-3 w-3 border border-slate-600" :class="r[3] ? 'bg-indigo-400' : 'bg-slate-900'" />
      </div>
    </div>

    <FractalCanvas :draw="draw" :version="version" :filename="`regra90-${generations}`" />
    <p class="mt-3 text-xs text-slate-500">
      Cada célula da nova linha fica acesa quando exatamente uma de suas vizinhas (esquerda ou direita) estava acesa:
      esquerda XOR direita. O nome vem de 01011010 em binário = 90. Partindo de uma única célula, surge o mesmo
      padrão do Pascal módulo 2.
    </p>
  </section>
</template>
