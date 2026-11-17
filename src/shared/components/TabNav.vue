<script setup lang="ts">
export interface Tab {
  id: string
  label: string
  hint: string
}
defineProps<{ tabs: Tab[] }>()
const active = defineModel<string>({ required: true })
</script>

<template>
  <nav class="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur" aria-label="Seções">
    <div class="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.id"
        role="tab"
        :aria-selected="active === t.id"
        class="shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition"
        :class="active === t.id ? 'border-indigo-400 text-slate-50' : 'border-transparent text-slate-400 hover:text-slate-200'"
        :title="t.hint"
        @click="active = t.id"
      >
        {{ t.label }}
      </button>
    </div>
  </nav>
</template>
