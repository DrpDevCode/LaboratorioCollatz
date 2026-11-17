<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEChart, COLORS } from '../composables/useEChart'
import { log10Big } from '../services/collatz'
import { groupDigits } from '../utils/format'

export interface CompareSeries {
  label: string
  sequence: bigint[]
}

const props = defineProps<{ series: CompareSeries[] }>()
const PALETTE = [COLORS.line, COLORS.odd, COLORS.even, COLORS.max]

const el = ref<HTMLElement | null>(null)
const chart = useEChart(el, () => render())

function render() {
  const c = chart.value
  if (!c) return
  c.setOption(
    {
      color: PALETTE,
      legend: { top: 0, textStyle: { color: COLORS.axis } },
      grid: { left: 56, right: 20, top: 36, bottom: 64 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0' },
        formatter: (params: any[]) => {
          const step = params[0]?.data[0]
          const lines = params.map((p) => {
            const seq = props.series[p.seriesIndex].sequence
            const v = groupDigits(seq[p.data[0]])
            return `<span style="color:${p.color}">●</span> ${p.seriesName}: ${v.length > 40 ? v.slice(0, 40) + '…' : v}`
          })
          return `<b>Etapa ${step}</b><br/>${lines.join('<br/>')}`
        },
      },
      xAxis: { type: 'value', name: 'etapa', min: 0, splitLine: { lineStyle: { color: COLORS.grid } }, axisLine: { lineStyle: { color: COLORS.axis } } },
      yAxis: {
        type: 'value',
        name: 'log₁₀(valor)',
        splitLine: { lineStyle: { color: COLORS.grid } },
        axisLine: { lineStyle: { color: COLORS.axis } },
        axisLabel: { formatter: (v: number) => `10^${+v.toFixed(1)}` },
      },
      dataZoom: [{ type: 'inside' }, { type: 'slider', height: 20, bottom: 12, borderColor: '#334155' }],
      series: props.series.map((s) => ({
        name: s.label,
        type: 'line',
        showSymbol: false,
        sampling: 'lttb',
        lineStyle: { width: 1.5 },
        data: s.sequence.map((v, i) => [i, log10Big(v)]),
      })),
    },
    { replaceMerge: ['series'] },
  )
}

watch(() => props.series, render)
</script>

<template>
  <div ref="el" class="h-72 w-full" role="img" aria-label="Comparação de sequências em escala logarítmica" />
</template>
