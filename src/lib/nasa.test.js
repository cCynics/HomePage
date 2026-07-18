import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchApod } from './nasa.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchApod', () => {
  it('returns image url and title for an image', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ media_type: 'image', title: 'Nebula', url: 'http://img/x.jpg' }),
    })
    expect(await fetchApod('KEY')).toEqual({ title: 'Nebula', imageUrl: 'http://img/x.jpg', isVideo: false })
  })
  it('handles a video by using its thumbnail', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ media_type: 'video', title: 'V', url: 'http://y', thumbnail_url: 'http://t.jpg' }),
    })
    expect(await fetchApod('KEY')).toEqual({ title: 'V', imageUrl: 'http://t.jpg', isVideo: true })
  })
})
