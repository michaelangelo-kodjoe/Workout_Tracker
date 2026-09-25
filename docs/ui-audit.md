# Lift Log — UI/UX audit tracker

Audit run 2026-09-24 with the `ui-ux-pro-max` skill (priority table + pro-rules pre-delivery checklist), measured in the
browser at 375 × 812 (small phone) on the real backup. Tick an item when its fix is merged; add the commit next to it.

Priority follows the skill's order: 1 Accessibility and 2 Touch are critical, 6 Typography is medium.

## Open

### 1 · Accessibility (critical)
- [ ] **Set inputs have no label.** The weight field's accessible name is its placeholder, which is the suggested weight
  ("55"), and the reps field is just "reps" — a screen reader can't tell which set or field it's on.
  Fix: `aria-label="Set 2 weight"` / `"Set 2 reps"` on each row.
- [ ] **Selected / open state isn't exposed.** The reps-left-in-tank pills have no `aria-pressed`, the day tabs and bottom
  nav tabs have no `aria-current`/`aria-pressed`, and the exercise card header has no `aria-expanded`. Visually clear,
  but a screen reader hears the same thing for selected and unselected.
- [ ] **Exercise done check has no text alternative.** The 22 px `.ex-check` circle on each exercise card header shows
  whether the exercise is finished by fill alone, with nothing for a screen reader.
- [ ] **Contrast: selected day tab subtitle** ("Heavy" under Upper) is 4.07:1 at 11 px — needs 4.5:1.

### 2 · Touch & interaction (critical)
- [ ] **Targets under 44 × 44 px** (measured):
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

  Fix: grow the hit area (padding or a transparent `::after`) rather than the visual size where the look should stay.
- [ ] **Almost no pressed feedback.** The tap highlight is switched off globally and only two `:active` rules exist
  (calendar cell, body diagram), so buttons, pills and tabs don't respond to a tap until their state changes.
  Fix: one shared `:active` treatment (opacity or background shift, ~100 ms) for buttons, pills and tabs.

### 6 · Typography & color (medium)
- [ ] **11 px text carries key information.** The exercise target and weight suggestion ("3 x 6-10 · try 55 lb"),
  e1RM, group headers, day-tab subtitles, bottom-nav labels and calendar tags are all 11 px; the skill's floor is 12 px.
  Fix: raise the 11 px tier to 12 px, and the target/suggestion line to ~13 px.
- [ ] **No `color-scheme: dark`.** The app is dark-only, but without declaring it native controls (select menu,
  checkbox, number spinners, scrollbars) can render with light system styling.

### 7 · Animation (medium)
- [ ] **Reduced motion misses the exercise demo animation.** `prefers-reduced-motion` covers the glow pulse, check pop
  and confetti, but the demo GIF frame flip (`exgifFlip`) keeps running.

## Passed
- No emoji used as icons; bottom nav and controls use SVG.
- Every interactive control has an accessible name (set ✓ / ✕ have `aria-label`s and `aria-pressed`).
- No horizontal scroll at 375 px; pinch-zoom allowed; inputs held at 16 px on touch so iOS doesn't zoom on focus.
- Safe-area insets respected on the sticky header and fixed footer; log content has bottom padding to clear the rest
  timer and footer.
- Global `:focus-visible` ring; strength charts are keyboard-scrubbable with labels.
- All other measured text clears 4.5:1 on the dark theme.

## Not audited yet
- Sheets: swap, block review, fatigue warning, celebration, onboarding / program builder.
- Landscape, tablet width, and largest system text size.
