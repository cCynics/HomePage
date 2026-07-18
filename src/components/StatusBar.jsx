import React from 'react'
import { clockParts } from '../lib/time.js'
import config from '../config.js'

export function StatusBar({ now, weatherText = '' }) {
  const { hh, mm, ss, period } = clockParts(now, config.hour12)
  return (
    <footer className="flex items-center text-[10px] font-semibold text-gs-bg">
      <span className="bg-gs-violet px-3 py-1">NORMAL</span>
      <span className="flex-1 bg-gs-panel px-3 py-1 font-normal text-gs-dim">
        ~/homepage · main ✱ · {hh}:{mm}:{ss}{config.hour12 ? ` ${period}` : ''}{weatherText && ` · ${weatherText}`}
      </span>
      <span className="bg-gs-violet/80 px-3 py-1 text-white">ghost-shell</span>
    </footer>
  )
}
