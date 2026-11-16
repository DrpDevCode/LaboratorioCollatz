<script setup lang="ts">
import { ref, watch } from 'vue'
import { COLORS, useEChart } from '../composables/useEChart'

/** histogram[s] = quantidade de números que exigiram s etapas. */
const props = defineProps<{ histogram: number[]; highlight?: number }>()

const el = ref<HTMLElement | null>(null)
const chart = useEChart(el, () => render())

function render() {
  const c = chart.value
  if (!c) return
  // Agrupa em faixas para manter o gráfico legível.
  const maxSteps = props.histogram.length - 1
  const width = Math.max(1, Math.ceil((maxSteps + 1) / 80))
  const bins: { from: number; to: number; count: number }[] = []
  for (let s = 0; s <= maxSteps; s += width) {
    let count = 0
    for (let k = s; k < s + width && k <= maxSteps; k++) count += props.histogram[k] ?? 0
    bins.push({ from: s, to: Math.min(maxSteps, s + width - 1), count })
  }
  const label = (b: (typeof bins)[number]) => (b.from === b.to ? `${b.from}` : `${b.from}–${b.to}`)
  c.setOption(
    {
      grid: { left: 56, right: 16, top: 16, bottom: 40 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0' },
        formatter: (p: any[]) => `${p[0].name} etapas<br/><b>${Number(p[0].value).toLocaleString('pt-BR')}</b> números`,
      },
      xAxis: {
        type: 'category',
        name: 'etapas',
        nameLocation: 'middle',
        nameGap: 26,
        data: bins.map(label),
        axisLine: { lineStyle: { color: COLORS.axis } },
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: COLORS.grid } }, axisLine: { lineStyle: { color: COLORS.axis } } },
      series: [
        {
          type: 'bar',
          barCategoryGap: '10%',
          data: bins.map((b) => ({
            value: b.count,
            itemStyle: {
              color: props.highlight !== undefined && props.highlight >= b.from && props.highlight <= b.to ? COLORS.max : COLORS.line,
              borderRadius: [3, 3, 0, 0],
            },
          })),
        },
      ],
    },
    { replaceMerge: ['series'] },
  )
}

watch(() => props.histogram, render)
</script>

<template>
  <div ref="el" class="h-64 w-full" role="img" aria-label="Distribuição do número de etapas" />
</template>
