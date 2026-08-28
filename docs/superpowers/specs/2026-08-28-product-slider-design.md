# Product Slider — "Best Sellers" section

**Date:** 2026-08-28
**Status:** Approved
**Approach:** Native scroll-snap + vanilla JS custom element (no new libraries; Web Awesome considered and declined — its engine IS scroll-snap, and its overlay nav doesn't match the target design).

## Target

Allbirds "BEST SELLERS" carousel: mono underlined label top-left, circular prev/next arrows top-right, horizontally scrolling product cards with the last card cut by the viewport edge. Cards: beige background, NEW pill badge, centered contain-fit product image, mono uppercase title, colorway subtitle, footer row with color swatch (left) + price (right).

## Files

| File | Change |
|------|--------|
| `sections/product-slider.liquid` | **New** — section markup, CSS, schema |
| `assets/theme.js` | **Append** — `<product-slider>` custom element |

No changes to `templates/index.json` (user adds the section via the theme editor preset), no new dependencies, no Tailwind rebuild (section stylesheet is Shopify-served).

## Schema

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `collection` | `collection` | — | Source collection for the cards |
| `heading` | `text` | `Best Sellers` | Section label |
| `products_to_show` | `range` 4–12 | `8` | Card count |
| `card_background` | `color` | `#F2EEE9` | Card background |

Presets: `Product Slider`. Empty collection → placeholder in editor, nothing on the storefront.

## Card data mapping

- **Badge `NEW`**: rendered when product has tag `new` (case-insensitive; merchant tags products).
- **Image**: `product.featured_image`, `object-fit: contain` in a 1:1 media box.
- **Title**: `product.title`, mono uppercase.
- **Colorway**: first option named color/colour → native `option_value.name`; fallback to `variant.options[index]`; hidden if absent.
- **Swatch**: native `option_value.swatch.color` → `.swatch.image` → fallback first variant image; hidden if nothing.
- **Price**: `product.price | money`, mono.

## Slider mechanics

- Root custom element `<product-slider>` with `full-width` class (bleeds past the `.shopify-section` content column).
- Scroller: `display: flex`, `overflow-x: auto`, `scroll-snap-type: x mandatory`, `scroll-behavior: smooth`, hidden scrollbar, `padding-inline`/`scroll-padding-inline-start` = `var(--page-margin)`.
- Card width via `--ps-pv` (cards per view): 1.3 (mobile) / 2.4 (≥640px) / 3.7 (≥1024px) — produces the "last card cut" peek at every breakpoint. Width: `calc((100% - var(--page-margin) - (var(--ps-pv) - 1) * var(--ps-gap)) / var(--ps-pv))`.
- Header arrows scroll by exactly one card (card width + gap); disabled state synced to scroll position on `scroll`/`resize`; both disabled when content fits.
- JS is a self-contained custom element (`connectedCallback` wires buttons + listeners, `disconnectedCallback` cleans up) — survives Section Rendering API re-renders via automatic custom element upgrade.

## A11y

Scroller is `role="region"` with `aria-label` from the heading; arrows have `aria-label`s; `:focus-visible` ring on arrows and cards; badge/swatch `aria-hidden`.

## Out of scope

Loop/infinite scroll (target doesn't loop), autoplay, pagination dots, desktop mouse-dragging (arrows + touch are the interaction model; can be added later).
