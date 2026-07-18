import { safeHttpUrl } from './url.js'

const BASE = 'https://hacker-news.firebaseio.com/v0'

export async function fetchTopStories(n = 3) {
  const res = await fetch(`${BASE}/topstories.json`)
  if (!res.ok) throw new Error(`hn ${res.status}`)
  const ids = await res.json()
  const items = await Promise.all(
    ids.slice(0, n).map(async (id) => {
      const r = await fetch(`${BASE}/item/${id}.json`)
      if (!r.ok) throw new Error(`hn item ${r.status}`)
      const it = await r.json()
      const permalink = `https://news.ycombinator.com/item?id=${it.id}`
      return { id: it.id, title: it.title, score: it.score, url: safeHttpUrl(it.url, permalink) }
    }),
  )
  return items
}
