<script setup lang="ts">
import { LABS } from '../labs'
defineEmits<{ open: [id: string] }>()
</script>

<template>
  <header class="relative overflow-hidden border-b border-slate-800 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18),transparent_60%)]">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:py-14">
      <p class="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300/80">laboratórios matemáticos</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">Escolha um laboratório</h1>
      <p class="mt-3 max-w-2xl text-slate-400">
        Simuladores interativos para explorar ideias matemáticas no navegador, sem instalar nada.
      </p>
    </div>
  </header>

  <main class="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
    <a
      v-for="lab in LABS"
      :key="lab.id"
      :href="`#/${lab.id}`"
      class="group flex flex-col rounded-2xl border border-slate-800 bg-gradient-to-br to-slate-900/50 p-5 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-indigo-400"
      :class="lab.accent"
      @click.prevent="$emit('open', lab.id)"
    >
      <div class="flex items-start justify-between gap-3">
        <span class="text-4xl" aria-hidden="true">{{ lab.icon }}</span>
        <span class="font-mono text-sm text-slate-400">{{ lab.formula }}</span>
      </div>
      <h2 class="mt-4 text-xl font-semibold text-slate-50">{{ lab.title }}</h2>
      <p class="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{{ lab.description }}</p>
      <div class="mt-4 flex flex-wrap gap-1.5">
        <span v-for="t in lab.tags" :key="t" class="tag bg-slate-800/80 text-slate-400">{{ t }}</span>
      </div>
      <span class="mt-4 text-sm font-medium text-indigo-300 group-hover:text-indigo-200">Abrir laboratório →</span>
    </a>

    <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 p-5 text-center text-sm text-slate-600">
      <span class="text-3xl" aria-hidden="true">＋</span>
      <p class="mt-2">Novos laboratórios em breve</p>
    </div>
  </main>
</template>
