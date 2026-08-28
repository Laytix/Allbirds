# Product page — media grid + sticky info card

**Date:** 2026-08-28
**Status:** Approved
**Scope:** Top section of the product page only (media + info card). Info/accordion/recommendation zones come later.

## Layout

Desktop (≥1024px): 2-col grid — media card left (`minmax(0, 1.6fr)`), info card right (`clamp(320px, 30vw, 420px)`), `align-items: start`. Info card `position: sticky; top: 5.5rem` (clears the fixed navbar) — pins while media scrolls, releases at media end. Mobile: stacked, info not sticky. Page root gets `padding-top: 5.5rem` (navbar clearance, no banner pattern).

## Media card

- White rounded card (1rem radius, site card language), inner padding 0.75rem, tile gap 0.75rem.
- Tile 1 (hero): first product image, aspect 1/1, NEW badge when product is tagged `new` (same badge style as cards).
- Remaining images: 2-column grid of 1:1 tiles — 3 images → 1+2, 5 images → 1+2×2 (always even; other counts render gracefully).
- Images `object-fit: contain` on a 4%-tinted zone — safe for any asset on the white card.
- Eager-load hero (LCP), lazy tiles.

## Info card

White rounded card, `2rem` padding: title (1.5rem+ bold) → price (mono, updates with variant) → option groups → description → add-to-cart → dynamic payment button.

**Option groups** (from `product.options_with_values`):
- Option with native swatches OR named color/colour → **swatch dots** (same swatch source as cards; selected value shown in the group label).
- All other options → **pill rows** (rounded-rect pills like Allbirds size pills; selected = inverted fill; unavailable values (no variant available with that value) = disabled + strikethrough).
- Radios-in-fieldsets semantics (Horizon pattern): visually hidden inputs inside styled labels; hidden `<select name="id">` keeps the form functional without JS (server preselects `selected_or_first_available_variant`).
- Server prechecks only the color option's selected value → non-color groups start unselected ("Select size" state, like Allbirds).

**Button**: full-width pill. States: `Select {option}` (disabled, when incomplete) → `Sold out` (disabled, when matched variant unavailable) → `Add to cart` → `Added ✓` (2s, after success).

**Add to cart**: submit intercepted → `POST /cart/add.js` → `Alpine.store('cart').fetch()` → `ui.cartDrawerOpen = true`.

## State (`productForm` Alpine.data component in alpine-stores.js)

- Variant list serialized server-side into `<script type="application/json" data-product-variants>` — `{ id, options[], available, price (money-formatted string) }`.
- `options` map updated from radio `@change`; `resolve()` finds the variant matching ALL selected options (only when complete), updates hidden select + price.
- Computed: `complete`, `matchedVariant`, `ready`, `buttonLabel`.

## Files

| File | Change |
|------|--------|
| `sections/product.liquid` | Full rewrite |
| `assets/alpine-stores.js` | Append `productForm` component |

No new CSS files (section stylesheet), no theme.js changes, no schema settings added.

## Out of scope (later pass)

"Also available in" color cross-links, Why-We-Made-This / accordions / feature sections, You-May-Also-Like, free-shipping note, quantity picker.
