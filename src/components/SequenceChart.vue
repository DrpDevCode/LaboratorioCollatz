<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ECharts } from 'echarts/core'
import { COLORS, useEChart } from '../composables/useEChart'
import { log10Big } from '../services/collatz'
import { groupDigits } from '../utils/format'

const props = defineProps<{
  sequence: bigint[]
  maxIndex: number
  converged: boolean
  current: number | null
}>()

const emit = defineEmits<{ pick: [step: number] }>()

const userLog = ref(false)
// Acima de ~300 dígitos, Number vira Infinity: só a escala log é representável.
const forceLog = computed(() => props.sequence[props.maxIndex]?.toString().length > 300)
const logScale = computed(() => userLog.value || forceLog.value)

/** Valores plotáveis (Number); o tooltip sempre usa o BigInt exato. */
const yValues = computed(() =>
  logScale.value ? props.sequence.map(log10Big) : props.sequence.map((v) => Number(v)),
)

const el = ref<HTMLElement | null>(null)
const chart = useEChart(el, (c) => {
  c.on('click', (p) => {
    if (typeof p.dataIndex === 'number' && p.seriesId === 'seq') emit('pick', p.dataIndex)
  })
  render(c)
})

function pointColor(i: number): string {
  const v = props.sequence[i]
  if (i === props.sequence.length - 1 && v === 1n) return COLORS.final
  return v % 2n === 0n ? COLORS.even : COLORS.odd
}

function render(c: ECharts | null) {
  if (!c) return
  const n = props.sequence.length
  const visible = props.current === null ? n : props.current + 1
  const ys = yValues.value
  const data = ys.slice(0, visible).map((y, i) => [i, y])
  const showSymbols = n <= 400
  const last = n - 1

  const markPoints: object[] = []
  if (props.maxIndex < visible) {
    markPoints.push({
      name: 'Máximo',
      coord: [props.maxIndex, ys[props.maxIndex]],
      itemStyle: { color: COLORS.max },
      label: { formatter: 'máx', color: '#0f172a', fontWeight: 600 },
    })
  }
  if (props.converged && visible === n && n > 1) {
    markPoints.push({
      name: 'Chegada',
      coord: [last, ys[last]],
      symbol: 'pin',
      itemStyle: { color: COLORS.final },
      label: { formatter: '1', color: '#0f172a', fontWeight: 700 },
    })
  }

  const cur = props.current
  c.setOption(
    {
      animation: n <= 2000,
      grid: { left: 64, right: 24, top: 28, bottom: 72 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0f172a',
        borderColor: '#334155',
        textStyle: { color: '#e2e8f0', fontFamily: 'JetBrains Mono, ui-monospace, monospace' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params.find((x: any) => x.seriesId === 'seq') ?? params[0] : params
          const i = p.data[0] as number
          const v = props.sequence[i]
          const par = v % 2n === 0n ? 'par' : 'ímpar'
          const full = groupDigits(v)
          const shown = full.length > 60 ? full.slice(0, 60) + '…' : full
          return `<b>Etapa ${i}</b><br/>Valor: ${shown}<br/><span style="color:${pointColor(i)}">● ${par}</span>`
        },
      },
      xAxis: {
        type: 'value',
        name: 'etapa',
        min: 0,
        max: Math.max(1, last),
        axisLine: { lineStyle: { color: COLORS.axis } },
        splitLine: { lineStyle: { color: COLORS.grid } },
      },
      yAxis: {
        type: 'value',
        name: logScale.value ? 'log₁₀(valor)' : 'valor',
        scale: false,
        axisLine: { lineStyle: { color: COLORS.axis } },
        splitLine: { lineStyle: { color: COLORS.grid } },
        axisLabel: {
          formatter: (v: number) =>
            logScale.value ? `10^${+v.toFixed(1)}` : Math.abs(v) >= 1e6 ? v.toExponential(1) : v.toLocaleString('pt-BR'),
        },
      },
      dataZoom: [
        { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
        { type: 'slider', xAxisIndex: 0, height: 22, bottom: 16, borderColor: '#334155', textStyle: { color: COLORS.axis } },
      ],
      series: [
        {
          id: 'seq',
          type: 'line',
          data,
          showSymbol: showSymbols,
          symbolSize: 6,
          sampling: n > 5000 ? 'lttb' : undefined,
          large: n > 5000,
          lineStyle: { color: COLORS.line, width: 1.6 },
          itemStyle: { color: (p: any) => pointColor(p.dataIndex) },
          areaStyle: { color: 'rgba(129,140,248,0.08)' },
          markPoint: { symbolSize: 42, data: markPoints },
        },
        {
          id: 'current',
          type: 'scatter',
          data: cur === null ? [] : [[cur, ys[cur]]],
          symbolSize: 14,
          itemStyle: { color: COLORS.current, borderColor: '#fff', borderWidth: 2 },
          z: 10,
          tooltip: { show: false },
        },
      ],
    },
    { replaceMerge: ['series'] },
  )
}

watch(() => [props.sequence, props.current, logScale.value], () => render(chart.value))
</script>

<template>
  <div>
    <div class="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
      <div class="flex flex-wrap gap-3">
        <span class="flex items-center gap-1"><i class="dot bg-sky-400" />par</span>
        <span class="flex items-center gap-1"><i class="dot bg-amber-400" />ímpar</span>
        <span class="flex items-center gap-1"><i class="dot bg-rose-400" />máximo</span>
        <span class="flex items-center gap-1"><i class="dot bg-emerald-400" />chegada em 1</span>
        <span class="flex items-center gap-1"><i class="dot bg-fuchsia-400" />etapa atual</span>
      </div>
      <label class="flex cursor-pointer items-center gap-2">
        <input v-model="userLog" type="checkbox" class="accent-indigo-400" :disabled="forceLog" />
        Escala logarítmica
        <span v-if="forceLog" class="text-amber-300">(obrigatória: valores grandes demais)</span>
      </label>
    </div>
    <div ref="el" class="h-80 w-full sm:h-[26rem]" role="img" aria-label="Gráfico da sequência de Collatz" />
    <p class="mt-1 text-xs text-slate-500">Role ou arraste para dar zoom; clique em um ponto para ir à etapa.</p>
  </div>
</template>

<style scoped>
.dot {
  display: inline-block;
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 9999px;
}
</style>
