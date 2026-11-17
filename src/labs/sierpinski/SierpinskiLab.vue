<script setup lang="ts">
import { shallowRef } from 'vue'
import AppHeader from './components/AppHeader.vue'
import TabNav, { type Tab } from '../../shared/components/TabNav.vue'
import ConstructionView from './components/ConstructionView.vue'
import ChaosGameView from './components/ChaosGameView.vue'
import PascalView from './components/PascalView.vue'
import Rule90View from './components/Rule90View.vue'
import AboutSection from './components/AboutSection.vue'
import { PALETTES } from './utils/palettes'

const tabs: Tab[] = [
  { id: 'build', label: '🔺 Construção', hint: 'Subdivisão recursiva nível a nível' },
  { id: 'chaos', label: '🎲 Jogo do Caos', hint: 'Pontos aleatórios formando o fractal' },
  { id: 'pascal', label: '🔢 Pascal', hint: 'Coeficientes binomiais módulo m' },
  { id: 'rule90', label: '▦ Regra 90', hint: 'Autômato celular elementar' },
  { id: 'about', label: '📖 Sobre', hint: 'O fractal' },
]
/** Aba ativa: controlada pelo shell, que a reflete na URL (#/laboratório/aba). */
const tab = defineModel<string>('tab', { required: true })
if (!tabs.some((t) => t.id === tab.value)) tab.value = 'build'

const palette = shallowRef(PALETTES[0])
</script>

<template>
  <AppHeader v-model="palette" />
  <TabNav v-model="tab" :tabs="tabs" />

  <main class="mx-auto grid max-w-7xl gap-5 px-4 py-6">
    <ConstructionView v-if="tab === 'build'" :palette="palette" />
    <ChaosGameView v-else-if="tab === 'chaos'" :palette="palette" />
    <PascalView v-else-if="tab === 'pascal'" :palette="palette" />
    <Rule90View v-else-if="tab === 'rule90'" :palette="palette" />
    <AboutSection v-else />
  </main>

  <footer class="py-8 text-center text-xs text-slate-600">
    Todo o processamento acontece no seu navegador · roda do mouse amplia, arrastar move, duplo clique restaura
  </footer>
</template>
