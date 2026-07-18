import React from 'react'
import { Background } from './components/Background.jsx'
import { Header } from './components/Header.jsx'
import { StatusBar } from './components/StatusBar.jsx'
import { Grid } from './components/Grid.jsx'
import { useNow } from './hooks/useNow.js'

export default function App() {
  const now = useNow()
  return (
    <div className="flex min-h-screen flex-col">
      <Background />
      <div className="flex-1">
        <Header now={now} />
        {/* CommandBar mounts here in Task 11 */}
        <Grid>{/* panes mount here in Task 25 */}</Grid>
      </div>
      <StatusBar now={now} />
    </div>
  )
}
