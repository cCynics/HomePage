# ghost-shell Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a terminal-style personal homepage — a hero command bar over 12 real-data panes — in React, deployed to Vercel.

**Architecture:** A single-page React app. A `config.js` file drives all personalization. Each pane is a self-contained component consuming a data hook (`usePolling`) and wrapped in a shared `Pane` frame that handles loading/error UI. Ten panes fetch CORS-friendly APIs directly from the browser; two panes (News/RSS, GitHub) fetch through tiny Vercel serverless functions in `/api`. Presentation uses the existing Tailwind 4 `gs-*` theme tokens.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 4 (CSS-first `@theme`), Vitest + React Testing Library, Vercel (static + serverless functions), oxlint.

## Global Constraints

- **React 19** function components + hooks only. No class components.
- **Tailwind 4 CSS-first** theming — colors live in `src/index.css` `@theme`, exposed as `gs-*` utilities. Do NOT add a `tailwind.config.js`.
- **Existing theme tokens** (already in `src/index.css`, use verbatim): `gs-bg #080808`, `gs-panel #0e0e18`, `gs-border #1a1a30`, `gs-hover #1e1e38`, `gs-violet #9966ff`, `gs-rose #ff5090`, `gs-cyan #60d0ff`, `gs-text #d0e0f0`, `gs-dim #6a6a88`. Font: `--font-mono` (JetBrains Mono).
- **No fake data.** Every pane shows real data or an honest "unavailable" state — never placeholder values to fill space.
- **Weather location is hardcoded:** Seattle, WA — `lat 47.6062, lon -122.3321`.
- **Banner text:** `ghost-shell` (cleanly generated figlet, stored as a static string).
- **Secrets stay server-side.** `GITHUB_TOKEN` is only ever read inside `/api/*`. Client-exposed keys use the `VITE_` prefix (`VITE_NASA_KEY`, default `DEMO_KEY`).
- **Respect `prefers-reduced-motion`:** all animations (pulse, typewriter, fade-in, count-up) must no-op for users who request reduced motion.
- **TDD, DRY, YAGNI, frequent commits.** Commit after every green task.

---

## File Structure

```
api/
  rss.js                 # Vercel fn: fetch+parse an RSS feed → JSON
  github.js              # Vercel fn: GitHub contributions via token
src/
  config.js             # all user personalization
  main.jsx              # (exists) entry
  index.css             # (exists) theme tokens + global keyframes
  App.jsx               # (exists→rewrite) composes the page
  lib/
    time.js             # clock/greeting/countdown/timezone helpers
    commands.js         # command-bar resolution logic
  hooks/
    useLocalStorage.js
    usePolling.js
    useReducedMotion.js
  components/
    Background.jsx      # horizon glow
    Header.jsx          # banner + host readout + clock/greeting
    CommandBar.jsx      # hero input + help overlay
    StatusBar.jsx       # bottom tmux-style strip
    Grid.jsx            # responsive 4-col grid
    Pane.jsx            # shared pane frame (loading/error/glow/pulse)
    CountUp.jsx         # count-up number animation
    panes/
      LinksPane.jsx
      WeatherPane.jsx
      CryptoPane.jsx
      TodoScratchPane.jsx
      NewsPane.jsx
      HackerNewsPane.jsx
      GithubPane.jsx
      NasaPane.jsx
      WorldClocksPane.jsx
      VersePane.jsx
      CalendarPane.jsx
      PomodoroPane.jsx
```

Test files live beside their subject as `*.test.js`/`*.test.jsx`.

---

## Task 1: Test tooling + Vercel base config

**Files:**
- Modify: `package.json` (add dev deps + `test` script)
- Create: `vitest.config.js`
- Create: `src/test/setup.js`
- Modify: `vite.config.js:9` (base `'./'` → `'/'`)
- Test: `src/test/smoke.test.js`

**Interfaces:**
- Produces: a working `npm test` (Vitest, jsdom env, jest-dom matchers).

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm install -D vitest@^2 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Change Vite base to root (Vercel serves at `/`)**

In `vite.config.js`, replace the `base: './'` line and its GitHub-Pages comment:
```js
  // Served from the domain root on Vercel.
  base: '/',
```

- [ ] **Step 3: Add the test script to `package.json`**

In the `"scripts"` block add:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 4: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
```

- [ ] **Step 5: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Write a smoke test at `src/test/smoke.test.js`**

```js
import { describe, it, expect } from 'vitest'

describe('test tooling', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 7: Run tests, expect PASS**

Run: `npm test`
Expected: 1 passing test.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.js vitest.config.js src/test
git commit -m "test: add vitest + RTL tooling, set Vite base to root"
```

---

## Task 2: Theme tokens + global animation CSS

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: extra `gs-*` color tokens (`gs-up`, `gs-down`, `gs-glow`) and reusable keyframes/utility classes: `.gs-glow-border`, `.gs-pulse`, `.gs-fade-up`, `.gs-blink`, and a `prefers-reduced-motion` guard.

- [ ] **Step 1: Add tokens + keyframes to `src/index.css`**

Append below the existing `@theme` block's closing brace and body styles:
```css
/* extra semantic tokens */
@theme {
  --color-gs-up:   #4dffa0;  /* market up / positive */
  --color-gs-down: #ff5090;  /* market down (reuse rose hue) */
  --color-gs-glow: #9966ff;  /* neon bloom source */
}

/* ─── flair: glow, pulse, fade-in, blink ─────────────────────────── */
.gs-glow-border {
  border: 1px solid color-mix(in srgb, var(--color-gs-violet) 34%, transparent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--color-gs-glow) 14%, transparent),
              inset 0 0 10px color-mix(in srgb, var(--color-gs-glow) 5%, transparent);
}
.gs-pulse { animation: gs-pulse 2.8s ease-in-out infinite; }
@keyframes gs-pulse {
  50% { box-shadow: 0 0 22px color-mix(in srgb, var(--color-gs-glow) 40%, transparent),
                    inset 0 0 12px color-mix(in srgb, var(--color-gs-glow) 10%, transparent); }
}
.gs-fade-up { animation: gs-fade-up .5s ease-out both; }
@keyframes gs-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
.gs-blink { animation: gs-blink 1s steps(1) infinite; }
@keyframes gs-blink { 50% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .gs-pulse, .gs-fade-up, .gs-blink { animation: none !important; }
}
```

- [ ] **Step 2: Verify the dev server compiles**

Run: `npm run dev` — confirm no Tailwind/CSS errors in the terminal, then stop it (Ctrl-C).
Expected: server starts clean.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add market/glow tokens and flair keyframes"
```

---

## Task 3: User config

**Files:**
- Create: `src/config.js`
- Test: `src/config.test.js`

**Interfaces:**
- Produces: default export `config` with keys used across panes:
  `bannerText:string`, `name:string`, `location:{lat,lon,label}`,
  `links:[{label,url,alias}]`, `bangs:{[prefix]:string /* %s template */}`,
  `defaultSearch:string /* %s template */`,
  `worldClocks:[{label,tz,flag}]`, `cryptoCoins:string[]`,
  `rssSources:[{label,url}]`, `githubUsername:string`,
  `bibleRefs:string[]`, `bibleTranslation:string`,
  `agenda:{[isoDate]:string[]}`.

- [ ] **Step 1: Write the failing test `src/config.test.js`**

```js
import { describe, it, expect } from 'vitest'
import config from './config.js'

describe('config', () => {
  it('hardcodes Seattle for weather', () => {
    expect(config.location).toEqual({ lat: 47.6062, lon: -122.3321, label: 'Seattle, WA' })
  })
  it('gives every link an alias', () => {
    for (const l of config.links) expect(l.alias).toBeTruthy()
  })
  it('has a %s slot in every search template', () => {
    expect(config.defaultSearch).toContain('%s')
    for (const t of Object.values(config.bangs)) expect(t).toContain('%s')
  })
  it('includes Tallinn and Sydney world clocks', () => {
    const tzs = config.worldClocks.map(c => c.tz)
    expect(tzs).toContain('Europe/Tallinn')
    expect(tzs).toContain('Australia/Sydney')
  })
})
```

- [ ] **Step 2: Run it, expect FAIL** (`Cannot find module './config.js'`)

Run: `npx vitest run src/config.test.js`

- [ ] **Step 3: Create `src/config.js`**

```js
const config = {
  bannerText: 'ghost-shell',
  name: 'nick',
  location: { lat: 47.6062, lon: -122.3321, label: 'Seattle, WA' },

  links: [
    { label: 'github',  url: 'https://github.com',      alias: 'gh' },
    { label: 'youtube', url: 'https://youtube.com',      alias: 'yt' },
    { label: 'reddit',  url: 'https://reddit.com',       alias: 'r'  },
    { label: 'claude',  url: 'https://claude.ai',        alias: 'ai' },
    { label: 'mail',    url: 'https://mail.google.com',  alias: 'm'  },
  ],

  // "yt lofi" → youtube search. %s is url-encoded query.
  bangs: {
    g:  'https://www.google.com/search?q=%s',
    yt: 'https://www.youtube.com/results?search_query=%s',
    gh: 'https://github.com/search?q=%s',
    r:  'https://www.reddit.com/search/?q=%s',
  },
  defaultSearch: 'https://www.google.com/search?q=%s',

  worldClocks: [
    { label: 'SF',      tz: 'America/Los_Angeles', flag: '🇺🇸' },
    { label: 'NYC',     tz: 'America/New_York',    flag: '🇺🇸' },
    { label: 'Tallinn', tz: 'Europe/Tallinn',      flag: '🇪🇪' },
    { label: 'Sydney',  tz: 'Australia/Sydney',    flag: '🇦🇺' },
    { label: 'Tokyo',   tz: 'Asia/Tokyo',          flag: '🇯🇵' },
  ],

  cryptoCoins: ['bitcoin', 'ethereum', 'solana', 'dogecoin'],

  rssSources: [
    { label: 'the verge', url: 'https://www.theverge.com/rss/index.xml' },
    { label: 'bbc',       url: 'https://feeds.bbci.co.uk/news/rss.xml' },
    { label: 'ars',       url: 'https://feeds.arstechnica.com/arstechnica/index' },
  ],

  githubUsername: 'cCynics',

  // verse-of-the-day rotates through these by day-of-year
  bibleRefs: ['Proverbs 3:5-6', 'Psalm 23:1-4', 'Philippians 4:6-7', 'Isaiah 40:31', 'John 3:16'],
  bibleTranslation: 'kjv',

  // manual calendar agenda: { 'YYYY-MM-DD': ['14:00 standup', ...] }
  agenda: {},
}

export default config
```

