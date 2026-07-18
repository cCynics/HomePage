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
