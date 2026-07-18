import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchCrypto } from './coingecko.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchCrypto', () => {
  it('maps CoinGecko simple price to rows', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        bitcoin:  { usd: 64200, usd_24h_change: 2.1 },
        ethereum: { usd: 3100,  usd_24h_change: -1.4 },
      }),
    })
    const rows = await fetchCrypto(['bitcoin', 'ethereum'])
    expect(rows[0]).toMatchObject({ id: 'bitcoin', label: 'BTC', price: 64200 })
    expect(rows[1].change24h).toBeCloseTo(-1.4)
  })
})
