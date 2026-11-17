import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { chaosStep, defaultRatio, mulberry32, polygon, type ChaosState } from '../services/sierpinski'
import type { Point } from '../types/sierpinski'

export const MAX_POINTS = 300_000

/** Estado e laço de animação do Jogo do Caos. Os pontos ficam em buffers tipados (sem reatividade profunda). */
export function useChaosGame() {
  const sides = ref(3)
  const ratio = ref(0.5)
  const noRepeat = ref(false)
  const speed = ref(2000)
  const target = ref(50_000)
  const seed = ref(1)
  const count = ref(0)
  const running = ref(false)
  const version = ref(0)
  const vertices = shallowRef<Point[]>([])
  const buf = {
    xs: new Float32Array(MAX_POINTS),
    ys: new Float32Array(MAX_POINTS),
    vs: new Uint8Array(MAX_POINTS),
  }
  let size = { w: 0, h: 0 }
  let state: ChaosState = { x: 0, y: 0, last: -1 }
  let rng = mulberry32(1)
  let raf = 0

  function reset() {
    pause()
    vertices.value = size.w ? polygon(sides.value, size.w, size.h) : []
    const v0 = vertices.value[0] ?? { x: 0, y: 0 }
    state = { x: v0.x, y: v0.y, last: -1 }
    rng = mulberry32(seed.value)
    count.value = 0
    version.value++
  }

  function setSides(k: number) {
    sides.value = k
    ratio.value = Number(defaultRatio(k).toFixed(3))
    noRepeat.value = k === 4
    reset()
  }

  function resize(w: number, h: number) {
    size = { w, h }
    reset()
  }

  function add(n: number) {
    if (!vertices.value.length) return
    const limit = Math.min(MAX_POINTS, target.value)
    const added = chaosStep(vertices.value, ratio.value, state, Math.min(n, limit - count.value), rng, buf, count.value, noRepeat.value)
    count.value += added
    version.value++
    return count.value < limit
  }

  function tick() {
    if (!running.value) return
    if (!add(Math.max(1, Math.round(speed.value / 60)))) return pause()
    raf = requestAnimationFrame(tick)
  }

  function play() {
    if (count.value >= Math.min(MAX_POINTS, target.value)) reset()
    running.value = true
    raf = requestAnimationFrame(tick)
  }

  function pause() {
    running.value = false
    cancelAnimationFrame(raf)
  }

  function instant() {
    pause()
    add(Math.min(MAX_POINTS, target.value))
  }

  onBeforeUnmount(pause)

  return { sides, ratio, noRepeat, speed, target, seed, count, running, version, vertices, buf, setSides, resize, reset, play, pause, instant, add }
}

export type ChaosApi = ReturnType<typeof useChaosGame>
