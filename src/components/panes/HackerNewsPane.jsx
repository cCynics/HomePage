import React from 'react'
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchTopStories } from '../../lib/hackernews.js'

export function HackerNewsPane() {
  const { data, loading, error } = usePolling(() => fetchTopStories(3), 10 * 60 * 1000)
  return (
    <Pane title="hacker news" badge="▲" className="sm:col-span-2" loading={loading && !data} error={error && !data}>
      {data && data.map((s) => (
        <a key={s.id} href={s.url} className="block py-0.5 leading-snug text-gs-text hover:text-gs-violet">
          <span className="text-[9px] text-gs-violet">{s.score} ▲</span> {s.title}
        </a>
      ))}
    </Pane>
  )
}
