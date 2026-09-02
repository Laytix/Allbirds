# Footer Design — Allbirds Shopify Theme

**Date:** 2026-07-24
**Scope:** Rewrite `sections/footer.liquid`, create `blocks/footer-column.liquid`, update `sections/footer-group.json`

---

## 1. Motivation

The current footer is bare — copyright, a single flat menu, and payment icons in a basic 3-column flexbox. We're replacing it with a bold, black, Allbirds-inspired footer featuring brand statement, email signup, multi-column navigation, social icons, and payment icons. The footer uses Horizon theme blocks for the navigation columns so the merchant can add any number of link columns.

---

## 2. Architecture

### Files to create:
| File | Purpose |
|------|---------|
| `blocks/footer-column.liquid` | Block: `heading` (text) + `menu` (link_list). Alpine.js accordion toggle on mobile. |

### Files to modify:
| File | What changes |
|------|-------------|
| `sections/footer.liquid` | Full rewrite — all section settings, newsletter form, block rendering, social icons, bottom bar |
| `sections/footer-group.json` | Updated defaults — 3 `footer-column` blocks in the default config |

### What we DON'T touch:
No edits to `theme.liquid`, `tailwind-input.css`, `alpine-stores.js`, `config/settings_schema.json`, or any Horizon stock files. Upgradeability rule: create new files, don't edit Horizon originals.

---

## 3. Layout — Desktop

```
+----------------------------------------------------------+
|  Brand Statement / Tagline                                |
|  [email input..................................] [Sign Up] |
+----------------------------------------------------------+
|  {% content_for 'blocks' %}                               |
|  +----------+ +----------+ +----------+                  |
|  | HELP     | | SHOP     | | COMPANY  |                  |
|  | Link     | | Link     | | Link     |                  |
|  | Link     | | Link     | | Link     |                  |
|  +----------+ +----------+ +----------+                  |
+----------------------------------------------------------+
|  Follow The Flock                                         |
|  [IG] [PIN] [FB] [TikTok] [YT]                           |
+----------------------------------------------------------+
|  (c) 2026 Allbirds     Privacy Policy     [payment icons] |
+----------------------------------------------------------+
```

Block columns use CSS grid: `grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))` so column count is fully dynamic.

---

## 4. Layout — Mobile

```
+-------------------------+
|  Brand Statement         |
|  [email................] |
|  [Sign Up..............] |
|                          |
|  v HELP                  |  (accordion, closed by default)
|  v SHOP                  |
|  v COMPANY               |
|                          |
|  Follow The Flock        |
|  [icons row]             |
|                          |
|  (c) 2026 Allbirds       |
|  Privacy Policy          |
|  [payment icons]         |
+-------------------------+
```

Each `footer-column` block uses `x-data="{ open: false }"` — heading buttons toggle `open` to expand/collapse links via `x-show` + `x-collapse`.

---

## 5. Schema — `sections/footer.liquid`

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `background_color` | `color` | `#000000` | Footer background |
| `text_color` | `color` | `#FFFFFF` | All text/icon color |
| `accent_color` | `color` | `#A8D8B9` | Hover states, newsletter button (Allbirds sage green) |
| `brand_statement` | `text` | — | Tagline above newsletter |
| `show_newsletter` | `checkbox` | `true` | Toggle newsletter section |
| `newsletter_heading` | `text` | `"Subscribe to our emails"` | Heading above email input |
| `newsletter_success_message` | `text` | `"Thanks for subscribing!"` | Shown after form submit |
| `show_social_links` | `checkbox` | `true` | Toggle social icons section |
| `social_heading` | `text` | `"Follow The Flock"` | Heading above social icons |
| `social_instagram` | `url` | — | Instagram URL |
| `social_pinterest` | `url` | — | Pinterest URL |
| `social_facebook` | `url` | — | Facebook URL |
| `social_tiktok` | `url` | — | TikTok URL |
| `social_youtube` | `url` | — | YouTube URL |
| `copyright_text` | `text` | `"© {{ year }} {{ shop.name }}"` | Copyright line |
| `legal_menu` | `link_list` | — | Legal links in bottom bar |
| `show_payment_icons` | `checkbox` | `true` | Payment icons (existing) |

**Blocks:** `{"type": "footer-column"}, {"type": "group"}, {"type": "@theme"}`
**Tag:** `"footer"`, **Class:** `"site-footer"`
**No presets** (statically rendered via footer-group)
**Disabled on password page**

---

## 6. Schema — `blocks/footer-column.liquid`

| Setting | Type | Default | Purpose |
|---------|------|---------|---------|
| `heading` | `text` | `"Column"` | Column header — also used as block title in theme editor |
| `menu` | `link_list` | — | Navigation links for this column |

**Presets:** `{"name": "Footer Column", "category": "Footer"}`

---

## 7. Styling Approach

- **Dynamic colors**: passed via inline `style` on the footer container. CSS variables used in `{% stylesheet %}` for scoped hover/interaction states.
- **Layout**: Tailwind utility classes (padding, gap, grid, flex, typography, responsive breakpoints).
- **Newsletter input**: Inverted style — transparent input with border on dark background.
- **Bottom bar**: Separated from main content by a thin border-top using accent color at low opacity.
- **Social icons**: Inline SVGs, 20px, colored via `text_color`, scale on hover.
- **Mobile breakpoint**: `md:` — columns become accordion below 768px.
- **Mobile accordion**: `x-data="{ open: false }"` per column. Toggle button with `+`/`−` indicator. Links use `x-show="open"` + `x-collapse`. Columns start closed.

---

## 8. Technical Details

- **Newsletter form**: Uses `{% form 'customer' %}` — Shopify's native customer form. No app dependency. Alpine.js handles success state toggle.
- **Social SVGs**: 5 inline SVGs (Instagram, Pinterest, Facebook, TikTok, YouTube). Each conditionally rendered via `{% if %}`.
- **Block rendering**: `{% content_for 'blocks' %}` between newsletter and social sections. CSS grid auto-fits columns.
- **Payment icons**: Existing `shop.enabled_payment_types` loop kept as-is.
- **Copyright**: Default auto-generates from `shop.name` + current year. Overridable via setting.
- **Locales**: Uses existing `t:` translations where available. Custom strings hardcoded in English.

---

## 9. Out of Scope

- Country/region selector
- Store locator
- Theme-level footer settings in `settings_schema.json`
- Back-to-top button
- Animated entrance (can be added later)
