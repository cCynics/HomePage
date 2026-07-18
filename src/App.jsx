import React from 'react'
import { Background } from './components/Background.jsx'
import { Header } from './components/Header.jsx'
import { StatusBar } from './components/StatusBar.jsx'
import { Grid } from './components/Grid.jsx'
import { useNow } from './hooks/useNow.js'
import { CommandBar } from './components/CommandBar.jsx'
import { LinksPane } from './components/panes/LinksPane.jsx'
import { WeatherPane } from './components/panes/WeatherPane.jsx'
import { CryptoPane } from './components/panes/CryptoPane.jsx'
import { TodoScratchPane } from './components/panes/TodoScratchPane.jsx'
import { NewsPane } from './components/panes/NewsPane.jsx'
import { HackerNewsPane } from './components/panes/HackerNewsPane.jsx'
import { GithubPane } from './components/panes/GithubPane.jsx'
import { NasaPane } from './components/panes/NasaPane.jsx'
import { WorldClocksPane } from './components/panes/WorldClocksPane.jsx'
import { VersePane } from './components/panes/VersePane.jsx'
import { CalendarPane } from './components/panes/CalendarPane.jsx'
import { PomodoroPane } from './components/panes/PomodoroPane.jsx'
import { BottomScene } from './components/BottomScene.jsx'

export default function App() {
  const now = useNow()
  return (
    <div className="flex min-h-screen flex-col">
      <Background />
      <div className="flex flex-1 flex-col">
        <Header now={now} />
        <CommandBar />
        <Grid>
          {/* row 1 — daily glances */}
          <LinksPane /><WeatherPane /><CryptoPane /><TodoScratchPane />
          {/* row 2 — reading */}
          <NewsPane /><HackerNewsPane />
          {/* row 3 — identity + splash */}
          <GithubPane /><NasaPane />
          {/* row 4 — personal */}
          <WorldClocksPane /><VersePane /><CalendarPane /><PomodoroPane />
        </Grid>
        <BottomScene />
      </div>
      <StatusBar now={now} />
    </div>
  )
}
