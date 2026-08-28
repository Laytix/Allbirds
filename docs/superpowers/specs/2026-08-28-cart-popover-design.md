# Cart popover (mini bag) — add-to-cart feedback

**Date:** 2026-08-28
**Status:** Approved
**Replaces:** add-to-cart opening the slide-out drawer. The drawer remains for explicit navbar cart-icon clicks (unchanged).

## Behavior

Successful `/cart/add.js` → `$store.ui.cartPopOpen = true` → compact popover drops from the navbar cart area. Auto-dismisses after 5s; closes on outside click, Escape, or navbar cart-icon click (which then opens the drawer).

## Popover

- Fixed `top: 4.75rem; right: 1.25rem` (aligned to navbar insets), width `min(360px, 100vw - 2.5rem)`, z-index 60, white, hairline border, 0.75rem radius, soft shadow.
- Entrance: fade + drop (translate-y/scale 95→100, 300ms ease-out).
- Header: "Added to Bag" mono label + animated check (SVG stroke-draw, replays on each open) + close ×.
- Just-added item row: thumbnail (rounded, tinted), mono uppercase title, variant + qty line, line price.
- Subtotal row: "Subtotal (N items)" + `$store.cart.total` (money-formatted).
- Actions: **Checkout** (dark pill → `/checkout`) and **View Cart** (understated link → cart page).

## State changes (`assets/alpine-stores.js`)

- `ui.cartPopOpen` flag; `ui.closeAll()` closes it.
- `cart.lastAdded` — populated in `cart.add()` from the add response (`product_title`, `variant_title`, `image`, quantity, formatted line price).
- `productForm.addToCart()` opens the popover instead of the drawer.

## Files

| File | Change |
|------|--------|
| `snippets/cart-pop.liquid` | New — popover markup (Alpine, `role="status"` aria-live) |
| `layout/theme.liquid` | Render snippet after the cart drawer |
| `assets/alpine-stores.js` | State changes above |
| `assets/custom.css` | Popover styles + check-draw keyframes |

## Out of scope

Navbar icon → popover swap (icon keeps opening the drawer), badge pop animations, quantity editing in the popover.
