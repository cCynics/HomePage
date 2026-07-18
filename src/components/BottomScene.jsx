import React from 'react'

// Decorative synthwave scene that fills the empty band below the panes.
// aria-hidden + pointer-events-none: purely visual, never interactive.
export function BottomScene() {
  return (
    <div aria-hidden className="pointer-events-none relative flex-1 min-h-[120px] overflow-hidden">
      {/* glowing horizon line */}
      <div className="absolute inset-x-0 bottom-[30%] h-px"
           style={{ background: '#c9a6ff', boxShadow: '0 0 24px 6px rgba(153,102,255,.5)' }} />
      {/* sliced vaporwave sun */}
      <div className="gs-scene-sun absolute bottom-[30%] left-1/2 h-32 w-32 -translate-x-1/2 rounded-full" />
      {/* drifting perspective grid */}
      <div className="gs-scene-grid absolute inset-x-[-50%] bottom-0 h-[70%]" />
    </div>
  )
}
