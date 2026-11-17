<script setup lang="ts">
import { computed, defineAsyncComponent, watchEffect } from 'vue'
import HomeView from './app/HomeView.vue'
import { useHashRoute } from './app/useHashRoute'
import { findLab, LABS } from './labs'

const { route, openLab, setTab } = useHashRoute()
const lab = computed(() => findLab(route.value.lab))

// Cada laboratório é carregado sob demanda (um bundle por laboratório).
const components = Object.fromEntries(LABS.map((l) => [l.id, defineAsyncComponent(l.load)]))

watchEffect(() => {
  document.title = lab.value ? `${lab.value.title} · Laboratórios Matemáticos` : 'Laboratórios Matemáticos'
})

function onSwitch(e: Event) {
  const id = (e.target as HTMLSelectElement).value
  if (id) openLab(id)
  else location.hash = '#/'
}
</script>

<template>
  <template v-if="lab">
    <div class="border-b border-slate-800 bg-slate-950">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-sm">
        <a href="#/" class="font-medium text-slate-400 transition hover:text-slate-100">← Laboratórios</a>
        <label class="flex items-center gap-2 text-slate-500">
          <span class="hidden sm:inline">Ir para</span>
          <select class="field !w-auto !py-1 text-sm" :value="lab.id" aria-label="Trocar de laboratório" @change="onSwitch">
            <option v-for="l in LABS" :key="l.id" :value="l.id">{{ l.icon }} {{ l.title }}</option>
          </select>
        </label>
      </div>
    </div>
    <component :is="components[lab.id]" :key="lab.id" :tab="route.tab" @update:tab="setTab" />
  </template>

  <HomeView v-else @open="openLab" />
</template>
