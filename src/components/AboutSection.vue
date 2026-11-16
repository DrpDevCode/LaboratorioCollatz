<template>
  <section class="panel">
    <h2 class="panel-title">Sobre a Conjectura de Collatz</h2>
    <div class="grid gap-6 text-sm leading-relaxed text-slate-300 md:grid-cols-2">
      <div class="space-y-3">
        <p>
          Proposta por Lothar Collatz em 1937, a conjectura considera a função
          <span class="font-mono text-slate-100">f(n) = n/2</span> para <span class="text-sky-300">n par</span> e
          <span class="font-mono text-slate-100">f(n) = 3n + 1</span> para <span class="text-amber-300">n ímpar</span>.
          Ela afirma que, partindo de qualquer inteiro positivo, aplicações sucessivas de f sempre chegam a 1, onde
          entram no ciclo 1 → 4 → 2 → 1.
        </p>
        <p>
          A regra é simples, mas o comportamento é irregular. O número 27, por exemplo, leva 111 etapas e sobe até
          9.232 antes de descer. Vizinhos como 26 e 28 terminam em 10 e 18 etapas.
        </p>
      </div>
      <div class="space-y-3">
        <p>
          A conjectura já foi verificada por computador para números iniciais enormes, e Terence Tao mostrou em 2019
          que “quase todas” as órbitas atingem valores muito pequenos. Ainda assim, <strong class="text-slate-100">não existe
          demonstração</strong> para todos os números naturais: o problema continua em aberto.
        </p>
        <p class="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-slate-400">
          Este simulador verifica sequências individuais. Ver uma sequência chegar a 1 confirma o comportamento para
          aquele número, e não prova a conjectura. Quando o limite de etapas é atingido, o resultado é apresentado
          como <em>interrompido</em>, nunca como convergente.
        </p>
      </div>
    </div>
  </section>
</template>
