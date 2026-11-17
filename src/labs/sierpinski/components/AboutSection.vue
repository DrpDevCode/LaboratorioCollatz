<template>
  <section class="panel">
    <h2 class="panel-title">Sobre o Triângulo de Sierpinski</h2>
    <div class="grid gap-6 text-sm leading-relaxed text-slate-300 md:grid-cols-2">
      <div class="space-y-3">
        <p>
          Descrito pelo matemático polonês Wacław Sierpiński em 1915, o triângulo é obtido removendo, repetidamente, o
          triângulo central formado pelos pontos médios de cada lado. O conjunto limite é
          <strong class="text-slate-100">autossimilar</strong>: é formado por três cópias de si mesmo, cada uma com
          metade do tamanho.
        </p>
        <p>
          Daí vem a dimensão de similaridade: 3 cópias na escala 1/2 dão
          <span class="font-mono text-slate-100">d = log 3 / log 2 ≈ 1,585</span>. A área do limite é zero e o
          perímetro é infinito.
        </p>
      </div>
      <div class="space-y-3">
        <p>
          O mesmo desenho aparece por caminhos muito diferentes: o <span class="text-indigo-300">Jogo do Caos</span>
          (processo aleatório), os <span class="text-indigo-300">coeficientes binomiais ímpares</span> do Triângulo de
          Pascal e o <span class="text-indigo-300">autômato celular da Regra 90</span>. Cada aba deste laboratório
          mostra um desses caminhos.
        </p>
        <p class="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-slate-400">
          A tela mostra aproximações finitas: um número limitado de níveis, pontos ou linhas. O fractal verdadeiro é o
          limite desses processos.
        </p>
      </div>
    </div>
  </section>
</template>
