# Footer Layout Redesign — Allbirds-style split layout

**Date:** 2026-08-28
**Status:** Approved
**Supersedes (layout only):** `2026-07-24-footer-design.md` — settings, block schema, form logic, and mobile accordion behavior from that spec are preserved.

## Motivation

The current footer stacks centered blocks (newsletter → divider → columns → centered social). The target is Allbirds' layout: a left newsletter zone, link columns on the right in one seamless dark zone, and FOLLOW THE FLOCK + social icons bottom-left.

## Scope

| File | Change |
|------|--------|
| `sections/footer.liquid` | Markup restructure + CSS rewrite for the top zone (newsletter, columns, social). Schema unchanged. |
| `blocks/footer-column.liquid` | Mono heading style, hover-slide removed, blank heading → headerless column. Schema unchanged. |
| `sections/footer-group.json` | **Unchanged** — merchant assigns menus/social URLs in the theme editor. |

## Layout

Desktop (≥768px) — CSS grid, named areas (columns cell spans both rows; social pinned to bottom-left):

```
+---------------------------------------------------------------+
| SUBSCRIBE TO OUR EMAILS     |  HELP        SHOP      COMPANY  |
| [ white pill ....... SIGNUP]|  link        link      link      |
|                             |  link        link      link      |
| FOLLOW THE FLOCK            |  (headerless 4th col possible)   |
| (o) (o) (o)                 |                                  |
+------------------------------- elevated bottom bar ------------+
| © 2026 Regard Moderne        legal links      [payment icons] |
+---------------------------------------------------------------+
```

- `.site-footer__main`: `grid-template-columns: minmax(280px, 2fr) 3fr`, areas `"newsletter columns" / "social columns"`, content max-width 80rem.
- Mobile: single column in DOM order — newsletter → columns (Flowbite accordions) → social → bottom bar. (DOM order = newsletter, columns, social; named areas only exist on desktop, so mobile auto-places in DOM order.)

## Styling

- **Labels** (newsletter heading, social heading, column headings): `var(--font-mono, ui-monospace, monospace)`, 0.75rem, uppercase, letter-spacing 0.15em, weight 500 — matches the hero eyebrow.
- **Newsletter pill**: filled — background `var(--footer-text)`, text `var(--footer-bg)`; SIGN UP is plain bold uppercase text inside the pill (arrow icon removed); accent color kept for `:focus-within` ring; placeholder at 45% opacity.
- **Social**: circular 48px icon buttons (unchanged) left-aligned under the label; accent hover kept.
- **Column links**: opacity 0.6 → 1 on hover; translateX slide removed.
- **Headerless column**: when a `footer-column` block's heading is blank, the toggle button and heading are skipped (links only) — enables the "Our Blog / Patents" pattern.
- **Removed**: centered newsletter/social sections, the divider between newsletter and columns (`__blocks-wrap`).

## Unchanged

Brand statement (optional), `{% form 'customer' %}` + Alpine success/error handling, mobile Flowbite accordion mechanics, elevated bottom bar (© + legal + payment icons), 2rem top corner radius, all section/block schema.

## Merchant follow-up (outside code)

Assign menus to the Help/Shop/Company columns and social URLs in the theme editor; links/icons don't render until set.

## Alternatives considered

- New `footer-v2` section + group JSON switch — preserves old footer live, but duplicates maintenance; git history is the rollback. Rejected.
- Fully composable block-based footer — newsletter form is section-level logic; over-engineering. Rejected.
