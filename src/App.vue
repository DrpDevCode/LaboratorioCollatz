<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppHeader from './components/AppHeader.vue'
import TabNav, { type Tab } from './components/TabNav.vue'
import InputPanel from './components/InputPanel.vue'
import StatsPanel from './components/StatsPanel.vue'
import CharacteristicsPanel from './components/CharacteristicsPanel.vue'
import SequenceChart from './components/SequenceChart.vue'
import LiveLab from './components/LiveLab.vue'
import StepsTable from './components/StepsTable.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import ComparatorView from './components/ComparatorView.vue'
import ExplorerView from './components/ExplorerView.vue'
import AboutSection from './components/AboutSection.vue'
import { useCollatz } from './composables/useCollatz'
import { useAnimation } from './composables/useAnimation'
import { useHistory } from './composables/useHistory'
import { useComparator } from './composables/useComparator'
import { useExplorer } from './composables/useExplorer'
import type { HistoryEntry } from './types/collatz'

const tabs: Tab[] = [
  { id: 'lab', label: '🧪 Laboratório', hint: 'Acompanhe cada operação acontecendo' },
  { id: 'compare', label: '⚖️ Comparador', hint: 'Dois números lado a lado' },
  { id: 'explore', label: '🔭 Explorador', hint: 'Quem exige mais etapas num intervalo' },
  { id: 'about', label: '📖 Sobre', hint: 'A conjectura' },
]
const initial = location.hash.slice(1)
const tab = ref(tabs.some((t) => t.id === initial) ? initial : 'lab')
watch(tab, (t) => history.replaceState(null, '', `#${t}`))

const calc = useCollatz()
const hist = useHistory()
const cmp = useComparator()
const ex = useExplorer()
const sequence = computed(() => calc.result.value?.sequence ?? [])
const anim = useAnimation(computed(() => sequence.value.length))

/** Sequências curtas são animadas automaticamente para o usuário acompanhar as operações. */
const AUTOPLAY_MAX_STEPS = 400

async function run() {
  anim.reset()
  const r = await calc.run()
  if (!r) return
  hist.record(r)
  if (r.stats.steps > 0 && r.stats.steps <= AUTOPLAY_MAX_STEPS) anim.play()
}

async function openNumber(n: string) {
  tab.value = 'lab'
  calc.input.value = n
  window.scrollTo({ top: 0, behavior: 'smooth' })
  await run()
}

async function openEntry(e: HistoryEntry) {
  calc.limit.value = e.limit
  await openNumber(e.start)
}

function comparePair(a: string, b: string) {
  tab.value = 'compare'
  window.scrollTo({ top: 0, behavior: 'smooth' })
  cmp.setPair(a, b)
}

function clear() {
  anim.reset()
  calc.clear()
}

onMounted(() => {
  run()
  cmp.run()
})
</script>

<template>
  <AppHeader />
  <TabNav v-model="tab" :tabs="tabs" />

  <main class="mx-auto grid max-w-7xl gap-5 px-4 py-6">
    <template v-if="tab === 'lab'">
      <InputPanel
        v-model:input="calc.input.value"
        v-model:limit="calc.limit.value"
        :running="calc.running.value"
        :progress="calc.progress.value"
        :error="calc.error.value"
        @run="run"
        @cancel="calc.cancel"
        @clear="clear"
      />

      <template v-if="calc.result.value">
        <LiveLab :anim="anim" :sequence="sequence" />

        <section class="panel">
          <h2 class="panel-title">Gráfico da sequência</h2>
          <SequenceChart
            :sequence="sequence"
            :max-index="calc.result.value.stats.maxIndex"
            :converged="calc.result.value.status === 'converged'"
            :current="anim.current.value"
            @pick="anim.goTo"
          />
        </section>
      </template>

      <StatsPanel :result="calc.result.value" :status="calc.status.value" :progress="calc.progress.value" />

      <template v-if="calc.result.value">
        <CharacteristicsPanel :result="calc.result.value" />
        <StepsTable
          :sequence="sequence"
          :current="anim.current.value"
          :max-index="calc.result.value.stats.maxIndex"
          @pick="anim.goTo"
        />
      </template>

      <HistoryPanel
        :entries="hist.entries.value"
        :busy="calc.running.value"
        @open="openEntry"
        @remove="hist.remove"
        @clear-all="hist.clearAll"
      />
    </template>

    <ComparatorView v-else-if="tab === 'compare'" :cmp="cmp" @open="openNumber" />

    <ExplorerView v-else-if="tab === 'explore'" :ex="ex" @open="openNumber" @compare="comparePair" />

    <AboutSection v-else />
  </main>

  <footer class="py-8 text-center text-xs text-slate-600">
    Todo o processamento acontece no seu navegador · aritmética exata com BigInt
  </footer>
</template>