- [ ] **Step 4: Run tests, expect PASS**

Run: `npx vitest run src/config.test.js`

- [ ] **Step 5: Commit**

```bash
git add src/config.js src/config.test.js
git commit -m "feat: add user config"
```

---

## Task 4: Shared hooks (useLocalStorage, usePolling)

**Files:**
- Create: `src/hooks/useLocalStorage.js`
- Create: `src/hooks/usePolling.js`
- Test: `src/hooks/useLocalStorage.test.jsx`, `src/hooks/usePolling.test.jsx`

**Interfaces:**
- Produces:
  - `useLocalStorage(key, initialValue)` → `[value, setValue]` (JSON-serialized, persisted).
  - `usePolling(fetcher, intervalMs)` → `{ data, loading, error, refresh }`.
    `fetcher` is `async () => data`. Runs once on mount, then every `intervalMs`.
    `loading` is true only until the first settle. `error` holds the thrown error (or null). `refresh()` forces a re-fetch.

- [ ] **Step 1: Write failing test `src/hooks/useLocalStorage.test.jsx`**

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage.js'

beforeEach(() => localStorage.clear())

describe('useLocalStorage', () => {
  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'init'))
    expect(result.current[0]).toBe('init')
  })
  it('persists updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('k', 0))
    act(() => result.current[1](5))
    expect(result.current[0]).toBe(5)
    expect(JSON.parse(localStorage.getItem('k'))).toBe(5)
  })
  it('reads an existing stored value', () => {
    localStorage.setItem('k', JSON.stringify('stored'))
    const { result } = renderHook(() => useLocalStorage('k', 'init'))
    expect(result.current[0]).toBe('stored')
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `npx vitest run src/hooks/useLocalStorage.test.jsx`

- [ ] **Step 3: Implement `src/hooks/useLocalStorage.js`**

```js
import { useState, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw != null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  const set = useCallback((next) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      try { localStorage.setItem(key, JSON.stringify(resolved)) } catch { /* quota */ }
      return resolved
    })
  }, [key])

  return [value, set]
}
```

- [ ] **Step 4: Run tests, expect PASS**

Run: `npx vitest run src/hooks/useLocalStorage.test.jsx`

- [ ] **Step 5: Write failing test `src/hooks/usePolling.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePolling } from './usePolling.js'

describe('usePolling', () => {
  it('starts loading, then resolves data', async () => {
    const { result } = renderHook(() => usePolling(async () => 42, 100000))
    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBe(42)
    expect(result.current.error).toBeNull()
  })
  it('captures a thrown error', async () => {
    const { result } = renderHook(() => usePolling(async () => { throw new Error('boom') }, 100000))
    await waitFor(() => expect(result.current.error).toBeTruthy())
    expect(result.current.error.message).toBe('boom')
  })
  it('re-fetches on refresh()', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce('a').mockResolvedValueOnce('b')
    const { result } = renderHook(() => usePolling(fetcher, 100000))
    await waitFor(() => expect(result.current.data).toBe('a'))
    await act(async () => { await result.current.refresh() })
    expect(result.current.data).toBe('b')
  })
})
```

- [ ] **Step 6: Run it, expect FAIL**

- [ ] **Step 7: Implement `src/hooks/usePolling.js`**

```js
import { useState, useEffect, useRef, useCallback } from 'react'

export function usePolling(fetcher, intervalMs) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(async () => {
    try {
      const result = await fetcherRef.current()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let alive = true
    const tick = async () => { if (alive) await run() }
    tick()
    const id = setInterval(tick, intervalMs)
    return () => { alive = false; clearInterval(id) }
  }, [run, intervalMs])

  return { data, loading, error, refresh: run }
}
```

- [ ] **Step 8: Run tests, expect PASS**

Run: `npx vitest run src/hooks`

- [ ] **Step 9: Commit**

```bash
git add src/hooks
git commit -m "feat: add useLocalStorage and usePolling hooks"
```

---

## Task 5: Pane frame component

**Files:**
- Create: `src/components/Pane.jsx`
- Test: `src/components/Pane.test.jsx`

**Interfaces:**
- Consumes: `.gs-glow-border`, `.gs-pulse` (Task 2).
- Produces: `<Pane title badge live loading error className>children</Pane>`.
  - Always renders a header: `title` (uppercased, `gs-dim`) left, `badge` (`gs-violet`) right.
  - `loading` true → a skeleton body (children hidden).
  - `error` truthy (and not loading) → a muted `unavailable` body.
  - otherwise → `children`.
  - `live` true → adds `gs-pulse`. Convention: panes pass `loading={loading && !data}` so background refreshes never blank the pane.

- [ ] **Step 1: Write failing test `src/components/Pane.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Pane } from './Pane.jsx'

describe('Pane', () => {
  it('renders title and children when ready', () => {
    render(<Pane title="weather"><div>body</div></Pane>)
    expect(screen.getByText('weather')).toBeInTheDocument()
    expect(screen.getByText('body')).toBeInTheDocument()
  })
  it('shows a skeleton and hides children while loading', () => {
    render(<Pane title="x" loading><div>body</div></Pane>)
    expect(screen.queryByText('body')).not.toBeInTheDocument()
    expect(screen.getByTestId('pane-skeleton')).toBeInTheDocument()
  })
  it('shows unavailable on error', () => {
    render(<Pane title="x" error={new Error('e')}><div>body</div></Pane>)
    expect(screen.getByText(/unavailable/i)).toBeInTheDocument()
    expect(screen.queryByText('body')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/components/Pane.jsx`**

```jsx
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
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components/Pane.jsx src/components/Pane.test.jsx
git commit -m "feat: add shared Pane frame with loading/error states"
```

---

## Task 6: Time utilities

**Files:**
- Create: `src/lib/time.js`
- Test: `src/lib/time.test.js`

**Interfaces:**
- Produces (all pure, take a `Date` so they're testable):
  - `pad2(n:number)` → 2-digit string.
  - `clockParts(date)` → `{ hh, mm, ss }` (strings, 24h).
  - `greeting(date)` → `'good morning'|'good afternoon'|'good evening'`.
  - `msUntilMidnight(date)` → number.
  - `formatDuration(ms)` → e.g. `'5h 13m'`.
  - `timeInZone(date, tz)` → `'HH:MM'` in that IANA timezone.

- [ ] **Step 1: Write failing test `src/lib/time.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { pad2, clockParts, greeting, msUntilMidnight, formatDuration, timeInZone } from './time.js'

const at = (h, m = 0, s = 0) => new Date(2026, 6, 18, h, m, s) // local time

describe('time', () => {
  it('pads', () => expect(pad2(4)).toBe('04'))
  it('splits the clock', () => expect(clockParts(at(21, 47, 32))).toEqual({ hh: '21', mm: '47', ss: '32' }))
  it('greets by hour', () => {
    expect(greeting(at(8))).toBe('good morning')
    expect(greeting(at(14))).toBe('good afternoon')
    expect(greeting(at(21))).toBe('good evening')
  })
  it('counts down to midnight', () => {
    expect(msUntilMidnight(at(23, 0, 0))).toBe(60 * 60 * 1000)
  })
  it('formats a duration', () => expect(formatDuration(5 * 3600e3 + 13 * 60e3)).toBe('5h 13m'))
  it('renders a timezone as HH:MM', () => {
    expect(timeInZone(new Date('2026-07-18T21:47:00Z'), 'UTC')).toBe('21:47')
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/lib/time.js`**

```js
export const pad2 = (n) => String(n).padStart(2, '0')

export function clockParts(date) {
  return { hh: pad2(date.getHours()), mm: pad2(date.getMinutes()), ss: pad2(date.getSeconds()) }
}

export function greeting(date) {
  const h = date.getHours()
  if (h < 12) return 'good morning'
  if (h < 18) return 'good afternoon'
  return 'good evening'
}

export function msUntilMidnight(date) {
  const next = new Date(date)
  next.setHours(24, 0, 0, 0)
  return next.getTime() - date.getTime()
}

export function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}h ${m}m`
}

export function timeInZone(date, tz) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date)
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/time.js src/lib/time.test.js
git commit -m "feat: add time utilities"
```

---

## Task 7: A live clock hook + Header component

**Files:**
- Create: `src/hooks/useNow.js`
- Create: `src/components/Header.jsx`
- Test: `src/components/Header.test.jsx`

**Interfaces:**
- Consumes: `time.js` (Task 6), `config` (Task 3).
- Produces:
  - `useNow(intervalMs = 1000)` → a `Date` that updates on an interval.
  - `<Header now={Date} />` — renders the ASCII banner (static string), a host
    readout, the big clock (hh:mm + dim ss), and `"{greeting}, {name} — {duration} until midnight"`.
    `now` is a prop (not internal) so it's testable with a fixed time.

- [ ] **Step 1: Write failing test `src/components/Header.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header.jsx'

describe('Header', () => {
  const now = new Date(2026, 6, 18, 21, 47, 32)
  it('shows the clock and greeting', () => {
    render(<Header now={now} />)
    expect(screen.getByText('21')).toBeInTheDocument()
    expect(screen.getByText('47')).toBeInTheDocument()
    expect(screen.getByText(/good evening, nick/i)).toBeInTheDocument()
  })
  it('renders the banner text', () => {
    render(<Header now={now} />)
    expect(screen.getByLabelText('ghost-shell')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/hooks/useNow.js`**

```js
import { useState, useEffect } from 'react'

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
```

- [ ] **Step 4: Implement `src/components/Header.jsx`**

The banner is a pre-generated figlet ("standard" font) of `ghost-shell`. Store it as
a raw string with an `aria-label` so it's screen-reader friendly and testable.

```jsx
import config from '../config.js'
import { clockParts, greeting, msUntilMidnight, formatDuration } from '../lib/time.js'

const BANNER = String.raw`
       _                _            _          _ _
  __ _| |__   ___  ___ | |_    ___  | |__   ___| | |
 / _' | '_ \ / _ \/ __|| __|  / __| | '_ \ / _ \ | |
| (_| | | | | (_) \__ \| |_   \__ \ | | | |  __/ | |
 \__, |_| |_|\___/|___/ \__|  |___/ |_| |_|\___|_|_|
 |___/
`

export function Header({ now }) {
  const { hh, mm, ss } = clockParts(now)
  return (
    <header className="px-5 pt-4">
      <div className="flex items-start justify-between">
        <pre aria-label={config.bannerText}
             className="m-0 text-[9px] leading-tight text-gs-violet"
             style={{ textShadow: '0 0 12px rgba(153,102,255,.5)' }}>{BANNER}</pre>
        <div className="text-right text-[10px] leading-relaxed text-gs-dim">
          <div>host <span className="text-gs-text">{config.bannerText}</span></div>
          <div>{config.location.label}</div>
          <div className="text-gs-violet">◉ all systems go</div>
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-4">
        <div className="text-3xl font-semibold tracking-wide text-gs-text"
             style={{ textShadow: '0 0 14px rgba(153,102,255,.5)' }}>
          <span>{hh}</span>:<span>{mm}</span><span className="text-base text-gs-dim">:{ss}</span>
        </div>
        <div className="text-xs text-gs-dim">
          {greeting(now)}, <span className="text-gs-violet">{config.name}</span> — {formatDuration(msUntilMidnight(now))} until midnight
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Run tests, expect PASS**

Note: the clock renders `hh` and `mm` in separate `<span>`s so the test can find `21` and `47` individually.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useNow.js src/components/Header.jsx src/components/Header.test.jsx
git commit -m "feat: add live clock hook and Header"
```

---

## Task 8: Background glow + StatusBar

**Files:**
- Create: `src/components/Background.jsx`
- Create: `src/components/StatusBar.jsx`
- Test: `src/components/StatusBar.test.jsx`

**Interfaces:**
- Consumes: `time.js` (Task 6).
- Produces:
  - `<Background/>` — a fixed, non-interactive horizon glow behind everything.
  - `<StatusBar now={Date} weatherText?={string} />` — a bottom strip:
    `NORMAL` segment, a dim middle (`~/homepage · main ✱ · HH:MM:SS · {weatherText}`), and a right segment.

- [ ] **Step 1: Write failing test `src/components/StatusBar.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBar } from './StatusBar.jsx'

describe('StatusBar', () => {
  it('renders the mode and the current time', () => {
    render(<StatusBar now={new Date(2026, 6, 18, 21, 47, 32)} />)
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
    expect(screen.getByText(/21:47:32/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/components/Background.jsx`**

```jsx
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute left-1/2 top-0 h-56 w-[520px] -translate-x-1/2 blur-2xl"
           style={{ background: 'radial-gradient(closest-side, rgba(153,102,255,.28), rgba(96,208,255,.08), transparent)' }} />
    </div>
  )
}
```

- [ ] **Step 4: Implement `src/components/StatusBar.jsx`**

```jsx
import { clockParts } from '../lib/time.js'

export function StatusBar({ now, weatherText = '' }) {
  const { hh, mm, ss } = clockParts(now)
  return (
    <footer className="flex items-center text-[10px] font-semibold text-gs-bg">
      <span className="bg-gs-violet px-3 py-1">NORMAL</span>
      <span className="flex-1 bg-gs-panel px-3 py-1 font-normal text-gs-dim">
        ~/homepage · main ✱ · {hh}:{mm}:{ss}{weatherText && ` · ${weatherText}`}
      </span>
      <span className="bg-gs-violet/80 px-3 py-1 text-white">ghost-shell</span>
    </footer>
  )
}
```

- [ ] **Step 5: Run tests, expect PASS**

- [ ] **Step 6: Commit**

```bash
git add src/components/Background.jsx src/components/StatusBar.jsx src/components/StatusBar.test.jsx
git commit -m "feat: add background glow and status bar"
```

---

## Task 9: Grid + App shell assembly

**Files:**
- Create: `src/components/Grid.jsx`
- Modify: `src/App.jsx` (rewrite the placeholder)
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes: `Background`, `Header`, `StatusBar` (Tasks 7-8), `useNow` (Task 7).
- Produces:
  - `<Grid>children</Grid>` — a responsive 4-col grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`).
  - `App` composes: `Background`, a scroll container with `Header`, a
    `CommandBar` slot (placeholder until Task 11), `Grid` (empty until panes land), `StatusBar`.

- [ ] **Step 1: Write failing test `src/App.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.jsx'

describe('App shell', () => {
  it('renders the banner and status bar', () => {
    render(<App />)
    expect(screen.getByLabelText('ghost-shell')).toBeInTheDocument()
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/components/Grid.jsx`**

```jsx
export function Grid({ children }) {
  return <div className="grid grid-cols-1 gap-3 px-5 pb-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
}
```

- [ ] **Step 4: Rewrite `src/App.jsx`**

```jsx
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
```

- [ ] **Step 5: Run tests, expect PASS**

- [ ] **Step 6: Commit**

```bash
git add src/components/Grid.jsx src/App.jsx src/App.test.jsx
git commit -m "feat: assemble app shell (background, header, grid, status bar)"
```

---

## Task 10: Command resolution logic

**Files:**
- Create: `src/lib/commands.js`
- Test: `src/lib/commands.test.js`

**Interfaces:**
- Consumes: `config` shape (Task 3).
- Produces: `resolveCommand(input, config)` → `{ url }` (or `null` for empty input).
  Resolution order: (1) exact link alias → that link's URL; (2) first token is a
  bang prefix → that search template with the remaining text URL-encoded; (3)
  otherwise → `defaultSearch` with the whole input URL-encoded.

- [ ] **Step 1: Write failing test `src/lib/commands.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { resolveCommand } from './commands.js'
import config from '../config.js'

describe('resolveCommand', () => {
  it('returns null for empty input', () => {
    expect(resolveCommand('   ', config)).toBeNull()
  })
  it('navigates on an exact alias', () => {
    expect(resolveCommand('gh', config)).toEqual({ url: 'https://github.com' })
  })
  it('searches with a bang prefix', () => {
    expect(resolveCommand('yt lofi beats', config))
      .toEqual({ url: 'https://www.youtube.com/results?search_query=lofi%20beats' })
  })
  it('falls back to the default search', () => {
    expect(resolveCommand('rust async', config))
      .toEqual({ url: 'https://www.google.com/search?q=rust%20async' })
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/lib/commands.js`**

```js
export function resolveCommand(input, config) {
  const text = input.trim()
  if (!text) return null

  const alias = config.links.find((l) => l.alias === text)
  if (alias) return { url: alias.url }

  const [first, ...rest] = text.split(/\s+/)
  const tmpl = config.bangs[first]
  if (tmpl && rest.length) {
    return { url: tmpl.replace('%s', encodeURIComponent(rest.join(' '))) }
  }

  return { url: config.defaultSearch.replace('%s', encodeURIComponent(text)) }
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/commands.js src/lib/commands.test.js
git commit -m "feat: add command resolution logic"
```

---

## Task 11: CommandBar component + help overlay

**Files:**
- Create: `src/components/CommandBar.jsx`
- Modify: `src/App.jsx` (mount `<CommandBar/>` in its slot)
- Test: `src/components/CommandBar.test.jsx`

**Interfaces:**
- Consumes: `resolveCommand` (Task 10), `config` (Task 3).
- Produces: `<CommandBar onNavigate?={(url)=>void} />`. Enter resolves the input
  and calls `onNavigate(url)` (defaults to `window.location.assign`). Typing `?`
  as the sole character opens a help overlay listing aliases + bangs; `Esc`
  closes it / blurs the input. Global `/` focuses the input.

- [ ] **Step 1: Write failing test `src/components/CommandBar.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommandBar } from './CommandBar.jsx'

describe('CommandBar', () => {
  it('navigates on Enter using resolveCommand', async () => {
    const onNavigate = vi.fn()
    render(<CommandBar onNavigate={onNavigate} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'gh{Enter}')
    expect(onNavigate).toHaveBeenCalledWith('https://github.com')
  })
  it('opens help on "?"', async () => {
    render(<CommandBar onNavigate={() => {}} />)
    await userEvent.type(screen.getByRole('textbox'), '?')
    expect(screen.getByText(/aliases/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/components/CommandBar.jsx`**

```jsx
import { useState, useRef, useEffect } from 'react'
import config from '../config.js'
import { resolveCommand } from '../lib/commands.js'

export function CommandBar({ onNavigate = (url) => window.location.assign(url) }) {
  const [value, setValue] = useState('')
  const [help, setHelp] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault(); inputRef.current?.focus()
      }
      if (e.key === 'Escape') { setHelp(false); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onChange = (e) => {
    const v = e.target.value
    setHelp(v === '?')
    setValue(v)
  }

  const onKeyDown = (e) => {
    if (e.key !== 'Enter') return
    const result = resolveCommand(value, config)
    if (result) { onNavigate(result.url); setValue('') }
  }

  return (
    <div className="relative px-5 pb-4 pt-2">
      <div className="gs-glow-border flex items-center gap-2 rounded-lg bg-gs-panel/50 px-4 py-3">
        <span className="font-bold text-gs-violet" style={{ textShadow: '0 0 8px #9966ff' }}>❯</span>
        <input
          ref={inputRef}
          role="textbox"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="command, search, or alias… try 'yt lofi', 'gh'  ·  '?' for help"
          className="w-full bg-transparent text-gs-text placeholder:text-gs-dim/70 focus:outline-none"
          autoFocus
        />
      </div>
      {help && (
        <div className="gs-glow-border absolute left-5 right-5 z-10 mt-2 rounded-lg bg-gs-panel p-4 text-xs">
          <p className="mb-2 uppercase tracking-widest text-gs-dim">aliases</p>
          <div className="mb-3 grid grid-cols-2 gap-1">
            {config.links.map((l) => (
              <div key={l.alias}><span className="text-gs-violet">{l.alias}</span> → {l.label}</div>
            ))}
          </div>
          <p className="mb-2 uppercase tracking-widest text-gs-dim">bangs (prefix + query)</p>
          <div className="grid grid-cols-2 gap-1">
            {Object.keys(config.bangs).map((b) => (
              <div key={b}><span className="text-gs-violet">{b}</span> … → search</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Mount it in `src/App.jsx`**

Add the import and replace the `{/* CommandBar mounts here in Task 11 */}` comment:
```jsx
import { CommandBar } from './components/CommandBar.jsx'
```
```jsx
        <CommandBar />
```

- [ ] **Step 5: Run tests, expect PASS**

Run: `npx vitest run src/components/CommandBar.test.jsx src/App.test.jsx`

- [ ] **Step 6: Commit**

```bash
git add src/components/CommandBar.jsx src/App.jsx
git commit -m "feat: add command bar with help overlay"
```

---

## Task 12: Weather pane (reference pane)

This is the **reference pattern** for all data panes: a `useX` hook wraps a
`fetchX` function in `usePolling`; the pane renders inside `Pane`, passing
`loading={loading && !data}` so refreshes never blank it.

**Files:**
- Create: `src/lib/openMeteo.js`
- Create: `src/components/panes/WeatherPane.jsx`
- Test: `src/lib/openMeteo.test.js`, `src/components/panes/WeatherPane.test.jsx`

**Interfaces:**
- Consumes: `usePolling` (Task 4), `Pane` (Task 5), `config.location` (Task 3).
- Produces:
  - `fetchWeather(location)` → `{ tempF, hiF, loF, humidity, windMph, code, desc }`.
  - `weatherEmoji(code)` → string.
  - `<WeatherPane/>` — self-contained, mounts its own hook. Refreshes every 15 min.

- [ ] **Step 1: Write failing test `src/lib/openMeteo.test.js`**

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchWeather, weatherEmoji } from './openMeteo.js'

afterEach(() => vi.restoreAllMocks())

describe('openMeteo', () => {
  it('maps the API response to a flat shape', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 14, relative_humidity_2m: 62, weather_code: 0, wind_speed_10m: 8 },
        daily: { temperature_2m_max: [19], temperature_2m_min: [11] },
      }),
    })
    const w = await fetchWeather({ lat: 47.6, lon: -122.3 })
    expect(w).toMatchObject({ tempF: 14, hiF: 19, loF: 11, humidity: 62, windMph: 8, code: 0 })
    expect(w.desc).toBeTruthy()
  })
  it('throws on a non-ok response', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 500 })
    await expect(fetchWeather({ lat: 1, lon: 2 })).rejects.toThrow()
  })
  it('maps codes to emoji', () => {
    expect(typeof weatherEmoji(0)).toBe('string')
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/lib/openMeteo.js`**

```js
const DESC = {
  0: 'clear', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast',
  45: 'fog', 48: 'rime fog', 51: 'light drizzle', 61: 'rain', 63: 'rain',
  71: 'snow', 80: 'showers', 95: 'thunderstorm',
}
const EMOJI = { 0: '☀', 1: '🌤', 2: '⛅', 3: '☁', 45: '🌫', 61: '🌧', 71: '❄', 80: '🌦', 95: '⛈' }

export const weatherEmoji = (code) => EMOJI[code] ?? '☁'

export async function fetchWeather({ lat, lon }) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
    + `&daily=temperature_2m_max,temperature_2m_min`
    + `&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`weather ${res.status}`)
  const d = await res.json()
  const code = d.current.weather_code
  return {
    tempF: Math.round(d.current.temperature_2m),
    hiF: Math.round(d.daily.temperature_2m_max[0]),
    loF: Math.round(d.daily.temperature_2m_min[0]),
    humidity: d.current.relative_humidity_2m,
    windMph: Math.round(d.current.wind_speed_10m),
    code,
    desc: DESC[code] ?? 'clear',
  }
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Write failing test `src/components/panes/WeatherPane.test.jsx`**

```jsx
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { WeatherPane } from './WeatherPane.jsx'

afterEach(() => vi.restoreAllMocks())

describe('WeatherPane', () => {
  it('renders the temperature after fetch', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 14, relative_humidity_2m: 62, weather_code: 0, wind_speed_10m: 8 },
        daily: { temperature_2m_max: [19], temperature_2m_min: [11] },
      }),
    })
    render(<WeatherPane />)
    await waitFor(() => expect(screen.getByText(/14°/)).toBeInTheDocument())
    expect(screen.getByText(/h19 · l11/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run it, expect FAIL**

- [ ] **Step 7: Implement `src/components/panes/WeatherPane.jsx`**

```jsx
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchWeather, weatherEmoji } from '../../lib/openMeteo.js'
import config from '../../config.js'

const FIFTEEN_MIN = 15 * 60 * 1000

export function WeatherPane() {
  const { data, loading, error } = usePolling(() => fetchWeather(config.location), FIFTEEN_MIN)
  return (
    <Pane title="weather" badge="◍" live loading={loading && !data} error={error && !data}>
      {data && (
        <>
          <div className="text-2xl text-gs-text" style={{ textShadow: '0 0 12px rgba(153,102,255,.4)' }}>
            {weatherEmoji(data.code)} {data.tempF}°
          </div>
          <div className="mt-1 text-[10px] leading-relaxed text-gs-dim">
            {data.desc} · h{data.hiF} · l{data.loF}<br />
            humidity {data.humidity}% · wind {data.windMph}
          </div>
        </>
      )}
    </Pane>
  )
}
```

- [ ] **Step 8: Run tests, expect PASS**

- [ ] **Step 9: Commit**

```bash
git add src/lib/openMeteo.js src/components/panes/WeatherPane.jsx src/lib/openMeteo.test.js src/components/panes/WeatherPane.test.jsx
git commit -m "feat: add weather pane (reference data-pane pattern)"
```

---

## Task 13: Crypto pane

**Files:**
- Create: `src/lib/coingecko.js`
- Create: `src/components/panes/CryptoPane.jsx`
- Test: `src/lib/coingecko.test.js`

**Interfaces:**
- Consumes: `usePolling`, `Pane`, `config.cryptoCoins`.
- Produces: `fetchCrypto(ids:string[])` → `[{ id, label, price, change24h }]`
  (label is a short upper ticker). `<CryptoPane/>` refreshes every 60 s, `live`.

- [ ] **Step 1: Write failing test `src/lib/coingecko.test.js`**

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchCrypto } from './coingecko.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchCrypto', () => {
  it('maps CoinGecko simple price to rows', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        bitcoin:  { usd: 64200, usd_24h_change: 2.1 },
        ethereum: { usd: 3100,  usd_24h_change: -1.4 },
      }),
    })
    const rows = await fetchCrypto(['bitcoin', 'ethereum'])
    expect(rows[0]).toMatchObject({ id: 'bitcoin', label: 'BTC', price: 64200 })
    expect(rows[1].change24h).toBeCloseTo(-1.4)
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/lib/coingecko.js`**

```js
const TICKER = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', dogecoin: 'DOGE' }

export async function fetchCrypto(ids) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}`
    + `&vs_currencies=usd&include_24hr_change=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`crypto ${res.status}`)
  const d = await res.json()
  return ids.map((id) => ({
    id,
    label: TICKER[id] ?? id.slice(0, 4).toUpperCase(),
    price: d[id]?.usd ?? null,
    change24h: d[id]?.usd_24h_change ?? 0,
  }))
}

// price → compact string: 64200 → "64.2k", 0.14 → ".14"
export function fmtPrice(n) {
  if (n == null) return '—'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  if (n < 1) return n.toFixed(2).replace(/^0/, '')
  return String(Math.round(n))
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Implement `src/components/panes/CryptoPane.jsx`**

```jsx
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchCrypto, fmtPrice } from '../../lib/coingecko.js'
import config from '../../config.js'

export function CryptoPane() {
  const { data, loading, error } = usePolling(() => fetchCrypto(config.cryptoCoins), 60 * 1000)
  return (
    <Pane title="crypto" badge="$" live loading={loading && !data} error={error && !data}>
      {data && data.map((c) => {
        const up = c.change24h >= 0
        return (
          <div key={c.id} className="flex justify-between py-0.5 text-gs-text">
            <span>{c.label}</span>
            <span className={up ? 'text-gs-up' : 'text-gs-down'}>
              {fmtPrice(c.price)} {up ? '▲' : '▼'}{Math.abs(c.change24h).toFixed(1)}%
            </span>
          </div>
        )
      })}
    </Pane>
  )
}
```

- [ ] **Step 6: Run tests, expect PASS** (`npx vitest run src/lib/coingecko.test.js`)

- [ ] **Step 7: Commit**

```bash
git add src/lib/coingecko.js src/components/panes/CryptoPane.jsx src/lib/coingecko.test.js
git commit -m "feat: add crypto pane"
```

---

## Task 14: Hacker News pane

**Files:**
- Create: `src/lib/hackernews.js`
- Create: `src/components/panes/HackerNewsPane.jsx`
- Test: `src/lib/hackernews.test.js`

**Interfaces:**
- Consumes: `usePolling`, `Pane`.
- Produces: `fetchTopStories(n=3)` → `[{ id, title, score, url }]`. Uses the HN
  Firebase API (topstories → first n item lookups). `<HackerNewsPane/>` spans 2
  columns, refreshes every 10 min.

- [ ] **Step 1: Write failing test `src/lib/hackernews.test.js`**

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchTopStories } from './hackernews.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchTopStories', () => {
  it('fetches ids then item details', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.includes('topstories')) return Promise.resolve({ ok: true, json: async () => [10, 20, 30, 40] })
      const id = Number(url.match(/item\/(\d+)/)[1])
      return Promise.resolve({ ok: true, json: async () => ({ id, title: `story ${id}`, score: id, url: `http://x/${id}` }) })
    })
    const rows = await fetchTopStories(2)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ id: 10, title: 'story 10', score: 10 })
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/lib/hackernews.js`**

```js
const BASE = 'https://hacker-news.firebaseio.com/v0'

export async function fetchTopStories(n = 3) {
  const res = await fetch(`${BASE}/topstories.json`)
  if (!res.ok) throw new Error(`hn ${res.status}`)
  const ids = await res.json()
  const items = await Promise.all(
    ids.slice(0, n).map(async (id) => {
      const r = await fetch(`${BASE}/item/${id}.json`)
      if (!r.ok) throw new Error(`hn item ${r.status}`)
      const it = await r.json()
      return { id: it.id, title: it.title, score: it.score, url: it.url ?? `https://news.ycombinator.com/item?id=${it.id}` }
    }),
  )
  return items
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Implement `src/components/panes/HackerNewsPane.jsx`**

```jsx
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchTopStories } from '../../lib/hackernews.js'

export function HackerNewsPane() {
  const { data, loading, error } = usePolling(() => fetchTopStories(3), 10 * 60 * 1000)
  return (
    <Pane title="hacker news" badge="▲" className="sm:col-span-2" loading={loading && !data} error={error && !data}>
      {data && data.map((s) => (
        <a key={s.id} href={s.url} className="block py-0.5 leading-snug text-gs-text hover:text-gs-violet">
          <span className="text-[9px] text-gs-violet">{s.score} ▲</span> {s.title}
        </a>
      ))}
    </Pane>
  )
}
```

- [ ] **Step 6: Run tests, expect PASS**

- [ ] **Step 7: Commit**

```bash
git add src/lib/hackernews.js src/components/panes/HackerNewsPane.jsx src/lib/hackernews.test.js
git commit -m "feat: add hacker news pane"
```

---

## Task 15: NASA photo-of-the-day pane

**Files:**
- Create: `src/lib/nasa.js`
- Create: `src/components/panes/NasaPane.jsx`
- Test: `src/lib/nasa.test.js`

**Interfaces:**
- Consumes: `usePolling`, `Pane`. Reads `import.meta.env.VITE_NASA_KEY` (default `'DEMO_KEY'`).
- Produces: `fetchApod(apiKey)` → `{ title, imageUrl, isVideo }` (for a video,
  `imageUrl` is the `thumbnail_url` or null). `<NasaPane/>` spans 2 columns,
  focal, refreshes once/day (24 h interval).

- [ ] **Step 1: Write failing test `src/lib/nasa.test.js`**

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchApod } from './nasa.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchApod', () => {
  it('returns image url and title for an image', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ media_type: 'image', title: 'Nebula', url: 'http://img/x.jpg' }),
    })
    expect(await fetchApod('KEY')).toEqual({ title: 'Nebula', imageUrl: 'http://img/x.jpg', isVideo: false })
  })
  it('handles a video by using its thumbnail', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ media_type: 'video', title: 'V', url: 'http://y', thumbnail_url: 'http://t.jpg' }),
    })
    expect(await fetchApod('KEY')).toEqual({ title: 'V', imageUrl: 'http://t.jpg', isVideo: true })
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/lib/nasa.js`**

```js
export async function fetchApod(apiKey) {
  const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}&thumbs=true`)
  if (!res.ok) throw new Error(`apod ${res.status}`)
  const d = await res.json()
  const isVideo = d.media_type === 'video'
  return { title: d.title, imageUrl: isVideo ? (d.thumbnail_url ?? null) : d.url, isVideo }
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Implement `src/components/panes/NasaPane.jsx`**

```jsx
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchApod } from '../../lib/nasa.js'

