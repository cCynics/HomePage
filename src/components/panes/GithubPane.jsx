import React from 'react'
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchGithub, levelClass } from '../../lib/github.js'
import config from '../../config.js'

export function GithubPane() {
  const { data, loading, error } = usePolling(() => fetchGithub(config.githubUsername), 30 * 60 * 1000)
  const days = data ? data.days.slice(-40) : []
  return (
    <Pane title="github activity" badge="◱" className="sm:col-span-2" loading={loading && !data} error={error && !data}>
      {data && (
        <>
          <div className="grid grid-cols-20 gap-0.5" style={{ gridTemplateColumns: 'repeat(20, 1fr)' }}>
            {days.map((d, i) => <span key={i} className={`aspect-square rounded-sm ${levelClass(d.level)}`} />)}
          </div>
          <p className="mt-2 text-[10px] text-gs-dim">{data.total} contributions this year</p>
        </>
      )}
    </Pane>
  )
}
