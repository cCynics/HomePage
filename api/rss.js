import { XMLParser } from 'fast-xml-parser'
import config from '../src/config.js'

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

// SSRF guard: only the feeds the app actually configures may be fetched.
// Exact-URL allowlist (not hostname) — immune to DNS-rebinding.
const ALLOWED = new Set(config.rssSources.map((s) => s.url))

const TIMEOUT_MS = 5000
const MAX_BYTES = 1_000_000 // 1 MB cap on the upstream body (DoS guard)

export function parseRss(xml) {
  const doc = parser.parse(xml)
  const channelItems = doc?.rss?.channel?.item
  const atomEntries = doc?.feed?.entry
  const raw = channelItems ?? atomEntries ?? []
  const list = Array.isArray(raw) ? raw : [raw]
  return list.map((it) => {
    const title = typeof it.title === 'object' ? it.title['#text'] : it.title
    let link = it.link
    // Atom entries often have multiple <link> elements — check array FIRST,
    // then the single-object href, before falling back to a plain string.
    if (Array.isArray(link)) link = link[0]?.['@_href'] ?? link[0]?.['#text'] ?? link[0]
    else if (typeof link === 'object' && link !== null) link = link['@_href'] ?? link['#text']
    return { title: String(title ?? '').trim(), link: String(link ?? '').trim() }
  })
}

export default async function handler(req, res) {
  const url = req.query?.url
  if (!url) { res.status(400).json({ error: 'missing url' }); return }
  if (!ALLOWED.has(url)) { res.status(400).json({ error: 'url not allowed' }); return }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const upstream = await fetch(url, {
      headers: { 'user-agent': 'ghost-shell/1.0' },
      signal: controller.signal,
    })
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`)
    const buf = await upstream.arrayBuffer()
    if (buf.byteLength > MAX_BYTES) throw new Error('too large')
    const xml = new TextDecoder().decode(buf)
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate')
    res.status(200).json({ items: parseRss(xml).slice(0, 5) })
  } catch {
    // Generic message — never echo upstream error text (info disclosure).
    res.status(502).json({ error: 'failed to fetch feed' })
  } finally {
    clearTimeout(timer)
  }
}