const KEY = import.meta.env.VITE_NASA_KEY || 'DEMO_KEY'

export function NasaPane() {
  const { data, loading, error } = usePolling(() => fetchApod(KEY), 24 * 60 * 60 * 1000)
  return (
    <Pane title="nasa · photo of the day" badge="✦" className="sm:col-span-2" loading={loading && !data} error={error && !data}>
      {data && (
        <figure className="m-0">
          {data.imageUrl
            ? <img src={data.imageUrl} alt={data.title} className="h-36 w-full rounded-md object-cover" />
            : <div className="flex h-36 items-center justify-center rounded-md bg-gs-hover text-gs-dim">video</div>}
          <figcaption className="mt-1 text-[10px] text-gs-dim">{data.title}</figcaption>
        </figure>
      )}
    </Pane>
  )
}
```

- [ ] **Step 6: Run tests, expect PASS**

- [ ] **Step 7: Commit**

```bash
git add src/lib/nasa.js src/components/panes/NasaPane.jsx src/lib/nasa.test.js
git commit -m "feat: add NASA photo-of-the-day pane"
```

---

## Task 16: Verse-of-the-day pane

**Files:**
- Create: `src/lib/bible.js`
- Create: `src/components/panes/VersePane.jsx`
- Test: `src/lib/bible.test.js`

**Interfaces:**
- Consumes: `usePolling`, `Pane`, `config.bibleRefs`, `config.bibleTranslation`.
- Produces:
  - `dayOfYear(date)` → 0-based day index.
  - `pickRef(refs, date)` → the ref for today (deterministic via `dayOfYear`).
  - `fetchVerse(ref, translation)` → `{ text, reference }` from bible-api.com.
  - `<VersePane/>` — resolves today's ref, fetches once/day.

- [ ] **Step 1: Write failing test `src/lib/bible.test.js`**

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { dayOfYear, pickRef, fetchVerse } from './bible.js'

afterEach(() => vi.restoreAllMocks())

describe('bible', () => {
  it('computes day of year', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(0)
    expect(dayOfYear(new Date(2026, 0, 11))).toBe(10)
  })
  it('picks a ref deterministically by day', () => {
    const refs = ['a', 'b', 'c']
    expect(pickRef(refs, new Date(2026, 0, 1))).toBe('a') // day 0 → index 0
    expect(pickRef(refs, new Date(2026, 0, 4))).toBe('a') // day 3 → 3 % 3 = 0
  })
  it('fetches and flattens verse text', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ reference: 'John 3:16', text: 'For God so loved…\n' }),
    })
    expect(await fetchVerse('John 3:16', 'kjv')).toEqual({ text: 'For God so loved…', reference: 'John 3:16' })
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/lib/bible.js`**

