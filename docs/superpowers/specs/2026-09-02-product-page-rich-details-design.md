# Product page — rich details & accordions

**Date:** 2026-09-02
**Status:** Approved
**Scope:** Right sticky info card of `sections/product.liquid`, plus one new modal snippet. Extends the 2026-08-28 product page spec (media grid + sticky info card), which remains in force.

## 1. Carbon Footprint badge

- Position: directly beneath the price inside `.product-info`.
- Style: understated mono pill — `var(--font-mono)`, `0.6875rem`, medium, uppercase, `1px` border `color-mix(in srgb, var(--color-foreground) 12%, transparent)`, rounded-full, `0.25rem 0.625rem` padding, leaf icon `🌱`.
- Text: `Carbon Footprint: {{ value }}`.
- Value resolution: `product.metafields.custom.carbon_footprint` → section setting `carbon_footprint_default` (default `"5.4 kg CO2e"`). Hidden entirely when section setting `show_carbon_footprint` is off or resolved value is blank.

## 2. Size Guide modal

- Trigger: underlined mono link-button `Size Guide` on the right side of the `Size` option legend (flex row header), `@click="$store.ui.sizeGuideOpen = true"`, `aria-haspopup="dialog"`.
- State: `sizeGuideOpen: false` added to `Alpine.store('ui')` (`assets/alpine-stores.js`); reset in `closeAll()`.
- Snippet: `snippets/size-guide-modal.liquid`, rendered in `layout/theme.liquid` next to `cart-drawer` / `cart-pop`.
- Behavior: backdrop fade + centered dialog scale transitions, close on backdrop click / ESC / close button.
- Content: "Runs true to size / size up for half sizes or wider feet" fit tip callout; Men's / Women's pill tab toggle; conversion tables (US, cross-gender US, UK, EU, CM foot length — men 8→14, women 5→11); footer line about the 30-day free return trial.
- Styles: `assets/custom.css` (`.size-guide-modal*`), matching cart-drawer/cart-pop language: 1rem radius card, mono uppercase header accents, 1px `color-mix` dividers, sticky table header, scrollable table area, max-width 580px.

## 3. Product accordions

- Placement: inside `.product-info` below the shipping note; thin `1px` top divider, per-item bottom dividers.
- Implementation: section blocks `type: "accordion"` in `sections/product.liquid` (section-blocks, not `@theme` blocks). Each renders independently with `x-data="{ isOpen: <default_open> }"` and `{{ block.shopify_attributes }}`.
- Independent toggles (opening one does not close others).
- Animation: CSS grid rows `0fr → 1fr` on `.product-accordion__collapse` with `.is-expanded` class; chevron SVG rotates 180°.
- Header: full-width button, mono uppercase `0.75rem` title, chevron right.
- Content resolution order per block: `product.metafields.custom[block.settings.metafield_key]` → `block.settings.page_content.content` → `block.settings.content` (richtext). Render only when title and resolved content are both non-blank.
- Block settings: `title` (text), `content` (richtext), `page_content` (page), `metafield_key` (text), `default_open` (checkbox, default false).
- Section settings added: `show_carbon_footprint` (checkbox, default true), `carbon_footprint_default` (text, default `"5.4 kg CO2e"`). Existing `shipping_note` retained.
- Presets: 4 default blocks — Highlights, Materials & Sustainability, Care Guide, Shipping & Free Returns (Allbirds copy: SweetFoam®, ZQ Merino / FSC eucalyptus fiber, castor-bean insole foam, recycled PET laces, machine-wash cold + air dry, free shipping over $100, 30-day trial).
- `templates/product.json` updated with the same 4 blocks under `"blocks"` / `"block_order"` so existing templates render them immediately.

## 4. Info card flow (approved)

Title → Price → Carbon badge → Color swatches → Size pills (+ Size Guide trigger) → Description → Add to cart → payment button → shipping note → accordions.

## Files

| File | Change |
|------|--------|
| `assets/alpine-stores.js` | Add `sizeGuideOpen` to ui store + `closeAll()` |
| `snippets/size-guide-modal.liquid` | Create — modal with tabs + tables |
| `assets/custom.css` | Append `.size-guide-modal*` styles |
| `layout/theme.liquid` | Render `size-guide-modal` |
| `sections/product.liquid` | Carbon badge, size-guide trigger, accordions markup + `{% stylesheet %}` + schema |
| `templates/product.json` | Default accordion blocks + settings |

## Out of scope (later passes)

Mobile sticky add-to-cart bar, reviews, "You May Also Like", quantity picker, "Also available in" cross-links.
