import React, { Children } from 'react'

export function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-3 px-5 pb-4 sm:grid-cols-2 lg:grid-cols-4">
      {Children.map(children, (child, i) => (
        <div className="gs-fade-up contents" style={{ animationDelay: `${i * 40}ms` }}>{child}</div>
      ))}
    </div>
  )
}