```js
export function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1)
  return Math.floor((date - start) / 86400000)
}

export function pickRef(refs, date) {
  return refs[dayOfYear(date) % refs.length]
}

export async function fetchVerse(ref, translation) {
  const res = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=${translation}`)
  if (!res.ok) throw new Error(`verse ${res.status}`)
  const d = await res.json()
  return { text: d.text.trim().replace(/\s+/g, ' '), reference: d.reference }
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Implement `src/components/panes/VersePane.jsx`**

```jsx
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { pickRef, fetchVerse } from '../../lib/bible.js'
import config from '../../config.js'

export function VersePane() {
  const ref = pickRef(config.bibleRefs, new Date())
  const { data, loading, error } = usePolling(() => fetchVerse(ref, config.bibleTranslation), 24 * 60 * 60 * 1000)
  return (
    <Pane title="verse of the day" badge="✝" loading={loading && !data} error={error && !data}>
      {data && (
        <>
          <p className="text-[11px] italic leading-relaxed text-gs-dim">"{data.text}"</p>
          <p className="mt-2 text-[10px] tracking-wide text-gs-dim">
            <span className="text-gs-violet">✝</span> {data.reference} · {config.bibleTranslation.toUpperCase()}
          </p>
        </>
      )}
    </Pane>
  )
}
```

