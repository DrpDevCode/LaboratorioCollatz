<script setup lang="ts">
import { PALETTES, type Palette } from '../utils/palettes'
const palette = defineModel<Palette>({ required: true })
</script>

<template>
  <header class="relative overflow-hidden border-b border-slate-800 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18),transparent_60%)]">
    <div class="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-4 px-4 py-8 sm:py-10">
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300/80">laboratório matemático</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          Triângulo de Sierpinski <span class="font-mono text-indigo-300">d ≈ 1,585</span>
        </h1>
        <p class="mt-3 max-w-2xl text-slate-400">
          Divida um triângulo em quatro, remova o do meio e repita em cada parte. O resultado é um fractal: cada pedaço é
          uma cópia reduzida do todo.
        </p>
        <div class="mt-4 flex flex-wrap gap-2 font-mono text-sm">
          <span class="tag bg-sky-500/15 text-sky-300">3 cópias</span>
          <span class="tag bg-amber-500/15 text-amber-300">escala ½</span>
          <span class="tag bg-emerald-500/15 text-emerald-300">área → 0</span>
        </div>
      </div>
      <div>
        <label class="label" for="palette">Paleta</label>
        <select id="palette" v-model="palette" class="field">
          <option v-for="p in PALETTES" :key="p.id" :value="p">{{ p.label }}</option>
        </select>
      </div>
    </div>
  </header>
</template>
