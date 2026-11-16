import type { CollatzResult, HistoryEntry } from '../types/collatz'

export const HISTORY_KEY = 'collatz-lab:history:v1'
export const HISTORY_MAX = 30

/** Armazenamento mínimo, injetável para testes. */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

function isEntry(x: unknown): x is HistoryEntry {
  const e = x as HistoryEntry
  return !!e && typeof e.id === 'string' && typeof e.start === 'string' && /^\d+$/.test(e.start)
    && typeof e.limit === 'number' && typeof e.steps === 'number' && typeof e.max === 'string'
}

export function loadHistory(store: KeyValueStore | undefined): HistoryEntry[] {
  try {
    const raw = store?.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isEntry) : []
  } catch {
    return []
  }
}

export function saveHistory(store: KeyValueStore | undefined, entries: HistoryEntry[]): void {
  try {
    store?.setItem(HISTORY_KEY, JSON.stringify(entries))
  } catch {
    // Armazenamento indisponível ou cheio: o histórico segue só em memória.
  }
}

/**
 * Guarda apenas o resumo (a sequência é recalculada ao reabrir), evitando
 * estourar o limite do LocalStorage com sequências longas.
 */
export function entryFromResult(r: CollatzResult): HistoryEntry {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    start: r.stats.start.toString(),
    limit: r.limit,
    steps: r.stats.steps,
    max: r.stats.max.toString(),
    status: r.status,
    createdAt: Date.now(),
  }
}

/** Insere no topo, removendo duplicatas do mesmo número e limite. */
export function addEntry(entries: HistoryEntry[], entry: HistoryEntry): HistoryEntry[] {
  const rest = entries.filter((e) => !(e.start === entry.start && e.limit === entry.limit))
  return [entry, ...rest].slice(0, HISTORY_MAX)
}
