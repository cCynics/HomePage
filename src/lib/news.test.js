import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchNews } from './news.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchNews', () => {
  it('merges items across sources, tagging each with its source', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ items: [{ title: 'T', link: 'http://x' }] }),
    })
    const rows = await fetchNews([{ label: 'verge', url: 'http://feed' }])
    expect(rows[0]).toEqual({ title: 'T', link: 'http://x', source: 'verge' })
  })
})
