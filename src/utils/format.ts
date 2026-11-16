const intFmt = new Intl.NumberFormat('pt-BR')

/** Separa milhares de um BigInt (exato, sem converter para Number). */
export function groupDigits(n: bigint | string): string {
  const s = n.toString()
  const neg = s.startsWith('-')
  const digits = neg ? s.slice(1) : s
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return neg ? `-${grouped}` : grouped
}

/** Versão curta para espaços estreitos; o valor completo deve ir no title. */
export function shortBig(n: bigint | string, maxLen = 24): string {
  const s = n.toString()
  const g = groupDigits(s)
  if (g.length <= maxLen) return g
  return `${s[0]},${s.slice(1, 4)} × 10^${s.length - 1}`
}

export function formatInt(n: number): string {
  return intFmt.format(n)
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
