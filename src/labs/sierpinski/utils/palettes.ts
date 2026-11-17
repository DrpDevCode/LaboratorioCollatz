export interface Palette {
  id: string
  label: string
  colors: string[]
}

export const PALETTES: Palette[] = [
  { id: 'indigo', label: 'Índigo', colors: ['#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa'] },
  { id: 'fogo', label: 'Fogo', colors: ['#f97316', '#facc15', '#ef4444', '#fb7185', '#fdba74', '#fde047'] },
  { id: 'oceano', label: 'Oceano', colors: ['#22d3ee', '#3b82f6', '#2dd4bf', '#60a5fa', '#a5f3fc', '#0ea5e9'] },
  { id: 'mono', label: 'Monocromático', colors: ['#e2e8f0', '#cbd5e1', '#94a3b8', '#f1f5f9', '#e2e8f0', '#cbd5e1'] },
]

export const pick = (p: Palette, i: number) => p.colors[i % p.colors.length]

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits })
