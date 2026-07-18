import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage.js'

beforeEach(() => localStorage.clear())

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'init'))
    expect(result.current[0]).toBe('init')
  })
  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0))
    act(() => result.current[1](5))
    expect(result.current[0]).toBe(5)
    expect(JSON.parse(localStorage.getItem('k'))).toBe(5)
  })
  it('reads an existing stored value', () => {
    localStorage.setItem('k', JSON.stringify('stored'))
    const { result } = renderHook(() => useLocalStorage('k', 'init'))
    expect(result.current[0]).toBe('stored')
  })
  it('supports functional updates and persists them', () => {
    const { result } = renderHook(() => useLocalStorage('k', 1))
    act(() => result.current[1]((prev) => prev + 1))
    expect(result.current[0]).toBe(2)
    expect(JSON.parse(localStorage.getItem('k'))).toBe(2)
  })
})
