import React from 'react'
import { Pane } from '../Pane.jsx'
import { useNow } from '../../hooks/useNow.js'
import { timeInZone } from '../../lib/time.js'
import config from '../../config.js'

export function WorldClocksPane() {
  const now = useNow()
  return (
    <Pane title="world clocks" badge="◴">
      {config.worldClocks.map((c) => (
        <div key={c.label} className="flex justify-between py-0.5 text-gs-text">
          <span className="text-gs-dim"><span>{c.label}</span> {c.flag}</span>
          <span>{timeInZone(now, c.tz)}</span>
        </div>
      ))}
    </Pane>
  )
}