- [ ] **Step 6: Run tests, expect PASS**

- [ ] **Step 7: Commit**

```bash
git add src/lib/bible.js src/components/panes/VersePane.jsx src/lib/bible.test.js
git commit -m "feat: add verse-of-the-day pane"
```

---

## Task 17: World Clocks pane

**Files:**
- Create: `src/components/panes/WorldClocksPane.jsx`
- Test: `src/components/panes/WorldClocksPane.test.jsx`

**Interfaces:**
- Consumes: `useNow` (Task 7), `timeInZone` (Task 6), `Pane`, `config.worldClocks`.
- Produces: `<WorldClocksPane/>` — no fetch; ticks each second via `useNow`.

- [ ] **Step 1: Write failing test `src/components/panes/WorldClocksPane.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorldClocksPane } from './WorldClocksPane.jsx'

describe('WorldClocksPane', () => {
  it('lists the configured cities', () => {
    render(<WorldClocksPane />)
    expect(screen.getByText('Tallinn')).toBeInTheDocument()
    expect(screen.getByText('Sydney')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/components/panes/WorldClocksPane.jsx`**

```jsx
import { Pane } from '../Pane.jsx'
import { useNow } from '../../hooks/useNow.js'
import { timeInZone } from '../../lib/time.js'
import config from '../../config.js'

export function WorldClocksPane() {
  const now = useNow()
  return (
    <Pane title="world clocks" badge="◴">
      {config.worldClocks.map((c) => (
        <div key={c.label} className="flex justify-between py-0.5 text-gs-text">
          <span className="text-gs-dim">{c.label} {c.flag}</span>
          <span>{timeInZone(now, c.tz)}</span>
        </div>
      ))}
    </Pane>
  )
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components/panes/WorldClocksPane.jsx src/components/panes/WorldClocksPane.test.jsx
git commit -m "feat: add world clocks pane"
```

