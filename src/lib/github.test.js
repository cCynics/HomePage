import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchGithub } from './github.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchGithub', () => {
  it('returns the flattened shape from the proxy', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ total: 5, days: [{ count: 1, level: 1 }] }),
    })
    expect(await fetchGithub('cCynics')).toEqual({ total: 5, days: [{ count: 1, level: 1 }] })
  })
  it('throws on proxy error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 502 })
    await expect(fetchGithub('x')).rejects.toThrow()
  })
})
