<script setup lang="ts">
import { computed, watch } from 'vue'
import FractalCanvas from './FractalCanvas.vue'
import StatCard from '../../../shared/components/StatCard.vue'
import { MAX_POINTS, useChaosGame } from '../composables/useChaosGame'
import { pick, fmt, type Palette } from '../utils/palettes'
import type { DrawFn } from '../types/sierpinski'

const props = defineProps<{ palette: Palette }>()
const g = useChaosGame()

const draw = computed<DrawFn>(() => (ctx, _w, _h, scale) => {
  const { xs, ys, vs } = g.buf
  const n = g.count.value
  const k = g.sides.value
  const s = Math.max(0.6, 1.2 / scale)
  for (let v = 0; v < k; v++) {
    ctx.fillStyle = pick(props.palette, v)
    ctx.beginPath()
    for (let i = 0; i < n; i++) if (vs[i] === v) ctx.rect(xs[i] - s / 2, ys[i] - s / 2, s, s)
    ctx.fill()
  }
  // vértices e último salto
  const r = 5 / scale
  g.vertices.value.forEach((p, v) => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
    ctx.fillStyle = pick(props.palette, v)
    ctx.fill()
    ctx.lineWidth = 1.5 / scale
    ctx.strokeStyle = '#f8fafc'
    ctx.stroke()
  })
  if (n > 0 && g.running.value) {
    ctx.beginPath()
    ctx.arc(xs[n - 1], ys[n - 1], 4 / scale, 0, Math.PI * 2)
    ctx.fillStyle = '#f8fafc'
    ctx.fill()
  }
})

const version = computed(() => `${g.version.value}|${props.palette.id}`)
watch([g.ratio, g.noRepeat, g.seed], () => g.reset())
</script>

<template>
  <section class="panel">
    <h2 class="panel-title">Jogo do Caos</h2>
    <div class="mb-4 grid gap-4 md:grid-cols-3">
      <div>
        <span class="label">Vértices</span>
        <div class="flex flex-wrap gap-1">
          <button
            v-for="k in [3, 4, 5, 6, 7, 8]"
            :key="k"
            class="btn"
            :class="g.sides.value === k && 'btn-primary'"
            @click="g.setSides(k)"
          >
            {{ k }}
          </button>
        </div>
      </div>
      <div>
        <label class="label" for="ratio">Razão do salto: <span class="font-mono text-indigo-300">{{ g.ratio.value }}</span></label>
        <input id="ratio" v-model.number="g.ratio.value" type="range" min="0.1" max="0.9" step="0.005" class="w-full accent-indigo-400" />
      </div>
      <div>
        <label class="label" for="speed">Velocidade: <span class="font-mono text-indigo-300">{{ fmt(g.speed.value) }} pts/s</span></label>
        <input id="speed" v-model.number="g.speed.value" type="range" min="10" max="100000" step="10" class="w-full accent-indigo-400" />
      </div>
      <div>
        <label class="label" for="target">Total de pontos (máx. {{ fmt(MAX_POINTS) }})</label>
        <input id="target" v-model.number="g.target.value" type="number" min="100" :max="MAX_POINTS" step="1000" class="field" />
      </div>
      <div>
        <label class="label" for="seed">Semente aleatória</label>
        <input id="seed" v-model.number="g.seed.value" type="number" min="0" class="field" />
      </div>
      <label class="flex items-center gap-2 self-end pb-2 text-sm text-slate-400">
        <input v-model="g.noRepeat.value" type="checkbox" class="accent-indigo-400" /> Não repetir o vértice anterior
      </label>
    </div>
    <div class="mb-4 flex flex-wrap gap-2">
      <button v-if="!g.running.value" class="btn btn-primary" @click="g.play">▶ Jogar</button>
      <button v-else class="btn btn-danger" @click="g.pause">❚❚ Pausar</button>
      <button class="btn" @click="g.add(1)">+1 ponto</button>
      <button class="btn" @click="g.instant">⚡ Completar</button>
      <button class="btn" @click="g.reset">⟲ Limpar</button>
    </div>
    <FractalCanvas :draw="draw" :version="version" filename="sierpinski-jogo-do-caos" @resize="g.resize" />
    <div class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Pontos" :value="fmt(g.count.value)" accent="text-indigo-300" />
      <StatCard label="Vértices" :value="String(g.sides.value)" />
      <StatCard label="Razão" :value="String(g.ratio.value)" />
      <StatCard label="Regra" :value="g.noRepeat.value ? 'sem repetição' : 'livre'" />
    </div>
    <p class="mt-3 text-xs text-slate-500">
      Comece num vértice, sorteie um vértice e ande a fração escolhida da distância até ele; marque o ponto e repita.
      Com 3 vértices e razão 0,5 surge o Triângulo de Sierpinski. Com 4 vértices sem restrição o quadrado só fica
      cinza; ative “não repetir” para ver um fractal aparecer. Cada cor indica o vértice sorteado.
    </p>
  </section>
</template>
