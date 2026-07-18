import React, { useState, useEffect } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

export function CountUp({ value, durationMs = 800 }) {
  const reduced = useReducedMotion()
  const [n, setN] = useState(reduced ? value : 0)
  useEffect(() => {
    if (reduced) { setN(value); return }
    let raf, start
    const step = (t) => {
      start ??= t
      const p = Math.min(1, (t - start) / durationMs)
      setN(Math.round(p * value))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, durationMs, reduced])
  return <span>{n}</span>
}
