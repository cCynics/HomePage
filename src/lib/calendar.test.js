import { describe, it, expect } from 'vitest'
import { monthGrid, isoDate } from './calendar.js'

describe('calendar', () => {
  it('builds the month grid with leading blanks', () => {
    const g = monthGrid(new Date(2026, 6, 18)) // July 2026, 1st is a Wednesday
    expect(g.monthLabel).toBe('july')
    expect(g.todayDate).toBe(18)
    expect(g.days.filter((d) => d === 31).length).toBe(1) // July has 31 days
    expect(g.days.slice(0, 3)).toEqual([null, null, null]) // Sun-Tue blanks before Wed
  })
  it('formats iso date', () => {
    expect(isoDate(new Date(2026, 6, 8))).toBe('2026-07-08')
  })
})
