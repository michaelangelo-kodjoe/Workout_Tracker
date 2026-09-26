# Lift Log — UI/UX audit tracker

Audit run 2026-09-24 with the `ui-ux-pro-max` skill (priority table + pro-rules pre-delivery checklist), measured in the
browser at 375 × 812 (small phone) on the real backup. Tick an item when its fix lands; add the commit next to it.

Priority follows the skill's order: 1 Accessibility and 2 Touch are critical, 6 Typography is medium.

## Open

### 1 · Accessibility (critical)
- [x] **Set inputs have no label.** — `2c31577` The weight field's accessible name is its placeholder, which is the suggested weight
  ("55"), and the reps field is just "reps" — a screen reader can't tell which set or field it's on.
  Fix: `aria-label="Set 2 weight"` / `"Set 2 reps"` on each row.
- [x] **Selected / open state isn't exposed.** — `2c31577` The reps-left-in-tank pills have no `aria-pressed`, the day tabs and bottom
  nav tabs have no `aria-current`/`aria-pressed`, and the exercise card header has no `aria-expanded`. Visually clear,
  but a screen reader hears the same thing for selected and unselected.
- [x] **Exercise done check has no text alternative.** — `2c31577` The 22 px `.ex-check` circle on each exercise card header shows
  whether the exercise is finished by fill alone, with nothing for a screen reader.
- [x] **Contrast: day tab subtitles** — `517bf73`. Re-measured with the tab's layered backgrounds, the *unselected*
  tabs' subtitle was the failure (3.47:1, --text-dim at 75% opacity); the selected tab's was 7.7:1. Now 5.1:1.
- [x] **Workout editor's ↔ ↑ ↓ ✕ had no names** (found in the second pass, below) — `cb6d171`.

### 2 · Touch & interaction (critical)
- [x] **Targets under 44 × 44 px** — `16b5795`. First pass (measured):
  | Control | Size |
  |---|---|
  | reps-left-in-tank pills | 31–39 × 29 |
  | fixed-weight-bar checkbox (with its label) | 103 × 19 |
  | bar-weight select | 121 × 29 |
  | day "edit" link | 19 × 37 |
  | "reset" link (log view) | 343 × 13 |
  | how to / swap links | 33–38 × 37 |
  | remove-set ✕ | 32 × 44 |
  | + add a set | 53 × 37 |
  | recovery "details" toggle | 317 × 37 |
  | bodyweight input / Log button | 90 × 35 / 91 × 40 |
  | calendar ‹ arrow / day cells | 39 × 40 / 42 × 42 |

  Second pass hit-tested all 140 controls with each scrolled into view, including Settings and the cardio log, which
  the first pass missed: the editor's ↔ ↑ ↓ ✕ (7–15 px wide), every settings field (35–37 px), the checkbox labels
  (19 px), the cardio type chips (38 px) and effort dots (26 × 40). All now reach 44 × 44 and none takes taps from a
  neighbour. **Exception:** the ten effort dots stay 26 px wide (ten across a phone can't be 44) and reach 44 tall.
  Trade-off: 44 px editor buttons wrap longer exercise names onto two lines.
- [ ] **Almost no pressed feedback.** The tap highlight is switched off globally and only two `:active` rules exist
  (calendar cell, body diagram), so buttons, pills and tabs don't respond to a tap until their state changes.
  Fix: one shared `:active` treatment (opacity or background shift, ~100 ms) for buttons, pills and tabs.

### 6 · Typography & color (medium)
- [x] **11 px text carries key information.** — `251bc56` (six-step scale: 12 · 13 · 15 · 17 · 22 · 32; 11 px kept only
  for uppercase letter-spaced labels and the calendar's plan tags). The exercise target and weight suggestion ("3 x 6-10 · try 55 lb"),
  e1RM, group headers, day-tab subtitles, bottom-nav labels and calendar tags are all 11 px; the skill's floor is 12 px.
  Fix: raise the 11 px tier to 12 px, and the target/suggestion line to ~13 px.
- [ ] **No `color-scheme: dark`.** The app is dark-only, but without declaring it native controls (select menu,
  checkbox, number spinners, scrollbars) can render with light system styling.

### 7 · Animation (medium)
- [ ] **Reduced motion misses the exercise demo animation.** `prefers-reduced-motion` covers the glow pulse, check pop
  and confetti, but the demo GIF frame flip (`exgifFlip`) keeps running.

### Spacing & layout (from the ui-styling pass, 2026-09-25 — mockups approved)
- [x] **Exercise card rebuilt** — `f87c08c`: How to · Swap · Demo segmented bar, bar-weight chip, centred column heads,
  dashed + Add set, 16 px padding.
- [x] **Text actions: one look per role** — `0f94dde`.
- [x] **Home spacing and copy** — `b5910d6`: greeting no longer repeats the recovery text, equal-height day cards,
  24 px between sections, readiness un-nested.
- [x] **Spacing rhythm** — `251bc56`: 16 px card padding, 12 px between cards, 8 px corners, checkboxes on the text edge.
- [ ] **Emoji as an icon:** the session-complete badge uses 💪 (the audit missed it — it only shows on the celebration
  screen). Swap for an SVG to match the rest of the app.

## Passed
- No emoji used as icons; bottom nav and controls use SVG.
- Every interactive control in the log, home, history and strength views has an accessible name.
- No horizontal scroll at 375 px; pinch-zoom allowed; inputs held at 16 px on touch so iOS doesn't zoom on focus.
- Safe-area insets respected on the sticky header and fixed footer; log content has bottom padding to clear the rest
  timer and footer.
- Global `:focus-visible` ring; strength charts are keyboard-scrubbable with labels.
- All other measured text clears 4.5:1 on the dark theme.

## Not audited yet
- Sheets: swap, block review, fatigue warning, celebration, onboarding / program builder.
- Landscape, tablet width, and largest system text size.
