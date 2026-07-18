import { describe, it, expect } from 'vitest'
import { pad2, clockParts, greeting, msUntilMidnight, formatDuration, timeInZone } from './time.js'

const at = (h, m = 0, s = 0) => new Date(2026, 6, 18, h, m, s) // local time

describe('time', () => {
  it('pads', () => expect(pad2(4)).toBe('04'))
  it('splits the clock', () => expect(clockParts(at(21, 47, 32))).toEqual({ hh: '21', mm: '47', ss: '32' }))
  it('greets by hour', () => {
    expect(greeting(at(8))).toBe('good morning')
    expect(greeting(at(14))).toBe('good afternoon')
    expect(greeting(at(21))).toBe('good evening')
  })
  it('counts down to midnight', () => {
    expect(msUntilMidnight(at(23, 0, 0))).toBe(60 * 60 * 1000)
  })
  it('formats a duration', () => expect(formatDuration(5 * 3600e3 + 13 * 60e3)).toBe('5h 13m'))
  it('renders a timezone as HH:MM', () => {
    expect(timeInZone(new Date('2026-07-18T21:47:00Z'), 'UTC')).toBe('21:47')
  })
})
