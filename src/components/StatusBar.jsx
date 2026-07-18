import React from 'react'
import { clockParts } from '../lib/time.js'

export function StatusBar({ now, weatherText = '' }) {
  const { hh, mm, ss } = clockParts(now)
  return (
    <footer className="flex items-center text-[10px] font-semibold text-gs-bg">
      <span className="bg-gs-violet px-3 py-1">NORMAL</span>
      <span className="flex-1 bg-gs-panel px-3 py-1 font-normal text-gs-dim">
        ~/homepage · main ✱ · {hh}:{mm}:{ss}{weatherText && ` · ${weatherText}`}
      </span>
      <span className="bg-gs-violet/80 px-3 py-1 text-white">ghost-shell</span>
    </footer>
  )
}
