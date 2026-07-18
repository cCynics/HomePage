import React from 'react'
import { Pane } from '../Pane.jsx'
import { monthGrid, isoDate } from '../../lib/calendar.js'
import config from '../../config.js'

const DOW = ['s', 'm', 't', 'w', 't', 'f', 's']

export function CalendarPane() {
  const today = new Date()
  const { monthLabel, days, todayDate } = monthGrid(today)
  const events = config.agenda[isoDate(today)] ?? []
  return (
    <Pane title={monthLabel} badge="▦">
      <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] text-gs-dim">
        {DOW.map((d, i) => <span key={i} className="text-gs-dim/60">{d}</span>)}
        {days.map((d, i) => (
          <span key={i} className={d === todayDate ? 'rounded bg-gs-violet/30 text-gs-text' : ''}>{d ?? ''}</span>
        ))}
      </div>
      {events.length > 0 && (
        <div className="mt-2 text-[10px] text-gs-dim">
          {events.map((e, i) => <div key={i}>▸ {e}</div>)}
        </div>
      )}
    </Pane>
  )
}
