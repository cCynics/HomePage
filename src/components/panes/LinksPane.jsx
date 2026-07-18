import React from 'react'
import { Pane } from '../Pane.jsx'
import config from '../../config.js'

export function LinksPane() {
  return (
    <Pane title="links" badge="↵">
      {config.links.map((l) => (
        <a key={l.alias} href={l.url} className="flex justify-between py-0.5 text-gs-text hover:text-gs-violet">
          <span>{l.label}</span><span className="text-gs-dim">{l.alias}</span>
        </a>
      ))}
    </Pane>
  )
}
