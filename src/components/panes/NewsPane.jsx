import React from 'react'
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchNews } from '../../lib/news.js'
import { safeHttpUrl } from '../../lib/url.js'
import config from '../../config.js'

export function NewsPane() {
  const { data, loading, error } = usePolling(() => fetchNews(config.rssSources), 15 * 60 * 1000)
  return (
    <Pane title="news" badge="rss" className="sm:col-span-2" loading={loading && !data} error={error && !data}>
      {data && data.map((n, i) => (
        <a key={i} href={safeHttpUrl(n.link, '#')} className="block py-0.5 leading-snug text-gs-text hover:text-gs-violet">
          <span className="text-[9px] text-gs-violet">{n.source}</span> — {n.title}
        </a>
      ))}
    </Pane>
  )
}
