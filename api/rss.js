import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

export function parseRss(xml) {
  const doc = parser.parse(xml)
  const channelItems = doc?.rss?.channel?.item
  const atomEntries = doc?.feed?.entry
  const raw = channelItems ?? atomEntries ?? []
  const list = Array.isArray(raw) ? raw : [raw]
  return list.map((it) => {
    const title = typeof it.title === 'object' ? it.title['#text'] : it.title
    let link = it.link
    if (typeof link === 'object') link = link['@_href'] ?? link['#text']
    if (Array.isArray(link)) link = link[0]?.['@_href'] ?? link[0]
    return { title: String(title ?? '').trim(), link: String(link ?? '').trim() }
  })
}

export default async function handler(req, res) {
  const url = req.query?.url
  if (!url) { res.status(400).json({ error: 'missing url' }); return }
  try {
    const upstream = await fetch(url, { headers: { 'user-agent': 'ghost-shell/1.0' } })
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`)
    const xml = await upstream.text()
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate')
    res.status(200).json({ items: parseRss(xml).slice(0, 5) })
  } catch (err) {
    res.status(502).json({ error: String(err.message ?? err) })
  }
}
