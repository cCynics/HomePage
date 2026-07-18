import { describe, it, expect } from 'vitest'
import { formatMMSS } from './pomodoro.js'

describe('formatMMSS', () => {
  it('formats seconds as MM:SS', () => {
    expect(formatMMSS(1453)).toBe('24:13')
    expect(formatMMSS(0)).toBe('00:00')
  })
})
