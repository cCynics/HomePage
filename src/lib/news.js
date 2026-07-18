export async function fetchNews(sources) {
  const perSource = await Promise.all(
    sources.map(async (s) => {
      const res = await fetch(`/api/rss?url=${encodeURIComponent(s.url)}`)
      if (!res.ok) return []
      const { items } = await res.json()
      return (items ?? []).map((it) => ({ ...it, source: s.label }))
    }),
  )
  return perSource.flat().slice(0, 3)
}
