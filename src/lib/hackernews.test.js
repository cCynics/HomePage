import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchTopStories } from './hackernews.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchTopStories', () => {
  it('fetches ids then item details', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('topstories')) return Promise.resolve({ ok: true, json: async () => [10, 20, 30, 40] })
      const id = Number(url.match(/item\/(\d+)/)[1])
      return Promise.resolve({ ok: true, json: async () => ({ id, title: `story ${id}`, score: id, url: `http://x/${id}` }) })
    })
    const rows = await fetchTopStories(2)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ id: 10, title: 'story 10', score: 10 })
  })
  it('sanitizes a javascript: story url to the HN permalink', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('topstories')) return Promise.resolve({ ok: true, json: async () => [77] })
      return Promise.resolve({ ok: true, json: async () => ({ id: 77, title: 'x', score: 1, url: 'javascript:alert(1)' }) })
    })
    const rows = await fetchTopStories(1)
    expect(rows[0].url).toBe('https://news.ycombinator.com/item?id=77')
  })
})
