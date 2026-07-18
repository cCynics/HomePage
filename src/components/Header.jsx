import React from 'react'
import config from '../config.js'
import { clockParts, greeting, msUntilMidnight, formatDuration } from '../lib/time.js'

const BANNER = String.raw`
       _                _            _          _ _
  __ _| |__   ___  ___ | |_    ___  | |__   ___| | |
 / _' | '_ \ / _ \/ __|| __|  / __| | '_ \ / _ \ | |
| (_| | | | | (_) \__ \| |_   \__ \ | | | |  __/ | |
 \__, |_| |_|\___/|___/ \__|  |___/ |_| |_|\___|_|_|
 |___/
`

export function Header({ now }) {
  const { hh, mm, ss, period } = clockParts(now, config.hour12)
  return (
    <header className="px-5 pt-4">
      <div className="flex items-start justify-between">
        <pre aria-label={config.bannerText}
             className="m-0 text-[9px] leading-tight text-gs-violet"
             style={{ textShadow: '0 0 12px rgba(153,102,255,.5)' }}>{BANNER}</pre>
        <div className="text-right text-[10px] leading-relaxed text-gs-dim">
          <div>host <span className="text-gs-text">{config.bannerText}</span></div>
          <div>{config.location.label}</div>
          <div className="text-gs-violet">◉ all systems go</div>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-4">
        <div className="text-3xl font-semibold tracking-wide text-gs-text"
             style={{ textShadow: '0 0 14px rgba(153,102,255,.5)' }}>
          <span>{hh}</span>:<span>{mm}</span><span className="text-base text-gs-dim">:{ss}</span>
          {config.hour12 && <span className="ml-1 text-sm text-gs-dim">{period}</span>}
        </div>
        <div className="text-xs text-gs-dim">
          {greeting(now)}, <span className="text-gs-violet">{config.name}</span> — {formatDuration(msUntilMidnight(now))} until midnight
        </div>
      </div>
    </header>
  )
}
