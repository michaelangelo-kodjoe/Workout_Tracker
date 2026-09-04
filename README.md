# Lift Log

A mobile-first workout tracker for a 4-day Upper/Lower lifting split plus conditioning work. It's a single self-contained `index.html` — no build step, no framework, no backend. Open the file (or visit the hosted page) and it just works.

**Live app:** https://michaelangelo-kodjoe.github.io/Workout_Tracker/

## What it does

The app has four tabs (**Log**, **History**, **Strength**, **More**), plus a 5th day-tab for **Cardio** inside the Log view.

### Log — today's workout

- **Program**: 4 lifting days — Upper Heavy, Lower Heavy, Upper Volume, Lower Volume — each with its own exercise list, grouped by body part (Chest, Back, Shoulders, Arms, Forearms, Quads, Hamstrings, Calves, Core). A 5th tab, **Cardio**, swaps the exercise list for a conditioning-session logger instead.
- **Set logging**: each exercise expands to a small grid — set number, weight, reps, and a checkbox per set. Checking a set marks it done and (if enabled) auto-starts the rest timer. You can add extra sets on the fly with "+ add a set".
- **Suggested weight**: every exercise shows "try _N_ lb" next to the rep target. The suggestion comes from `suggestWeight()`: it looks at your last logged sets for that exercise, and if you hit the *top* of the prescribed rep range on every set, it suggests one weight increment (`step`) higher; otherwise it suggests holding at the same weight. Bodyweight exercises (`start: 0`) show "bodyweight" instead, and exercises with no starting weight yet (`start: -1`) prompt you to find a working weight.
- **How-to cue**: an expandable form-cue panel with written coaching notes for the movement.
- **Watch demo**: a link that opens a YouTube search for "\<exercise name> exercise form" (no embedded video, just a search link).
- **Swap ↔**: opens a bottom sheet of same-muscle-group alternatives — pulled from a built-in exercise library (`ALTS`, organized by body part) plus any matching exercises from other days in the default program. You can swap in an alternative, restore the original, or rename the slot entirely (keeps the same target/muscles, just changes the display name — useful for "my gym's machine is a different brand").
- **Plateau flag**: if an exercise's estimated 1-rep-max hasn't improved by more than 1% across its last 3 logged sessions, it gets a "plateau" badge and a tip suggesting a deload or a rep-range change.
- **Recovery map**: an original hand-drawn SVG figure (front + back) that recolors each muscle red → amber → green based on estimated hours since it was last worked, scaled by what fraction of the planned sets you actually completed. A text list below the figure shows exact hours remaining per muscle. Recovery windows are ~36h (abs), ~48h (shoulders/arms/calves), ~72h (chest/back/legs/lower back), scaled down for Volume days (`factor: 0.85`).
- **Rest timer**: shown in the footer once a set is checked. Default 90s (configurable in More), with a "+30s" and "skip" control, a countdown bar, and a beep + vibration when it hits zero.
- **Finish session**: "mark session complete" logs the session — writes per-exercise history (for the Strength tab), updates the recovery map, and bumps the session counter. The button becomes "session complete — log it" once every set on the page is checked.

### Cardio (inside Log)

A separate logging form for conditioning work — pick a type (**Zone 2** steady state, **Intervals/HIIT**, or a **short finisher** circuit), each with its own description and how-to cue. Log duration, optional distance, RPE (1–10), and notes. No suggested progression here — conditioning is tracked in aggregate on the Strength tab instead.

### History

- Sessions in the **last 7 days** (vs. a 4-session target) and **last 30 days**, with an 8-week sparkline of weekly session counts.
- Conditioning minutes logged **this week** (2–3 sessions/week target).
- A reverse-chronological list of every past session. Lifting sessions expand to show every exercise, weight, and rep logged that day; cardio sessions show type, duration, distance, RPE, and notes inline.

### Strength

- **Overall strength vs. where you started**, shown as a plain percentage (no 1RM jargon) — averaged across every exercise you've logged.
- **Big lifts** sub-score (press, row, pulldown, shoulder press, leg press) tracked the same way.
- **Strength per lb of body weight**: (current big-lift total ÷ current body weight) vs. (starting big-lift total ÷ starting body weight) — rewards getting stronger without just getting bigger.
- **Body weight log**: quick "log today" input plus a sparkline and delta since your first entry.
- **Conditioning card** (only shown once you've logged cardio): weekly minutes trend, average RPE trend (dropping RPE at the same output = real improvement), and pace trend (minutes per mile/km) if you've logged distance.
- **Per-exercise rows**: current level (%), change since baseline, best set ever logged, sessions logged, a plateau badge, and a sparkline of estimated 1RM over time.

Strength math: estimated 1RM uses Epley's formula (`w * (1 + r/30)`, or just `w` for a 1-rep set) via `e1rm()`. The "baseline" is either a seeded first session (built into the default program so a level shows before you've logged anything) or your first real logged session; "current" is your most recent logged session for that exercise.

### More

- **Rest timer settings**: default duration (60/90/120/150/180s) and whether it auto-starts when a set is checked.
- **Edit workouts**: reorder (↑/↓), rename/swap (↔), or remove (✕) any exercise in any day; add a brand-new exercise (name, group, target rep range, starting weight, weight increment, muscles worked, optional cue); reset any day back to the default program (your logged history is kept).
- **Your data**:
  - **Export backup** — downloads a JSON file of everything (program, history, sessions, body weight, settings).
  - **Import backup** — restores from a previously exported file (validates it's a Lift Log backup first).
  - **Auto-backup** — if enabled, automatically downloads a backup after you finish a session, but only if it's been 7+ days since the last one. A banner also appears at the top of the Log tab when a backup is due.
  - **Erase everything** — wipes all local data after two confirmation prompts.

## How data works

Everything is stored **locally on the device** — there is no backend and no sync. The `store` object (top of the `<script>` block) uses `localStorage` when it's available, falls back to the browser's `IndexedDB` if it's not, and falls back to an in-memory object as a last resort (the app still functions, but nothing survives a page reload).

The **More → Your data** panel tells you which mode is active. Because storage is device-local, exporting a backup periodically (or enabling auto-backup) is the only way to move data between devices or survive clearing browser data.

## Tech notes

- Single file: `index.html` — HTML, CSS, and JS all inline, no dependencies, no build step.
- The dark theme, serif headlines, and monospace numerals are defined as CSS custom properties at the top of the `<style>` block (`:root`) — change colors there.
- The front/back muscle figures are original inline `<svg>` paths (not copyrighted artwork), tagged with `data-m="<muscle>"` so `renderBody()` can recolor them.
- `DEFAULT_PROGRAM` holds the 4-day split; `ALTS` holds the swap-alternatives library; both are plain JS arrays/objects near the top of the script, easy to hand-edit if you'd rather change the program in code than through the More tab editor.
- No React/Vue/build tooling by design — keep changes to plain DOM calls consistent with the existing style unless a rewrite is explicitly requested.

## Running locally

Just open `index.html` in a browser — no server or install step needed:

```bash
open index.html
```

## Deployment

This repo is hosted on GitHub Pages, served from the `main` branch. Pushing changes to `main` updates the live site directly — there's no separate build or deploy step.
