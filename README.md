# Laboratório Collatz (3n + 1)

Simulador interativo da Conjectura de Collatz. Roda inteiramente no navegador, com aritmética exata via BigInt.

## Seções

- **Laboratório:** mostra cada operação acontecendo (valor atual, regra aplicada, feed das últimas etapas, contadores ao vivo), com gráfico, tabela e histórico. Sequências de até 400 etapas são animadas automaticamente.
- **Análise estatística:** indicadores básicos e características da trajetória: tempo de parada, crescimento (máx ÷ início), proporção de 3n+1, maiores subidas e descidas consecutivas e maior salto. Inclui também um resumo em texto.
- **Comparador:** dois números lado a lado em seis critérios. Vence quem levar mais critérios; o desempate é pelo total de etapas e depois pelo pico.
- **Explorador:** percorre um intervalo de até 10 milhões de números num Web Worker, com memoização. Mostra os campeões de etapas, os maiores picos, os recordes sucessivos e o histograma de etapas.

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
  types/collatz.ts          tipos (resultado, estatísticas, histórico)
  services/collatz.ts       regra, cálculo síncrono/assíncrono cancelável, estatísticas, validação
  services/analysis.ts      características da sequência e critérios do comparador
  services/explorer.ts      varredura de intervalos com memoização
  workers/                  Web Worker do explorador
  services/history.ts       persistência do histórico (LocalStorage, só resumos)
  composables/              useCollatz, useAnimation, useHistory, useEChart
  components/               painéis da página (entrada, indicadores, gráficos, tabela, animação, histórico)
  utils/format.ts           formatação exata de BigInt
```

## Decisões

- O cálculo roda em blocos de 20 mil etapas, cedendo o thread principal entre eles. Isso mantém a interface responsiva e permite cancelar.
- O limite de etapas é configurável, de 1 a 5.000.000. Ao atingi-lo, o resultado aparece como **interrompido**, nunca como convergente.
- O histórico guarda apenas o resumo de cada cálculo. A sequência é recalculada ao reabrir ou comparar, para não estourar a cota do LocalStorage.
- O gráfico usa `Number` para plotar, e o tooltip e a tabela mostram o BigInt exato. Acima de 300 dígitos, a escala logarítmica passa a ser obrigatória.
