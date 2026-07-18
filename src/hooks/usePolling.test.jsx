import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePolling } from './usePolling.js'

describe('usePolling', () => {
  it('starts loading, then resolves data', async () => {
    const { result } = renderHook(() => usePolling(async () => 42, 100000))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBe(42)
    expect(result.current.error).toBeNull()
  })
  it('captures a thrown error', async () => {
    const { result } = renderHook(() => usePolling(async () => { throw new Error('boom') }, 100000))
    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.error.message).toBe('boom')
  })
  it('re-fetches on refresh()', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce('a').mockResolvedValueOnce('b')
    const { result } = renderHook(() => usePolling(fetcher, 100000))
    await waitFor(() => expect(result.current.data).toBe('a'))
    await act(async () => { await result.current.refresh() })
    expect(result.current.data).toBe('b')
  })
})
