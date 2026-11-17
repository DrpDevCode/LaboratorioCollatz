import { describe, it, expect } from 'vitest'
import { parseHash, toHash } from './useHashRoute'

describe('parseHash', () => {
  it('menu inicial', () => {
    expect(parseHash('')).toEqual({ lab: '', tab: '' })
    expect(parseHash('#/')).toEqual({ lab: '', tab: '' })
  })
  it('laboratório e aba', () => {
    expect(parseHash('#/sierpinski/chaos')).toEqual({ lab: 'sierpinski', tab: 'chaos' })
    expect(parseHash('#/collatz')).toEqual({ lab: 'collatz', tab: '' })
  })
  it('links antigos do Collatz (#aba) continuam funcionando', () => {
    expect(parseHash('#explore')).toEqual({ lab: 'collatz', tab: 'explore' })
  })
  it('ida e volta', () => {
    for (const h of ['#/', '#/collatz', '#/sierpinski/pascal']) expect(toHash(parseHash(h))).toBe(h)
  })
})
