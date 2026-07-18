import { describe, it, expect } from 'vitest'
import { safeHttpUrl } from './url.js'

describe('safeHttpUrl', () => {
  it('passes through http and https URLs', () => {
    expect(safeHttpUrl('http://x.com/a', 'fb')).toBe('http://x.com/a')
    expect(safeHttpUrl('https://x.com/a', 'fb')).toBe('https://x.com/a')
  })
  it('rejects javascript: URLs to the fallback', () => {
    expect(safeHttpUrl('javascript:alert(1)', 'fb')).toBe('fb')
  })
  it('rejects data: URLs to the fallback', () => {
    expect(safeHttpUrl('data:text/html,<script>', 'fb')).toBe('fb')
  })
  it('falls back on undefined, relative, or garbage input', () => {
    expect(safeHttpUrl(undefined, 'fb')).toBe('fb')
    expect(safeHttpUrl('/relative', 'fb')).toBe('fb')
    expect(safeHttpUrl('not a url', 'fb')).toBe('fb')
  })
})
