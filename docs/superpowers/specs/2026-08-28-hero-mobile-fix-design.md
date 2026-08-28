# Hero Slider — Mobile Fix Design

**Date:** 2026-08-28
**Status:** Approved
**Scope:** `sections/hero-slider.liquid` only (existing `@media (max-width: 640px)` block + progress-bar base styles). Desktop layout, Alpine logic, schema, and image settings unchanged.

## Problem

On mobile the hero forces desktop 16:9 images into a 9:16 portrait frame with
`object-fit: cover`, so only ~32% of the image width is visible — subjects get
chopped off. The hero also occupies nearly the full viewport (`100svh`), the
progress bars jump to an unusual top position, and the overlay panel carries an
oversized 3.5rem bottom padding.

Constraint: **CSS-only** — no separate mobile image assets exist; the existing
16:9 desktop images must look good as-is.

## Approved design

### 1. Frame geometry
- Mobile `aspect-ratio: 9/16` → `4/5`.
  - On a 390px-wide phone: hero ≈ 366×458px (~54% of viewport height instead of ~100%).
  - Visible image width rises from ~32% → ~45%.
- Keep `max-height: 100svh` (harmless safety), keep inset rounded-card look
  (`margin: 0.75rem`, `border-radius: 0.75rem`) to match the site's card language.

### 2. Overlay text panel
- Stays bottom-anchored with the same bottom-up gradient (gradient stops unchanged).
- Padding: `1.5rem 1.25rem 3.5rem` → `1.25rem 1.25rem 3rem`; the 3rem bottom
  padding clears the progress bars relocated beneath the panel.
- Buttons unchanged: side-by-side, `flex: 1`, full-width pair.

### 3. Progress bars — back to the bottom + tap-target fix
- Delete the mobile override that pins them to the top; they inherit the desktop
  placement (`bottom: 1.25rem`), sitting below the text panel.
- Tap target: buttons currently render 3px tall (nearly untappable). Grow the
  button to 23px tall while keeping the visual bar 3px via
  `padding: 10px 0` + `background-clip: content-box` on both the track button
  and the fill span. Applies to desktop too (same 3px visual, larger hit area).

### 4. Explicitly unchanged
- No new schema settings, no JS changes, no image/`sizes`/`widths` changes,
  desktop 16:9 layout and Ken Burns animation identical.

## Implementation notes

- The CSS lives in the section's `{% stylesheet %}` tag — served by Shopify
  directly; **no Tailwind build step is involved**.
- `background-clip: content-box` + scaleX transforms interact safely: the
  transform scales width only, and the symmetric vertical padding keeps the
  3px bar vertically centered under `transform-origin: left center`.
- Verification: visual check at 390px viewport via `shopify theme dev`;
  no test infrastructure exists in this repo.

## Alternatives considered

1. **16:9 landscape mobile frame** — zero horizontal crop but compact/editorial,
   risks vertical cropping of subjects; less immersive than the portrait pattern.
2. **Keep 9:16 + per-slide focus settings** — keeps full immersion but still a
   narrow strip, manual tuning per image, more schema surface.
3. **Art direction via `<picture>` + mobile image settings** — best long-term
   quality, but rejected for now: no mobile assets available (CSS-only constraint).
