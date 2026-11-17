<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import FractalCanvas from './FractalCanvas.vue'
import MetricsPanel from './MetricsPanel.vue'
import { baseTriangle, MAX_DEPTH, removedAt, subdivide } from '../services/sierpinski'
import { pick, type Palette } from '../utils/palettes'
import type { DrawFn, Triangle } from '../types/sierpinski'

const props = defineProps<{ palette: Palette }>()

const depth = ref(5)
const colorBy = ref<'branch' | 'level' | 'uniform'>('branch')
const showRemoved = ref(true)
const playing = ref(false)
const size = ref({ w: 0, h: 0 })
let timer = 0

const base = computed(() => baseTriangle(size.value.w || 1, size.value.h || 1))
const tris = computed(() => (size.value.w ? subdivide(base.value, depth.value) : []))
const holes = computed(() => {
  if (!showRemoved.value || !size.value.w) return [] as { tri: Triangle; level: number }[]
  const out: { tri: Triangle; level: number }[] = []
  for (let l = 1; l <= depth.value; l++) {
    // removedAt(l) devolve só os 3^(l-1) buracos criados no nível l
    for (const tri of removedAt(base.value, l)) out.push({ tri, level: l })
  }
  return out
})

function path(ctx: CanvasRenderingContext2D, [a, b, c]: Triangle) {
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.lineTo(c.x, c.y)
  ctx.closePath()
}

const draw = computed<DrawFn>(() => (ctx, _w, _h, scale) => {
  const d = depth.value
  const groups = new Map<string, Triangle[]>()
  tris.value.forEach((t, i) => {
    let color: string
    if (colorBy.value === 'uniform' || d === 0) color = pick(props.palette, 0)
    else if (colorBy.value === 'branch') color = pick(props.palette, Math.floor(i / 3 ** (d - 1)))
    else color = pick(props.palette, i % 3)
    if (!groups.has(color)) groups.set(color, [])
    groups.get(color)!.push(t)
  })
  for (const [color, list] of groups) {
    ctx.beginPath()
    for (const t of list) path(ctx, t)
    ctx.fillStyle = color
    ctx.fill()
  }
  if (showRemoved.value) {
    ctx.lineWidth = 1 / scale
    for (const { tri, level } of holes.value) {
      ctx.beginPath()
      path(ctx, tri)
      ctx.strokeStyle = `rgba(148,163,184,${Math.max(0.15, 0.6 - level * 0.05)})`
      ctx.stroke()
    }
  }
})

const version = computed(() => `${depth.value}|${tris.value.length}|${showRemoved.value}|${colorBy.value}|${props.palette.id}`)

function stop() {
  playing.value = false
  clearInterval(timer)
}

function animate() {
  stop()
  const target = depth.value > 0 ? depth.value : 6
  depth.value = 0
  playing.value = true
  timer = window.setInterval(() => {
    if (depth.value >= target) return stop()
    depth.value++
  }, 700)
}

onBeforeUnmount(stop)
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Construção recursiva</h2>
    <div class="mb-4 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <div>
        <label class="label" for="depth">Profundidade: <span class="font-mono text-indigo-300">{{ depth }}</span></label>
        <input id="depth" v-model.number="depth" type="range" min="0" :max="MAX_DEPTH" class="w-full accent-indigo-400" @input="stop" />
      </div>
      <div>
        <label class="label" for="colorBy">Cor por</label>
        <select id="colorBy" v-model="colorBy" class="field">
          <option value="branch">Ramo (canto inicial)</option>
          <option value="level">Posição no último nível</option>
          <option value="uniform">Uniforme</option>
        </select>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button class="btn" :disabled="depth <= 0" @click="stop(); depth--">◀ Nível</button>
        <button class="btn" :disabled="depth >= MAX_DEPTH" @click="stop(); depth++">Nível ▶</button>
        <button v-if="!playing" class="btn btn-primary" @click="animate">▶ Animar</button>
        <button v-else class="btn btn-danger" @click="stop">■ Parar</button>
      </div>
    </div>
    <label class="mb-3 flex items-center gap-2 text-sm text-slate-400">
      <input v-model="showRemoved" type="checkbox" class="accent-indigo-400" /> Contornar triângulos removidos
    </label>
    <FractalCanvas
      :draw="draw"
      :version="version"
      :filename="`sierpinski-nivel-${depth}`"
      @resize="(w, h) => (size = { w, h })"
    />
    <p class="mt-2 text-xs text-slate-500">
      A cada nível, cada triângulo é dividido em quatro pelos pontos médios e o central é removido.
      Role para ampliar e arraste para mover: as partes repetem o todo.
    </p>
  </section>

  <MetricsPanel :depth="depth" />
</template>
