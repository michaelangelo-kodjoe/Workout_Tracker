# Lift Log

A mobile-first workout tracker for a 4-day Upper/Lower lifting split plus conditioning work. It's a single self-contained `index.html` — no build step, no framework, no backend. Open the file (or visit the hosted page) and it just works.

**Live app:** https://michaelangelo-kodjoe.github.io/Workout_Tracker/ — installable to your home screen (Add to Home Screen / Install app), and works offline once installed.

## What it does

- **Onboarding**: first-time users get a short welcome flow — name, optional body weight, and an intro to the recovery map — before landing on Home.
- **Home**: a personalized greeting, a program builder that generates your 4-day split based on the equipment you have, and a recovery map showing which muscles are ready to train.
- **Log**: today's workout — set-by-set logging, suggested weights based on your history, swappable exercises, and automatic exercise rotation so lifts refresh themselves every few sessions instead of going stale. Also where conditioning (cardio) sessions are logged.
- **History**: a log of past sessions with weekly trends.
- **Strength**: progress tracking — overall strength, separate Upper/Lower strength trends, body weight, and per-exercise history.
- **Settings**: rest timer preferences, exercise rotation preferences, workout editing, and backup/restore of your data.

## How data works

Everything is stored **locally on the device** — there's no backend and no sync. Use **Settings → Your data** to export/import a backup; that's the only way to move data between devices or survive clearing browser data.

## Tech notes

The app itself is a single file, plain HTML/CSS/JS, no dependencies or build tooling — keep changes consistent with that style unless a rewrite is explicitly requested. A few small supporting files make it installable as a PWA: `manifest.json`, `sw.js` (offline app-shell caching), and the icon PNGs — these can't be inlined into `index.html` since browsers require them as separate same-origin files.

## Running locally

Just open `index.html` in a browser — no server or install step needed:

```bash
open index.html
```

## Deployment

This repo is hosted on GitHub Pages, served from the `main` branch. Pushing changes to `main` updates the live site directly — there's no separate build or deploy step.
