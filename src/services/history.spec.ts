import { describe, it, expect } from 'vitest'
import { addEntry, entryFromResult, HISTORY_KEY, HISTORY_MAX, loadHistory, saveHistory, type KeyValueStore } from './history'
import { collatzSync } from './collatz'

function memoryStore(): KeyValueStore & { data: Map<string, string> } {
  const data = new Map<string, string>()
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) }
}

describe('histórico', () => {
  it('salva e recarrega entradas', () => {
    const store = memoryStore()
    const e = entryFromResult(collatzSync(27n))
    saveHistory(store, [e])
    expect(loadHistory(store)).toEqual([e])
    expect(e).toMatchObject({ start: '27', steps: 111, max: '9232', status: 'converged' })
  })

  it('ignora dados corrompidos', () => {
    const store = memoryStore()
    store.setItem(HISTORY_KEY, '{nao é json')
    expect(loadHistory(store)).toEqual([])
    store.setItem(HISTORY_KEY, JSON.stringify([{ id: 1 }, { foo: 'bar' }]))
    expect(loadHistory(store)).toEqual([])
  })

  it('remove duplicatas e respeita o tamanho máximo', () => {
    let list = [] as ReturnType<typeof entryFromResult>[]
    for (let i = 1; i <= HISTORY_MAX + 5; i++) list = addEntry(list, entryFromResult(collatzSync(BigInt(i))))
    expect(list).toHaveLength(HISTORY_MAX)
    list = addEntry(list, entryFromResult(collatzSync(BigInt(HISTORY_MAX + 5))))
    expect(list.filter((e) => e.start === String(HISTORY_MAX + 5))).toHaveLength(1)
  })

  it('funciona sem armazenamento disponível', () => {
    expect(loadHistory(undefined)).toEqual([])
    expect(() => saveHistory(undefined, [])).not.toThrow()
  })
})
