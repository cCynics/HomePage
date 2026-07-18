import React from 'react'

export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute left-1/2 top-0 h-56 w-[520px] -translate-x-1/2 blur-2xl"
           style={{ background: 'radial-gradient(closest-side, rgba(153,102,255,.28), rgba(96,208,255,.08), transparent)' }} />
    </div>
  )
}
