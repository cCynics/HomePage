import React from 'react'
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { pickRef, fetchVerse } from '../../lib/bible.js'
import config from '../../config.js'

export function VersePane() {
  const ref = pickRef(config.bibleRefs, new Date())
  const { data, loading, error } = usePolling(() => fetchVerse(ref, config.bibleTranslation), 24 * 60 * 60 * 1000)
  return (
    <Pane title="verse of the day" badge="✝" loading={loading && !data} error={error && !data}>
      {data && (
        <>
          <p className="text-[11px] italic leading-relaxed text-gs-dim">"{data.text}"</p>
          <p className="mt-2 text-[10px] tracking-wide text-gs-dim">
            <span className="text-gs-violet">✝</span> {data.reference} · {config.bibleTranslation.toUpperCase()}
          </p>
        </>
      )}
    </Pane>
  )
}
