# Collections page — product grid + Allbirds-style filter bar

**Date:** 2026-08-28
**Status:** Approved
**Depends on:** Product card design from the Product Slider section.

## Goal

Replace the bare stock collection page with: Allbirds-style filter bar (desktop bar / mobile pill), the shared product card in a responsive grid, filter + sort drawer, Load More pagination.

## Files

| File | Change |
|------|--------|
| `snippets/product-card.liquid` | **New** — shared card markup (color option resolution, badge, media, title, colorway, swatch + price). Accepts `product`. |
| `assets/custom.css` | **New** — product card visual styles (moved from the slider section so both pages share them). Linked in `theme.liquid`. |
| `layout/theme.liquid` | Add `custom.css` link after `application.css`. |
| `sections/product-slider.liquid` | Render `product-card` snippet; keep only slider-specific card sizing (flex/width/snap) scoped under `.product-slider`; remove duplicated card CSS. |
| `sections/collection.liquid` | Full rewrite — header, filter bar, grid, drawer, empty state. |
| `assets/theme.js` | Append `CollectionFacets` custom element. |

## Filter bar

- **Desktop (≥768px)**: full-width bar (bg = 5% foreground mixed into page background, radius 1.25rem). Left: circular outlined sliders-icon button + "FILTER" + "(N products)" count. Right: white pill sort dropdown (chevron) listing `collection.sort_options`, current = `collection.sort_by | default: collection.default_sort_by`.
- **Mobile (<768px)**: single outlined pill "FILTER AND SORT" (icon + chevron) opening the drawer. Bar count hides on mobile (count shows in drawer header).

## Drawer

Left-side full-height Alpine drawer (mirrors cart-drawer mechanics, local `x-data="{ drawerOpen: false }"` on the section root — no global store). Contents:

- Header: "Filter And Sort" + close button.
- Sort group: all `collection.sort_options` as selectable rows (current highlighted).
- One accordion group per `collection.filters` entry:
  - `type == "list"`: checkbox per `filter.values` entry — `value.param_name`/`value.value`, label + `value.count`, pre-checked from `value.active`.
  - `type == "price_range"`: min/max number inputs named per `filter.min_value.param_name` / `filter.max_value.param_name`, placeholder 0 / `filter.range_max | money_without_currency`, "Apply" button.
- Footer: "Clear all" link to `collection.url`.

Checkbox changes apply instantly; price applies on Apply. Filters come entirely from Shopify Search & Discovery (merchant-configured) — nothing hardcoded.

## Mechanics (`CollectionFacets` in theme.js)

- On checkbox change / Apply / sort click: serialize all controls into `URLSearchParams` (checked boxes = param/value pairs, price inputs, `sort_by`), `history.pushState`, fetch `path?params&section_id=<id>`, parse with `DOMParser`, swap grid innerHTML, update count text + sort label + next-page URL from the fetched copy.
- `popstate` → re-fetch (back button works).
- **Load More**: grid carries `data-next-url` from `paginate.next.url`; click fetches that URL + `section_id`, appends parsed grid children, updates/removes `data-next-url`; button hidden when no next page.
- Grid container has no Alpine directives inside (plain card links) so innerHTML swaps are safe without `Alpine.initTree`; drawer/bar Alpine state lives outside the swapped node.
- 24 products per page.

## Grid

2 columns mobile (gap 0.75rem) → 3 (≥768px) → 4 (≥1024px), `padding-inline: var(--page-margin)`. Empty result → message + "Clear filters".

## Merchant follow-up

Configure filters in Shopify admin → Search & Discovery; enable the collection template's filters as desired. Sort options are native.

## Out of scope

Infinite scroll, saved filter state beyond URL, per-collection sort overrides.
