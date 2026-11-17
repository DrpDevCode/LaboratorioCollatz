# Laboratórios Matemáticos

Coleção de simuladores matemáticos interativos. Tudo roda no navegador. A página inicial mostra um menu com os laboratórios disponíveis; cada um abre em `#/<laboratório>/<aba>`, o que permite compartilhar o link de uma aba específica.

## Laboratórios

### 🧪 Conjectura de Collatz (3n + 1) — `#/collatz`

- **Laboratório:** mostra cada operação acontecendo (valor atual, regra aplicada, feed das últimas etapas, contadores ao vivo), com gráfico, tabela e histórico. Sequências de até 400 etapas são animadas automaticamente.
- **Análise estatística:** indicadores básicos e características da trajetória: tempo de parada, crescimento (máx ÷ início), proporção de 3n+1, maiores subidas e descidas consecutivas e maior salto. Inclui também um resumo em texto.
- **Comparador:** dois números lado a lado em seis critérios. Vence quem levar mais critérios; o desempate é pelo total de etapas e depois pelo pico.
- **Explorador:** percorre um intervalo de até 10 milhões de números num Web Worker, com memoização. Mostra os campeões de etapas, os maiores picos, os recordes sucessivos e o histograma de etapas.

### 🔺 Triângulo de Sierpinski — `#/sierpinski`

- **Construção:** subdivisão recursiva de 0 a 10 níveis, com animação e métricas: triângulos (3ⁿ), área ((3/4)ⁿ), perímetro (3·(3/2)ⁿ) e dimensão fractal (log 3 / log 2).
- **Jogo do Caos:** de 3 a 8 vértices, razão, velocidade, até 300 mil pontos, semente reproduzível e regra "não repetir vértice".
- **Pascal:** coeficientes binomiais módulo 2, 3, 4, 5 ou 7 (até 256 linhas, valores exatos).
- **Regra 90:** autômato celular gerado linha a linha.

As telas têm zoom, arrasto e exportação em PNG.

## Comandos

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm test           # testes unitários (Vitest)
npm run typecheck  # vue-tsc
npm run build      # build de produção em dist/
```

## Estrutura

```
src/
  App.vue                    shell: menu inicial ou laboratório ativo + barra para trocar
  app/                       HomeView (menu) e useHashRoute (rota #/lab/aba)
  labs/index.ts              catálogo de laboratórios (título, descrição, ícone, carregamento)
  labs/collatz/              Laboratório Collatz (componentes, composables, services, worker)
  labs/sierpinski/           Laboratório Sierpinski
  shared/components/         componentes comuns (TabNav, StatCard)
  style.css                  tema e classes compartilhadas (panel, btn, field…)
```

## Como adicionar um laboratório

1. Crie `src/labs/<id>/` com um componente raiz, por exemplo `MeuLab.vue`. Ele recebe a aba ativa por `v-model:tab` (`defineModel<string>('tab', { required: true })`) e deve corrigi-la para uma aba válida se vier vazia.
2. Acrescente a entrada em `src/labs/index.ts` (`id`, `title`, `formula`, `description`, `icon`, `tags`, `accent`, `load: () => import('./<id>/MeuLab.vue')`).
3. Coloque os testes em `*.spec.ts` dentro da pasta do laboratório. O Vitest encontra todos automaticamente.

Cada laboratório é carregado sob demanda, em um bundle próprio.

## Decisões

### Collatz

- O cálculo roda em blocos de 20 mil etapas, cedendo o thread principal entre eles. Isso mantém a interface responsiva e permite cancelar.
- O limite de etapas é configurável, de 1 a 5.000.000. Ao atingi-lo, o resultado aparece como **interrompido**, nunca como convergente.
- O histórico guarda apenas o resumo de cada cálculo. A sequência é recalculada ao reabrir ou comparar, para não estourar a cota do LocalStorage.
- O gráfico usa `Number` para plotar, e o tooltip e a tabela mostram o BigInt exato. Acima de 300 dígitos, a escala logarítmica passa a ser obrigatória.

### Sierpinski

- O Jogo do Caos usa um gerador pseudoaleatório com semente, então a mesma semente reproduz o mesmo desenho.
- Os testes verificam que Pascal módulo 2 (pelo teorema de Lucas), o cálculo exato com BigInt e a Regra 90 produzem o mesmo padrão.
