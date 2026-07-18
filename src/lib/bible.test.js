import { describe, it, expect, vi, afterEach } from 'vitest'
import { dayOfYear, pickRef, fetchVerse } from './bible.js'

afterEach(() => vi.restoreAllMocks())

describe('bible', () => {
  it('computes day of year', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(0)
    expect(dayOfYear(new Date(2026, 0, 11))).toBe(10)
  })
  it('picks a ref deterministically by day', () => {
    const refs = ['a', 'b', 'c']
    expect(pickRef(refs, new Date(2026, 0, 1))).toBe('a') // day 0 → index 0
    expect(pickRef(refs, new Date(2026, 0, 4))).toBe('a') // day 3 → 3 % 3 = 0
  })
  it('fetches and flattens verse text', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ reference: 'John 3:16', text: 'For God so loved…\n' }),
    })
    expect(await fetchVerse('John 3:16', 'kjv')).toEqual({ text: 'For God so loved…', reference: 'John 3:16' })
  })
})
