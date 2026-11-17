<script setup lang="ts">
import { computed } from 'vue'
import StatCard from '../../../shared/components/StatCard.vue'
import { metrics } from '../services/sierpinski'
import { fmt } from '../utils/palettes'

const props = defineProps<{ depth: number }>()
const m = computed(() => metrics(props.depth))
const levels = computed(() => Array.from({ length: props.depth + 1 }, (_, i) => metrics(i)))
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Métricas (lado = 1)</h2>
    <div class="grid grid-cols-2 gap-3 md:grid-cols-5">
      <StatCard label="Triângulos" :value="fmt(m.triangles)" hint="3ⁿ" accent="text-indigo-300" />
      <StatCard label="Removidos" :value="fmt(m.removed)" hint="(3ⁿ − 1) ÷ 2" accent="text-rose-300" />
      <StatCard label="Área restante" :value="`${fmt(m.areaFraction * 100, 2)}%`" hint="(3/4)ⁿ → 0" accent="text-sky-300" />
      <StatCard label="Perímetro total" :value="fmt(m.perimeterFactor, 3)" hint="3·(3/2)ⁿ → ∞" accent="text-amber-300" />
      <StatCard label="Dimensão fractal" :value="fmt(m.dimension, 4)" hint="log 3 ÷ log 2" accent="text-emerald-300" />
    </div>
    <div class="mt-4 overflow-x-auto">
      <table class="w-full text-right font-mono text-sm">
        <thead class="text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th class="py-1 text-left">Nível</th>
            <th>Triângulos</th>
            <th>Removidos</th>
            <th>Área</th>
            <th>Perímetro</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in levels" :key="l.depth" class="border-t border-slate-800" :class="l.depth === depth ? 'text-indigo-200' : 'text-slate-400'">
            <td class="py-1 text-left">{{ l.depth }}</td>
            <td>{{ fmt(l.triangles) }}</td>
            <td>{{ fmt(l.removed) }}</td>
            <td>{{ fmt(l.areaFraction * 100, 2) }}%</td>
            <td>{{ fmt(l.perimeterFactor, 3) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-3 text-xs text-slate-500">
      O paradoxo do fractal: a área tende a zero enquanto o perímetro cresce sem limite. A dimensão ≈ 1,585 fica entre
      a de uma linha (1) e a de uma superfície (2).
    </p>
  </section>
</template>
