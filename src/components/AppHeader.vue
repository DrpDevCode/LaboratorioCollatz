<template>
  <header class="relative overflow-hidden border-b border-slate-800 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18),transparent_60%)]">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <p class="font-mono text-xs uppercase tracking-[0.3em] text-indigo-300/80">laboratório matemático</p>
      <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
        Conjectura de Collatz <span class="font-mono text-indigo-300">3n + 1</span>
      </h1>
      <p class="mt-3 max-w-2xl text-slate-400">
        Escolha um inteiro positivo. Se for par, divida por 2; se for ímpar, multiplique por 3 e some 1. Repita.
        A conjectura afirma que toda sequência chega a 1, mas isso nunca foi demonstrado.
      </p>
      <div class="mt-4 flex flex-wrap gap-2 font-mono text-sm">
        <span class="tag bg-sky-500/15 text-sky-300">par → n ÷ 2</span>
        <span class="tag bg-amber-500/15 text-amber-300">ímpar → 3n + 1</span>
        <span class="tag bg-emerald-500/15 text-emerald-300">fim → 1</span>
      </div>
    </div>
  </header>
</template>
