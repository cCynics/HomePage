const TICKER = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', dogecoin: 'DOGE' }

export async function fetchCrypto(ids) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}`
    + `&vs_currencies=usd&include_24hr_change=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`crypto ${res.status}`)
  const d = await res.json()
  return ids.map((id) => ({
    id,
    label: TICKER[id] ?? id.slice(0, 4).toUpperCase(),
    price: d[id]?.usd ?? null,
    change24h: d[id]?.usd_24h_change ?? 0,
  }))
}

// price → compact string: 64200 → "64.2k", 0.14 → ".14"
export function fmtPrice(n) {
  if (n == null) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  if (n < 1) return n.toFixed(2).replace(/^0/, '')
  return String(Math.round(n))
}
