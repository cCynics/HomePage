import React, { useState, useRef, useEffect } from 'react'
import config from '../config.js'
import { resolveCommand } from '../lib/commands.js'

export function CommandBar({ onNavigate = (url) => window.location.assign(url) }) {
  const [value, setValue] = useState('')
  const [help, setHelp] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault(); inputRef.current?.focus()
      }
      if (e.key === 'Escape') { setHelp(false); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onChange = (e) => {
    const v = e.target.value
    setHelp(v === '?')
    setValue(v)
  }

  const onKeyDown = (e) => {
    if (e.key !== 'Enter') return
    const result = resolveCommand(value, config)
    if (result) { onNavigate(result.url); setValue('') }
  }

  return (
    <div className="relative px-5 pb-4 pt-2">
      <div className="gs-glow-border flex items-center gap-2 rounded-lg bg-gs-panel/50 px-4 py-3">
        <span className="font-bold text-gs-violet" style={{ textShadow: '0 0 8px #9966ff' }}>❯</span>
        <input
          ref={inputRef}
          role="textbox"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="command, search, or alias… try 'yt lofi', 'gh'  ·  '?' for help"
          className="w-full bg-transparent text-gs-text placeholder:text-gs-dim/70 focus:outline-none"
          autoFocus
        />
        <span className="gs-blink ml-1 inline-block h-4 w-[7px] bg-gs-violet" aria-hidden />
      </div>
      {help && (
        <div className="gs-glow-border absolute left-5 right-5 z-10 mt-2 rounded-lg bg-gs-panel p-4 text-xs">
          <p className="mb-2 uppercase tracking-widest text-gs-dim">aliases</p>
          <div className="mb-3 grid grid-cols-2 gap-1">
            {config.links.map((l) => (
              <div key={l.alias}><span className="text-gs-violet">{l.alias}</span> → {l.label}</div>
            ))}
          </div>
          <p className="mb-2 uppercase tracking-widest text-gs-dim">bangs (prefix + query)</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.keys(config.bangs).map((b) => (
              <div key={b}><span className="text-gs-violet">{b}</span> … → search</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
