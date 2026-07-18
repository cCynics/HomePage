import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion.js'

describe('useReducedMotion', () => {
  it('reads the media query', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }))
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })
})
