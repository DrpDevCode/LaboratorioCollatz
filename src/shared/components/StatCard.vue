<script setup lang="ts">
defineProps<{ label: string; value: string; title?: string; accent?: string; hint?: string }>()
</script>

<template>
  <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
    <div class="text-[0.7rem] uppercase tracking-wider text-slate-500">{{ label }}</div>
    <div class="mt-1 truncate font-mono text-lg font-semibold" :class="accent ?? 'text-slate-100'" :title="title ?? value">
      {{ value }}
    </div>
    <div v-if="hint" class="text-xs text-slate-500">{{ hint }}</div>
  </div>
</template>
