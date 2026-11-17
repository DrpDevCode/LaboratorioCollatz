import { ref } from 'vue'
import { addEntry, entryFromResult, loadHistory, saveHistory, type KeyValueStore } from '../services/history'
import type { CollatzResult, HistoryEntry } from '../types/collatz'

function safeStorage(): KeyValueStore | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

export function useHistory() {
  const store = safeStorage()
  const entries = ref<HistoryEntry[]>(loadHistory(store))
  const persist = () => saveHistory(store, entries.value)

  function record(r: CollatzResult) {
    entries.value = addEntry(entries.value, entryFromResult(r))
    persist()
  }

  function remove(id: string) {
    entries.value = entries.value.filter((e) => e.id !== id)
    persist()
  }

  function clearAll() {
    entries.value = []
    persist()
  }

  return { entries, record, remove, clearAll }
}
