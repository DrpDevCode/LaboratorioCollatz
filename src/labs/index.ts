import type { Component } from 'vue'

/**
 * Catálogo de laboratórios. Para adicionar um novo:
 *   1. crie src/labs/<id>/ com um componente raiz que aceite `v-model:tab`;
 *   2. acrescente uma entrada aqui.
 * O shell cuida do menu, da rota (#/<id>/<aba>) e do carregamento sob demanda.
 */
export interface LabInfo {
  id: string
  title: string
  formula: string
  description: string
  icon: string
  tags: string[]
  /** Classes de destaque do cartão no menu (cor do tema do laboratório). */
  accent: string
  load: () => Promise<{ default: Component }>
}

export const LABS: LabInfo[] = [
  {
    id: 'collatz',
    title: 'Conjectura de Collatz',
    formula: '3n + 1',
    description:
      'Siga a sequência de qualquer inteiro até chegar a 1. Compare números, analise trajetórias e explore intervalos de até 10 milhões.',
    icon: '🧪',
    tags: ['teoria dos números', 'problema em aberto', 'BigInt'],
    accent: 'from-indigo-500/20 hover:border-indigo-400/60',
    load: () => import('./collatz/CollatzLab.vue'),
  },
  {
    id: 'sierpinski',
    title: 'Triângulo de Sierpinski',
    formula: 'd ≈ 1,585',
    description:
      'Construa o fractal por subdivisão, pelo Jogo do Caos, pelo Triângulo de Pascal e pela Regra 90, com zoom e exportação em PNG.',
    icon: '🔺',
    tags: ['fractais', 'autossimilaridade', 'autômatos'],
    accent: 'from-amber-500/20 hover:border-amber-400/60',
    load: () => import('./sierpinski/SierpinskiLab.vue'),
  },
]

export const findLab = (id: string) => LABS.find((l) => l.id === id)
