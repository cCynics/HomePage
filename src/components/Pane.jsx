import React from 'react'

export function Pane({ title, badge, live = false, loading = false, error = null, className = '', children }) {
  return (
    <section className={`gs-glow-border ${live ? 'gs-pulse' : ''} rounded-lg bg-gs-panel/50 p-3 ${className}`}>
      <header className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-widest text-gs-dim">
        <span>{title}</span>
        {badge != null && <span className="text-gs-violet">{badge}</span>}
      </header>
      {loading ? (
        <div data-testid="pane-skeleton" className="space-y-2">
          <div className="h-3 w-2/3 rounded bg-gs-hover/60" />
          <div className="h-3 w-1/2 rounded bg-gs-hover/40" />
        </div>
      ) : error ? (
        <p className="text-xs text-gs-dim">— unavailable —</p>
      ) : (
        children
      )}
    </section>
  )
}