---

## Task 18: Calendar pane

**Files:**
- Create: `src/lib/calendar.js`
- Create: `src/components/panes/CalendarPane.jsx`
- Test: `src/lib/calendar.test.js`

**Interfaces:**
- Consumes: `Pane`, `config.agenda`.
- Produces:
  - `monthGrid(date)` → `{ monthLabel, days:number[], todayDate:number }` where
    `days` is the current month's day numbers (1..N), leading blanks as `null`.
  - `isoDate(date)` → `'YYYY-MM-DD'`.
  - `<CalendarPane/>` — highlights today, lists `config.agenda[isoDate(today)]`.

- [ ] **Step 1: Write failing test `src/lib/calendar.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { monthGrid, isoDate } from './calendar.js'

describe('calendar', () => {
  it('builds the month grid with leading blanks', () => {
    const g = monthGrid(new Date(2026, 6, 18)) // July 2026, 1st is a Wednesday
    expect(g.monthLabel).toBe('july')
    expect(g.todayDate).toBe(18)
    expect(g.days.filter((d) => d === 31).length).toBe(1) // July has 31 days
    expect(g.days.slice(0, 3)).toEqual([null, null, null]) // Sun-Tue blanks before Wed
  })
  it('formats iso date', () => {
    expect(isoDate(new Date(2026, 6, 8))).toBe('2026-07-08')
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/lib/calendar.js`**

```js
const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december']

export function isoDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function monthGrid(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDow = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  return { monthLabel: MONTHS[month], days, todayDate: date.getDate() }
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Implement `src/components/panes/CalendarPane.jsx`**

```jsx
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
```

- [ ] **Step 6: Run tests, expect PASS**

- [ ] **Step 7: Commit**

```bash
git add src/lib/calendar.js src/components/panes/CalendarPane.jsx src/lib/calendar.test.js
git commit -m "feat: add calendar pane"
```

---

## Task 19: Links pane

**Files:**
- Create: `src/components/panes/LinksPane.jsx`
- Test: `src/components/panes/LinksPane.test.jsx`

**Interfaces:**
- Consumes: `Pane`, `config.links`.
- Produces: `<LinksPane/>` — a list of links with their alias shown on the right.

- [ ] **Step 1: Write failing test `src/components/panes/LinksPane.test.jsx`**

```jsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LinksPane } from './LinksPane.jsx'

