import { onBeforeUnmount, onMounted, shallowRef, type Ref } from 'vue'
import { init, use, type ECharts } from 'echarts/core'
import { BarChart, LineChart, ScatterChart } from 'echarts/charts'
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkPointComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, LineChart,ScatterChart, GridComponent, TooltipComponent, DataZoomComponent, MarkPointComponent, LegendComponent, CanvasRenderer])

/** Cria e descarta uma instância ECharts ligada a um elemento, com resize automático. */
export function useEChart(el: Ref<HTMLElement | null>, onReady: (chart: ECharts) => void) {
  const chart = shallowRef<ECharts | null>(null)
  let ro: ResizeObserver | null = null

  onMounted(() => {
    if (!el.value) return
    chart.value = init(el.value, undefined, { renderer: 'canvas' })
    ro = new ResizeObserver(() => chart.value?.resize())
    ro.observe(el.value)
    onReady(chart.value)
  })

  onBeforeUnmount(() => {
    ro?.disconnect()
    chart.value?.dispose()
  })

  return chart
}

export const COLORS = {
  even: '#38bdf8',
  odd: '#fbbf24',
  final: '#34d399',
  max: '#fb7185',
  current: '#e879f9',
  line: '#818cf8',
  grid: 'rgba(148,163,184,0.12)',
  axis: '#94a3b8',
}
