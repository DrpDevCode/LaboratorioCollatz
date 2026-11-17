<script setup lang="ts">
import { computed, ref } from 'vue'
import FractalCanvas from './FractalCanvas.vue'
import { pascalRows } from '../services/sierpinski'
import { pick, type Palette } from '../utils/palettes'
import type { DrawFn } from '../types/sierpinski'

const props = defineProps<{ palette: Palette }>()
const rows = ref(32)
const mod = ref(2)
const size = ref({ w: 0, h: 0 })

const values = computed(() => pascalRows(rows.value))
const showNumbers = computed(() => rows.value <= 12)
const oddCount = computed(() => values.value.reduce((s, r) => s + r.filter((v) => v % 2n === 1n).length, 0))

const draw = computed<DrawFn>(() => (ctx, w, h) => {
  const n = rows.value
  const cell = Math.min((w - 32) / n, (h - 32) / n)
  const top = (h - cell * n) / 2
  const m = BigInt(mod.value)
  values.value.forEach((row, r) => {
    row.forEach((v, k) => {
      const x = w / 2 + (k - r / 2) * cell - cell / 2
      const y = top + r * cell
      const res = Number(v % m)
      ctx.fillStyle = res === 0 ? '#1e293b' : pick(props.palette, res - 1)
      ctx.fillRect(x + 0.5, y + 0.5, cell - 1, cell - 1)
      if (showNumbers.value) {
        ctx.fillStyle = res === 0 ? '#64748b' : '#020617'
        ctx.font = `600 ${Math.min(cell * 0.38, 18)}px JetBrains Mono, monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(v.toString(), x + cell / 2, y + cell / 2)
      }
    })
  })
})

const version = computed(() => `${rows.value}|${mod.value}|${props.palette.id}|${size.value.w}`)
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Triângulo de Pascal módulo {{ mod }}</h2>
    <div class="mb-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <label class="label" for="rows">Linhas: <span class="font-mono text-indigo-300">{{ rows }}</span></label>
        <input id="rows" v-model.number="rows" type="range" min="4" max="256" class="w-full accent-indigo-400" />
      </div>
      <div>
        <span class="label">Módulo</span>
        <div class="flex gap-1">
          <button v-for="m in [2, 3, 4, 5, 7]" :key="m" class="btn" :class="mod === m && 'btn-primary'" @click="mod = m">{{ m }}</button>
        </div>
      </div>
    </div>
    <div class="mb-3 flex flex-wrap gap-2 text-xs">
      <button v-for="r in [8, 16, 32, 64, 128, 256]" :key="r" class="chip" @click="rows = r">{{ r }} linhas</button>
    </div>
    <FractalCanvas :draw="draw" :version="version" :filename="`pascal-mod${mod}-${rows}`" @resize="(w, h) => (size = { w, h })" />
    <p class="mt-3 text-sm text-slate-400">
      Ímpares nas {{ rows }} primeiras linhas: <span class="font-mono text-indigo-300">{{ oddCount.toLocaleString('pt-BR') }}</span>
      de {{ ((rows * (rows + 1)) / 2).toLocaleString('pt-BR') }}.
    </p>
    <p class="mt-2 text-xs text-slate-500">
      Pinte de escuro os números divisíveis por {{ mod }}. Com módulo 2, os ímpares formam o Triângulo de Sierpinski,
      porque C(n, k) é ímpar exatamente quando k e n − k não têm bits 1 em comum (teorema de Lucas). Use potências de 2
      (16, 32, 64…) para ver o padrão completo. Com até 12 linhas, os valores aparecem nas células.
    </p>
  </section>
</template>