describe('LinksPane', () => {
  it('renders each link with an href', () => {
    render(<LinksPane />)
    const gh = screen.getByRole('link', { name: /github/i })
    expect(gh).toHaveAttribute('href', 'https://github.com')
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/components/panes/LinksPane.jsx`**

```jsx
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
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components/panes/LinksPane.jsx src/components/panes/LinksPane.test.jsx
git commit -m "feat: add links pane"
```

---

## Task 20: Todo & Scratch pane

**Files:**
- Create: `src/components/panes/TodoScratchPane.jsx`
- Test: `src/components/panes/TodoScratchPane.test.jsx`

**Interfaces:**
- Consumes: `Pane`, `useLocalStorage` (Task 4).
- Produces: `<TodoScratchPane/>` — a todo list persisted under `gs.todos`
  (`[{id, text, done}]`) and a free-text scratch note under `gs.scratch`.
  Enter in the input adds a todo; clicking a todo toggles done.

- [ ] **Step 1: Write failing test `src/components/panes/TodoScratchPane.test.jsx`**

```jsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TodoScratchPane } from './TodoScratchPane.jsx'

beforeEach(() => localStorage.clear())

describe('TodoScratchPane', () => {
  it('adds a todo on Enter and toggles it done', async () => {
    render(<TodoScratchPane />)
    await userEvent.type(screen.getByPlaceholderText(/add todo/i), 'ship it{Enter}')
    const item = screen.getByText('ship it')
    expect(item).toBeInTheDocument()
    await userEvent.click(item)
    expect(item).toHaveClass('line-through')
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/components/panes/TodoScratchPane.jsx`**

```jsx
import { useState } from 'react'
import { Pane } from '../Pane.jsx'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export function TodoScratchPane() {
  const [todos, setTodos] = useLocalStorage('gs.todos', [])
  const [scratch, setScratch] = useLocalStorage('gs.scratch', '')
  const [draft, setDraft] = useState('')

  const add = (e) => {
    if (e.key !== 'Enter' || !draft.trim()) return
    setTodos((t) => [...t, { id: Date.now(), text: draft.trim(), done: false }])
    setDraft('')
  }
  const toggle = (id) => setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))

  return (
    <Pane title="todo & scratch" badge={todos.filter((t) => !t.done).length || null}>
      <input
        value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={add}
        placeholder="add todo…"
        className="mb-1 w-full bg-transparent text-[11px] text-gs-text placeholder:text-gs-dim/60 focus:outline-none"
      />
      {todos.map((t) => (
        <div key={t.id} onClick={() => toggle(t.id)}
             className={`cursor-pointer py-0.5 text-gs-text ${t.done ? 'text-gs-dim line-through' : ''}`}>
          <span className="text-gs-violet">{t.done ? '✓' : '▸'}</span> {t.text}
        </div>
      ))}
      <textarea
        value={scratch} onChange={(e) => setScratch(e.target.value)}
        placeholder="scratch…" rows={2}
        className="mt-2 w-full resize-none bg-transparent text-[10px] italic text-gs-dim placeholder:text-gs-dim/50 focus:outline-none"
      />
    </Pane>
  )
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/components/panes/TodoScratchPane.jsx src/components/panes/TodoScratchPane.test.jsx
git commit -m "feat: add todo & scratch pane"
```

---

## Task 21: Pomodoro pane

**Files:**
- Create: `src/lib/pomodoro.js`
- Create: `src/components/panes/PomodoroPane.jsx`
- Test: `src/lib/pomodoro.test.js`

**Interfaces:**
- Consumes: `Pane`.
- Produces:
  - `formatMMSS(seconds)` → `'MM:SS'`.
  - `<PomodoroPane/>` — a 25:00 countdown with start/pause/reset, driven by a
    local 1 s interval (self-contained state, no persistence needed).

- [ ] **Step 1: Write failing test `src/lib/pomodoro.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { formatMMSS } from './pomodoro.js'

describe('formatMMSS', () => {
  it('formats seconds as MM:SS', () => {
    expect(formatMMSS(1453)).toBe('24:13')
    expect(formatMMSS(0)).toBe('00:00')
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/lib/pomodoro.js`**

```js
export function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Implement `src/components/panes/PomodoroPane.jsx`**

```jsx
import { useState, useEffect } from 'react'
import { Pane } from '../Pane.jsx'
import { formatMMSS } from '../../lib/pomodoro.js'

const FOCUS = 25 * 60

export function PomodoroPane() {
  const [seconds, setSeconds] = useState(FOCUS)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds((s) => (s <= 1 ? (setRunning(false), 0) : s - 1)), 1000)
    return () => clearInterval(id)
  }, [running])

  return (
    <Pane title="pomodoro" badge="◔">
      <div className="text-2xl text-gs-text" style={{ textShadow: '0 0 12px rgba(153,102,255,.4)' }}>
        {formatMMSS(seconds)}
      </div>
      <div className="mt-2 flex gap-2 text-[10px]">
        <button onClick={() => setRunning((r) => !r)} className="text-gs-violet hover:underline">
          {running ? '❚❚ pause' : '▶ start'}
        </button>
        <button onClick={() => { setRunning(false); setSeconds(FOCUS) }} className="text-gs-dim hover:underline">
          ↺ reset
        </button>
      </div>
    </Pane>
  )
}
```

- [ ] **Step 6: Run tests, expect PASS**

- [ ] **Step 7: Commit**

```bash
git add src/lib/pomodoro.js src/components/panes/PomodoroPane.jsx src/lib/pomodoro.test.js
git commit -m "feat: add pomodoro pane"
```

---

## Task 22: News pane + RSS serverless function

**Files:**
- Modify: `package.json` (add `fast-xml-parser` runtime dep)
- Create: `api/rss.js` (Vercel serverless function)
- Create: `src/lib/news.js`
- Create: `src/components/panes/NewsPane.jsx`
- Test: `api/rss.test.js`, `src/lib/news.test.js`

**Interfaces:**
- Produces:
  - `parseRss(xml)` → `[{ title, link }]` (exported from `api/rss.js` for testing).
  - `api/rss.js` default handler: `GET /api/rss?url=<feed>` → `{ items:[{title,link}] }`.
    Rejects a missing `url` with 400. Sets a short `s-maxage` cache header.
  - `fetchNews(sources)` → `[{ title, link, source }]` (client; calls `/api/rss`
    per source, merges, caps at 3).
  - `<NewsPane/>` spans 2 columns, refreshes every 15 min.

- [ ] **Step 1: Add the parser dependency**

Run: `npm install fast-xml-parser`

- [ ] **Step 2: Write failing test `api/rss.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { parseRss } from './rss.js'

const XML = `<?xml version="1.0"?><rss><channel>
  <item><title>First</title><link>http://a/1</link></item>
  <item><title>Second</title><link>http://a/2</link></item>
</channel></rss>`

describe('parseRss', () => {
  it('extracts items from RSS', () => {
    expect(parseRss(XML)).toEqual([
      { title: 'First', link: 'http://a/1' },
      { title: 'Second', link: 'http://a/2' },
    ])
  })
  it('handles Atom <entry> feeds', () => {
    const atom = `<feed><entry><title>A</title><link href="http://x/a"/></entry></feed>`
    expect(parseRss(atom)).toEqual([{ title: 'A', link: 'http://x/a' }])
  })
})
```

- [ ] **Step 3: Run it, expect FAIL**

- [ ] **Step 4: Implement `api/rss.js`**

```js
import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })

export function parseRss(xml) {
  const doc = parser.parse(xml)
  const channelItems = doc?.rss?.channel?.item
  const atomEntries = doc?.feed?.entry
  const raw = channelItems ?? atomEntries ?? []
  const list = Array.isArray(raw) ? raw : [raw]
  return list.map((it) => {
    const title = typeof it.title === 'object' ? it.title['#text'] : it.title
    let link = it.link
    if (typeof link === 'object') link = link['@_href'] ?? link['#text']
    if (Array.isArray(link)) link = link[0]?.['@_href'] ?? link[0]
    return { title: String(title ?? '').trim(), link: String(link ?? '').trim() }
  })
}

export default async function handler(req, res) {
  const url = req.query?.url
  if (!url) { res.status(400).json({ error: 'missing url' }); return }
  try {
    const upstream = await fetch(url, { headers: { 'user-agent': 'ghost-shell/1.0' } })
    if (!upstream.ok) throw new Error(`upstream ${upstream.status}`)
    const xml = await upstream.text()
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate')
    res.status(200).json({ items: parseRss(xml).slice(0, 5) })
  } catch (err) {
    res.status(502).json({ error: String(err.message ?? err) })
  }
}
```

- [ ] **Step 5: Run tests, expect PASS** (`npx vitest run api/rss.test.js`)

- [ ] **Step 6: Write failing test `src/lib/news.test.js`**

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchNews } from './news.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchNews', () => {
  it('merges items across sources, tagging each with its source', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ items: [{ title: 'T', link: 'http://x' }] }),
    })
    const rows = await fetchNews([{ label: 'verge', url: 'http://feed' }])
    expect(rows[0]).toEqual({ title: 'T', link: 'http://x', source: 'verge' })
  })
})
```

- [ ] **Step 7: Run it, expect FAIL**

- [ ] **Step 8: Implement `src/lib/news.js`**

```js
export async function fetchNews(sources) {
  const perSource = await Promise.all(
    sources.map(async (s) => {
      const res = await fetch(`/api/rss?url=${encodeURIComponent(s.url)}`)
      if (!res.ok) return []
      const { items } = await res.json()
      return (items ?? []).map((it) => ({ ...it, source: s.label }))
    }),
  )
  return perSource.flat().slice(0, 3)
}
```

- [ ] **Step 9: Run tests, expect PASS**

- [ ] **Step 10: Implement `src/components/panes/NewsPane.jsx`**

```jsx
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchNews } from '../../lib/news.js'
import { safeHttpUrl } from '../../lib/url.js'
import config from '../../config.js'

export function NewsPane() {
  const { data, loading, error } = usePolling(() => fetchNews(config.rssSources), 15 * 60 * 1000)
  return (
    <Pane title="news" badge="rss" className="sm:col-span-2" loading={loading && !data} error={error && !data}>
      {data && data.map((n, i) => (
        <a key={i} href={safeHttpUrl(n.link, '#')} className="block py-0.5 leading-snug text-gs-text hover:text-gs-violet">
          <span className="text-[9px] text-gs-violet">{n.source}</span> — {n.title}
        </a>
      ))}
    </Pane>
  )
}
```

- [ ] **Step 11: Commit**

```bash
git add package.json package-lock.json api/rss.js api/rss.test.js src/lib/news.js src/lib/news.test.js src/components/panes/NewsPane.jsx
git commit -m "feat: add news pane with RSS serverless proxy"
```

---

## Task 23: GitHub activity pane + serverless function

**Files:**
- Create: `api/github.js` (Vercel serverless function)
- Create: `src/lib/github.js`
- Create: `src/components/panes/GithubPane.jsx`
- Test: `api/github.test.js`, `src/lib/github.test.js`

**Interfaces:**
- Env: reads `GITHUB_TOKEN` server-side only (never exposed to the client).
- Produces:
  - `flattenContributions(graphql)` → `{ total, days:[{count, level}] }`
    (exported from `api/github.js` for testing; `level` 0-4).
  - `api/github.js` handler: `GET /api/github?user=<login>` → the flattened shape.
  - `fetchGithub(user)` → same shape (client; calls `/api/github`).
  - `<GithubPane/>` spans 2 columns; renders the last 40 days as a heatmap + total.

- [ ] **Step 1: Write failing test `api/github.test.js`**

```js
import { describe, it, expect } from 'vitest'
import { flattenContributions } from './github.js'

const GQL = {
  data: { user: { contributionsCollection: { contributionCalendar: {
    totalContributions: 128,
    weeks: [
      { contributionDays: [{ contributionCount: 0, contributionLevel: 'NONE' }, { contributionCount: 3, contributionLevel: 'SECOND_QUARTILE' }] },
      { contributionDays: [{ contributionCount: 9, contributionLevel: 'FOURTH_QUARTILE' }] },
    ],
  } } } },
}

describe('flattenContributions', () => {
  it('flattens weeks into a day list with numeric levels', () => {
    const out = flattenContributions(GQL)
    expect(out.total).toBe(128)
    expect(out.days).toHaveLength(3)
    expect(out.days[0]).toEqual({ count: 0, level: 0 })
    expect(out.days[1]).toEqual({ count: 3, level: 2 })
    expect(out.days[2]).toEqual({ count: 9, level: 4 })
  })
}) 
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `api/github.js`**

```js
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 }

export function flattenContributions(gql) {
  const cal = gql.data.user.contributionsCollection.contributionCalendar
  const days = cal.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({ count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 })),
  )
  return { total: cal.totalContributions, days }
}

const QUERY = `query($user:String!){ user(login:$user){ contributionsCollection{ contributionCalendar{
  totalContributions weeks{ contributionDays{ contributionCount contributionLevel } } } } } }`

export default async function handler(req, res) {
  const user = req.query?.user
  if (!user) { res.status(400).json({ error: 'missing user' }); return }
  const token = process.env.GITHUB_TOKEN
  if (!token) { res.status(500).json({ error: 'server missing GITHUB_TOKEN' }); return }
  try {
    const gh = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { authorization: `bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { user } }),
    })
    if (!gh.ok) throw new Error(`github ${gh.status}`)
    const json = await gh.json()
    if (json.errors) throw new Error(json.errors[0]?.message ?? 'graphql error')
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate')
    res.status(200).json(flattenContributions(json))
  } catch {
    // Generic message — never echo upstream/GraphQL error text (info disclosure).
    res.status(502).json({ error: 'failed to fetch contributions' })
  }
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Write failing test `src/lib/github.test.js`**

```js
import { describe, it, expect, vi, afterEach } from 'vitest'
import { fetchGithub } from './github.js'

afterEach(() => vi.restoreAllMocks())

describe('fetchGithub', () => {
  it('returns the flattened shape from the proxy', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ total: 5, days: [{ count: 1, level: 1 }] }),
    })
    expect(await fetchGithub('cCynics')).toEqual({ total: 5, days: [{ count: 1, level: 1 }] })
  })
  it('throws on proxy error', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 502 })
    await expect(fetchGithub('x')).rejects.toThrow()
  })
})
```

- [ ] **Step 6: Run it, expect FAIL**

- [ ] **Step 7: Implement `src/lib/github.js`**

```js
export async function fetchGithub(user) {
  const res = await fetch(`/api/github?user=${encodeURIComponent(user)}`)
  if (!res.ok) throw new Error(`github ${res.status}`)
  return res.json()
}

const LEVEL_BG = ['bg-gs-violet/10', 'bg-gs-violet/30', 'bg-gs-violet/50', 'bg-gs-violet/70', 'bg-gs-violet']
export const levelClass = (level) => LEVEL_BG[level] ?? LEVEL_BG[0]
```

- [ ] **Step 8: Run tests, expect PASS**

- [ ] **Step 9: Implement `src/components/panes/GithubPane.jsx`**

