import React from 'react'
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchApod } from '../../lib/nasa.js'

const KEY = import.meta.env.VITE_NASA_KEY || 'DEMO_KEY'

export function NasaPane() {
  const { data, loading, error } = usePolling(() => fetchApod(KEY), 24 * 60 * 60 * 1000)
  return (
    <Pane title="nasa · photo of the day" badge="✦" className="sm:col-span-2" loading={loading && !data} error={error && !data}>
      {data && (
        <figure className="m-0">
          {data.imageUrl
            ? <img src={data.imageUrl} alt={data.title} className="h-36 w-full rounded-md object-cover" />
            : <div className="flex h-36 items-center justify-center rounded-md bg-gs-hover text-gs-dim">video</div>}
          <figcaption className="mt-1 text-[10px] text-gs-dim">{data.title}</figcaption>
        </figure>
      )}
    </Pane>
  )
}
