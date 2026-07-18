import React from 'react'
import { useState, useEffect } from 'react'
import { Pane } from '../Pane.jsx'
import { formatMMSS } from '../../lib/pomodoro.js'

const FOCUS = 25 * 60

export function PomodoroPane() {
  const [seconds, setSeconds] = useState(FOCUS)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => (s <= 1 ? (setRunning(false), 0) : s - 1)), 1000)
    return () => clearInterval(id)
  }, [running])

  return (
    <Pane title="pomodoro" badge="◔">
      <div className="text-2xl text-gs-text" style={{ textShadow: '0 0 12px rgba(153,102,255,.4)' }}>
        {formatMMSS(seconds)}
      </div>
      <div className="mt-2 flex gap-2 text-[10px]">
        <button onClick={() => setRunning((r) => !r)} className="text-gs-violet hover:underline">
          {running ? '❚❚ pause' : '▶ start'}
        </button>
        <button onClick={() => { setRunning(false); setSeconds(FOCUS) }} className="text-gs-dim hover:underline">
          ↺ reset
        </button>
      </div>
    </Pane>
  )
}
