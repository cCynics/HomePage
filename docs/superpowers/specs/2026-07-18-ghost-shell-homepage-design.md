# ghost-shell — personal homepage design

**Date:** 2026-07-18
**Status:** Approved (design locked)
**Branch:** `react-rebuild`

## Overview

A personal homepage / new-tab dashboard with a terminal "command deck" aesthetic —
dark, monospace, violet-accented, keyboard-driven. It blends a **launchpad** (a
command bar + quick links) with a **glanceable dashboard** (weather, markets,
feeds, etc.), and leans into a distinctive look ("ghost-shell") rather than a
generic new-tab page.

This is a from-scratch rebuild. The old vanilla `script.js`/`styles.css` homepage
is discarded; the React + Vite + Tailwind scaffold on `react-rebuild` is the base.

### Goals
- A page that feels effortless to use daily *and* looks intentional, not templated.
- Command bar is the hero: everything reachable by keystroke.
- 12 panes, all backed by **real data** — no fake filler.
- Every pane works on first load (no stubs).

### Non-goals (explicitly cut)
- ISS location, moon & sun, on-this-day, stocks, now-playing — cut as novelty/low
  daily value or infeasible.
- Real system meters (cpu/mem/disk) — impossible in a browser; never included.
- Google Calendar sync, theme switcher, boot-sequence animation — possible future
  additions, out of scope for v1.

## Aesthetic direction

- **Palette:** near-black background (`#08080e`), violet accent (`#a06cff` /
  lighter `#c9a6ff`), muted grey body text, green/red for market up/down.
- **Type:** monospace throughout (JetBrains Mono or similar), uppercase micro-labels
  for pane headers.
- **Chrome:** a "traffic-light" top bar, a **cleanly-generated** ASCII figlet
  banner reading `ghost-shell` (configurable), a big live clock + greeting +
  countdown-to-midnight, and a tmux/vim-style **status bar** pinned at the bottom.
- **Flair (locked):**
  - **Horizon glow** — a soft violet/cyan radial glow behind the header. (The
    earlier synthwave *grid* was cut — invisible under the panes.)
  - **Neon bloom** — glowing pane borders + light shadow; *live* panes (weather,
    crypto) softly pulse to signal fresh data.
  - **Load-in freebies** — typewriter greeting, staggered pane fade-in on load,
    count-up animation on numbers, glowing focus ring on the command bar.
- **Accessibility:** body text stays solid (not glassy) for contrast; respect
  `prefers-reduced-motion` (disable pulse/typewriter/fade for those users).

## Tech approach

- **Stack:** React 19 + Vite 8 + Tailwind CSS 4 (already scaffolded). oxlint for
  linting. Deploy target: **Vercel**.
- **Serverless proxy (required):** some data can't be fetched directly from the
  browser. Vercel Functions (`/api/*`) handle:
  - **News (RSS)** — feeds are XML without CORS headers; the function fetches +
    parses to JSON.
  - **GitHub activity** — needs a token; kept server-side in an env var so it's
    never exposed client-side. Function returns the contribution counts.
  - Everything else is fetched **directly** from the browser (all CORS-friendly).
- **Local dev:** `vercel dev` (or Vite proxy) so `/api/*` works alongside the
  Vite dev server.

## Architecture (components & data)

Design principle: each pane is a **self-contained component** with one job,
consuming a data hook, wrapped in a shared `Pane` frame. Panes don't know about
each other. Config drives content so personalizing the page never touches
component internals.

### Layout
```
<App>
  <Background/>            // horizon glow
  <Header/>               // ascii banner + host readout + clock/greeting/countdown
  <CommandBar/>           // the hero input
  <Grid>                  // 4-column responsive grid, 4 grouped rows
    ...12 <Pane> children
  </Grid>
  <StatusBar/>            // bottom tmux-style strip
```

**Grid grouping (top → bottom):**
- **Row 1 — daily glances:** Links · Weather · Crypto · Todo&Scratch
- **Row 2 — reading:** News (span 2) · Hacker News (span 2)
- **Row 3 — identity + splash:** GitHub activity (span 2) · NASA photo (span 2, focal)
- **Row 4 — personal:** World Clocks · Verse · Calendar · Pomodoro

Responsive: collapses to 2 columns, then 1, on narrow viewports.

### Shared pieces
- `Pane` — consistent frame: header label, glow, **loading skeleton**, and a
  graceful **error/unavailable** state (a pane whose API fails shows a quiet
  "unavailable", never a blank or a crash).
- `useLocalStorage(key, default)` — persistence primitive.
- `usePolling(fetcher, intervalMs)` — generic `{data, loading, error}` with a
  refresh interval; per-source hooks build on it.
- `config.js` — single user-config file (see below).

### Panes, data sources & refresh cadence

| Pane | Source | Auth | Fetch | Refresh |
|------|--------|------|-------|---------|
| Links | `config.js` | — | static | — |
| Weather | Open-Meteo | none | direct | ~15 min |
| Crypto | CoinGecko (free) | none | direct | ~60 s |
| Todo & Scratch | localStorage | — | local | on edit |
| News | RSS via `/api/rss` | — | proxy | ~15 min |
| Hacker News | HN Firebase API | none | direct | ~10 min |
| GitHub activity | GitHub via `/api/github` | token (server) | proxy | ~30 min |
| NASA photo | NASA APOD | free key | direct | 1×/day |
| World Clocks | `Intl` timeZones | — | client | 1 s |
| Verse of the day | bible-api.com | none | direct | 1×/day |
| Calendar | `Date` + config agenda | — | client | — |
| Pomodoro | client timer | — | client | tick |

Clock / greeting / countdown / status bar are pure client-side (1 s tick).

### Config (`src/config.js`)
User-editable without touching components:
- `bannerText` (default `"ghost-shell"`)
- `name` (for the greeting)
- `location` `{ lat: 47.6062, lon: -122.3321, label: "Seattle, WA" }` — hardcoded
  for weather (no browser geolocation)
- `links` — `[{ label, url, alias }]`
- `worldClocks` — `[{ label, tz, flag }]` (defaults incl. Tallinn 🇪🇪, Sydney 🇦🇺)
- `cryptoCoins` — `["bitcoin","ethereum","solana","dogecoin"]`
- `rssSources` — `[{ label, url }]`
- `githubUsername`
- `bibleTranslation` (default `kjv`)

### Command bar behavior
- Type to search; **aliases** resolve first (`gh` → GitHub, `yt` → YouTube).
- **Bang searches** DuckDuckGo-style: `yt lofi` → YouTube search, `g rust async`
  → Google, plain text → default search engine.
- `?` opens a help overlay listing aliases & bangs.
- Keyboard: `/` focuses the bar; `Esc` blurs; `Enter` executes.

## Secrets / env
- `GITHUB_TOKEN` — server-side only (Vercel env var), for the GitHub proxy.
- `NASA_API_KEY` — free key (`DEMO_KEY` works for light use).
- No other keys needed.

## Testing
- Unit: alias/bang resolution, config parsing, `usePolling` (loading/error/data
  transitions), localStorage hook.
- Pane behavior: each pane renders loading → data → error states from mocked
  fetchers.
- Manual: verify each live source returns real data; verify reduced-motion path.

## Resolved decisions
- **Banner text:** `ghost-shell` (kept as-is; the earlier illegible banner was
  just a hand-typed mock — real build generates a clean figlet).
- **Weather location:** hardcoded to Seattle, WA (`47.6062, -122.3321`). No
  browser geolocation.
