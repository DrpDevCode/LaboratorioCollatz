<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { DrawFn } from '../types/sierpinski'

/**
 * Canvas com zoom (roda do mouse / pinça), arrasto e exportação em PNG.
 * Quem usa fornece `draw` em coordenadas CSS da área; `version` força redesenho.
 */
const props = defineProps<{ draw: DrawFn; version: number | string; filename: string; height?: number }>()
const emit = defineEmits<{ resize: [width: number, height: number] }>()

const wrap = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const view = { scale: 1, tx: 0, ty: 0 }
const zoomLabel = ref('100%')
let w = 0
let h = 0
let raf = 0

function render() {
  raf = 0
  const c = canvas.value
  if (!c || !w) return
  const dpr = window.devicePixelRatio || 1
  const ctx = c.getContext('2d')!
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.tx, dpr * view.ty)
  props.draw(ctx, w, h, view.scale)
  zoomLabel.value = `${Math.round(view.scale * 100)}%`
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(render)
}

function fit() {
  const el = wrap.value
  const c = canvas.value
  if (!el || !c) return
  const dpr = window.devicePixelRatio || 1
  w = el.clientWidth
  h = props.height ?? Math.min(640, Math.max(320, Math.round(w * 0.75)))
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  c.style.height = `${h}px`
  emit('resize', w, h)
  schedule()
}

function zoomAt(px: number, py: number, factor: number) {
  const s = Math.min(512, Math.max(0.5, view.scale * factor))
  const f = s / view.scale
  view.tx = px - (px - view.tx) * f
  view.ty = py - (py - view.ty) * f
  view.scale = s
  schedule()
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  zoomAt(e.offsetX, e.offsetY, Math.exp(-e.deltaY * 0.0015))
}

const pointers = new Map<number, { x: number; y: number }>()
let pinch = 0

function onDown(e: PointerEvent) {
  canvas.value!.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.offsetX, y: e.offsetY })
}

function onMove(e: PointerEvent) {
  const prev = pointers.get(e.pointerId)
  if (!prev) return
  const cur = { x: e.offsetX, y: e.offsetY }
  pointers.set(e.pointerId, cur)
  if (pointers.size === 1) {
    view.tx += cur.x - prev.x
    view.ty += cur.y - prev.y
    schedule()
  } else if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    const d = Math.hypot(a.x - b.x, a.y - b.y)
    if (pinch) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, d / pinch)
    pinch = d
  }
}

function onUp(e: PointerEvent) {
  pointers.delete(e.pointerId)
  pinch = 0
}

function resetView() {
  Object.assign(view, { scale: 1, tx: 0, ty: 0 })
  schedule()
}

function zoomCenter(f: number) {
  zoomAt(w / 2, h / 2, f)
}

function exportPng() {
  canvas.value?.toBlob((blob) => {
    if (!blob) return
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${props.filename}.png`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  })
}

let ro: ResizeObserver | undefined
onMounted(() => {
  ro = new ResizeObserver(fit)
  ro.observe(wrap.value!)
  fit()
})
onBeforeUnmount(() => {
  ro?.disconnect()
  cancelAnimationFrame(raf)
})
watch(() => [props.version, props.draw], schedule)
</script>

<template>
  <div ref="wrap" class="relative">
    <canvas
      ref="canvas"
      class="block w-full cursor-grab touch-none rounded-xl border border-slate-800 active:cursor-grabbing"
      aria-label="Área de desenho do fractal. Use a roda do mouse para ampliar e arraste para mover."
      @wheel="onWheel"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @dblclick="resetView"
    />
    <div class="absolute right-2 top-2 flex gap-1">
      <span class="tag self-center bg-slate-900/80 font-mono text-slate-400">{{ zoomLabel }}</span>
      <button class="btn" title="Ampliar" @click="zoomCenter(1.5)">＋</button>
      <button class="btn" title="Reduzir" @click="zoomCenter(1 / 1.5)">－</button>
      <button class="btn" title="Restaurar visualização (ou duplo clique)" @click="resetView">⟲</button>
      <button class="btn" title="Baixar imagem PNG" @click="exportPng">⤓ PNG</button>
    </div>
  </div>
</template>