```jsx
import { Pane } from '../Pane.jsx'
import { usePolling } from '../../hooks/usePolling.js'
import { fetchGithub, levelClass } from '../../lib/github.js'
import config from '../../config.js'

export function GithubPane() {
  const { data, loading, error } = usePolling(() => fetchGithub(config.githubUsername), 30 * 60 * 1000)
  const days = data ? data.days.slice(-40) : []
  return (
    <Pane title="github activity" badge="◱" className="sm:col-span-2" loading={loading && !data} error={error && !data}>
      {data && (
        <>
          <div className="grid grid-cols-20 gap-0.5" style={{ gridTemplateColumns: 'repeat(20, 1fr)' }}>
            {days.map((d, i) => <span key={i} className={`aspect-square rounded-sm ${levelClass(d.level)}`} />)}
          </div>
          <p className="mt-2 text-[10px] text-gs-dim">{data.total} contributions this year</p>
        </>
      )}
    </Pane>
  )
}
```

- [ ] **Step 10: Run tests, expect PASS**

- [ ] **Step 11: Commit**

```bash
git add api/github.js api/github.test.js src/lib/github.js src/lib/github.test.js src/components/panes/GithubPane.jsx
git commit -m "feat: add github activity pane with token-proxied serverless function"
```

---

## Task 24: Mount all panes in the final layout

**Files:**
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx` (extend)

**Interfaces:**
- Consumes: every pane (Tasks 12-23), `Grid` (Task 9).
- Produces: the full page with all 12 panes in the locked order.

- [ ] **Step 1: Extend `src/App.test.jsx`**

Add (the fetch panes will show skeletons in jsdom — that's fine; we only assert the no-fetch panes render):
```jsx
  it('mounts the config-driven panes', () => {
    render(<App />)
    expect(screen.getByText('links')).toBeInTheDocument()
    expect(screen.getByText('world clocks')).toBeInTheDocument()
    expect(screen.getByText('pomodoro')).toBeInTheDocument()
  })
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Wire panes into `src/App.jsx`**

Add imports for all 12 panes and fill the `Grid` in the locked order:
```jsx
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
```
```jsx
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
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, open the local URL. Confirm: banner + clock tick, command
bar (`gh` + Enter → GitHub), and the no-key panes show real data (weather,
crypto, HN, NASA, verse, world clocks). News + GitHub panes show "unavailable"
until `vercel dev` / deploy provides `/api` — expected. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx src/App.test.jsx
git commit -m "feat: mount all 12 panes in the final layout"
```

---

## Task 25: Load-in flair (fade-up, count-up) + reduced motion

**Files:**
- Create: `src/hooks/useReducedMotion.js`
- Create: `src/components/CountUp.jsx`
- Modify: `src/components/Grid.jsx` (staggered `gs-fade-up` on children)
- Modify: `src/components/CommandBar.jsx` (blinking cursor via `gs-blink`)
- Test: `src/components/CountUp.test.jsx`, `src/hooks/useReducedMotion.test.jsx`

**Interfaces:**
- Produces:
  - `useReducedMotion()` → `boolean` (matches `prefers-reduced-motion`).
  - `<CountUp value={number} />` — animates 0→value; renders `value` immediately
    when reduced motion is on.
  - `Grid` wraps each child so panes fade up staggered on first paint.

- [ ] **Step 1: Write failing test `src/hooks/useReducedMotion.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useReducedMotion } from './useReducedMotion.js'

describe('useReducedMotion', () => {
  it('reads the media query', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }))
    const { result } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(true)
  })
})
```

- [ ] **Step 2: Run it, expect FAIL**

- [ ] **Step 3: Implement `src/hooks/useReducedMotion.js`**

```js
import { useState, useEffect } from 'react'

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}
```

- [ ] **Step 4: Run tests, expect PASS**

- [ ] **Step 5: Write failing test `src/components/CountUp.test.jsx`**

```jsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CountUp } from './CountUp.jsx'

describe('CountUp', () => {
  it('renders the final value immediately under reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    }))
    render(<CountUp value={128} />)
    expect(screen.getByText('128')).toBeInTheDocument()
  })
})
```

- [ ] **Step 6: Run it, expect FAIL**

- [ ] **Step 7: Implement `src/components/CountUp.jsx`**

```jsx
import { useState, useEffect } from 'react'
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
```

- [ ] **Step 8: Run tests, expect PASS**

- [ ] **Step 9: Stagger pane fade-in in `src/components/Grid.jsx`**

```jsx
import { Children } from 'react'

export function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 gap-3 px-5 pb-4 sm:grid-cols-2 lg:grid-cols-4">
      {Children.map(children, (child, i) => (
        <div className="gs-fade-up contents" style={{ animationDelay: `${i * 40}ms` }}>{child}</div>
      ))}
    </div>
  )
}
```

- [ ] **Step 10: Use CountUp for the GitHub total** in `src/components/panes/GithubPane.jsx`

Replace `{data.total} contributions this year` with:
```jsx
<CountUp value={data.total} /> contributions this year
```
and add `import { CountUp } from '../CountUp.jsx'` at the top.

- [ ] **Step 11: Add the blinking cursor to `src/components/CommandBar.jsx`**

After the `<input>`, inside the flex row, add:
```jsx
        <span className="gs-blink ml-1 inline-block h-4 w-[7px] bg-gs-violet" aria-hidden />
```

- [ ] **Step 12: Run the full test suite, expect PASS**

Run: `npm test`

- [ ] **Step 13: Commit**

```bash
git add src/hooks/useReducedMotion.js src/components/CountUp.jsx src/components/Grid.jsx src/components/CommandBar.jsx src/components/panes/GithubPane.jsx src/hooks/useReducedMotion.test.jsx src/components/CountUp.test.jsx
git commit -m "feat: add load-in flair with reduced-motion support"
```

---

## Task 26: Vercel deploy config + docs

**Files:**
- Create: `.env.example`
- Create: `vercel.json`
- Create: `README.md`
- Test: build verification (command only)

**Interfaces:**
- Produces: deploy configuration and the operator runbook.

- [ ] **Step 1: Create `.env.example`**

```bash
# Server-side only (set in Vercel → Project → Settings → Environment Variables)
GITHUB_TOKEN=ghp_your_token_with_read:user_scope

# Client-exposed (optional; DEMO_KEY works out of the box)
VITE_NASA_KEY=DEMO_KEY
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "functions": { "api/*.js": { "maxDuration": 10 } }
}
```

- [ ] **Step 3: Create `README.md`**

````markdown
# ghost-shell

A terminal-style personal homepage. React 19 + Vite + Tailwind 4, deployed on Vercel.

## Develop

```bash
npm install
npm run dev        # app only (News + GitHub panes need the API — see below)
vercel dev         # app + /api serverless functions locally
npm test           # vitest
```

## Configure

Edit `src/config.js` — links, world-clock cities, crypto coins, RSS sources,
GitHub username, Bible refs, calendar agenda.

## Environment variables

| Name | Where | Purpose |
|------|-------|---------|
| `GITHUB_TOKEN` | Vercel (server) | `read:user` PAT for the GitHub pane |
| `VITE_NASA_KEY` | Vercel (build) | optional NASA key; defaults to `DEMO_KEY` |

## Deploy

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo** (framework auto-detected: Vite).
3. Add `GITHUB_TOKEN` (and optionally `VITE_NASA_KEY`) under Environment Variables.
4. Deploy. Every push to `main` redeploys.
````

- [ ] **Step 4: Verify a clean production build**

Run: `npm run build`
Expected: build succeeds, output in `dist/`, no errors.

- [ ] **Step 5: Verify lint passes**

Run: `npm run lint`
Expected: no errors (fix any oxlint findings before committing).

- [ ] **Step 6: Commit**

```bash
git add .env.example vercel.json README.md
git commit -m "chore: add Vercel deploy config and README"
```

- [ ] **Step 7: Deploy (operator step — requires the Vercel account)**

Either connect the GitHub repo in the Vercel dashboard, or:
```bash
npm i -g vercel
vercel            # first run links the project
vercel env add GITHUB_TOKEN     # paste the read:user PAT
vercel --prod
```

---

## Self-Review

**Spec coverage** — every spec pane and feature maps to a task:
- Skeleton (banner, clock, greeting, countdown, status bar) → T7, T8, T9
- Command bar (aliases, bangs, help, keyboard) → T10, T11
- Panes: Links T19 · Weather T12 · Crypto T13 · Todo&Scratch T20 · News T22 ·
  Hacker News T14 · GitHub T23 · NASA T15 · World Clocks T17 · Verse T16 ·
  Calendar T18 · Pomodoro T21 (= all 12)
- Flair (horizon glow T8, neon bloom/pulse T2+T5, fade-up/count-up/blink T25,
  reduced-motion T2+T25) → covered
- Serverless proxies (RSS, GitHub) → T22, T23
- Config-driven personalization → T3
- Deploy/env → T26
- Cut items (ISS, moon/sun, stocks, system meters) → correctly absent

**Type consistency** — verified across tasks: `usePolling` returns
`{data, loading, error, refresh}` (used identically by every pane); every pane
passes `loading={loading && !data}`; `Pane` props `{title, badge, live, loading,
error, className}` match all call sites; `flattenContributions` shape
`{total, days:[{count, level}]}` matches `fetchGithub` and `GithubPane`;
`fetchCrypto` rows `{id, label, price, change24h}` match `CryptoPane` + `fmtPrice`.

**Placeholder scan** — no TBD/TODO; every code step contains complete code and
every test step contains real assertions.

**Note for the implementer:** the Tailwind arbitrary class `grid-cols-20` in the
GitHub heatmap is backed by the inline `gridTemplateColumns` style, so it renders
correctly even though `grid-cols-20` isn't a default Tailwind utility.

